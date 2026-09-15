import { expect, it } from "vitest";
import { estimatePitch } from "./pitchDetection";
it.each([110, 220, 261.6256, 440, 523.2511, 880])("estimates a synthetic %s Hz tone within 5 cents", (frequency) => {
  const samples = Float32Array.from({ length: 4096 }, (_, i) => 0.2 * Math.sin(2 * Math.PI * frequency * i / 48000));
  const result = estimatePitch(samples, 48000);
  expect(result).not.toBeNull();
  expect(Math.abs(1200 * Math.log2(result!.hz / frequency))).toBeLessThan(5);
});
it("rejects silence and invalid signal", () => {
  expect(estimatePitch(new Float32Array(4096), 48000)).toBeNull();
  expect(estimatePitch(new Float32Array(4096).fill(NaN), 48000)).toBeNull();
});
