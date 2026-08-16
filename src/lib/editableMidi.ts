import type { MidiNoteEvent } from "@/src/lib/midiToSargam";

const MIN_MIDI = 0;
const MAX_MIDI = 127;

/** Applies one explicit semitone correction without mutating the source phrase. */
export function adjustMidiEvent(
  events: readonly MidiNoteEvent[],
  eventIndex: number,
  semitones: -1 | 1,
): readonly MidiNoteEvent[] {
  return events.map((event, index) =>
    index === eventIndex
      ? {
          ...event,
          midi: Math.min(MAX_MIDI, Math.max(MIN_MIDI, event.midi + semitones)),
        }
      : event,
  );
}

/** Verifies that persisted corrections are safe to replay over a known phrase. */
export function hasValidMidiOverrides(
  overrides: unknown,
  expectedLength: number,
): overrides is readonly number[] {
  return (
    Array.isArray(overrides) &&
    overrides.length === expectedLength &&
    overrides.every(
      (midi) =>
        typeof midi === "number" &&
        Number.isInteger(midi) &&
        midi >= MIN_MIDI &&
        midi <= MAX_MIDI,
    )
  );
}

/** Rehydrates an edited phrase while retaining source timing and velocity. */
export function applyMidiOverrides(
  events: readonly MidiNoteEvent[],
  overrides: readonly number[],
): readonly MidiNoteEvent[] {
  return events.map((event, index) => ({ ...event, midi: overrides[index] ?? event.midi }));
}
