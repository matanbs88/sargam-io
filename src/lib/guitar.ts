export type GuitarStringNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type GuitarPosition = {
  readonly stringNumber: GuitarStringNumber;
  readonly openMidi: number;
  readonly fret: number;
};

type GuitarString = {
  readonly stringNumber: GuitarStringNumber;
  readonly openMidi: number;
  readonly label: string;
};

/** Standard guitar tuning, ordered from the first (high E) string to low E. */
export const STANDARD_GUITAR_TUNING: readonly GuitarString[] = [
  { stringNumber: 1, openMidi: 64, label: "E4" },
  { stringNumber: 2, openMidi: 59, label: "B3" },
  { stringNumber: 3, openMidi: 55, label: "G3" },
  { stringNumber: 4, openMidi: 50, label: "D3" },
  { stringNumber: 5, openMidi: 45, label: "A2" },
  { stringNumber: 6, openMidi: 40, label: "E2" },
] as const;

export const DISPLAY_FRET_COUNT = 12;

function assertMidiValue(midi: number): void {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new RangeError("midi must be an integer MIDI value between 0 and 127.");
  }
}

/**
 * Finds a playable position in standard tuning, preferring frets nearest the
 * current hand position. This is intentionally deterministic for Phase 2.
 */
export function midiToGuitarString(
  midi: number,
  preferredPosition = 5,
  maxFret = DISPLAY_FRET_COUNT,
): GuitarPosition | null {
  assertMidiValue(midi);

  if (!Number.isInteger(preferredPosition) || preferredPosition < 0) {
    throw new RangeError("preferredPosition must be a non-negative integer.");
  }

  if (!Number.isInteger(maxFret) || maxFret < 0) {
    throw new RangeError("maxFret must be a non-negative integer.");
  }

  const candidates = STANDARD_GUITAR_TUNING.flatMap((string) => {
    const fret = midi - string.openMidi;

    if (fret < 0 || fret > maxFret) {
      return [];
    }

    return [
      {
        stringNumber: string.stringNumber,
        openMidi: string.openMidi,
        fret,
      },
    ];
  });

  candidates.sort((left, right) => {
    const leftDistance = Math.abs(left.fret - preferredPosition);
    const rightDistance = Math.abs(right.fret - preferredPosition);

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.stringNumber - right.stringNumber;
  });

  return candidates[0] ?? null;
}
