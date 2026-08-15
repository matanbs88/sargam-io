import { describe, expect, it } from "vitest";
import { midiToGuitarString } from "./guitar";

describe("midiToGuitarString", () => {
  it("chooses the playable fret nearest the preferred position", () => {
    expect(midiToGuitarString(62, 5)).toEqual({
      stringNumber: 2,
      openMidi: 59,
      fret: 3,
    });
  });

  it("can select a different valid position when the hand position changes", () => {
    expect(midiToGuitarString(62, 10)).toEqual({
      stringNumber: 4,
      openMidi: 50,
      fret: 12,
    });
  });

  it("returns null for a note outside the displayed fretboard range", () => {
    expect(midiToGuitarString(39)).toBeNull();
  });
});
