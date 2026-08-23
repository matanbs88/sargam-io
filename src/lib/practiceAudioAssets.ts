/**
 * Stable names for the sounds the practice experience needs. Provider files
 * never leak into transport or rhythm logic, so an approved library can replace
 * browser synthesis without changing the user-facing timing model.
 */
export type PracticeAudioRole =
  | "piano.guide"
  | "tanpura.sa-pa"
  | "tanpura.sa-ma"
  | "tabla.dayan"
  | "tabla.bayan"
  | "bansuri.guide"
  | "harmonium.guide";

export type AudioAssetStatus = "generated" | "candidate" | "approved";

export type PracticeAudioAsset = {
  readonly role: PracticeAudioRole;
  readonly status: AudioAssetStatus;
  readonly provider: string;
  readonly sourceUrl: string | null;
  readonly canLoop: boolean;
  readonly canPitchMap: boolean;
  readonly canStreamInApp: boolean;
  readonly notes: string;
};

/**
 * The current app has no bundled recordings. These entries make that state
 * explicit and define the exact roles a founder-approved library will replace.
 */
export const CURRENT_PRACTICE_AUDIO_ASSETS: readonly PracticeAudioAsset[] = [
  {
    role: "piano.guide",
    status: "approved",
    provider: "Salamander Grand Piano V3 / Alexander Holm",
    sourceUrl: "https://piano.usini.eu/",
    canLoop: false,
    canPitchMap: true,
    canStreamInApp: true,
    notes:
      "Full 30-anchor x 16-layer manifest with lazy on-demand fetch; CC BY 3.0 attribution required. Production should mirror selected files to approved object storage.",
  },
  {
    role: "tanpura.sa-pa",
    status: "generated",
    provider: "Browser Web Audio synthesis",
    sourceUrl: null,
    canLoop: true,
    canPitchMap: true,
    canStreamInApp: true,
    notes: "Generated Sa-Pa practice drone; not a recorded Tanpura asset.",
  },
  {
    role: "tanpura.sa-ma",
    status: "generated",
    provider: "Browser Web Audio synthesis",
    sourceUrl: null,
    canLoop: true,
    canPitchMap: true,
    canStreamInApp: true,
    notes: "Generated Sa-Ma practice drone; not a recorded Tanpura asset.",
  },
  {
    role: "tabla.dayan",
    status: "generated",
    provider: "Browser Web Audio synthesis",
    sourceUrl: null,
    canLoop: false,
    canPitchMap: false,
    canStreamInApp: true,
    notes: "Generated tabla-shaped cue; not a recorded Tabla sample.",
  },
  {
    role: "tabla.bayan",
    status: "generated",
    provider: "Browser Web Audio synthesis",
    sourceUrl: null,
    canLoop: false,
    canPitchMap: false,
    canStreamInApp: true,
    notes: "Generated tabla-shaped cue; not a recorded Tabla sample.",
  },
  {
    role: "bansuri.guide",
    status: "generated",
    provider: "Browser Web Audio synthesis",
    sourceUrl: null,
    canLoop: false,
    canPitchMap: true,
    canStreamInApp: true,
    notes: "Generated guide pitch; no Bansuri recording is currently bundled.",
  },
  {
    role: "harmonium.guide",
    status: "generated",
    provider: "Browser Web Audio synthesis",
    sourceUrl: null,
    canLoop: false,
    canPitchMap: true,
    canStreamInApp: true,
    notes: "Generated guide pitch; no Harmonium recording is currently bundled.",
  },
];

export function isStreamReadyAsset(asset: PracticeAudioAsset): boolean {
  return asset.status === "approved" && asset.canStreamInApp;
}
