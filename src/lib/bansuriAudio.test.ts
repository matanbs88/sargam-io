import { describe, expect, it } from "vitest";
import { getBansuriAudioProfile } from "./bansuriAudio";

describe("browser Bansuri voice profile", () => {
  it("keeps the guide within a restrained musical range", () => {
    const profile = getBansuriAudioProfile(60, 600, 80);

    expect(profile.durationSeconds).toBe(0.6);
    expect(profile.tonePeak).toBeGreaterThan(0.055);
    expect(profile.tonePeak).toBeLessThan(0.16);
    expect(profile.breathPeak).toBeGreaterThan(0);
    expect(profile.vibratoHz).toBeGreaterThan(5);
  });

  it("adds brightness and air to the upper register", () => {
    const low = getBansuriAudioProfile(48, 600, 80);
    const high = getBansuriAudioProfile(84, 600, 80);

    expect(high.bodyFilterHz).toBeGreaterThan(low.bodyFilterHz);
    expect(high.breathFilterHz).toBeGreaterThan(low.breathFilterHz);
    expect(high.breathPeak).toBeGreaterThan(low.breathPeak);
  });

  it("clamps extreme MIDI timing and velocity values", () => {
    const profile = getBansuriAudioProfile(60, 0, 999);

    expect(profile.durationSeconds).toBe(0.14);
    expect(profile.normalizedVelocity).toBe(1);
    expect(profile.tonePeak).toBeLessThan(0.16);
  });
});

