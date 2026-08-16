import { describe, expect, it } from "vitest";
import { TAALS, beatsInTaal, matraAtTime, validateTaal } from "./taal";

describe("taal definitions", () => {
  it("models the known matra structure of the initial practice taals", () => {
    expect(beatsInTaal(TAALS.teentaal)).toBe(16);
    expect(TAALS.jhaptaal.divisions.map((division) => division.beats)).toEqual([2, 3, 2, 3]);
    expect(TAALS.rupak.divisions.map((division) => division.beats)).toEqual([3, 2, 2]);
  });

  it("keeps every definition internally consistent", () => {
    expect(Object.values(TAALS).every(validateTaal)).toBe(true);
  });

  it("maps time to a repeating zero-based matra at the selected tempo", () => {
    expect(matraAtTime(0, 120, TAALS.teentaal)).toBe(0);
    expect(matraAtTime(500, 120, TAALS.teentaal)).toBe(1);
    expect(matraAtTime(8_000, 120, TAALS.teentaal)).toBe(0);
  });
});
