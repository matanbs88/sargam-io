import { BASIC_THEKAS } from "./tabla";
import type { TaalId } from "./taal";

export type DroneMode = "SaPa" | "SaMa";

export type TablaVoice = "bayan" | "dayan" | "combined";

/**
 * A small, explicit sound-design vocabulary for the browser-native practice
 * engine. It is intentionally not presented as a recording of a tabla player.
 */
export type TablaBolProfile = {
  readonly brightness: number;
  readonly decayMs: number;
  readonly voice: TablaVoice;
};

const BOL_PROFILES: Readonly<Record<string, TablaBolProfile>> = {
  Dha: { voice: "combined", brightness: 0.48, decayMs: 240 },
  DhaGe: { voice: "combined", brightness: 0.36, decayMs: 300 },
  Dhi: { voice: "dayan", brightness: 0.58, decayMs: 220 },
  Dhin: { voice: "combined", brightness: 0.52, decayMs: 280 },
  Ge: { voice: "bayan", brightness: 0.22, decayMs: 260 },
  Ka: { voice: "dayan", brightness: 0.68, decayMs: 95 },
  Kat: { voice: "dayan", brightness: 0.62, decayMs: 120 },
  Na: { voice: "dayan", brightness: 0.7, decayMs: 130 },
  Ta: { voice: "dayan", brightness: 0.76, decayMs: 100 },
  Ti: { voice: "dayan", brightness: 0.73, decayMs: 105 },
  Tin: { voice: "dayan", brightness: 0.64, decayMs: 180 },
  Tirakita: { voice: "dayan", brightness: 0.7, decayMs: 110 },
  Tu: { voice: "bayan", brightness: 0.3, decayMs: 190 },
};

const DEFAULT_BOL_PROFILE: TablaBolProfile = {
  voice: "dayan",
  brightness: 0.55,
  decayMs: 150,
};

/** Returns the standard Pa/Ma–Sa–Sa–upper Sa sequence for a four-string Tanpura. */
export function getDroneStringMidis(
  rootMidi: number,
  mode: DroneMode,
): readonly number[] {
  const fifthOrFourth = mode === "SaPa" ? 7 : 5;

  return [rootMidi + fifthOrFourth - 12, rootMidi, rootMidi, rootMidi + 12];
}

/** Keeps the audio engine aligned with the same displayed theka as the UI. */
export function getPracticeBol(taalId: TaalId, matraIndex: number): string {
  const bols = BASIC_THEKAS[taalId];
  const normalizedIndex = ((matraIndex % bols.length) + bols.length) % bols.length;

  return bols[normalizedIndex];
}

export function getTablaBolProfile(bol: string): TablaBolProfile {
  return BOL_PROFILES[bol] ?? DEFAULT_BOL_PROFILE;
}
