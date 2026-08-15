import { describe, expect, it } from "vitest";
import {
  formatRelativeMidiEvents,
  formatRelativeNotes,
  midiEventsToRelativeNotes,
  midiToRelativeNotes,
} from "./midiToSargam";

describe("midiToRelativeNotes", () => {
  it("maps all twelve chromatic positions to the approved Latin Sargam convention", () => {
    expect(
      formatRelativeNotes(
        [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
        60,
        "Sargam_EN",
      ),
    ).toEqual(["S", "r", "R", "g", "G", "m", "M", "P", "d", "D", "n", "N"]);
  });

  it("uses repeated relative octave markers in both directions", () => {
    expect(
      formatRelativeNotes([59, 60, 72, 84], 60, "Sargam_EN"),
    ).toEqual(["N.", "S", "S'", "S''"]);
  });

  it("uses a strict token dictionary for Devanagari output", () => {
    expect(
      formatRelativeNotes([60, 61, 66, 70], 60, "Sargam_HI"),
    ).toEqual(["सा", "रे॒", "म॑", "नि॒"]);
  });

  it("keeps timing data attached to converted events", () => {
    expect(
      midiEventsToRelativeNotes(
        [{ midi: 62, startMs: 240, durationMs: 480, velocity: 90 }],
        60,
      ),
    ).toMatchObject([
      {
        sargamToken: "R",
        abcToken: "D",
        startMs: 240,
        durationMs: 480,
        velocity: 90,
      },
    ]);

    expect(
      formatRelativeMidiEvents(
        [{ midi: 62, startMs: 240, durationMs: 480, velocity: 90 }],
        60,
        "ABC",
      ),
    ).toEqual(["D"]);
  });

  it("rejects invalid MIDI input", () => {
    expect(() => midiToRelativeNotes([128], 60)).toThrow(RangeError);
  });
});
