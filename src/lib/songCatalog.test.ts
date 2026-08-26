import { describe, expect, it } from "vitest";
import {
  filterCatalogSongs,
  READY_CATALOG_SONGS,
  SONG_CATALOG,
} from "./songCatalog";

describe("MVP song catalog", () => {
  it("contains the committed 100-entry demand map", () => {
    expect(SONG_CATALOG).toHaveLength(100);
    expect(new Set(SONG_CATALOG.map((song) => song.id)).size).toBe(100);
  });

  it("keeps ready practice content separate from uncleared repertoire", () => {
    expect(READY_CATALOG_SONGS).toHaveLength(12);
    expect(READY_CATALOG_SONGS.every((song) => song.noteEvents !== null)).toBe(true);
    expect(SONG_CATALOG.filter((song) => song.category === "The Beatles").every(
      (song) => song.status === "planned" && song.noteEvents === null,
    )).toBe(true);
  });

  it("tracks technical export readiness without making it a publication gate", () => {
    for (const song of SONG_CATALOG) {
      expect(song.exportAllowed).toBe(song.noteEvents !== null);
      expect(song.rightsBasis).toBe(
        song.status === "ready" ? "original" : "rights-review",
      );
    }
  });

  it("searches ready entries by default and exposes demand-map titles explicitly", () => {
    expect(filterCatalogSongs(SONG_CATALOG, "", "all", false)).toHaveLength(12);

    const beatles = filterCatalogSongs(SONG_CATALOG, "let it be", "The Beatles", true);
    expect(beatles).toHaveLength(1);
    expect(beatles[0]?.status).toBe("planned");

    expect(filterCatalogSongs(SONG_CATALOG, "let it be", "The Beatles", false)).toHaveLength(0);
  });
});
