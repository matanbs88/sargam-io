import { describe, expect, it } from "vitest";
import {
  CURRENT_PRACTICE_AUDIO_ASSETS,
  isStreamReadyAsset,
} from "./practiceAudioAssets";

describe("practice audio asset registry", () => {
  it("states that the current MVP serves no recorded provider assets", () => {
    expect(CURRENT_PRACTICE_AUDIO_ASSETS).toHaveLength(6);
    expect(CURRENT_PRACTICE_AUDIO_ASSETS.every((asset) => asset.status === "generated")).toBe(true);
    expect(CURRENT_PRACTICE_AUDIO_ASSETS.some(isStreamReadyAsset)).toBe(false);
  });
});
