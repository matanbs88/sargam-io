export type PlaybackClockInput = {
  readonly baseTimeMs: number;
  readonly isPlaying: boolean;
  readonly nowMs: number;
  readonly playbackRate: number;
  readonly startedAtMs: number;
};

/**
 * Converts one animation-frame timestamp into the authored practice timeline.
 * Audio preparation and transport decide when playback starts; every visual
 * surface uses this same calculation while it is running.
 */
export function getPlaybackClockTime({
  baseTimeMs,
  isPlaying,
  nowMs,
  playbackRate,
  startedAtMs,
}: PlaybackClockInput): number {
  if (!isPlaying) return baseTimeMs;

  const safeRate = Number.isFinite(playbackRate)
    ? Math.min(Math.max(playbackRate, 0.25), 2)
    : 1;
  const elapsedMs = Math.max(0, nowMs - startedAtMs);

  return baseTimeMs + elapsedMs * safeRate;
}
