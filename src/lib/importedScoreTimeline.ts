import type { MidiNoteEvent } from "./midiToSargam";

export type ImportedScoreTimelineEvent = {
  readonly durationDivisions: number;
  readonly midi: number | null;
  readonly startDivisions: number;
  readonly tie: "none" | "start" | "stop" | "continue";
};

export type ImportedScoreTimelineMeasure = {
  readonly divisionsPerQuarter: number;
  readonly events: readonly ImportedScoreTimelineEvent[];
  readonly number: number;
  readonly timeSignature: string | null;
};

export type ImportedScorePayload = {
  readonly measures: readonly ImportedScoreTimelineMeasure[];
  readonly sourceFormat: "musicxml" | "mxl";
  readonly timeSignature: string | null;
  readonly title: string;
  readonly warnings: readonly string[];
};

export type ImportedScoreValidation = {
  readonly issues: readonly {
    readonly message: string;
    readonly severity: "warning" | "error";
  }[];
  readonly requiresReview: boolean;
  readonly status: "ready" | "review-required";
};

export type ImportedPracticeScore = {
  readonly noteEvents: readonly MidiNoteEvent[];
  readonly sourceFormat: ImportedScorePayload["sourceFormat"];
  readonly timeSignature: string | null;
  readonly title: string;
  readonly validation: ImportedScoreValidation;
};

const DEFAULT_IMPORT_TEMPO_BPM = 96;

function measureDurationDivisions(measure: ImportedScoreTimelineMeasure): number {
  return Math.max(
    0,
    ...measure.events.map(
      (event) => event.startDivisions + event.durationDivisions,
    ),
  );
}

/**
 * Converts validated symbolic timing to a temporary practice timeline. Rests
 * advance time but do not become playable MIDI notes. Imported tempo is not
 * guessed; the workspace starts at a clearly editable 96 BPM.
 */
export function importedScoreToPracticeScore(
  score: ImportedScorePayload,
  validation: ImportedScoreValidation,
  tempoBpm = DEFAULT_IMPORT_TEMPO_BPM,
): ImportedPracticeScore {
  if (!Number.isFinite(tempoBpm) || tempoBpm < 30 || tempoBpm > 300) {
    throw new RangeError("Imported practice tempo must be between 30 and 300 BPM.");
  }

  let measureStartMs = 0;
  const noteEvents: MidiNoteEvent[] = [];

  for (const measure of score.measures) {
    const millisecondsPerDivision =
      60_000 / (tempoBpm * measure.divisionsPerQuarter);

    for (const event of measure.events) {
      if (event.midi === null) continue;
      noteEvents.push({
        durationMs: event.durationDivisions * millisecondsPerDivision,
        midi: event.midi,
        startMs: measureStartMs + event.startDivisions * millisecondsPerDivision,
        velocity: 88,
      });
    }

    measureStartMs += measureDurationDivisions(measure) * millisecondsPerDivision;
  }

  if (noteEvents.length === 0) {
    throw new Error("This score has no playable melody notes.");
  }

  return {
    noteEvents,
    sourceFormat: score.sourceFormat,
    timeSignature: score.timeSignature,
    title: score.title,
    validation,
  };
}

export { DEFAULT_IMPORT_TEMPO_BPM };
