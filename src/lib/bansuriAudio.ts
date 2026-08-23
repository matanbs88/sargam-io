/**
 * Musical controls for the browser-native Bansuri guide voice.
 *
 * This is intentionally a pure module. The Web Audio graph lives in the
 * practice hook, while this file keeps the sound-design decisions testable
 * and ready to be replaced by a cleared multi-sample manifest later.
 */

export type BansuriAudioProfile = {
  readonly durationSeconds: number;
  readonly normalizedVelocity: number;
  readonly tonePeak: number;
  readonly breathPeak: number;
  readonly bodyFilterHz: number;
  readonly breathFilterHz: number;
  readonly vibratoHz: number;
  readonly vibratoDepthCents: number;
  readonly harmonicMix: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Returns a musically conservative profile for one guided Bansuri note.
 * Higher notes get a little more air and brightness; velocity changes the
 * breath pressure without making the guide harsh or excessively loud.
 */
export function getBansuriAudioProfile(
  midi: number,
  durationMs: number,
  velocity = 64,
): BansuriAudioProfile {
  const durationSeconds = clamp(durationMs / 1_000, 0.14, 1.8);
  const normalizedVelocity = clamp(velocity, 1, 127) / 127;
  const register = clamp((midi - 48) / 36, 0, 1);

  return {
    durationSeconds,
    normalizedVelocity,
    tonePeak: 0.055 + normalizedVelocity * 0.095,
    breathPeak: 0.006 + normalizedVelocity * (0.01 + register * 0.006),
    bodyFilterHz: 2_400 + register * 2_100,
    breathFilterHz: 2_000 + register * 2_600,
    vibratoHz: 5.05 + register * 0.35,
    vibratoDepthCents: 5.5 + normalizedVelocity * 4.5,
    harmonicMix: 0.12 + register * 0.08,
  };
}

