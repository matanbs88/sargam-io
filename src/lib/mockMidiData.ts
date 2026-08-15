import type { MidiNoteEvent } from "./midiToSargam";

export type DetectedKey = {
  readonly pitchClass: string;
  readonly rootMidi: number;
  readonly displayName: string;
};

export type MockMidiData = {
  readonly id: string;
  readonly title: string;
  readonly sourceType: "mock";
  readonly detectedKey: DetectedKey;
  readonly tempoBpm: number;
  readonly timeSignature: "4/4";
  readonly durationMs: number;
  readonly noteEvents: readonly MidiNoteEvent[];
};

/**
 * Phase 1 local transcription result. D4 (MIDI 62) is treated as Sa.
 * The phrase covers all twelve Sargam tokens and resolves to upper Sa.
 */
export const mockMidiEvents: readonly MidiNoteEvent[] = [
  { midi: 62, startMs: 0, durationMs: 420, velocity: 88 },
  { midi: 63, startMs: 500, durationMs: 420, velocity: 82 },
  { midi: 64, startMs: 1000, durationMs: 420, velocity: 86 },
  { midi: 65, startMs: 1500, durationMs: 420, velocity: 80 },
  { midi: 66, startMs: 2000, durationMs: 420, velocity: 84 },
  { midi: 67, startMs: 2500, durationMs: 420, velocity: 86 },
  { midi: 68, startMs: 3000, durationMs: 420, velocity: 80 },
  { midi: 69, startMs: 3500, durationMs: 420, velocity: 90 },
  { midi: 70, startMs: 4000, durationMs: 420, velocity: 82 },
  { midi: 71, startMs: 4500, durationMs: 420, velocity: 86 },
  { midi: 72, startMs: 5000, durationMs: 420, velocity: 80 },
  { midi: 73, startMs: 5500, durationMs: 420, velocity: 84 },
  { midi: 74, startMs: 6000, durationMs: 800, velocity: 94 },
] as const;

export const mockMidiData: MockMidiData = {
  id: "mock-chromatic-sargam-phrase",
  title: "Phase 1 Mock Sargam Phrase",
  sourceType: "mock",
  detectedKey: {
    pitchClass: "D",
    rootMidi: 62,
    displayName: "D (Sa)",
  },
  tempoBpm: 120,
  timeSignature: "4/4",
  durationMs: 6800,
  noteEvents: mockMidiEvents,
};
