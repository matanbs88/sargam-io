import { describe, expect, it } from "vitest";
import {
  clampEventIndex,
  getLastEventIndex,
  getPlaybackProgress,
  stepEventIndex,
} from "./playback";

describe("note-event playback helpers", () => {
  it("uses -1 as the only valid empty-transport index", () => {
    expect(getLastEventIndex(0)).toBe(-1);
    expect(clampEventIndex(0, 0)).toBe(-1);
  });

  it("clamps transport seeks at the first and last events", () => {
    expect(clampEventIndex(-2, 13)).toBe(0);
    expect(clampEventIndex(14, 13)).toBe(12);
  });

  it("steps without off-by-one overflow", () => {
    expect(stepEventIndex(0, -1, 13)).toBe(0);
    expect(stepEventIndex(12, 1, 13)).toBe(12);
    expect(stepEventIndex(6, 1, 13)).toBe(7);
  });

  it("calculates bounded progress", () => {
    expect(getPlaybackProgress(0, 13)).toBe(0);
    expect(getPlaybackProgress(12, 13)).toBe(100);
    expect(getPlaybackProgress(99, 13)).toBe(100);
    expect(getPlaybackProgress(0, 1)).toBe(0);
  });
});
