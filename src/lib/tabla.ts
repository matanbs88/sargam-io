import { TAALS, type TaalId } from "./taal";

/**
 * One useful basic theka per supported practice taal. These are learner
 * prompts, not a claim that a taal has one canonical performance variation.
 */
export const BASIC_THEKAS: Record<TaalId, readonly string[]> = {
  teentaal: [
    "Dha", "Dhin", "Dhin", "Dha",
    "Dha", "Dhin", "Dhin", "Dha",
    "Dha", "Tin", "Tin", "Ta",
    "Ta", "Dhin", "Dhin", "Dha",
  ],
  jhaptaal: ["Dhi", "Na", "Dhi", "Dhi", "Na", "Tin", "Na", "Dhi", "Dhi", "Na"],
  rupak: ["Tin", "Tin", "Na", "Dhin", "Na", "Dhin", "Na"],
  ektal: ["Dhin", "Dhin", "DhaGe", "Tirakita", "Tu", "Na", "Kat", "Ta", "DhaGe", "Tirakita", "Dhin", "Na"],
  dadra: ["Dha", "Dhi", "Na", "Dha", "Tu", "Na"],
  keherwa: ["Dha", "Ge", "Na", "Ti", "Na", "Ka", "Dhi", "Na"],
};

export function validateBasicTheka(taalId: TaalId): boolean {
  return BASIC_THEKAS[taalId].length === TAALS[taalId].matras;
}
