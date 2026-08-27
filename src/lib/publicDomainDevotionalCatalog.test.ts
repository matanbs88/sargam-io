import { describe, expect, it } from "vitest";
import { PUBLIC_DOMAIN_DEVOTIONAL_CATALOG } from "./publicDomainDevotionalCatalog";

describe("public-domain devotional catalog", () => {
  it("contains playable provenance-backed practice studies", () => {
    expect(PUBLIC_DOMAIN_DEVOTIONAL_CATALOG).toHaveLength(12);
    expect(new Set(PUBLIC_DOMAIN_DEVOTIONAL_CATALOG.map((song) => song.id)).size).toBe(12);

    for (const song of PUBLIC_DOMAIN_DEVOTIONAL_CATALOG) {
      expect(song.category).toBe("Devotional");
      expect(song.rightsBasis).toBe("public-domain");
      expect(song.status).toBe("ready");
      expect(song.noteEvents?.length).toBeGreaterThan(0);
      expect(song.sourceRef).toMatch(/^https:\/\//);
    }
  });
});
