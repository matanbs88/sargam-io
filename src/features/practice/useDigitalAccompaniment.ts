"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDroneStringMidis,
  getPracticeBol,
  getTablaBolProfile,
  type DroneMode,
} from "@/src/lib/digitalAccompaniment";
import type { TaalDefinition } from "@/src/lib/taal";
import {
  getSalamanderPlaybackRate,
  getSalamanderSampleUrl,
  selectSalamanderSample,
  type SalamanderSample,
} from "@/src/lib/salamanderPiano";
import { getBansuriAudioProfile } from "@/src/lib/bansuriAudio";

export type GuideInstrument = "synth" | "piano" | "bansuri";

type UseDigitalAccompanimentOptions = {
  readonly guideInstrument?: GuideInstrument;
  readonly droneMode: DroneMode;
  readonly rootMidi: number;
  readonly taal: TaalDefinition;
  readonly tempoBpm: number;
};

const SCHEDULER_INTERVAL_MS = 30;
const SCHEDULE_AHEAD_SECONDS = 0.14;

function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function getAudioContext(
  contextRef: { current: AudioContext | null },
): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) {
    return null;
  }

  if (contextRef.current === null) {
    contextRef.current = new window.AudioContext();
  }

  return contextRef.current;
}

function createNoiseBuffer(context: AudioContext, durationSeconds: number): AudioBuffer {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function playDayan(
  context: AudioContext,
  when: number,
  brightness: number,
  decayMs: number,
  accent: boolean,
): void {
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const now = when;
  const duration = decayMs / 1_000;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(210 + brightness * 115, now);
  overtone.type = "triangle";
  overtone.frequency.setValueAtTime(780 + brightness * 540, now);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1_250 + brightness * 1_200, now);
  filter.Q.setValueAtTime(4.5, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.16 : 0.1, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  overtone.connect(filter);
  filter.connect(gain).connect(context.destination);
  oscillator.start(now);
  overtone.start(now);
  oscillator.stop(now + duration + 0.02);
  overtone.stop(now + duration + 0.02);
}

function playBayan(
  context: AudioContext,
  when: number,
  brightness: number,
  decayMs: number,
  accent: boolean,
): void {
  const oscillator = context.createOscillator();
  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const gain = context.createGain();
  const now = when;
  const duration = decayMs / 1_000;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(108 + brightness * 30, now);
  oscillator.frequency.exponentialRampToValueAtTime(72 + brightness * 22, now + duration * 0.7);
  noise.buffer = createNoiseBuffer(context, Math.min(duration, 0.16));
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(430 + brightness * 520, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.18 : 0.12, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  noise.connect(noiseFilter).connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  noise.start(now);
  oscillator.stop(now + duration + 0.02);
  noise.stop(now + Math.min(duration, 0.16));
}

function playTablaBol(
  context: AudioContext,
  bol: string,
  when: number,
  accent: boolean,
): void {
  const profile = getTablaBolProfile(bol);

  if (profile.voice === "bayan" || profile.voice === "combined") {
    playBayan(context, when, profile.brightness, profile.decayMs, accent);
  }

  if (profile.voice === "dayan" || profile.voice === "combined") {
    playDayan(context, when + (profile.voice === "combined" ? 0.012 : 0), profile.brightness, profile.decayMs, accent);
  }
}

function playDronePluck(context: AudioContext, midi: number, when: number): void {
  const oscillator = context.createOscillator();
  const companion = context.createOscillator();
  const buzz = context.createOscillator();
  const filter = context.createBiquadFilter();
  const colour = context.createBiquadFilter();
  const drive = context.createWaveShaper();
  const delay = context.createDelay(0.32);
  const feedback = context.createGain();
  const ambience = context.createGain();
  const gain = context.createGain();
  const frequency = midiToFrequency(midi);
  const real = new Float32Array(9);
  const imag = new Float32Array([0, 0.86, 0.56, 0.37, 0.24, 0.17, 0.12, 0.08, 0.05]);
  const curve = new Float32Array(256);

  for (let index = 0; index < curve.length; index += 1) {
    const value = (index * 2) / (curve.length - 1) - 1;
    curve[index] = Math.tanh(value * 1.45);
  }

  oscillator.setPeriodicWave(context.createPeriodicWave(real, imag));
  oscillator.frequency.setValueAtTime(frequency, when);
  companion.setPeriodicWave(context.createPeriodicWave(real, imag));
  companion.detune.setValueAtTime(3.5, when);
  companion.frequency.setValueAtTime(frequency, when);
  buzz.type = "sine";
  buzz.frequency.setValueAtTime(frequency * 2.96, when);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(frequency * 13, 3_400), when);
  filter.Q.setValueAtTime(2.2, when);
  colour.type = "peaking";
  colour.frequency.setValueAtTime(Math.min(frequency * 4.8, 1_900), when);
  colour.Q.setValueAtTime(1.4, when);
  colour.gain.setValueAtTime(4.5, when);
  drive.curve = curve;
  drive.oversample = "2x";
  delay.delayTime.setValueAtTime(0.17, when);
  feedback.gain.setValueAtTime(0.17, when);
  feedback.gain.exponentialRampToValueAtTime(0.0001, when + 2.5);
  ambience.gain.setValueAtTime(0.12, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.07, when + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.019, when + 0.32);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 2.45);

  oscillator.connect(filter);
  companion.connect(filter);
  buzz.connect(colour);
  colour.connect(filter);
  filter.connect(drive).connect(gain);
  gain.connect(context.destination);
  gain.connect(delay).connect(ambience).connect(context.destination);
  delay.connect(feedback).connect(delay);
  oscillator.start(when);
  companion.start(when);
  buzz.start(when);
  oscillator.stop(when + 2.5);
  companion.stop(when + 2.5);
  buzz.stop(when + 0.48);
}

