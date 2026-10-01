import { describe, expect, it } from "vitest";
import {
  formatRelativeNote,
  formatRelativeMidiEvents,
  formatRelativeNotes,
  midiEventsToRelativeNotes,
  midiToRelativeNotes,
} from "./midiToSargam";
import { projectBansuriSetup } from "./bansuriSetup";

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
    ).toEqual(["D4"]);
  });

  it("displays all absolute chromatic pitch names regardless of selected Sa", () => {
    const pitches = Array.from({ length: 12 }, (_, index) => 60 + index);
    const names = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"];
    for (const sa of [48, 60, 64, 69, 84]) {
      expect(formatRelativeNotes(pitches, sa, "ABC")).toEqual(names);
    }
    expect(formatRelativeNotes([0, 59, 60, 72, 84, 127], 64, "ABC"))
      .toEqual(["C-1", "B3", "C4", "C5", "C6", "G9"]);
  });

  it("preserves internal relative ABC tokens but ignores their markers for concert display", () => {
    const [note] = midiToRelativeNotes([62], 64);
    expect(note).toMatchObject({ abcToken: "A#", octaveMarker: ".", sargamToken: "n" });
    expect(formatRelativeNote(note, "ABC")).toBe("D4");
    expect(formatRelativeNote({ ...note, octaveMarker: "" }, "ABC")).toBe("D4");
    expect(formatRelativeNote(note, "Sargam_EN")).toBe("n.");
    expect(formatRelativeNote(note, "Sargam_HI")).toBe("नि॒.");
  });

  it("transposes source Sa E4 to D4 flute Sa: concert D4, relative S", () => {
    const source = [{ midi: 64, startMs: 240, durationMs: 480, velocity: 90 }];
    const projected = projectBansuriSetup(source, 64, 62, "transpose");
    expect(projected).toMatchObject({ songSa: 62, fluteSa: 62, shift: -2 });
    expect(formatRelativeMidiEvents(projected.events, projected.songSa, "ABC")).toEqual(["D4"]);
    expect(formatRelativeMidiEvents(projected.events, projected.songSa, "Sargam_EN")).toEqual(["S"]);
    expect(midiEventsToRelativeNotes(projected.events, projected.songSa)[0].abcToken).toBe("C");
    expect(projected.events[0]).toEqual({ ...source[0], midi: 62 });
    expect(source[0].midi).toBe(64);
  });

  it("rejects invalid MIDI input", () => {
    expect(() => midiToRelativeNotes([128], 60)).toThrow(RangeError);
  });
});
