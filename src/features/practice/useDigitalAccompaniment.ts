"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDroneStringMidis,
  getPracticeBol,
  getTablaBolProfile,
  type DroneMode,
} from "@/src/lib/digitalAccompaniment";
import type { TaalDefinition } from "@/src/lib/taal";

type UseDigitalAccompanimentOptions = {
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
  const shimmer = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const frequency = midiToFrequency(midi);

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, when);
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(frequency * 2.01, when);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(frequency * 9, 2_800), when);
  filter.Q.setValueAtTime(1.8, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.06, when + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.7);

  oscillator.connect(filter);
  shimmer.connect(filter);
  filter.connect(gain).connect(context.destination);
  oscillator.start(when);
  shimmer.start(when);
  oscillator.stop(when + 1.75);
  shimmer.stop(when + 1.75);
}

/**
 * Browser-native accompaniment with no bundled recordings. Every generated
 * sound has a stable replacement seam for a future licensed asset library.
 */
export function useDigitalAccompaniment({
  droneMode,
  rootMidi,
  taal,
  tempoBpm,
}: UseDigitalAccompanimentOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [activeMatra, setActiveMatra] = useState(0);
  const [isDronePlaying, setIsDronePlaying] = useState(false);
  const [isTablaPlaying, setIsTablaPlaying] = useState(false);

  const resumeAudio = useCallback(() => {
    const context = getAudioContext(audioContextRef);
    if (context !== null) void context.resume();
  }, []);

  const playGuideNote = useCallback((midi: number, durationMs: number) => {
    const context = getAudioContext(audioContextRef);
    if (context === null) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const duration = Math.min(Math.max(durationMs / 1_000, 0.12), 1.4);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }, []);

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
    const interval = window.setInterval(pluck, 880);
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
    resumeAudio,
    toggleDrone,
    toggleTabla,
  };
}
