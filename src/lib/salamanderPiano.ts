/**
 * Browser-safe manifest for a small, on-demand subset of the Salamander Grand
 * Piano V3. The complete library is roughly 650 MB, so Sargam.io does not
 * bundle it in the application repository. A deployment can point the public
 * base URL at its own approved object storage without changing the sampler.
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

/**
 * Salamander's natural piano SFZ maps one sample every minor third. v8 is a
 * musical mid-dynamic layer (MIDI velocities 57–64) and keeps the MVP light:
 * only the nearest sample to a requested note is fetched and cached.
 */
export const SALAMANDER_GUIDE_SAMPLES: readonly SalamanderSample[] = [
  { midi: 48, noteName: "C3", fileName: "C3v8.wav", velocityLayer: 8 },
  { midi: 51, noteName: "D#3", fileName: "D#3v8.wav", velocityLayer: 8 },
  { midi: 54, noteName: "F#3", fileName: "F#3v8.wav", velocityLayer: 8 },
  { midi: 57, noteName: "A3", fileName: "A3v8.wav", velocityLayer: 8 },
  { midi: 60, noteName: "C4", fileName: "C4v8.wav", velocityLayer: 8 },
  { midi: 63, noteName: "D#4", fileName: "D#4v8.wav", velocityLayer: 8 },
  { midi: 66, noteName: "F#4", fileName: "F#4v8.wav", velocityLayer: 8 },
  { midi: 69, noteName: "A4", fileName: "A4v8.wav", velocityLayer: 8 },
  { midi: 72, noteName: "C5", fileName: "C5v8.wav", velocityLayer: 8 },
  { midi: 75, noteName: "D#5", fileName: "D#5v8.wav", velocityLayer: 8 },
  { midi: 78, noteName: "F#5", fileName: "F#5v8.wav", velocityLayer: 8 },
  { midi: 81, noteName: "A5", fileName: "A5v8.wav", velocityLayer: 8 },
  { midi: 84, noteName: "C6", fileName: "C6v8.wav", velocityLayer: 8 },
];

export function selectSalamanderSample(
  midi: number,
  samples: readonly SalamanderSample[] = SALAMANDER_GUIDE_SAMPLES,
): SalamanderSample {
  if (samples.length === 0) {
    throw new Error("At least one Salamander sample is required.");
  }

  return samples.reduce((closest, candidate) =>
    Math.abs(candidate.midi - midi) < Math.abs(closest.midi - midi)
      ? candidate
      : closest,
  );
}

export function getSalamanderSampleUrl(
  midi: number,
  baseUrl: string = SALAMANDER_SAMPLE_BASE_URL,
): string {
  const sample = selectSalamanderSample(midi);
  return `${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(sample.fileName)}`;
}

export function getSalamanderPlaybackRate(
  midi: number,
  sample: SalamanderSample,
): number {
  return 2 ** ((midi - sample.midi) / 12);
}
