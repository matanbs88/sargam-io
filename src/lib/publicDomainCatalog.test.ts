import { describe, expect, it } from "vitest";
import { PUBLIC_DOMAIN_CATALOG } from "./publicDomainCatalog";

describe("public-domain catalog", () => {
  it("contains unique playable studies with provenance", () => {
    expect(PUBLIC_DOMAIN_CATALOG).toHaveLength(11);
    expect(new Set(PUBLIC_DOMAIN_CATALOG.map((song) => song.id)).size).toBe(11);

    for (const song of PUBLIC_DOMAIN_CATALOG) {
      expect(song.category).toBe("Public domain");
      expect(song.rightsBasis).toBe("public-domain");
      expect(song.status).toBe("ready");
      expect(song.exportAllowed).toBe(true);
      expect(song.noteEvents?.length).toBeGreaterThan(0);
      expect(song.sourceRef).toMatch(/^https:\/\//);
    }
  });

  it("keeps melody timelines ordered and valid for the practice engine", () => {
    for (const song of PUBLIC_DOMAIN_CATALOG) {
      const events = song.noteEvents ?? [];
      expect(events.every((event) => event.midi >= 0 && event.midi <= 127)).toBe(true);
      expect(events.every((event, index) => index === 0 || event.startMs > events[index - 1].startMs)).toBe(true);
      expect(events.every((event) => event.durationMs > 0)).toBe(true);
    }
  });
});
