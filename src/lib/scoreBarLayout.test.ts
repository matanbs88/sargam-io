import { expect, it } from 'vitest';
import { scoreBarSegment } from './scoreBarLayout';

it('keeps rests as empty space', () => {
  expect(scoreBarSegment(1000, 500, 0, 2000)).toEqual({ left: 50, width: 25, durationMs: 500, continued: false });
});
it('splits a held note visually without spilling into the next bar', () => {
  expect(scoreBarSegment(1500, 1000, 0, 2000)?.width).toBe(25);
  expect(scoreBarSegment(1500, 1000, 1, 2000)).toEqual({ left: 0, width: 25, durationMs: 500, continued: true });
  expect(scoreBarSegment(1500, 1000, 2, 2000)).toBeNull();
});
it('rejects invalid geometry and excludes notes ending at this bar start', () => {
  expect(scoreBarSegment(0, 2000, 1, 2000)).toBeNull();
  expect(scoreBarSegment(0, 1, 0, 0)).toBeNull();
  expect(scoreBarSegment(NaN, 1, 0, 2000)).toBeNull();
});
