import { describe, expect, it } from 'vitest';
import { practiceKeyboardGeometry, practiceKeyboardRange, isCompactPracticeKeyboard } from './practiceKeyboard';
import { isWhitePianoKey } from './pianoGeometry';

describe('responsive practice keyboard', () => {
  it('keeps broad landscape keys proportional rather than stretching one octave', () => {
    expect(isCompactPracticeKeyboard(374, 436)).toBe(true);
    expect(isCompactPracticeKeyboard(635, 117)).toBe(false);
    expect(isCompactPracticeKeyboard(635, 300)).toBe(false);
    expect(isCompactPracticeKeyboard(1334, 420)).toBe(false);
    expect(isCompactPracticeKeyboard(0, 400)).toBe(false);
  });
  it('preserves the full desktop keyboard', () => {
    expect(practiceKeyboardRange([60, 67], false)).toEqual({ firstMidi: 48, lastMidi: 96 });
  });
  it('keeps every phrase pitch and white endpoints in a compact range', () => {
    for (const pitches of [[60, 62, 64, 65, 67], [61, 66], [0, 127], [127]]) {
      const range = practiceKeyboardRange(pitches, true);
      expect(isWhitePianoKey(range.firstMidi)).toBe(true);
      expect(isWhitePianoKey(range.lastMidi)).toBe(true);
      expect(range.firstMidi).toBeLessThanOrEqual(Math.min(...pitches));
      expect(range.lastMidi).toBeGreaterThanOrEqual(Math.max(...pitches));
      const keys = practiceKeyboardGeometry(pitches, true);
      for (const key of keys) {
        expect(key.left).toBeGreaterThanOrEqual(0);
        expect(key.left + key.width).toBeLessThanOrEqual(100.000001);
      }
    }
  });
  it('falls back for missing or invalid pitches', () => {
    expect(practiceKeyboardRange([NaN, -2, 200], true)).toEqual({ firstMidi: 48, lastMidi: 96 });
  });
  it('extends desktop geometry instead of dropping imported low or high notes', () => {
    const keys = practiceKeyboardGeometry([33, 61, 103], false);
    for (const midi of [33, 61, 103]) expect(keys.some(key => key.midi === midi)).toBe(true);
    expect(keys[0].isBlack).toBe(false);
    expect(keys.at(-1)?.isBlack).toBe(false);
  });
});
