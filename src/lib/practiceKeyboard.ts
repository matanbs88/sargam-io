import { createPianoKeyGeometry, isWhitePianoKey, PERFORMANCE_PIANO_RANGE } from './pianoGeometry';

/** A portrait-sized stage benefits from a phrase range. A short landscape
 * stage needs the full keyboard, otherwise eight keys become wide flat tiles. */
export function isCompactPracticeKeyboard(width: number, height: number): boolean {
  return Number.isFinite(width) && Number.isFinite(height) && width > 0
    && width < 720 && height / width >= .7;
}

/** A stable phrase-wide range: never pan the keyboard under a playing note. */
export function practiceKeyboardRange(pitches: readonly number[], compact: boolean) {
  const valid = pitches.filter(p => Number.isInteger(p) && p >= 0 && p <= 127);
  if (!valid.length) return { ...PERFORMANCE_PIANO_RANGE };
  const lowest = valid.reduce((a, b) => Math.min(a, b), 127);
  const highest = valid.reduce((a, b) => Math.max(a, b), 0);
  let firstMidi = compact ? Math.max(0, lowest - 2) : Math.min(PERFORMANCE_PIANO_RANGE.firstMidi, lowest);
  let lastMidi = compact ? Math.min(127, highest + 2) : Math.max(PERFORMANCE_PIANO_RANGE.lastMidi, highest);
  while (!isWhitePianoKey(firstMidi)) firstMidi--;
  while (!isWhitePianoKey(lastMidi)) lastMidi++;
  return { firstMidi, lastMidi };
}

export function practiceKeyboardGeometry(pitches: readonly number[], compact: boolean) {
  const range = practiceKeyboardRange(pitches, compact);
  return createPianoKeyGeometry(range.firstMidi, range.lastMidi);
}

/** Fit the whole phrase on every viewport, adding context to avoid oversized keys.
 * Notes, lanes and keys must all consume this same geometry. */
export function adaptiveKeyboardGeometry(pitches: readonly number[], width: number) {
  const range = practiceKeyboardRange(pitches, true);
  const targetWhites = Math.max(8, Math.min(29, Math.ceil(Math.max(0, width) / 64)));
  let keys = createPianoKeyGeometry(range.firstMidi, range.lastMidi);
  while (keys.filter(k => !k.isBlack).length < targetWhites && (range.firstMidi > 0 || range.lastMidi < 127)) {
    if (range.firstMidi > 0) { do { range.firstMidi--; } while (!isWhitePianoKey(range.firstMidi)); }
    if (range.lastMidi < 127) { do { range.lastMidi++; } while (!isWhitePianoKey(range.lastMidi)); }
    keys = createPianoKeyGeometry(range.firstMidi, range.lastMidi);
  }
  return keys;
}
