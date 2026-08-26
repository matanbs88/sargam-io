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
 * Audio roles are deliberately separated from transport and visualizer logic.
 * Harmonium is now wired to an open browser sample candidate, but remains a
 * candidate until the final SaaS redistribution and CDN audit is complete.
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
    provider: "Sargam Bansuri breath-and-resonance engine",
    sourceUrl: null,
    canLoop: false,
    canPitchMap: true,
    canStreamInApp: true,
    notes:
      "Browser-native Bansuri model with breath noise, harmonic body resonance and vibrato; no raw recording is distributed. A cleared multi-sample pack can replace this role later.",
  },
  {
    role: "harmonium.guide",
    status: "candidate",
    provider: "tonejs-instruments / Yale Euterpea harmonium samples",
    sourceUrl: "https://github.com/nbrosowsky/tonejs-instruments",
    canLoop: true,
    canPitchMap: true,
    canStreamInApp: true,
    notes:
      "Browser prototype uses the repository's chromatic harmonium sample map with a local loop envelope. Samples are identified as CC BY 3.0; production SaaS use requires preserved attribution and a final licence/CDN review.",
  },
];

export function isStreamReadyAsset(asset: PracticeAudioAsset): boolean {
  return asset.status === "approved" && asset.canStreamInApp;
}
