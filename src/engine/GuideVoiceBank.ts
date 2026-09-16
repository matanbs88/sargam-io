import type { MidiNoteEvent } from "../lib/midiToSargam";
import { getSalamanderSampleUrl, selectSalamanderSample } from "../lib/salamanderPiano";
import { getHarmoniumSampleUrl, selectHarmoniumSample } from "../lib/harmoniumAudio";
import type { AudioBackend } from "./EngineStore";
import { getBansuriAudioProfile } from "../lib/bansuriAudio";
import { pitchCentsAt, validatePitchCurve } from "../lib/expressivePitch";

export type VoiceSettings = {
  instrument: "Piano" | "Harmonium" | "Bansuri";
  enabled: boolean;
  double: boolean;
  room: boolean;
  /** Preview-only A/B voice. Default remains procedural until listening QA. */
  bansuriVoice?: "procedural" | "ventus-study";
};
type Sample = { buffer: AudioBuffer; midi: number };

/** Prepared voices: no fetch/decode is permitted on the scheduling path. */
export class GuideVoiceBank implements AudioBackend {
  private samples = new Map<string, Sample>();
  private voices = new Set<() => void>();
  private controller: AbortController | null = null;
  private context: AudioContext | null = null;
  private disposed = false;
  private noise: AudioBuffer | null = null;
  private epoch = 0;
  settings: VoiceSettings;
  constructor(private getContext: () => AudioContext, settings: VoiceSettings) { this.settings = settings; }
  configure(settings: VoiceSettings) {
    if (settings.instrument !== this.settings.instrument || settings.bansuriVoice !== this.settings.bansuriVoice) this.samples.clear();
    this.settings = settings;
  }
  now = () => this.context?.currentTime ?? 0;
  isInterrupted = () => this.context !== null && this.context.state !== "running";
  private source(note: MidiNoteEvent) {
    if (this.settings.instrument === "Bansuri" && this.settings.bansuriVoice === "ventus-study") {
      return { url: "/audio/preview/ventus-fsharp4-sustain.wav", midi: 65.993 };
    }
    return this.settings.instrument === "Piano"
      ? { url: getSalamanderSampleUrl(note.midi, undefined, note.velocity), midi: selectSalamanderSample(note.midi, note.velocity).midi }
      : { url: getHarmoniumSampleUrl(note.midi), midi: selectHarmoniumSample(note.midi).midi };
  }
  async prepare(events: readonly MidiNoteEvent[]) {
    const epoch = ++this.epoch;
    this.disposed = false;
    const context = this.getContext();
    this.context = context;
    await context.resume();
    if (epoch !== this.epoch) throw new Error("Audio preparation cancelled");
    if (!this.settings.enabled) return;
    if (this.settings.instrument === "Bansuri" && this.settings.bansuriVoice !== "ventus-study") {
      if (!this.noise) {
        this.noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      return;
    }
    if (this.settings.instrument === "Bansuri" && events.some(note => note.midi < 60 || note.midi > 72 || note.pitchCurve?.length)) {
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
        this.samples.set(item.url, { buffer, midi: item.midi });
      }
    })).catch((error) => { controller.abort(); throw error; }).finally(() => clearTimeout(timeout));
  }
  cancel = () => {
    ++this.epoch;
    this.controller?.abort();
    for (const stop of this.voices) stop();
    this.voices.clear();
  };
  schedule(note: MidiNoteEvent, when: number, duration: number, offset: number, rate: number) {
    const ctx = this.context;
    if (!ctx || !this.settings.enabled || duration <= 0) return;
    const output = ctx.createGain();
    const nodes: AudioNode[] = [output];
    const sources: AudioScheduledSourceNode[] = [];
    const peak = 0.08 + (note.velocity ?? 64) / 127 * 0.12;
    const attack = Math.min(0.012, duration / 3);
    const end = when + duration;
    output.gain.setValueAtTime(0, when);
    output.gain.linearRampToValueAtTime(peak, when + attack);
    output.gain.setValueAtTime(peak, Math.max(when + attack, end - 0.006));
    output.gain.linearRampToValueAtTime(0, end);
    output.connect(ctx.destination);
    if (this.settings.room) {
      const delay = ctx.createDelay(0.3); const wet = ctx.createGain();
      delay.delayTime.value = 0.12; wet.gain.value = 0.12;
      output.connect(delay).connect(wet).connect(ctx.destination);
      nodes.push(delay, wet);
    }
    if (this.settings.instrument === "Bansuri" && this.settings.bansuriVoice !== "ventus-study") {
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
        source.loop = this.settings.instrument === "Harmonium";
        source.loopStart = sample.buffer.duration * 0.2;
        source.loopEnd = sample.buffer.duration * 0.85;
        source.connect(gain).connect(output); nodes.push(source, gain);
        const sampleOffset = source.loop ? 0 : offset * pitchRate;
        if (this.settings.instrument === "Bansuri" && sampleOffset + duration * pitchRate > sample.buffer.duration) {
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
    const cleanup = () => {
      if (cleaned) return; cleaned = true;
      clearTimeout(cleanupTimer);
      for (const source of sources) { try { source.stop(); } catch { /* already ended */ } }
      nodes.forEach((node) => node.disconnect()); this.voices.delete(cleanup);
    };
    for (const source of sources) source.stop(end);
    // Cleanup includes the optional delay tail; cancellation disconnects immediately.
    const cleanupTimer = setTimeout(cleanup, Math.max(0, end - ctx.currentTime + 0.2) * 1000);
    this.voices.add(cleanup);
  }
  dispose() { this.disposed = true; this.cancel(); this.samples.clear(); this.noise = null; }
}
