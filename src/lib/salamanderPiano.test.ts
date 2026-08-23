import { describe, expect, it } from "vitest";
import {
  getSalamanderPlaybackRate,
  getSalamanderSampleUrl,
  SALAMANDER_GUIDE_SAMPLES,
  selectSalamanderSample,
} from "@/src/lib/salamanderPiano";

describe("Salamander piano manifest", () => {
  it("selects the nearest minor-third sample", () => {
    expect(selectSalamanderSample(61).noteName).toBe("C4");
    expect(selectSalamanderSample(62).noteName).toBe("D#4");
    expect(selectSalamanderSample(72).fileName).toBe("C5v8.wav");
  });

  it("creates an overridable asset URL", () => {
    expect(getSalamanderSampleUrl(60, "https://cdn.example.com/piano/")).toBe(
      "https://cdn.example.com/piano/C4v8.wav",
    );
    expect(getSalamanderSampleUrl(63, "https://cdn.example.com/piano")).toBe(
      "https://cdn.example.com/piano/D%234v8.wav",
    );
  });

  it("plays a center sample at unity rate", () => {
    const sample = SALAMANDER_GUIDE_SAMPLES.find(({ midi }) => midi === 60);
    expect(sample).toBeDefined();
    expect(getSalamanderPlaybackRate(60, sample!)).toBe(1);
  });
});
