import { describe, expect, it } from "vitest";
import { getPlaybackClockTime } from "./playbackClock";

describe("playback clock", () => {
  it("holds the authored event time while paused", () => {
    expect(
      getPlaybackClockTime({
        baseTimeMs: 500,
        isPlaying: false,
        nowMs: 1_000,
        playbackRate: 2,
        startedAtMs: 900,
      }),
    ).toBe(500);
  });

  it("advances from the active event at the selected rate", () => {
    expect(
      getPlaybackClockTime({
        baseTimeMs: 500,
        isPlaying: true,
        nowMs: 1_250,
        playbackRate: 2,
        startedAtMs: 1_000,
      }),
    ).toBe(1_000);
  });

  it("clamps invalid playback rates to the safe default", () => {
    expect(
      getPlaybackClockTime({
        baseTimeMs: 500,
        isPlaying: true,
        nowMs: 1_250,
        playbackRate: Number.NaN,
        startedAtMs: 1_000,
      }),
    ).toBe(750);
  });
});
