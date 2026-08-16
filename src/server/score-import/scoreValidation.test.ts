import { describe, expect, it } from "vitest";
import type { ImportedScore } from "./musicXml";
import { validateImportedScore } from "./scoreValidation";

const baseScore: ImportedScore = {
  divisionsPerQuarter: 2,
  keyFifths: -4,
  measures: [{ divisionsPerQuarter: 2, events: [{ durationDivisions: 6, midi: 65, startDivisions: 0, tie: "none" }], number: 1, timeSignature: "3/4" }],
  sourceFormat: "musicxml",
  timeSignature: "3/4",
  title: "Validation fixture",
  warnings: [],
};

describe("validateImportedScore", () => {
  it("accepts a measure that fills its declared meter", () => {
    expect(validateImportedScore(baseScore)).toEqual({ issues: [], requiresReview: false, status: "ready" });
  });

  it("flags duration and parser anomalies for editorial review", () => {
    const report = validateImportedScore({
      ...baseScore,
      measures: [{ divisionsPerQuarter: 2, events: [{ durationDivisions: 4, midi: 65, startDivisions: 0, tie: "none" }], number: 1, timeSignature: "3/4" }],
      warnings: ["Measure 1 contains harmony and needs a melody selection."],
    });

    expect(report.status).toBe("review-required");
    expect(report.issues.map((issue) => issue.code)).toEqual(["meter-mismatch", "parser-warning"]);
  });
});
