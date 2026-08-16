import { describe, expect, it } from "vitest";
import {
  getBansuriRunwayLane,
  getBansuriReferenceFingering,
  getBansuriTimelineXPosition,
} from "../../lib/bansuriFingering";

describe("getBansuriReferenceFingering", () => {
  it("maps the selected Sa to the Sa reference fingering", () => {
    expect(getBansuriReferenceFingering(62, 62)).toMatchObject({ label: "S · Sa", holes: ["closed", "closed", "closed", "open", "open", "open"] });
  });

  it("uses the six finger holes of a standard Hindustani bansuri", () => {
    expect(getBansuriReferenceFingering(62, 62)?.holes).toHaveLength(6);
  });

  it("normalizes notes below Sa into the same twelve-semitone reference map", () => {
    expect(getBansuriReferenceFingering(61, 62)?.label).toBe("N · Ni");
  });

  it("returns no fingering when there is no active note", () => {
    expect(getBansuriReferenceFingering(null, 62)).toBeNull();
  });

  it("keeps the six physical holes distinct", () => {
    const positions = Array.from({ length: 6 }, (_, index) => getBansuriTimelineXPosition(index));
    expect(new Set(positions).size).toBe(6);
    expect(positions[0]).toBeGreaterThan(0);
    expect(positions[5]).toBeLessThan(100);
  });

  it("places Sa at the three-closed-hole midpoint landmark", () => {
    expect(getBansuriRunwayLane(0)).toMatchObject({
      top: 50,
      isNaturalAnchor: true,
    });
  });
});
