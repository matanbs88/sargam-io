import type { MidiNoteEvent } from "../lib/midiToSargam";
import { getSalamanderSampleUrl, selectSalamanderSample } from "../lib/salamanderPiano";
import { getHarmoniumSampleUrl, selectHarmoniumSample } from "../lib/harmoniumAudio";
import type { AudioBackend } from "./EngineStore";
import { getBansuriAudioProfile } from "../lib/bansuriAudio";
import { pitchCentsAt, pitchCurveSampleSeconds, validatePitchCurve } from "../lib/expressivePitch";
import { DEFAULT_BANSURI_VOICE, selectVentusSample, ventusResumeOffset, type BansuriVoice } from '../lib/ventusAudio';
import { bansuriPeakGain, bansuriVolumeGain, scorePolyphony, selectPerformanceSample, type BansuriArticulation } from '../lib/ventusPerformance';

export type VoiceSettings = {
  instrument: "Piano" | "Harmonium" | "Bansuri";
  enabled: boolean;
  double: boolean;
  room: boolean;
  /** Sampled Ventus by default. Synthesis is an explicit diagnostic choice. */
  bansuriVoice?: BansuriVoice;
  bansuriArticulation?: BansuriArticulation;
  bansuriVolume?: number;
};
type Sample = { buffer: AudioBuffer; midi: number; loopStart?: number; loopEnd?: number };
type VoiceContext = BaseAudioContext & { resume?: () => Promise<void> };

