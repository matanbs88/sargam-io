import { describe, expect, it } from "vitest";
import {
  getSalamanderPlaybackRate,
  getSalamanderSampleUrl,
  getSalamanderVelocityLayer,
  SALAMANDER_GUIDE_SAMPLES,
  selectSalamanderSample,
} from "@/src/lib/salamanderPiano";

describe("Salamander piano manifest", () => {
  it("selects the nearest minor-third sample", () => {
    expect(selectSalamanderSample(61).noteName).toBe("C4");
    expect(selectSalamanderSample(62).noteName).toBe("D#4");
    expect(selectSalamanderSample(72).fileName).toBe("C5v8.wav");
    expect(selectSalamanderSample(72, 110).fileName).toBe("C5v14.wav");
  });

  it("creates an overridable asset URL", () => {
    expect(getSalamanderSampleUrl(60, "https://cdn.example.com/piano/")).toBe(
      "https://cdn.example.com/piano/C4v8.wav",
    );
    expect(getSalamanderSampleUrl(63, "https://cdn.example.com/piano")).toBe(
      "https://cdn.example.com/piano/D%234v8.wav",
    );
    expect(
      getSalamanderSampleUrl(63, "https://cdn.example.com/piano", 100),
    ).toBe("https://cdn.example.com/piano/D%234v13.wav");
  });

  it("preserves Salamander's uneven velocity layer ranges", () => {
    expect(getSalamanderVelocityLayer(1)).toBe(1);
    expect(getSalamanderVelocityLayer(64)).toBe(8);
    expect(getSalamanderVelocityLayer(127)).toBe(16);
  });

  it("plays a center sample at unity rate", () => {
    const sample = SALAMANDER_GUIDE_SAMPLES.find(({ midi }) => midi === 60);
    expect(sample).toBeDefined();
    expect(getSalamanderPlaybackRate(60, sample!)).toBe(1);
  });
});
