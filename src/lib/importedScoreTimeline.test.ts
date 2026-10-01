import { describe, expect, it } from "vitest";
import { resolveMelody } from "./practiceParts";
import {
  importedScoreToPracticeScore,
  selectImportedMelody,
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
  it("retains trailing silence before the next measure and rejects invalid timing", () => {
    const practice = importedScoreToPracticeScore({ ...score, measures: [
      { ...score.measures[0], durationDivisions: 8 }, score.measures[0],
    ] }, validation, 120);
    expect(practice.noteEvents[2].startMs).toBe(2000);
    expect(() => importedScoreToPracticeScore({ ...score, measures: [{ ...score.measures[0], divisionsPerQuarter: 0 }] }, validation)).toThrow("positive divisions");
  });
  it("lets the user select a lower written melody without losing the piano arrangement", () => {
    const practice = importedScoreToPracticeScore({ ...score, measures: [{ ...score.measures[0], events: [
      { durationDivisions: 2, midi: 84, startDivisions: 0, tie: "none", voice: "1" },
      { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "none", voice: "2" },
    ] }] }, validation, 120);
    const selected = selectImportedMelody(practice, practice.voices[1].id);
    expect(selected.melodyEvents?.map(note => note.midi)).toEqual([60]);
    expect(selected.noteEvents).toHaveLength(2);
    expect(selected.voices.every(voice => !voice.estimated)).toBe(true);
    expect(() => selectImportedMelody(practice, "missing")).toThrow("available");
  });

  it("joins ties only within the same staff, voice and pitch", () => {
    const practice = importedScoreToPracticeScore({ ...score, measures: [
      { ...score.measures[0], events: [
        { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "start", voice: "1" },
        { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "none", voice: "2" },
      ] },
      { ...score.measures[0], number: 2, events: [
        { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "stop", voice: "1" },
      ] },
    ] }, validation, 120);
    expect(practice.noteEvents).toEqual([
      { durationMs: 1000, midi: 60, startMs: 0, velocity: 88 },
      { durationMs: 500, midi: 60, startMs: 0, velocity: 88 },
    ]);
    expect(practice.validation.requiresReview).toBe(false);
  });

  it("labels chordal voice reduction as an estimate and marks unmatched ties", () => {
    const practice = importedScoreToPracticeScore({ ...score, measures: [{ ...score.measures[0], events: [
      { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "stop" },
      { durationDivisions: 2, midi: 64, startDivisions: 0, tie: "none" },
    ] }] }, validation, 120);
    expect(practice.voices[0].estimated).toBe(true);
    expect(practice.voices[0].events.map(note => note.midi)).toEqual([64]);
    expect(practice.validation.requiresReview).toBe(true);
    const selected = selectImportedMelody(practice, practice.voices[0].id);
    expect(resolveMelody(selected.noteEvents, selected).estimated).toBe(true);
  });
  it("keeps rests silent while preserving their timing", () => {
    const practice = importedScoreToPracticeScore(score, validation, 120);

    expect(practice.noteEvents).toEqual([
      { durationMs: 500, midi: 60, startMs: 0, velocity: 88 },
      { durationMs: 500, midi: 62, startMs: 1_000, velocity: 88 },
    ]);
  });
});
