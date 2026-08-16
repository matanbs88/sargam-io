import { describe, expect, it } from "vitest";
import {
  getDroneStringMidis,
  getPracticeBol,
  getTablaBolProfile,
} from "./digitalAccompaniment";

describe("digital accompaniment configuration", () => {
  it("creates a Sa-Pa drone pattern around the selected tonic", () => {
    expect(getDroneStringMidis(62, "SaPa")).toEqual([57, 62, 62, 74]);
  });

  it("uses Ma instead of Pa for the Sa-Ma pattern", () => {
    expect(getDroneStringMidis(60, "SaMa")).toEqual([53, 60, 60, 72]);
  });

  it("uses the same theka sequence shown in the practice UI", () => {
    expect(getPracticeBol("teentaal", 0)).toBe("Dha");
    expect(getPracticeBol("teentaal", 15)).toBe("Dha");
    expect(getPracticeBol("teentaal", 16)).toBe("Dha");
  });

  it("keeps a defined fallback for future bols", () => {
    expect(getTablaBolProfile("Unmapped")).toMatchObject({
      voice: "dayan",
    });
  });
});
