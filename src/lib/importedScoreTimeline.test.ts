import { describe, expect, it } from "vitest";
import {
  importedScoreToPracticeScore,
  type ImportedScorePayload,
  type ImportedScoreValidation,
} from "./importedScoreTimeline";

const score: ImportedScorePayload = {
  measures: [
    {
      divisionsPerQuarter: 2,
      events: [
        { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "none" },
        { durationDivisions: 2, midi: null, startDivisions: 2, tie: "none" },
        { durationDivisions: 2, midi: 62, startDivisions: 4, tie: "none" },
      ],
      number: 1,
      timeSignature: "3/4",
    },
  ],
  sourceFormat: "musicxml",
  timeSignature: "3/4",
  title: "Imported fixture",
  warnings: [],
};

const validation: ImportedScoreValidation = {
  issues: [],
  requiresReview: false,
  status: "ready",
};

describe("importedScoreToPracticeScore", () => {
  it("keeps rests silent while preserving their timing", () => {
    const practice = importedScoreToPracticeScore(score, validation, 120);

    expect(practice.noteEvents).toEqual([
      { durationMs: 500, midi: 60, startMs: 0, velocity: 88 },
      { durationMs: 500, midi: 62, startMs: 1_000, velocity: 88 },
    ]);
  });
});
