export type NotationSystem = "sargam" | "abc";

export type ConvertedNote = {
  midi: number;
  interval: number;
  octaveShift: number;
  sargam: string;
  abc: string;
};

export type MidiNoteEvent = {
  midi: number;
  startMs: number;
  durationMs: number;
  velocity?: number;
};

export type ConvertedNoteEvent = ConvertedNote & Omit<MidiNoteEvent, "midi">;

/**
 * Product ASCII notation, from Sa upward. This is intentionally an ASCII
 * representation for learners, not a complete rendering of Bhatkhande's
 * Devanagari notation or of raga-specific shruti/intonation.
 */
export const SARGAM_NOTES = ["S", "r", "R", "g", "G", "m", "M", "P", "d", "D", "n", "N"] as const;
const ABC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function validateMidi(midi: number, label: string) {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new RangeError(`${label} must be an integer MIDI value from 0 to 127.`);
  }
}

/**
 * Converts absolute MIDI pitches into a relative Sargam/ABC representation.
 * `rootMidi` is the MIDI pitch treated as Sa (or C in the ABC-relative view).
 */
export function midiToRelativeNotes(
  midiNotes: readonly number[],
  rootMidi: number,
): ConvertedNote[] {
  validateMidi(rootMidi, "rootMidi");
  return midiNotes.map((midi) => {
    validateMidi(midi, "midi note");
    const distance = midi - rootMidi;
    const interval = ((distance % 12) + 12) % 12;
    const octaveShift = Math.floor(distance / 12);
    const octaveMark = octaveShift > 0 ? "'".repeat(octaveShift) : ".".repeat(Math.abs(octaveShift));

    return {
      midi,
      interval,
      octaveShift,
      sargam: `${SARGAM_NOTES[interval]}${octaveMark}`,
      abc: `${ABC_NOTES[interval]}${octaveMark}`,
    };
  });
}

/** Preserves provider timing data while deriving a learner-facing pitch label. */
export function midiEventsToRelativeNotes(
  events: readonly MidiNoteEvent[],
  rootMidi: number,
): ConvertedNoteEvent[] {
  return events.map((event) => ({
    ...midiToRelativeNotes([event.midi], rootMidi)[0],
    startMs: event.startMs,
    durationMs: event.durationMs,
    velocity: event.velocity,
  }));
}

export function formatRelativeNotes(
  midiNotes: readonly number[],
  rootMidi: number,
  notation: NotationSystem,
): string[] {
  return midiToRelativeNotes(midiNotes, rootMidi).map((note) => note[notation]);
}
