import "server-only";

import type { ImportedScore } from "./musicXml";

export type ScoreValidationIssue = {
  readonly code: "meter-mismatch" | "missing-meter" | "parser-warning" | "tie-without-note";
  readonly measure?: number;
  readonly message: string;
  readonly severity: "warning" | "error";
};

export type ScoreValidationReport = {
  readonly issues: readonly ScoreValidationIssue[];
  readonly requiresReview: boolean;
  readonly status: "ready" | "review-required";
};

function parseTimeSignature(value: string | null): { readonly beats: number; readonly beatType: number } | null {
  if (value === null) return null;
  const match = /^(\d{1,2})\/(\d{1,2})$/.exec(value);
  if (match === null) return null;
  const beats = Number(match[1]);
  const beatType = Number(match[2]);
  return Number.isInteger(beats) && Number.isInteger(beatType) && beats > 0 && [1, 2, 4, 8, 16].includes(beatType)
    ? { beats, beatType }
    : null;
}

/**
 * Validates only facts that can be proven from MusicXML. It deliberately does
 * not infer a raga, taal, Sa, ornament, or performance fingering.
 */
export function validateImportedScore(score: ImportedScore): ScoreValidationReport {
  const issues: ScoreValidationIssue[] = [];
  const signature = parseTimeSignature(score.timeSignature);

  if (signature === null) {
    issues.push({
      code: "missing-meter",
      message: "No usable time signature was found; rhythm needs editorial review.",
      severity: "warning",
    });
  } else {
    score.measures.forEach((measure) => {
      const measureSignature = parseTimeSignature(measure.timeSignature) ?? signature;
      const expectedDuration =
        measure.divisionsPerQuarter *
        measureSignature.beats *
        (4 / measureSignature.beatType);
      const actualDuration = Math.max(
        0,
        ...measure.events.map((event) => event.startDivisions + event.durationDivisions),
      );
      if (actualDuration !== expectedDuration) {
        issues.push({
          code: "meter-mismatch",
          measure: measure.number,
          message: `Measure ${measure.number} spans ${actualDuration} divisions; ${measureSignature.beats}/${measureSignature.beatType} expects ${expectedDuration}.`,
          severity: "warning",
        });
      }
    });
  }

  score.measures.forEach((measure) => {
    measure.events.forEach((event) => {
      if (event.midi === null && event.tie !== "none") {
        issues.push({
          code: "tie-without-note",
          measure: measure.number,
          message: `Measure ${measure.number} has a tie attached to a rest.`,
          severity: "error",
        });
      }
    });
  });

  score.warnings.forEach((warning) => {
    issues.push({ code: "parser-warning", message: warning, severity: "warning" });
  });

  return {
    issues,
    requiresReview: issues.length > 0,
    status: issues.length === 0 ? "ready" : "review-required",
  };
}
