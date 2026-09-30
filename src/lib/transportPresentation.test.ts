import { describe, expect, it } from 'vitest';
import { formatPlaybackTime, isAtScoreEnd } from './transportPresentation';

describe('transport presentation', () => {
  it('formats source-timeline time without rounding into a future second', () => {
    expect(formatPlaybackTime(18_563)).toBe('0:18');
    expect(formatPlaybackTime(60_001)).toBe('1:00');
    expect(formatPlaybackTime(3_661_500)).toBe('61:01');
  });
  it('uses a safe visible value for absent or invalid time', () => {
    expect(formatPlaybackTime(-100)).toBe('0:00');
    expect(formatPlaybackTime(NaN)).toBe('0:00');
    expect(formatPlaybackTime(Infinity)).toBe('0:00');
  });
  it('only identifies the real end of a non-empty timeline', () => {
    expect(isAtScoreEnd(18_562, 18_563)).toBe(false);
    expect(isAtScoreEnd(18_563, 18_563)).toBe(true);
    expect(isAtScoreEnd(0, 0)).toBe(false);
    expect(isAtScoreEnd(Infinity, 10)).toBe(false);
  });
});
