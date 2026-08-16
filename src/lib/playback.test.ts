import { describe, expect, it } from "vitest";
import {
  clampEventIndex,
  getNextEventIndex,
  getPlaybackDelay,
  getLastEventIndex,
  getPlaybackProgress,
  normalizeLoopRange,
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

  it("normalizes phrase-loop boundaries and returns to the loop start", () => {
    expect(normalizeLoopRange({ startIndex: 8, endIndex: 4 }, 13)).toEqual({
      startIndex: 4,
      endIndex: 8,
    });
    expect(getNextEventIndex(7, 13, { startIndex: 4, endIndex: 8 })).toBe(8);
    expect(getNextEventIndex(8, 13, { startIndex: 4, endIndex: 8 })).toBe(4);
    expect(getNextEventIndex(12, 13, null)).toBeNull();
  });

  it("uses stable, bounded delays for the speed ladder", () => {
    expect(getPlaybackDelay(420, 0.5)).toBe(840);
    expect(getPlaybackDelay(420, 2)).toBe(210);
    expect(getPlaybackDelay(40, 2)).toBe(120);
    expect(getPlaybackDelay(420, Number.NaN)).toBe(420);
  });
});