/** Prepared voices: no fetch/decode is permitted on the scheduling path. */
export class GuideVoiceBank implements AudioBackend {
  private samples = new Map<string, Sample>();
  private voices = new Set<() => void>();
  private controller: AbortController | null = null;
  private context: VoiceContext | null = null;
  private disposed = false;
  private noise: AudioBuffer | null = null;
  private epoch = 0;
  private polyphony = 1;
  private bansuriMaster: GainNode | null = null;
  // Pending source tails are extended only when the destination is actually
  // scheduled. A loop ending at the boundary cannot accidentally bridge a rest.
  private handoffs = new Map<string, { end: number; join: (fade: number) => void }>();
  setBansuriVolume(volume = 85) {
    this.settings = { ...this.settings, bansuriVolume: volume };
    if (this.bansuriMaster && this.context) {
      this.bansuriMaster.gain.setTargetAtTime(bansuriVolumeGain(volume), this.context.currentTime, .015);
    }
  }
  private performancePlan = new Map<string, ReturnType<typeof selectPerformanceSample>>();
  private noteKey(note: MidiNoteEvent) { return `${note.startMs}:${note.midi}:${note.durationMs}`; }
  settings: VoiceSettings;
  constructor(private getContext: () => VoiceContext, settings: VoiceSettings) { this.settings = settings; }
  configure(settings: VoiceSettings) {
    if (settings.instrument !== this.settings.instrument || settings.bansuriVoice !== this.settings.bansuriVoice) this.samples.clear();
    this.settings = settings;
  }
  now = () => this.context?.currentTime ?? 0;
  isInterrupted = () => this.context !== null && this.context.state !== "running";
  private get bansuriVoice() { return this.settings.bansuriVoice ?? DEFAULT_BANSURI_VOICE; }
  private source(note: MidiNoteEvent) {
    if (this.settings.instrument === 'Bansuri' && this.bansuriVoice === 'ventus') return this.performancePlan.get(this.noteKey(note)) ?? selectVentusSample(note.midi);
    if (this.settings.instrument === "Bansuri" && this.settings.bansuriVoice === "ventus-study") {
      return { url: "/audio/preview/ventus-fsharp4-sustain.wav", midi: 65.993 };
    }
    return this.settings.instrument === "Piano"
      ? { url: getSalamanderSampleUrl(note.midi, undefined, note.velocity), midi: selectSalamanderSample(note.midi, note.velocity).midi }
      : { url: getHarmoniumSampleUrl(note.midi), midi: selectHarmoniumSample(note.midi).midi };
  }
  async prepare(events: readonly MidiNoteEvent[]) {
    const epoch = ++this.epoch;
    this.handoffs.clear();
    this.disposed = false;
    const context = this.getContext();
    this.context = context;
    if (!this.bansuriMaster) {
      this.bansuriMaster = context.createGain();
      this.bansuriMaster.gain.value = bansuriVolumeGain(this.settings.bansuriVolume);
      this.bansuriMaster.connect(context.destination);
    }
    // Offline contexts start only after all voices are scheduled. Their resume
    // method is for a suspended render, not initial preparation.
    if (!('startRendering' in context)) await context.resume?.();
    if (epoch !== this.epoch) throw new Error("Audio preparation cancelled");
    if (!this.settings.enabled) return;
    this.polyphony = scorePolyphony(events);
    this.performancePlan.clear();
    if (this.settings.instrument === 'Bansuri' && this.bansuriVoice === 'ventus') events.forEach((note,index) => this.performancePlan.set(this.noteKey(note), selectPerformanceSample(note,index,this.settings.bansuriArticulation)));
    if (this.settings.instrument === "Bansuri" && this.bansuriVoice === "procedural") {
      if (!this.noise) {
        this.noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      return;
    }
    if (this.settings.instrument === "Bansuri" && this.bansuriVoice === 'ventus-study' && events.some(note => note.midi < 60 || note.midi > 72 || note.pitchCurve?.length)) {
      throw new Error("Ventus study voice supports C4–C5 without pitch slides. Choose the procedural voice for this score.");
    }
    this.controller?.abort();
    const controller = new AbortController(); this.controller = controller;
    const timeout = setTimeout(() => controller.abort(), 30_000);
    const needed = new Map(events.map((n) => { const s = this.source(n); return [s.url, s]; }));
    // Only retain samples used by this score/instrument. Active voices own buffers.
    for (const url of this.samples.keys()) if (!needed.has(url)) this.samples.delete(url);
    const queue = [...needed.values()].filter(({ url }) => !this.samples.has(url));
    let bytes = [...this.samples.values()].reduce((n, s) => n + s.buffer.length * s.buffer.numberOfChannels * 4, 0);
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
      while (queue.length) {
        const item = queue.shift()!;
        const response = await fetch(item.url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Sample download failed (${response.status}). Retry or turn sound off.`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (controller.signal.aborted || this.disposed) throw new Error("Audio preparation cancelled");
        bytes += buffer.length * buffer.numberOfChannels * 4;
        if (bytes > 256 * 1024 * 1024) throw new Error("This score exceeds the 256 MB sample budget. Try a shorter score.");
        this.samples.set(item.url, { ...item, buffer });
      }
    })).catch((error) => { controller.abort(); throw error; }).finally(() => clearTimeout(timeout));
  }
  cancel = () => {
    ++this.epoch;
    this.controller?.abort();
    for (const stop of this.voices) stop();
    this.voices.clear();
    this.handoffs.clear();
  };
  schedule(note: MidiNoteEvent, when: number, duration: number, offset: number, rate: number) {
    const ctx = this.context;
    if (!ctx || !this.settings.enabled || duration <= 0) return;
    const output = ctx.createGain();
    const nodes: AudioNode[] = [output];
    const sources: AudioScheduledSourceNode[] = [];
    const peak = this.settings.instrument === 'Bansuri' && this.bansuriVoice === 'ventus'
      ? bansuriPeakGain(note.velocity, 100, this.polyphony)
      : 0.08 + (note.velocity ?? 64) / 127 * 0.12;
    const attack = Math.min(0.012, duration / 3);
    const end = when + duration;
    const naturalVentus = this.settings.instrument === 'Bansuri' && this.bansuriVoice === 'ventus' && (this.settings.bansuriArticulation ?? 'natural') === 'natural';
    const incomingKey = `${note.startMs}:${note.midi}`;
    const predecessor = this.handoffs.get(incomingKey);
    this.handoffs.delete(incomingKey);
    const joined = naturalVentus && offset === 0 && predecessor && Math.abs(predecessor.end - when) < .0005 && when > ctx.currentTime + .006;
    // Linear complementary fades avoid the +3dB coherent sum of equal-power
    // fades. Their differing peaks remain bounded by the louder single voice.
    const crossfade = Math.min(.018, duration / 3);
    output.gain.setValueAtTime(0, when);
    output.gain.linearRampToValueAtTime(peak, when + (joined ? crossfade : attack));
    output.gain.setValueAtTime(peak, Math.max(when + attack, end - 0.006));
    output.gain.linearRampToValueAtTime(0, end);
    const destination = this.settings.instrument === 'Bansuri' && this.bansuriVoice === 'ventus'
      ? this.bansuriMaster! : ctx.destination;
    output.connect(destination);
    if (this.settings.room) {
      const delay = ctx.createDelay(0.3); const wet = ctx.createGain();
      delay.delayTime.value = 0.12; wet.gain.value = 0.12;
      output.connect(delay).connect(wet).connect(destination);
      nodes.push(delay, wet);
    }
    if (this.settings.instrument === "Bansuri" && this.bansuriVoice === "procedural") {
      const profile = getBansuriAudioProfile(note.midi, duration * 1000, note.velocity ?? 64);
      const vibrato = ctx.createOscillator(); const depth = ctx.createGain();
      vibrato.frequency.value = profile.vibratoHz; depth.gain.value = profile.vibratoDepthCents;
      vibrato.connect(depth); nodes.push(vibrato, depth); sources.push(vibrato); vibrato.start(when);
      const curve = note.pitchCurve;
      const curveValid = curve && validatePitchCurve(curve, note.durationMs);
      // Explicit procedural fallback pending Ventus conversion; not a piano sample.
      for (const [multiple, level] of [[1, 1], [2, 0.12], [3, 0.035]]) {
        const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 440 * 2 ** ((note.midi - 69) / 12) * multiple;
        depth.connect(oscillator.detune);
        if (curveValid) {
          oscillator.detune.setValueAtTime(pitchCentsAt(curve, offset * 1000), when);
          const lastMs = offset * 1000 + duration * 1000 * rate;
          for (const point of curve) if (point.offsetMs > offset * 1000 && point.offsetMs < lastMs) {
            oscillator.detune.linearRampToValueAtTime(point.cents, when + (point.offsetMs / 1000 - offset) / rate);
          }
          oscillator.detune.linearRampToValueAtTime(pitchCentsAt(curve, lastMs), end);
        }
        gain.gain.value = level;
        oscillator.connect(gain).connect(output);
        nodes.push(oscillator, gain); sources.push(oscillator); oscillator.start(when);
      }
      const breath = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const breathGain = ctx.createGain();
      breath.buffer = this.noise; breath.loop = true;
      filter.type = "bandpass"; filter.frequency.value = profile.breathFilterHz; filter.Q.value = 0.75;
      breathGain.gain.value = 0.035;
      breath.connect(filter).connect(breathGain).connect(output);
      nodes.push(breath, filter, breathGain); sources.push(breath); breath.start(when);
    } else {
      const sample = this.samples.get(this.source(note).url);
      if (!sample) { nodes.forEach((n) => n.disconnect()); throw new Error("Sample was not prepared"); }
      const count = this.settings.instrument === "Harmonium" && this.settings.double ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const source = ctx.createBufferSource(); const gain = ctx.createGain();
        source.buffer = sample.buffer;
        const pitchRate = 2 ** ((note.midi - sample.midi) / 12);
        source.playbackRate.value = pitchRate; source.detune.value = i * 4.5;
        gain.gain.value = i ? 0.18 : 1;
        const ventus = this.settings.instrument === 'Bansuri' && this.bansuriVoice === 'ventus';
        source.loop = this.settings.instrument === "Harmonium" || ventus;
        source.loopStart = sample.loopStart ?? sample.buffer.duration * 0.2;
        source.loopEnd = sample.loopEnd ?? sample.buffer.duration * 0.85;
        if (ventus && note.pitchCurve && validatePitchCurve(note.pitchCurve, note.durationMs)) {
          const curve = note.pitchCurve, startMs = offset * 1000, lastMs = startMs + duration * 1000 * rate;
          source.detune.setValueAtTime(pitchCentsAt(curve, startMs), when);
          for (const point of curve) if (point.offsetMs > startMs && point.offsetMs < lastMs) source.detune.linearRampToValueAtTime(point.cents, when + (point.offsetMs / 1000 - offset) / rate);
          source.detune.linearRampToValueAtTime(pitchCentsAt(curve, lastMs), end);
        }
        source.connect(gain).connect(output); nodes.push(source, gain);
        // Transport offset is score seconds; the sample advances in real seconds.
        // Tempo changes note timing without changing the instrument's pitch.
        const elapsedSample = ventus && note.pitchCurve && validatePitchCurve(note.pitchCurve,note.durationMs)
          ? pitchCurveSampleSeconds(note.pitchCurve,offset*1000,rate)*pitchRate : (offset/rate)*pitchRate;
        const sampleOffset = ventus ? ventusResumeOffset((joined ? source.loopStart : 0) + elapsedSample, source.loopStart, source.loopEnd) : source.loop ? 0 : elapsedSample;
        if (this.settings.instrument === "Bansuri" && !ventus && sampleOffset + duration * pitchRate > sample.buffer.duration) {
          nodes.forEach(node => node.disconnect());
          throw new Error("This note exceeds the experimental Ventus sustain. Choose a faster tempo or the procedural voice.");
        }
        if (sampleOffset < sample.buffer.duration) {
          source.start(when, sampleOffset);
          sources.push(source);
        }
      }
    }
    let cleaned = false;
    let handoffKey: string | null = null;
    let handoff: { end: number; join: (fade: number) => void } | null = null;
    const cleanup = () => {
      if (cleaned) return; cleaned = true;
      clearTimeout(cleanupTimer);
      for (const source of sources) { try { source.stop(); } catch { /* already ended */ } }
      nodes.forEach((node) => node.disconnect()); this.voices.delete(cleanup);
      if (handoffKey && this.handoffs.get(handoffKey) === handoff) this.handoffs.delete(handoffKey);
    };
    for (const source of sources) source.stop(end);
    if (joined) predecessor.join(crossfade);
    if (naturalVentus && note.transition && Math.abs((offset + duration * rate) * 1000 - note.durationMs) < .5) {
      handoffKey = `${note.startMs + note.durationMs}:${note.transition.targetMidi}`;
      handoff = { end, join: fade => {
        // Called during lookahead, before the source's scheduled release begins.
        output.gain.cancelScheduledValues(end - .006);
        output.gain.setValueAtTime(peak, end);
        output.gain.linearRampToValueAtTime(0, end + fade);
        for (const source of sources) source.stop(end + fade);
      }};
      this.handoffs.set(handoffKey, handoff);
    }
    // Cleanup includes the optional delay tail; cancellation disconnects immediately.
    // Wall-clock timers must never disconnect an offline render mid-computation.
    // The comparison renderer disposes the bank after startRendering resolves.
    const cleanupTimer = 'startRendering' in ctx ? undefined : setTimeout(cleanup, Math.max(0, end - ctx.currentTime + 0.2) * 1000);
    this.voices.add(cleanup);
  }
  dispose() { this.disposed = true; this.cancel(); this.samples.clear(); this.noise = null; this.bansuriMaster?.disconnect(); this.bansuriMaster = null; }
}
