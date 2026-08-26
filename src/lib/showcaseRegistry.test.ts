import { describe, expect, it } from "vitest";
import { RIGHTS_SAFE_SHOWCASES } from "./showcaseRegistry";

describe("rights-safe showcase registry", () => {
  it("contains five original, exportable showcase sessions", () => {
    expect(RIGHTS_SAFE_SHOWCASES).toHaveLength(5);
    expect(new Set(RIGHTS_SAFE_SHOWCASES.map((showcase) => showcase.id)).size).toBe(5);
    expect(RIGHTS_SAFE_SHOWCASES.every((showcase) => showcase.exportAllowed)).toBe(true);
  });

  it("keeps a rights record and at least one instrument for every showcase", () => {
    for (const showcase of RIGHTS_SAFE_SHOWCASES) {
      expect(showcase.rightsRecord).toMatch(/^original-sargam-riyaz-/);
      expect(showcase.featuredInstruments.length).toBeGreaterThan(0);
    }
  });
});
