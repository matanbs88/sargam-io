import { describe, expect, it } from "vitest";
import {
  getHarmoniumPlaybackRate,
  getHarmoniumSampleUrl,
  selectHarmoniumSample,
} from "./harmoniumAudio";

describe("harmonium browser sample manifest", () => {
  it("selects the nearest open harmonium anchor", () => {
    expect(selectHarmoniumSample(60).noteName).toBe("C4");
    expect(selectHarmoniumSample(59).noteName).toBe("A#3");
  });

  it("builds a stable browser sample URL", () => {
    expect(getHarmoniumSampleUrl(60, "https://cdn.example.com/harmonium")).toBe(
      "https://cdn.example.com/harmonium/C4.mp3",
    );
  });

  it("keeps pitch mapping mathematically correct", () => {
    const sample = selectHarmoniumSample(64);
    expect(getHarmoniumPlaybackRate(64, sample)).toBe(2 ** ((64 - sample.midi) / 12));
  });
});
