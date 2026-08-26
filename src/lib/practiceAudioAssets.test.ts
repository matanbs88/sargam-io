import { describe, expect, it } from "vitest";
import {
  CURRENT_PRACTICE_AUDIO_ASSETS,
  isStreamReadyAsset,
} from "./practiceAudioAssets";

describe("practice audio asset registry", () => {
  it("keeps non-piano Indian roles explicit about their current status", () => {
    const generatedAssets = CURRENT_PRACTICE_AUDIO_ASSETS.filter(
      (asset) => asset.role !== "piano.guide" && asset.role !== "harmonium.guide",
    );

    expect(generatedAssets).toHaveLength(5);
    expect(generatedAssets.every((asset) => asset.status === "generated")).toBe(true);
    expect(CURRENT_PRACTICE_AUDIO_ASSETS.find((asset) => asset.role === "harmonium.guide")?.status).toBe("candidate");
    expect(CURRENT_PRACTICE_AUDIO_ASSETS.some(isStreamReadyAsset)).toBe(true);
  });

  it("registers the founder-approved Salamander piano guide", () => {
    const piano = CURRENT_PRACTICE_AUDIO_ASSETS.find(
      (asset) => asset.role === "piano.guide",
    );

    expect(piano?.status).toBe("approved");
    expect(piano?.canStreamInApp).toBe(true);
    expect(piano?.provider).toContain("Salamander");
  });
});