function playSynthGuideNote(
  context: AudioContext,
  midi: number,
  durationMs: number,
  velocity = 64,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const duration = Math.min(Math.max(durationMs / 1_000, 0.12), 1.4);
  const release = Math.min(0.45, Math.max(0.16, duration * 0.35));
  const peak = 0.045 + Math.min(Math.max(velocity, 1), 127) / 127 * 0.06;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(midiToFrequency(midi), now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(peak * 0.28, now + duration);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + release + 0.03);
}

function playBansuriGuideNote(
  context: AudioContext,
  midi: number,
  durationMs: number,
  velocity: number,
  breathBuffer: AudioBuffer,
): void {
  const profile = getBansuriAudioProfile(midi, durationMs, velocity);
  const now = context.currentTime;
  const frequency = midiToFrequency(midi);
  const release = Math.min(0.34, Math.max(0.16, profile.durationSeconds * 0.28));

  const fundamental = context.createOscillator();
  const harmonic = context.createOscillator();
  const vibrato = context.createOscillator();
  const vibratoDepth = context.createGain();
  const breath = context.createBufferSource();
  const breathFilter = context.createBiquadFilter();
  const bodyFilter = context.createBiquadFilter();
  const toneGain = context.createGain();
  const breathGain = context.createGain();
  const output = context.createGain();

  fundamental.type = "sine";
  fundamental.frequency.setValueAtTime(frequency, now);
  harmonic.type = "triangle";
  harmonic.frequency.setValueAtTime(frequency * 2, now);
  harmonic.detune.setValueAtTime(0.6, now);

  vibrato.type = "sine";
  vibrato.frequency.setValueAtTime(profile.vibratoHz, now);
  vibratoDepth.gain.setValueAtTime(profile.vibratoDepthCents, now);
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(fundamental.detune);
  vibratoDepth.connect(harmonic.detune);

  bodyFilter.type = "lowpass";
  bodyFilter.frequency.setValueAtTime(profile.bodyFilterHz, now);
  bodyFilter.Q.setValueAtTime(0.7, now);
  breathFilter.type = "bandpass";
  breathFilter.frequency.setValueAtTime(profile.breathFilterHz, now);
  breathFilter.Q.setValueAtTime(0.75, now);

  breath.buffer = breathBuffer;
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(profile.tonePeak, now + 0.045);
  toneGain.gain.exponentialRampToValueAtTime(
    profile.tonePeak * 0.68,
    now + Math.max(0.12, profile.durationSeconds * 0.72),
  );
  toneGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + profile.durationSeconds + release,
  );

  breathGain.gain.setValueAtTime(0.0001, now);
  breathGain.gain.exponentialRampToValueAtTime(profile.breathPeak, now + 0.035);
  breathGain.gain.exponentialRampToValueAtTime(
    profile.breathPeak * 0.36,
    now + Math.max(0.12, profile.durationSeconds * 0.68),
  );
  breathGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + profile.durationSeconds + release * 0.85,
  );

  output.gain.setValueAtTime(0.82, now);

  fundamental.connect(bodyFilter);
  harmonic.connect(bodyFilter);
  bodyFilter.connect(toneGain);
  breath.connect(breathFilter).connect(breathGain);
  toneGain.connect(output);
  breathGain.connect(output);
  output.connect(context.destination);

  fundamental.start(now);
  harmonic.start(now);
  vibrato.start(now);
  breath.start(now);
  fundamental.stop(now + profile.durationSeconds + release + 0.03);
  harmonic.stop(now + profile.durationSeconds + release + 0.03);
  vibrato.stop(now + profile.durationSeconds + release + 0.03);
  breath.stop(now + profile.durationSeconds + release + 0.03);
}

