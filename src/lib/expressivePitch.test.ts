import { describe, it, expect } from "vitest";
import { centsFromSa, frequencyFromSa, pitchCentsAt, validatePitchCurve } from "./expressivePitch";
describe("continuous relative pitch", () => {
  const curve = [{ offsetMs: 0, cents: 0 }, { offsetMs: 1000, cents: 200 }];
  it("interpolates microtones without semitone snapping", () => expect(pitchCentsAt(curve, 175)).toBe(35));
  it("holds both endpoints", () => { expect(pitchCentsAt(curve, -1)).toBe(0); expect(pitchCentsAt(curve, 2000)).toBe(200); });
  it("preserves octave identity", () => { expect(centsFromSa(440, 220)).toBe(1200); expect(frequencyFromSa(220, 1200)).toBe(440); });
  it("rejects invalid curves and pitch inputs", () => {
    expect(validatePitchCurve(curve, 1000)).toBe(true);
    expect(validatePitchCurve([...curve, curve[1]], 1000)).toBe(false);
    expect(validatePitchCurve(curve, 500)).toBe(false);
    expect(centsFromSa(0, 220)).toBeNull();
  });
});
