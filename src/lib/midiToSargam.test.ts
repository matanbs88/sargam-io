import { describe, expect, it } from "vitest";
import { formatRelativeNotes, midiEventsToRelativeNotes, midiToRelativeNotes } from "./midiToSargam";

describe("midiToRelativeNotes", () => {
  it("maps all twelve chromatic positions to the product Sargam convention", () => {
    expect(formatRelativeNotes([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], 60, "sargam")).toEqual([
      "S", "r", "R", "g", "G", "m", "M", "P", "d", "D", "n", "N",
    ]);
  });

  it("uses relative octaves in both directions", () => {
    expect(midiToRelativeNotes([59, 60, 72, 84], 60).map((note) => note.sargam)).toEqual(["N.", "S", "S'", "S''"]);
  });

  it("keeps provider timing data attached to converted events", () => {
    expect(midiEventsToRelativeNotes([{ midi: 62, startMs: 240, durationMs: 480, velocity: 90 }], 60)).toMatchObject([
      { sargam: "R", abc: "D", startMs: 240, durationMs: 480, velocity: 90 },
    ]);
  });

  it("rejects invalid MIDI input", () => {
    expect(() => midiToRelativeNotes([128], 60)).toThrow(RangeError);
  });
});
