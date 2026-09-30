/** Clip a sustained note at bar boundaries without changing its playback event. */
export function scoreBarSegment(startMs: number, durationMs: number, bar: number, barMs: number) {
  if (![startMs, durationMs, bar, barMs].every(Number.isFinite) || barMs <= 0 || durationMs <= 0) return null;
  const start = Math.max(startMs, bar * barMs);
  const end = Math.min(startMs + durationMs, (bar + 1) * barMs);
  if (end - start < .01) return null;
  return { left: (start / barMs - bar) * 100, width: (end - start) / barMs * 100, durationMs: end - start, continued: start > startMs };
}
