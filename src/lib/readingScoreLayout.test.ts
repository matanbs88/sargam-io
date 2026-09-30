import { expect, it } from 'vitest';
import { readingScoreLayout } from './readingScoreLayout';
import { adaptiveKeyboardGeometry } from './practiceKeyboard';
it('reflows score columns and expands note rows when more height is available', () => {
  expect(readingScoreLayout(1200, 150, 8).columns).toBe(5);
  expect(readingScoreLayout(390, 150, 8).columns).toBe(1);
  expect(readingScoreLayout(1200, 400, 8).rowHeight).toBeGreaterThan(readingScoreLayout(1200, 150, 8).rowHeight);
  expect(readingScoreLayout(1200, 400, 8, 400).columns).toBe(3);
});
it('uses phrase geometry on desktop too and maps every note to that exact key', () => {
  for (const width of [320, 700, 1300, 1800]) {
    const keys = adaptiveKeyboardGeometry([60, 62, 64, 67], width);
    for (const midi of [60, 62, 64, 67]) {
      const key = keys.find(k => k.midi === midi)!;
      expect(key.left).toBeGreaterThanOrEqual(0);
      expect(key.left + key.width).toBeLessThanOrEqual(100.0001);
    }
  }
  expect(adaptiveKeyboardGeometry([60, 67], 1300).length).toBeLessThan(49);
});