async function fetchSalamanderBuffer(
  context: AudioContext,
  midi: number,
  velocity: number,
  cache: Map<string, Promise<AudioBuffer>>,
): Promise<{ readonly buffer: AudioBuffer; readonly sample: SalamanderSample }> {
  const sample = selectSalamanderSample(midi, velocity);
  const url = getSalamanderSampleUrl(midi, undefined, velocity);
  const cached = cache.get(url);
  if (cached !== undefined) {
    return { buffer: await cached, sample };
  }

  const request = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Salamander sample request failed: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data));

  cache.set(url, request);
  try {
    return { buffer: await request, sample };
  } catch (error) {
    cache.delete(url);
    throw error;
  }
}

function preloadSalamanderBuffers(
  context: AudioContext,
  notes: readonly { readonly midi: number; readonly velocity?: number }[],
  cache: Map<string, Promise<AudioBuffer>>,
): void {
  const uniqueNotes = new Map<string, { readonly midi: number; readonly velocity: number }>();
  notes.slice(0, 8).forEach(({ midi, velocity = 64 }) => {
    uniqueNotes.set(`${midi}:${velocity}`, { midi, velocity });
  });

  uniqueNotes.forEach(({ midi, velocity }) => {
    void fetchSalamanderBuffer(context, midi, velocity, cache).catch(() => {
      // The guide-note callback owns the audible fallback. Preload failures
      // stay silent so an offline session remains usable.
    });
  });
}

