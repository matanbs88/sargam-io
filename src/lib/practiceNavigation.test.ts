import { describe, it, expect } from "vitest";
import { practiceTime, validPracticeRange } from "./practiceNavigation";
describe("practice navigation", () => {
  it("supports one-note and whole-piece ranges", () => {
    expect(validPracticeRange(0, 0, 1)).toEqual({ startIndex: 0, endIndex: 0 });
    expect(validPracticeRange(0, 12, 13)).toEqual({ startIndex: 0, endIndex: 12 });
  });
  it("rejects reversed, fractional, empty and out-of-range selections", () => {
    for (const [a, b, n] of [[2, 1, 3], [0, 3, 3], [0, 0, 0], [-1, 2, 3], [0.5, 1, 3], [NaN, 1, 3]]) expect(validPracticeRange(a, b, n)).toBeNull();
  });
  it("formats score time without wrapping after an hour", () => {
    expect(practiceTime(61500)).toBe("1:01");
    expect(practiceTime(3600000)).toBe("60:00");
    expect(practiceTime(NaN)).toBe("0:00");
  });
});
