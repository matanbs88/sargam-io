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
/** Vertical centers for the six playable holes, nearest embouchure first. */
export const BANSURI_FINGER_HOLE_POSITIONS = [34, 42, 50, 58, 66, 74] as const;

export type BansuriRunwayLane = {
  readonly interval: number;
  readonly top: number;
  readonly isNaturalAnchor: boolean;
  /** The physical hole this natural swara is aligned with, when applicable. */
  readonly holeIndex?: number;
};

function naturalLane(interval: number, holeIndex: number): BansuriRunwayLane {
  return {
    holeIndex,
    interval,
    isNaturalAnchor: true,
    top: BANSURI_FINGER_HOLE_POSITIONS[holeIndex],
  };
}

/**
 * Visual swara anchors for the six-hole reference profile. The natural swaras
 * are tied to their opening/closing landmark rather than being spaced as an
 * unrelated chromatic piano grid: Sa is the midpoint landmark (three upper
 * holes closed, three lower holes open). Komal and tivra variants remain
 * between the surrounding natural landmarks.
 */
export const BANSURI_RUNWAY_LANES: readonly BansuriRunwayLane[] = [
  { interval: 6, top: 18, isNaturalAnchor: false }, // tivra Ma
  { interval: 5, top: 26, isNaturalAnchor: true }, // shuddh Ma, half-hole transition above hole 1
  naturalLane(4, 0), // Ga, one closed
  { interval: 3, top: 38, isNaturalAnchor: false },
  naturalLane(2, 1), // Re, two closed
  { interval: 1, top: 46, isNaturalAnchor: false },
  naturalLane(0, 2), // Sa, three closed
  naturalLane(11, 3), // Ni, four closed
  { interval: 10, top: 62, isNaturalAnchor: false },
  naturalLane(9, 4), // Dha, five closed
  { interval: 8, top: 70, isNaturalAnchor: false },
  naturalLane(7, 5), // Pa, six closed
];

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

export function getBansuriRunwayLane(interval: number): BansuriRunwayLane {
  const normalizedInterval = ((interval % 12) + 12) % 12;
  const lane = BANSURI_RUNWAY_LANES.find(
    (candidate) => candidate.interval === normalizedInterval,
  );

  if (lane === undefined) {
    throw new RangeError("Bansuri runway interval must resolve to 0 through 11.");
  }

  return lane;
}

/** Converts a flute-body-relative percentage into a percentage of the stage. */
export function getBansuriTimelineXPosition(holeIndex: number): number {
  const holePosition = BANSURI_FINGER_HOLE_POSITIONS[holeIndex];
  if (holePosition === undefined) {
    throw new RangeError("Bansuri hole index must be between 0 and 5.");
  }

  return 7 + (holePosition / 100) * 86;
}