async function playSalamanderGuideNote(
  context: AudioContext,
  midi: number,
  durationMs: number,
  velocity: number,
  cache: Map<string, Promise<AudioBuffer>>,
): Promise<void> {
  try {
    const { buffer, sample } = await fetchSalamanderBuffer(
      context,
      midi,
      velocity,
      cache,
    );
    if (context.state === "closed") return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    const now = context.currentTime;
    const duration = Math.min(Math.max(durationMs / 1_000, 0.12), 1.4);
    const release = Math.min(0.65, Math.max(0.18, duration * 0.45));
    const normalizedVelocity = Math.min(Math.max(velocity, 1), 127) / 127;
    const peak = 0.1 + normalizedVelocity * 0.14;

    source.buffer = buffer;
    source.playbackRate.setValueAtTime(
      getSalamanderPlaybackRate(midi, sample),
      now,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(peak * 0.32, now + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    source.connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + duration + release + 0.04);
  } catch {
    // A blocked CDN, offline session, or decode failure must never silence the
    // practice timeline; the existing synth is the deterministic safety net.
    playSynthGuideNote(context, midi, durationMs, velocity);
  }
}

/**
 * Browser-native accompaniment. Indian practice cues remain generated, while
 * the keyboard guide can opt into the founder-approved Salamander sampler.
 */
export function useDigitalAccompaniment({
  guideInstrument = "synth",
  droneMode,
  rootMidi,
  taal,
  tempoBpm,
}: UseDigitalAccompanimentOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bansuriBreathBufferRef = useRef<AudioBuffer | null>(null);
  const pianoSampleCacheRef = useRef<Map<string, Promise<AudioBuffer>>>(
    new Map(),
  );
  const [activeMatra, setActiveMatra] = useState(0);
  const [isDronePlaying, setIsDronePlaying] = useState(false);
  const [isTablaPlaying, setIsTablaPlaying] = useState(false);

  const getBansuriBreathBuffer = useCallback((context: AudioContext): AudioBuffer => {
    if (bansuriBreathBufferRef.current === null) {
      bansuriBreathBufferRef.current = createNoiseBuffer(context, 2.2);
    }

    return bansuriBreathBufferRef.current;
  }, []);

  const resumeAudio = useCallback(() => {
    const context = getAudioContext(audioContextRef);
    if (context !== null) void context.resume();
  }, []);

  const preloadGuideNotes = useCallback((
    notes: readonly { readonly midi: number; readonly velocity?: number }[],
  ) => {
    if (guideInstrument !== "piano" && guideInstrument !== "bansuri") return;

    const context = getAudioContext(audioContextRef);
    if (context === null) return;

    void context.resume();
    if (guideInstrument === "bansuri") {
      getBansuriBreathBuffer(context);
      return;
    }

    preloadSalamanderBuffers(
      context,
      notes,
      pianoSampleCacheRef.current,
    );
  }, [getBansuriBreathBuffer, guideInstrument]);

  const playGuideNote = useCallback((
    midi: number,
    durationMs: number,
    velocity = 64,
  ) => {
    const context = getAudioContext(audioContextRef);
    if (context === null) return;

    void context.resume();
    if (guideInstrument === "piano") {
      void playSalamanderGuideNote(
        context,
        midi,
        durationMs,
        velocity,
        pianoSampleCacheRef.current,
      );
      return;
    }

    if (guideInstrument === "bansuri") {
      playBansuriGuideNote(
        context,
        midi,
        durationMs,
        velocity,
        getBansuriBreathBuffer(context),
      );
      return;
    }

    playSynthGuideNote(context, midi, durationMs, velocity);
  }, [getBansuriBreathBuffer, guideInstrument]);

  const toggleDrone = useCallback(() => {
    resumeAudio();
    setIsDronePlaying((value) => !value);
  }, [resumeAudio]);

  const toggleTabla = useCallback(() => {
    resumeAudio();
    setIsTablaPlaying((value) => !value);
  }, [resumeAudio]);

  useEffect(() => {
    if (!isDronePlaying) return;

    const context = getAudioContext(audioContextRef);
    if (context === null) return;

    const strings = getDroneStringMidis(rootMidi, droneMode);
    let currentString = 0;
    const pluck = () => {
      playDronePluck(context, strings[currentString], context.currentTime + 0.015);
      currentString = (currentString + 1) % strings.length;
    };

    pluck();
    const interval = window.setInterval(pluck, 1_120);
    return () => window.clearInterval(interval);
  }, [droneMode, isDronePlaying, rootMidi]);

  useEffect(() => {
    if (!isTablaPlaying) return;

    const context = getAudioContext(audioContextRef);
    if (context === null) return;

    const beatSeconds = 60 / tempoBpm;
    let nextMatra = 0;
    let nextBeatAt = context.currentTime + 0.06;
    const visualTimers = new Set<number>();

    const schedule = () => {
      while (nextBeatAt < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
        const matraForBeat = nextMatra;
        const bol = getPracticeBol(taal.id, matraForBeat);
        playTablaBol(context, bol, nextBeatAt, matraForBeat === 0);
        const delayMs = Math.max(0, (nextBeatAt - context.currentTime) * 1_000);
        const timer = window.setTimeout(() => {
          visualTimers.delete(timer);
          setActiveMatra(matraForBeat);
        }, delayMs);
        visualTimers.add(timer);
        nextMatra = (nextMatra + 1) % taal.matras;
        nextBeatAt += beatSeconds;
      }
    };

    setActiveMatra(0);
    schedule();
    const interval = window.setInterval(schedule, SCHEDULER_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      visualTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isTablaPlaying, taal, tempoBpm]);

  useEffect(
    () => () => {
      const context = audioContextRef.current;
      if (context !== null && context.state !== "closed") {
        void context.close();
      }
    },
    [],
  );

  return {
    activeMatra,
    isDronePlaying,
    isTablaPlaying,
    playGuideNote,
    preloadGuideNotes,
    resumeAudio,
    toggleDrone,
    toggleTabla,
  };
}
