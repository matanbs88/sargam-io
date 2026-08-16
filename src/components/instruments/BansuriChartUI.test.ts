import { describe, expect, it } from "vitest";
import { getBansuriReferenceFingering } from "./BansuriChartUI";

describe("getBansuriReferenceFingering", () => {
  it("maps the selected Sa to the Sa reference fingering", () => {
    expect(getBansuriReferenceFingering(62, 62)).toMatchObject({
      label: "S · Sa",
      holes: ["closed", "closed", "closed", "open", "open", "open"],
    });
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
});
