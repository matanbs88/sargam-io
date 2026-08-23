import type { MidiNoteEvent, NotationSystem } from "./midiToSargam";
import type { ImportedScoreValidation } from "./importedScoreTimeline";
import type { TaalId } from "./taal";

export type PracticeSource = {
  readonly kind: "mock" | "musicxml";
  readonly noteEvents: readonly MidiNoteEvent[];
  readonly rootMidi: number;
  readonly tempoBpm: number;
  readonly timeSignature: string;
  readonly title: string;
  readonly validation: ImportedScoreValidation | null;
};

/**
 * The persisted shape intentionally contains the source timeline, not just
 * corrected MIDI values. That lets an imported score survive a refresh and
 * keeps future server persistence compatible with the same contract.
 */
export type SavedPracticeSession = {
  readonly midiOverrides: readonly number[];
  readonly notation: NotationSystem;
  readonly playbackRate: number;
  readonly rootMidi: number;
  readonly source?: PracticeSource;
  readonly taalId: TaalId;
  readonly tempoBpm: number;
  readonly visualizer: "Piano" | "Bansuri";
};

const VALID_NOTATIONS = new Set<NotationSystem>(["ABC", "Sargam_EN", "Sargam_HI"]);
const VALID_TAALS = new Set<TaalId>([
  "teentaal",
  "jhaptaal",
  "rupak",
  "ektal",
  "dadra",
  "keherwa",
]);
const VALID_PLAYBACK_RATES = new Set([0.5, 0.75, 1, 1.25]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMidi(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 127;
}

function isNoteEvent(value: unknown): value is MidiNoteEvent {
  if (!isRecord(value)) return false;

  return (
    isMidi(value.midi) &&
    typeof value.startMs === "number" &&
    Number.isFinite(value.startMs) &&
    value.startMs >= 0 &&
    typeof value.durationMs === "number" &&
    Number.isFinite(value.durationMs) &&
    value.durationMs > 0 &&
    (value.velocity === undefined ||
      (typeof value.velocity === "number" && Number.isFinite(value.velocity) && value.velocity >= 0 && value.velocity <= 127))
  );
}

function isValidation(value: unknown): value is ImportedScoreValidation {
  if (!isRecord(value) || typeof value.requiresReview !== "boolean") return false;
  if (value.status !== "ready" && value.status !== "review-required") return false;
  if (!Array.isArray(value.issues)) return false;

  return value.issues.every(
    (issue) =>
      isRecord(issue) &&
      typeof issue.message === "string" &&
      issue.message.length > 0 &&
      (issue.severity === "warning" || issue.severity === "error"),
  );
}

export function isValidPracticeSource(value: unknown): value is PracticeSource {
  if (!isRecord(value)) return false;
  if (value.kind !== "mock" && value.kind !== "musicxml") return false;
  if (!Array.isArray(value.noteEvents) || value.noteEvents.length === 0 || value.noteEvents.length > 1024) return false;
  if (!value.noteEvents.every(isNoteEvent)) return false;
  if (!isMidi(value.rootMidi)) return false;
  if (typeof value.tempoBpm !== "number" || !Number.isFinite(value.tempoBpm) || value.tempoBpm < 30 || value.tempoBpm > 300) return false;
  if (typeof value.timeSignature !== "string" || value.timeSignature.length === 0 || value.timeSignature.length > 16) return false;
  if (typeof value.title !== "string" || value.title.trim().length === 0 || value.title.length > 160) return false;
  return value.validation === null || isValidation(value.validation);
}

/** Validates untrusted localStorage data before it reaches React state. */
export function isValidSavedPracticeSession(value: unknown): value is SavedPracticeSession {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.midiOverrides) || value.midiOverrides.length > 1024 || !value.midiOverrides.every(isMidi)) return false;
  if (typeof value.notation !== "string" || !VALID_NOTATIONS.has(value.notation as NotationSystem)) return false;
  if (typeof value.playbackRate !== "number" || !VALID_PLAYBACK_RATES.has(value.playbackRate)) return false;
  if (!isMidi(value.rootMidi)) return false;
  if (typeof value.taalId !== "string" || !VALID_TAALS.has(value.taalId as TaalId)) return false;
  if (typeof value.tempoBpm !== "number" || !Number.isFinite(value.tempoBpm) || value.tempoBpm < 30 || value.tempoBpm > 300) return false;
  if (value.visualizer !== "Piano" && value.visualizer !== "Bansuri") return false;
  return value.source === undefined || isValidPracticeSource(value.source);
}

/** Parses legacy and current sessions without allowing malformed state in. */
export function parseSavedPracticeSession(raw: string | null): SavedPracticeSession | null {
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidSavedPracticeSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
