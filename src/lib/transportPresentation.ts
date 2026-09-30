/** Display helpers only; the transport keeps its unrounded audio-clock values. */
export function formatPlaybackTime(milliseconds: number): string {
  const seconds = Math.floor(Math.max(0, Number.isFinite(milliseconds) ? milliseconds : 0) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function isAtScoreEnd(positionMs: number, durationMs: number): boolean {
  return Number.isFinite(positionMs) && Number.isFinite(durationMs)
    && durationMs > 0 && positionMs >= durationMs;
}
