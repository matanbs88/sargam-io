export type NotationSystem = "sargam" | "abc";

export type ConvertedNote = {
  midi: number;
  interval: number;
  octaveShift: number;
  sargam: string;
  abc: string;
};

const SARGAM_NOTES = ["S", "r", "R", "g", "G", "m", "M", "P", "d", "D", "n", "N"];
const ABC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Converts absolute MIDI pitches into a relative Sargam/ABC representation.
 * `rootMidi` is the MIDI pitch treated as Sa (or C in the ABC-relative view).
 */
export function midiToRelativeNotes(
  midiNotes: readonly number[],
  rootMidi: number,
): ConvertedNote[] {
  return midiNotes.map((midi) => {
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

export function formatRelativeNotes(
  midiNotes: readonly number[],
  rootMidi: number,
  notation: NotationSystem,
): string[] {
  return midiToRelativeNotes(midiNotes, rootMidi).map((note) => note[notation]);
}

