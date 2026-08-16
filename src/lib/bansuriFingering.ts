export type BansuriHoleState = "closed" | "open" | "half-open";

type SixHolePattern = readonly [
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
];

export type BansuriFingering = {
  readonly label: string;
  readonly holes: SixHolePattern;
};

/** Hole centers on the horizontal flute. Hole 1 is nearest the embouchure. */
export const BANSURI_FINGER_HOLE_POSITIONS = [35, 43, 51, 59, 67, 75] as const;

const REFERENCE_FINGERINGS: readonly BansuriFingering[] = [
  { label: "S · Sa", holes: ["closed", "closed", "closed", "open", "open", "open"] },
  { label: "r · Komal Re", holes: ["closed", "closed", "half-open", "open", "open", "open"] },
  { label: "R · Re", holes: ["closed", "closed", "open", "open", "open", "open"] },
  { label: "g · Komal Ga", holes: ["closed", "half-open", "open", "open", "open", "open"] },
  { label: "G · Ga", holes: ["closed", "open", "open", "open", "open", "open"] },
  { label: "m · Ma", holes: ["half-open", "open", "open", "open", "open", "open"] },
  { label: "M · Teevra Ma", holes: ["open", "open", "open", "open", "open", "open"] },
  { label: "P · Pa", holes: ["closed", "closed", "closed", "closed", "closed", "closed"] },
  { label: "d · Komal Dha", holes: ["closed", "closed", "closed", "closed", "closed", "half-open"] },
  { label: "D · Dha", holes: ["closed", "closed", "closed", "closed", "closed", "open"] },
  { label: "n · Komal Ni", holes: ["closed", "closed", "closed", "closed", "half-open", "open"] },
  { label: "N · Ni", holes: ["closed", "closed", "closed", "closed", "open", "open"] },
];

function getRelativeInterval(activeMidi: number, rootMidi: number): number {
  return ((activeMidi - rootMidi) % 12 + 12) % 12;
}

/** Six-hole Hindustani Bansuri reference map relative to Sa. */
export function getBansuriReferenceFingering(
  activeMidi: number | null,
  rootMidi: number,
): BansuriFingering | null {
  if (activeMidi === null) return null;
  return REFERENCE_FINGERINGS[getRelativeInterval(activeMidi, rootMidi)] ?? null;
}

/** Converts a flute-body-relative percentage into a percentage of the stage. */
export function getBansuriTimelineXPosition(holeIndex: number): number {
  const holePosition = BANSURI_FINGER_HOLE_POSITIONS[holeIndex];
  if (holePosition === undefined) {
    throw new RangeError("Bansuri hole index must be between 0 and 5.");
  }

  return 7 + (holePosition / 100) * 86;
}
