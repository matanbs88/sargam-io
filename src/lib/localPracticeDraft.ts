import type { PracticePiece } from '../features/design-lab/usePilotSession';
import type { MidiNoteEvent } from './midiToSargam';
import { isMonophonic } from './practiceParts';

export const LOCAL_PRACTICE_DRAFT_KEY = 'sargam-local-practice-draft-v1';
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_TIME_MS = 6 * 60 * 60 * 1000;
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type StorageProvider = () => DraftStorage;
const browserStorage: StorageProvider = () => window.localStorage;
export type DraftResult = { piece: PracticePiece | null; error: string | null };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function number(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
function midi(value: unknown): value is number {
  return number(value, 0, 127) && Number.isInteger(value);
}
function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

/** Construct an allowlisted copy: never persist job IDs, URLs, audio or settings. */
function copyPiece(value: unknown): PracticePiece | null {
  if (!record(value) || !text(value.title, 160) || !number(value.tempoBpm, 1, 600) || !midi(value.rootMidi)) return null;
  if (typeof value.timeSignature !== 'string' || !/^(?:[1-9]|[12]\d|3[0-2])\/(?:1|2|4|8|16|32)$/.test(value.timeSignature)) return null;
  if (value.artistOrSource !== undefined && !text(value.artistOrSource, 240)) return null;
  if (value.reviewIssues !== undefined && (!Array.isArray(value.reviewIssues) || value.reviewIssues.length > 100 || !value.reviewIssues.every(issue => text(issue, 1000)))) return null;
  if (value.melodyCredit !== undefined && !text(value.melodyCredit, 1000)) return null;
  if (value.melodyEstimated !== undefined && typeof value.melodyEstimated !== 'boolean') return null;
  const melody = value.melodyEvents === undefined ? undefined : copyPiece({
    title: value.title, tempoBpm: value.tempoBpm, rootMidi: value.rootMidi,
    timeSignature: value.timeSignature, noteEvents: value.melodyEvents,
  });
  if (melody === null || (melody && !isMonophonic(melody.noteEvents))) return null;
  if (!Array.isArray(value.noteEvents) || !value.noteEvents.length || value.noteEvents.length > 10_000) return null;
  const noteEvents: MidiNoteEvent[] = [];
  let previousStart = -1;
  const [beatsPerBar, denominator] = value.timeSignature.split('/').map(Number);
  const beatMs = 60000 / value.tempoBpm * 4 / denominator;
  let readingCells = 0;
  for (const note of value.noteEvents) {
    if (!record(note) || !midi(note.midi) || !number(note.startMs, 0, MAX_TIME_MS) || !number(note.durationMs, Number.MIN_VALUE, MAX_TIME_MS)) return null;
    if (note.startMs < previousStart || note.startMs + note.durationMs > MAX_TIME_MS) return null;
    // Bound the rendered score too: a few far-future/very long notes can
    // otherwise allocate millions of empty measures or continuation buttons.
    if ((note.startMs + note.durationMs) / (beatMs * beatsPerBar) > 4096) return null;
    readingCells += Math.ceil(note.durationMs / beatMs) + 1;
    if (readingCells > 65536) return null;
    if (note.velocity !== undefined && !number(note.velocity, 0, 127)) return null;
    const event: { midi: number; startMs: number; durationMs: number; velocity?: number; pitchCurve?: { offsetMs: number; cents: number }[]; transition?: MidiNoteEvent['transition'] } = {
      midi: note.midi, startMs: note.startMs, durationMs: note.durationMs,
    };
    if (note.velocity !== undefined) event.velocity = note.velocity;
    if (note.pitchCurve !== undefined) {
      if (!Array.isArray(note.pitchCurve) || note.pitchCurve.length > 256) return null;
      event.pitchCurve = [];
      let previousOffset = -1;
      for (const point of note.pitchCurve) {
        if (!record(point) || !number(point.offsetMs, 0, note.durationMs) || point.offsetMs < previousOffset || !number(point.cents, -2400, 2400)) return null;
        event.pitchCurve.push({ offsetMs: point.offsetMs, cents: point.cents });
        previousOffset = point.offsetMs;
      }
    }
    if (note.transition !== undefined) {
      const transition = note.transition;
      if (!record(transition) || (transition.kind !== 'meend' && transition.kind !== 'gamak-study') || !number(transition.onsetMs, 0, note.durationMs) || !midi(transition.targetMidi)) return null;
      event.transition = { kind: transition.kind, onsetMs: transition.onsetMs, targetMidi: transition.targetMidi };
    }
    noteEvents.push(event);
    previousStart = note.startMs;
  }
  return { title: value.title, tempoBpm: value.tempoBpm, rootMidi: value.rootMidi, timeSignature: value.timeSignature,
    ...(value.artistOrSource === undefined ? {} : { artistOrSource: value.artistOrSource }),
    ...(melody ? { melodyEvents: melody.noteEvents } : {}),
    ...(value.melodyCredit === undefined ? {} : { melodyCredit: value.melodyCredit }),
    ...(value.melodyEstimated === undefined ? {} : { melodyEstimated: value.melodyEstimated }),
    ...(value.reviewIssues === undefined ? {} : { reviewIssues: [...value.reviewIssues as string[]] }), noteEvents };
}

export function parseLocalPracticeDraft(raw: string | null): PracticePiece | null {
  if (raw === null || raw.length * 2 > MAX_BYTES) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return record(value) && value.version === 1 ? copyPiece(value.piece) : null;
  } catch { return null; }
}

export function readLocalPracticeDraft(storage: StorageProvider = browserStorage): DraftResult {
  try {
    const raw = storage().getItem(LOCAL_PRACTICE_DRAFT_KEY);
    const piece = parseLocalPracticeDraft(raw);
    return { piece, error: raw !== null && !piece ? 'The saved local draft is invalid or unsupported. Delete it or save a new draft.' : null };
  } catch { return { piece: null, error: 'Local storage is unavailable. Practice still works, but this browser cannot read a saved draft.' }; }
}

export function saveLocalPracticeDraft(value: unknown, storage: StorageProvider = browserStorage): DraftResult {
  const piece = copyPiece(value);
  if (!piece) return { piece: null, error: 'This score cannot be saved as a local draft: its notes or metadata are invalid or exceed the supported limits.' };
  const raw = JSON.stringify({ version: 1, piece });
  if (raw.length * 2 > MAX_BYTES) return { piece: null, error: 'This draft is too large to save locally. Keep your original file or download the score.' };
  try {
    storage().setItem(LOCAL_PRACTICE_DRAFT_KEY, raw);
    return { piece, error: null };
  } catch { return { piece: null, error: 'Draft not saved. Local storage is blocked or full. Keep your original file or download the score; your current practice is unchanged.' }; }
}

export function deleteLocalPracticeDraft(storage: StorageProvider = browserStorage): { error: string | null } {
  try { storage().removeItem(LOCAL_PRACTICE_DRAFT_KEY); return { error: null }; }
  catch { return { error: 'Could not delete the local draft because browser storage is unavailable. Your current practice is unchanged.' }; }
}
