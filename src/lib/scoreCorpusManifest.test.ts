import { describe, expect, it } from "vitest";
import { SONG_CATALOG } from "./songCatalog";
import {
  BATCH_01_MANIFEST,
  getBatch01Item,
  validateScoreCorpusManifest,
} from "./scoreCorpusManifest";

describe("Batch 01 score corpus manifest", () => {
  it("contains the 18 high-confidence source candidates", () => {
    expect(BATCH_01_MANIFEST.batchId).toBe("batch-01-high-confidence");
    expect(BATCH_01_MANIFEST.items).toHaveLength(18);
    expect(new Set(BATCH_01_MANIFEST.items.map((item) => item.catalogSongId)).size).toBe(18);
  });

  it("resolves every item to a planned catalog title", () => {
    const issues = validateScoreCorpusManifest(
      BATCH_01_MANIFEST,
      SONG_CATALOG.map((song) => song.id),
    );

    expect(issues).toEqual([]);
    expect(BATCH_01_MANIFEST.items.every((item) =>
      SONG_CATALOG.some((song) => song.id === item.catalogSongId && song.status === "planned"),
    )).toBe(true);
  });

  it("keeps source discovery separate from playable artifact readiness", () => {
    expect(getBatch01Item("kesariya")?.artifactPath).toBeNull();
    expect(getBatch01Item("kesariya")?.sourceStatus).toBe("discovered");
    expect(getBatch01Item("hare-krishna")?.sourceStatus).toBe("catalog-hit");
  });
});
