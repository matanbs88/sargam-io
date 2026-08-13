export type TaalId = "teentaal" | "jhaptaal" | "rupak" | "ektal" | "dadra" | "keherwa";

export type TaalDivision = {
  beats: number;
  gesture: "sam" | "tali" | "khali";
};

export type TaalDefinition = {
  id: TaalId;
  label: string;
  matras: number;
  divisions: readonly TaalDivision[];
};

/**
 * Structural tala metadata for display/practice grids. It is never inferred
 * from BPM alone: detecting tala from a mix requires dedicated rhythm analysis.
 */
export const TAALS: Record<TaalId, TaalDefinition> = {
  teentaal: {
    id: "teentaal",
    label: "Teentaal",
    matras: 16,
    divisions: [
      { beats: 4, gesture: "sam" },
      { beats: 4, gesture: "tali" },
      { beats: 4, gesture: "khali" },
      { beats: 4, gesture: "tali" },
    ],
  },
  jhaptaal: {
    id: "jhaptaal",
    label: "Jhaptal",
    matras: 10,
    divisions: [
      { beats: 2, gesture: "sam" },
      { beats: 3, gesture: "tali" },
      { beats: 2, gesture: "khali" },
      { beats: 3, gesture: "tali" },
    ],
  },
  rupak: {
    id: "rupak",
    label: "Rupak",
    matras: 7,
    divisions: [
      { beats: 3, gesture: "khali" },
      { beats: 2, gesture: "tali" },
      { beats: 2, gesture: "tali" },
    ],
  },
  ektal: {
    id: "ektal",
    label: "Ektal",
    matras: 12,
    divisions: [
      { beats: 2, gesture: "sam" },
      { beats: 2, gesture: "khali" },
      { beats: 2, gesture: "tali" },
      { beats: 2, gesture: "khali" },
      { beats: 2, gesture: "tali" },
      { beats: 2, gesture: "tali" },
    ],
  },
  dadra: {
    id: "dadra",
    label: "Dadra",
    matras: 6,
    divisions: [
      { beats: 3, gesture: "sam" },
      { beats: 3, gesture: "khali" },
    ],
  },
  keherwa: {
    id: "keherwa",
    label: "Keherwa",
    matras: 8,
    divisions: [
      { beats: 4, gesture: "sam" },
      { beats: 4, gesture: "khali" },
    ],
  },
};

export function beatsInTaal(taal: TaalDefinition): number {
  return taal.divisions.reduce((total, division) => total + division.beats, 0);
}

export function validateTaal(taal: TaalDefinition): boolean {
  return beatsInTaal(taal) === taal.matras;
}
