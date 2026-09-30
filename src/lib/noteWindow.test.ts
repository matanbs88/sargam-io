import { expect, it } from 'vitest';
import { createNoteWindow } from './noteWindow';

it('retains a sustained note underneath later onsets and includes boundary notes', () => {
  const notes = [{ midi: 60, startMs: 0, durationMs: 10000 }, { midi: 62, startMs: 100, durationMs: 100 }, { midi: 64, startMs: 5000, durationMs: 500 }];
  const visible = createNoteWindow(notes);
  expect(visible(4000, 5000)).toEqual([notes[0], notes[2]]);
  expect(visible(11000, 12000)).toEqual([]);
});
it('does not mutate or quantize input and supports unsorted polyphony', () => {
  const notes = [{ midi: 60, startMs: 500, durationMs: 123.45 }, { midi: 64, startMs: 0, durationMs: 700 }];
  const before = JSON.stringify(notes);
  expect(createNoteWindow(notes)(550, 600)).toEqual([notes[1], notes[0]]);
  expect(JSON.stringify(notes)).toBe(before);
});
it('returns bounded visible content for a long score', () => {
  const notes = Array.from({ length: 10000 }, (_, index) => ({ midi: 60, startMs: index * 100, durationMs: 50 }));
  expect(createNoteWindow(notes)(500000, 505000)).toHaveLength(51);
});
it('rejects invalid windows and malformed durations', () => {
  const visible = createNoteWindow([{ midi: 60, startMs: NaN, durationMs: 500 }, { midi: 60, startMs: 0, durationMs: -1 }]);
  expect(visible(0, 100)).toEqual([]);
  expect(visible(NaN, 100)).toEqual([]);
  expect(visible(100, 0)).toEqual([]);
});
