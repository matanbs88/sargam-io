import { describe, expect, it } from "vitest";
import { isValidPracticeSource, parseSavedPracticeSession } from "./practiceSession";

const source = {
  kind: "musicxml" as const,
  noteEvents: [{ durationMs: 500, midi: 60, startMs: 0, velocity: 88 }],
  rootMidi: 60,
  tempoBpm: 96,
  timeSignature: "4/4",
  title: "Imported melody",
  validation: { issues: [], requiresReview: false, status: "ready" as const },
};

describe("practice session persistence", () => {
  it("accepts an imported source that can be restored after refresh", () => {
    expect(isValidPracticeSource(source)).toBe(true);
    expect(
      parseSavedPracticeSession(
        JSON.stringify({
          midiOverrides: [60],
          harmoniumReedMode: "double",
          harmoniumReverbMode: "room",
          notation: "Sargam_EN",
          playbackRate: 1,
          rootMidi: 60,
          source,
          taalId: "teentaal",
          tempoBpm: 96,
          visualizer: "Piano",
        }),
      ),
    ).toMatchObject({
      harmoniumReedMode: "double",
      harmoniumReverbMode: "room",
      source: { kind: "musicxml", title: "Imported melody" },
    });
  });

  it("rejects malformed or unsafe localStorage state", () => {
    expect(parseSavedPracticeSession("not-json")).toBeNull();
    expect(
      parseSavedPracticeSession(
        JSON.stringify({
          midiOverrides: [999],
          notation: "Sargam_EN",
          playbackRate: 1,
          rootMidi: 60,
          taalId: "teentaal",
          tempoBpm: 96,
          visualizer: "Piano",
        }),
      ),
    ).toBeNull();
  });
});
