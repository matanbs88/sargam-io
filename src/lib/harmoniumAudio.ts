/**
 * Browser-safe manifest for the open harmonium sample set published by
 * nbrosowsky/tonejs-instruments. The repository identifies its samples as
 * CC BY 3.0; keep the attribution visible and re-check the licence before
 * production SaaS distribution.
 */
export type HarmoniumSample = {
  readonly midi: number;
  readonly noteName: string;
  readonly fileName: string;
};

export const HARMONIUM_SAMPLE_BASE_URL =
  process.env.NEXT_PUBLIC_HARMONIUM_SAMPLE_BASE_URL ??
  "https://nbrosowsky.github.io/tonejs-instruments/samples/harmonium";

/** The source manifest provides chromatic anchors from C2 through A#4. */
const HARMONIUM_SAMPLE_ANCHOR_DATA = [
  [36, "C2", "C2.mp3"],
  [37, "C#2", "Cs2.mp3"],
  [38, "D2", "D2.mp3"],
  [39, "D#2", "Ds2.mp3"],
  [40, "E2", "E2.mp3"],
  [41, "F2", "F2.mp3"],
  [42, "F#2", "Fs2.mp3"],
  [43, "G2", "G2.mp3"],
  [44, "G#2", "Gs2.mp3"],
  [45, "A2", "A2.mp3"],
  [46, "A#2", "As2.mp3"],
  [48, "C3", "C3.mp3"],
  [49, "C#3", "Cs3.mp3"],
  [50, "D3", "D3.mp3"],
  [51, "D#3", "Ds3.mp3"],
  [52, "E3", "E3.mp3"],
  [53, "F3", "F3.mp3"],
  [54, "F#3", "Fs3.mp3"],
  [55, "G3", "G3.mp3"],
  [56, "G#3", "Gs3.mp3"],
  [57, "A3", "A3.mp3"],
  [58, "A#3", "As3.mp3"],
  [60, "C4", "C4.mp3"],
  [61, "C#4", "Cs4.mp3"],
  [62, "D4", "D4.mp3"],
  [63, "D#4", "Ds4.mp3"],
  [64, "E4", "E4.mp3"],
  [65, "F4", "F4.mp3"],
  [66, "F#4", "Fs4.mp3"],
  [67, "G4", "G4.mp3"],
  [68, "G#4", "Gs4.mp3"],
  [69, "A4", "A4.mp3"],
  [70, "A#4", "As4.mp3"],
] as const;

export const HARMONIUM_SAMPLE_ANCHORS: readonly HarmoniumSample[] =
  HARMONIUM_SAMPLE_ANCHOR_DATA.map(([midi, noteName, fileName]) => ({
    midi,
    noteName,
    fileName,
  }));

export function selectHarmoniumSample(midi: number): HarmoniumSample {
  return HARMONIUM_SAMPLE_ANCHORS.reduce((closest, candidate) =>
    Math.abs(candidate.midi - midi) < Math.abs(closest.midi - midi)
      ? candidate
      : closest,
  );
}

export function getHarmoniumSampleUrl(
  midi: number,
  baseUrl: string = HARMONIUM_SAMPLE_BASE_URL,
): string {
  const sample = selectHarmoniumSample(midi);
  return `${baseUrl.replace(/\/$/, "")}/${sample.fileName}`;
}

export function getHarmoniumPlaybackRate(
  midi: number,
  sample: HarmoniumSample,
): number {
  return 2 ** ((midi - sample.midi) / 12);
}
