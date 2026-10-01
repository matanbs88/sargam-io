import type { MidiNoteEvent } from "./midiToSargam";
import { estimateUpperMelody, isMonophonic } from "./practiceParts";

export type ImportedScoreTimelineEvent = {
  readonly voice?: string;
  readonly staff?: string;
  readonly durationDivisions: number;
  readonly midi: number | null;
  readonly startDivisions: number;
  readonly tie: "none" | "start" | "stop" | "continue";
};

export type ImportedScoreTimelineMeasure = {
  readonly durationDivisions?: number;
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
  readonly voices: readonly ImportedMelodyVoice[];
  readonly melodyEvents?: readonly MidiNoteEvent[];
  readonly melodyCredit?: string;
  readonly melodyEstimated?: boolean;
  readonly noteEvents: readonly MidiNoteEvent[];
  readonly sourceFormat: ImportedScorePayload["sourceFormat"];
  readonly timeSignature: string | null;
  readonly title: string;
  readonly validation: ImportedScoreValidation;
};

export type ImportedMelodyVoice = {
  readonly id: string;
  readonly label: string;
  readonly events: readonly MidiNoteEvent[];
  readonly estimated: boolean;
};

export function selectImportedMelody(score: ImportedPracticeScore, voiceId: string): ImportedPracticeScore {
  const voice = score.voices.find(candidate => candidate.id === voiceId);
  if (!voice) throw new Error("Choose an available melody voice.");
  return { ...score, melodyEvents: voice.events, melodyEstimated: voice.estimated, melodyCredit: `${voice.label} — ${voice.estimated ? "upper-note estimate; review required" : "user-selected written voice; review musical phrasing"}` };
}

const DEFAULT_IMPORT_TEMPO_BPM = 96;

function measureDurationDivisions(measure: ImportedScoreTimelineMeasure): number {
  return measure.events.reduce((end, event) => Math.max(end, event.startDivisions + event.durationDivisions), measure.durationDivisions ?? 0);
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
  const voiceEvents = new Map<string, { label: string; events: MidiNoteEvent[] }>();
  type ImportedNote = { -readonly [K in keyof MidiNoteEvent]: MidiNoteEvent[K] };
  const openTies = new Map<string, ImportedNote>();
  const tieWarnings: string[] = [];

  for (const measure of score.measures) {
    if (!Number.isFinite(measure.divisionsPerQuarter) || measure.divisionsPerQuarter <= 0) throw new Error("Score timing needs positive divisions per quarter.");
    const millisecondsPerDivision =
      60_000 / (tempoBpm * measure.divisionsPerQuarter);

    for (const event of measure.events) {
      if (!Number.isFinite(event.startDivisions) || event.startDivisions < 0 || !Number.isFinite(event.durationDivisions) || event.durationDivisions <= 0) throw new Error("Score contains invalid note timing.");
      if (event.midi === null) continue;
      const voiceId = JSON.stringify([event.staff ?? "1", event.voice ?? "1"]);
      let voice = voiceEvents.get(voiceId);
      if (!voice) {
        voice = { label: `Staff ${event.staff ?? "1"} · voice ${event.voice ?? "1"}`, events: [] };
        voiceEvents.set(voiceId, voice);
      }
      const note: ImportedNote = {
        durationMs: event.durationDivisions * millisecondsPerDivision,
        midi: event.midi,
        startMs: measureStartMs + event.startDivisions * millisecondsPerDivision,
        velocity: 88,
      };
      const tieId = JSON.stringify([voiceId, event.midi]);
      const previous = openTies.get(tieId);
      const continues = event.tie === "stop" || event.tie === "continue";
      if (continues && previous && Math.abs(previous.startMs + previous.durationMs - note.startMs) < 0.001) {
        previous.durationMs += note.durationMs;
        if (event.tie === "stop") openTies.delete(tieId);
        continue;
      }
      if (continues) tieWarnings.push(`Unmatched tie at measure ${measure.number}; retained as a separate attack.`);
      if (previous) tieWarnings.push(`Broken tie at measure ${measure.number}; check the written voice.`);
      openTies.delete(tieId);
      noteEvents.push(note);
      voice.events.push(note);
      if (event.tie === "start" || event.tie === "continue") openTies.set(tieId, note);
    }

    measureStartMs += measureDurationDivisions(measure) * millisecondsPerDivision;
  }

  if (noteEvents.length === 0) {
    throw new Error("This score has no playable melody notes.");
  }
  if (openTies.size) tieWarnings.push("The score ends with an unfinished tie; check its duration.");
  noteEvents.sort((a, b) => a.startMs - b.startMs);
  const voices = [...voiceEvents].map(([id, voice]) => {
    voice.events.sort((a, b) => a.startMs - b.startMs);
    return { id, label: voice.label, events: estimateUpperMelody(voice.events), estimated: !isMonophonic(voice.events) };
  });

  return {
    voices,
    noteEvents,
    sourceFormat: score.sourceFormat,
    timeSignature: score.timeSignature,
    title: score.title,
    validation: tieWarnings.length ? {
      ...validation,
      status: "review-required",
      requiresReview: true,
      issues: [...validation.issues, ...[...new Set(tieWarnings)].map(message => ({ message, severity: "warning" as const }))],
    } : validation,
  };
}

export { DEFAULT_IMPORT_TEMPO_BPM };
