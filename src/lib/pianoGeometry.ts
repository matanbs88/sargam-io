export type PianoKeyGeometry = {
  readonly midi: number;
  readonly isBlack: boolean;
  /** Horizontal position as a percentage of the full keyboard. */
  readonly left: number;
  /** Key width as a percentage of the full keyboard. */
  readonly width: number;
};

const WHITE_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);

export const PERFORMANCE_PIANO_RANGE = {
  firstMidi: 48, // C3
  lastMidi: 96, // C7
} as const;

export const REFERENCE_PIANO_RANGE = {
  firstMidi: 60, // C4
  lastMidi: 84, // C6
} as const;

export function isWhitePianoKey(midi: number): boolean {
  return WHITE_PITCH_CLASSES.has(((midi % 12) + 12) % 12);
}

/**
 * Produces one geometric source of truth for piano keys and falling-note bars.
 * Black keys are centred exactly on the boundary between their two white keys.
 */
export function createPianoKeyGeometry(
  firstMidi: number,
  lastMidi: number,
): readonly PianoKeyGeometry[] {
  const midiValues = Array.from(
    { length: lastMidi - firstMidi + 1 },
    (_, index) => firstMidi + index,
  );
  const whiteKeys = midiValues.filter(isWhitePianoKey);
  const whiteIndexByMidi = new Map(
    whiteKeys.map((midi, index) => [midi, index]),
  );
  const whiteKeyWidth = 100 / whiteKeys.length;
  const blackKeyWidth = whiteKeyWidth * 0.62;

  return midiValues.map((midi) => {
    const isBlack = !isWhitePianoKey(midi);

    if (!isBlack) {
      return {
        midi,
        isBlack,
        left: (whiteIndexByMidi.get(midi) ?? 0) * whiteKeyWidth,
        width: whiteKeyWidth,
      };
    }

    const precedingWhiteIndex = whiteIndexByMidi.get(midi - 1) ?? 0;

    return {
      midi,
      isBlack,
      left: (precedingWhiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2,
      width: blackKeyWidth,
    };
  });
}

export const PERFORMANCE_PIANO_KEYS = createPianoKeyGeometry(
  PERFORMANCE_PIANO_RANGE.firstMidi,
  PERFORMANCE_PIANO_RANGE.lastMidi,
);

export const REFERENCE_PIANO_KEYS = createPianoKeyGeometry(
  REFERENCE_PIANO_RANGE.firstMidi,
  REFERENCE_PIANO_RANGE.lastMidi,
);
