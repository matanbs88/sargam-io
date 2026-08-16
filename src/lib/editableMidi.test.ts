import { describe, expect, it } from "vitest";
import {
  adjustMidiEvent,
  applyMidiOverrides,
  hasValidMidiOverrides,
} from "./editableMidi";

const phrase = [
  { midi: 62, startMs: 0, durationMs: 420, velocity: 80 },
  { midi: 74, startMs: 500, durationMs: 420, velocity: 80 },
] as const;

describe("editable MIDI phrase helpers", () => {
  it("changes only the selected event by one semitone", () => {
    expect(adjustMidiEvent(phrase, 1, -1)).toEqual([
      phrase[0],
      { ...phrase[1], midi: 73 },
    ]);
  });

  it("never moves a MIDI event outside the valid MIDI range", () => {
    expect(adjustMidiEvent([{ ...phrase[0], midi: 0 }], 0, -1)[0]?.midi).toBe(0);
    expect(adjustMidiEvent([{ ...phrase[0], midi: 127 }], 0, 1)[0]?.midi).toBe(127);
  });

  it("accepts only a complete, valid persisted correction set", () => {
    expect(hasValidMidiOverrides([61, 73], 2)).toBe(true);
    expect(hasValidMidiOverrides([61], 2)).toBe(false);
    expect(hasValidMidiOverrides([61, 128], 2)).toBe(false);
    expect(applyMidiOverrides(phrase, [61, 73]).map((event) => event.midi)).toEqual([61, 73]);
  });
});
