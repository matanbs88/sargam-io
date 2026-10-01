import { describe, expect, it } from "vitest";
import { FULL_PRACTICE_CATALOG, READY_PRACTICE_CATALOG } from "./practiceCatalog";

describe("full practice catalog", () => {
  it("exposes the 100-title queue plus the playable public-domain sets", () => {
    expect(FULL_PRACTICE_CATALOG).toHaveLength(132);
    expect(READY_PRACTICE_CATALOG).toHaveLength(44);
    expect(FULL_PRACTICE_CATALOG.filter((song) => song.status === "planned")).toHaveLength(88);
    expect(READY_PRACTICE_CATALOG.find(song => song.id === "verified-raghupati-raghav-complete"))
      .toMatchObject({ category: "Devotional", timeSignature: "2/4", tempoBpm: 100 });
  });

  it("never marks a title playable without note data", () => {
    for (const song of FULL_PRACTICE_CATALOG) {
      expect(song.status === "ready").toBe(song.noteEvents !== null);
      expect(song.status === "ready").toBe(song.exportAllowed);
      expect(song.noteEvents === null || song.noteEvents.length > 0).toBe(true);
    }
  });
});
