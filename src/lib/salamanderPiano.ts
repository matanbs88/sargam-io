/**
 * Browser-safe manifest for the Salamander Grand Piano V3. The complete
 * library is roughly 650 MB, so Sargam.io fetches only the nearest note and
 * velocity layer on demand instead of bundling the archive in the repository.
 */
export type SalamanderSample = {
  readonly midi: number;
  readonly noteName: string;
  readonly fileName: string;
  readonly velocityLayer: number;
};

export const SALAMANDER_SAMPLE_BASE_URL =
  process.env.NEXT_PUBLIC_SALAMANDER_SAMPLE_BASE_URL ??
  "https://media.githubusercontent.com/media/remisarrailh/SalamanderPianoApp/68b7b4db7188eafd1a868c11daf7a8e375642df9/android/app/src/main/assets/sfz/Samples";

/** The original SFZ mapping samples one note every minor third. */
export const SALAMANDER_SAMPLE_ANCHORS = [
  { midi: 21, noteName: "A0" },
  { midi: 24, noteName: "C1" },
  { midi: 27, noteName: "D#1" },
  { midi: 30, noteName: "F#1" },
  { midi: 33, noteName: "A1" },
  { midi: 36, noteName: "C2" },
  { midi: 39, noteName: "D#2" },
  { midi: 42, noteName: "F#2" },
  { midi: 45, noteName: "A2" },
  { midi: 48, noteName: "C3" },
  { midi: 51, noteName: "D#3" },
  { midi: 54, noteName: "F#3" },
  { midi: 57, noteName: "A3" },
  { midi: 60, noteName: "C4" },
  { midi: 63, noteName: "D#4" },
  { midi: 66, noteName: "F#4" },
  { midi: 69, noteName: "A4" },
  { midi: 72, noteName: "C5" },
  { midi: 75, noteName: "D#5" },
  { midi: 78, noteName: "F#5" },
  { midi: 81, noteName: "A5" },
  { midi: 84, noteName: "C6" },
  { midi: 87, noteName: "D#6" },
  { midi: 90, noteName: "F#6" },
  { midi: 93, noteName: "A6" },
  { midi: 96, noteName: "C7" },
  { midi: 99, noteName: "D#7" },
  { midi: 102, noteName: "F#7" },
  { midi: 105, noteName: "A7" },
  { midi: 108, noteName: "C8" },
] as const;

/** Exact velocity ranges from the original Salamander SFZ mapping. */
export const SALAMANDER_VELOCITY_RANGES = [
  { layer: 1, min: 1, max: 26 },
  { layer: 2, min: 27, max: 34 },
  { layer: 3, min: 35, max: 36 },
  { layer: 4, min: 37, max: 43 },
  { layer: 5, min: 44, max: 46 },
  { layer: 6, min: 47, max: 50 },
  { layer: 7, min: 51, max: 56 },
  { layer: 8, min: 57, max: 64 },
  { layer: 9, min: 65, max: 72 },
  { layer: 10, min: 73, max: 80 },
  { layer: 11, min: 81, max: 88 },
  { layer: 12, min: 89, max: 96 },
  { layer: 13, min: 97, max: 104 },
  { layer: 14, min: 105, max: 112 },
  { layer: 15, min: 113, max: 120 },
  { layer: 16, min: 121, max: 127 },
] as const;

/** Full 30-anchor × 16-layer manifest; files remain lazy and are not bundled. */
export const SALAMANDER_GUIDE_SAMPLES: readonly SalamanderSample[] =
  SALAMANDER_SAMPLE_ANCHORS.flatMap((anchor) =>
    SALAMANDER_VELOCITY_RANGES.map(({ layer }) => ({
      ...anchor,
      fileName: `${anchor.noteName}v${layer}.wav`,
      velocityLayer: layer,
    })),
  );

export function getSalamanderVelocityLayer(velocity = 64): number {
  const normalizedVelocity = Math.min(127, Math.max(1, Math.round(velocity)));
  return (
    SALAMANDER_VELOCITY_RANGES.find(
      ({ min, max }) => normalizedVelocity >= min && normalizedVelocity <= max,
    )?.layer ?? 8
  );
}

export function selectSalamanderSample(
  midi: number,
  velocity = 64,
  samples: readonly SalamanderSample[] = SALAMANDER_GUIDE_SAMPLES,
): SalamanderSample {
  if (samples.length === 0) {
    throw new Error("At least one Salamander sample is required.");
  }

  const layer = getSalamanderVelocityLayer(velocity);
  const layerSamples = samples.filter((sample) => sample.velocityLayer === layer);
  const candidates = layerSamples.length > 0 ? layerSamples : samples;

  return candidates.reduce((closest, candidate) =>
    Math.abs(candidate.midi - midi) < Math.abs(closest.midi - midi)
      ? candidate
      : closest,
  );
}

export function getSalamanderSampleUrl(
  midi: number,
  baseUrl: string = SALAMANDER_SAMPLE_BASE_URL,
  velocity = 64,
): string {
  const sample = selectSalamanderSample(midi, velocity);
  return `${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(sample.fileName)}`;
}

export function getSalamanderPlaybackRate(
  midi: number,
  sample: SalamanderSample,
): number {
  return 2 ** ((midi - sample.midi) / 12);
}
