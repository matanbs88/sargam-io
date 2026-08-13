export type BansuriKey = "C" | "D" | "E" | "F" | "G";

const BANSURI_SA_MIDI: Record<BansuriKey, number> = {
  C: 60,
  D: 62,
  E: 64,
  F: 65,
  G: 67,
};

export type BansuriProfile = {
  key: BansuriKey;
  saMidi: number;
  holeCount: 6 | 7;
  calibrationRequired: boolean;
};

/**
 * A key establishes a concert-pitch reference, not a universal fingering map.
 * Exact holes/half-holes vary by maker, hole count, and embouchure, so a player
 * calibration step is required before showing prescriptive fingerings.
 */
export function createBansuriProfile(key: BansuriKey, holeCount: 6 | 7 = 6): BansuriProfile {
  return {
    key,
    saMidi: BANSURI_SA_MIDI[key],
    holeCount,
    calibrationRequired: true,
  };
}
