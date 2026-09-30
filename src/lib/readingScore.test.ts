import { expect, it } from 'vitest';
import { buildReadingScore } from './readingScore';
import { READY_PRACTICE_CATALOG } from './practiceCatalog';
it('groups half-beat onsets and represents sustain separately', () => {
  const result = buildReadingScore([{ midi: 60, startMs: 0, durationMs: 250 }, { midi: 62, startMs: 250, durationMs: 750 }], 120, '4/4');
  expect(result.bars[0][0]).toEqual([{ index: 0, continued: false }, { index: 1, continued: false }]);
  expect(result.bars[0][1]).toEqual([{ index: 1, continued: true }]);
  expect(result.bars[0][2]).toEqual([]);
});
it('includes the whole piece, not just four bars', () => {
  expect(buildReadingScore([{ midi: 60, startMs: 20000, durationMs: 500 }], 120, '4/4').bars).toHaveLength(11);
});
it('preserves compound meter without floating-point boundary fragments', () => {
  const result = buildReadingScore([{ midi: 60, startMs: 0, durationMs: 1500.00001 }], 120, '6/8');
  expect(result.bars).toHaveLength(1);
  expect(result.bars[0]).toHaveLength(6);
});
it('includes each catalog onset exactly once without changing source events', () => {
  for (const piece of READY_PRACTICE_CATALOG) {
    const events = piece.noteEvents!;
    const before = JSON.stringify(events);
    const result = buildReadingScore(events, piece.tempoBpm, piece.timeSignature);
    const onsets = result.bars.flat(2).filter(note => !note.continued).map(note => note.index).sort((a, b) => a - b);
    expect(onsets, piece.title).toEqual(events.map((_, index) => index));
    expect(JSON.stringify(events)).toBe(before);
  }
});
it('keeps rounded-ms alankar pairs on their intended beats', () => {
  const piece = READY_PRACTICE_CATALOG.find(piece => piece.id === 'riyaz-alankar-one')!;
  const score = buildReadingScore(piece.noteEvents!, piece.tempoBpm, piece.timeSignature);
  for (let beat = 0; beat < 8; beat++) {
    expect(score.bars[Math.floor(beat / 4)][beat % 4].filter(note => !note.continued).map(note => note.index)).toEqual([beat * 2, beat * 2 + 1]);
  }
});
it('retains sub-tick notes instead of dropping their onset', () => {
  expect(buildReadingScore([{ midi:60, startMs:250, durationMs:1 }],120,'4/4').bars[0][0]).toEqual([{ index:0, continued:false }]);
});
it('follows the actual printed bar at every catalog onset, including rounded boundaries', () => {
  for (const piece of READY_PRACTICE_CATALOG) {
    const score = buildReadingScore(piece.noteEvents!, piece.tempoBpm, piece.timeSignature);
    piece.noteEvents!.forEach((event, index) => {
      const printedBar = score.bars.findIndex(beats => beats.flat().some(note => note.index === index && !note.continued));
      expect(score.barAt(event.startMs), `${piece.title}, note ${index}`).toBe(printedBar);
    });
    expect(score.barAt(Infinity)).toBe(0);
    expect(score.barAt(-1)).toBe(0);
    expect(score.barAt(Number.MAX_SAFE_INTEGER)).toBe(score.bars.length - 1);
  }
});
