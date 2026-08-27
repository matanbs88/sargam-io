"use client";

import { useEffect, useRef, useState } from "react";

function safePlaybackRate(playbackRate: number): number {
  return Number.isFinite(playbackRate)
    ? Math.min(Math.max(playbackRate, 0.25), 2)
    : 1;
}

type UsePlaybackClockOptions = {
  readonly baseTimeMs: number;
  readonly endTimeMs?: number;
  readonly isPlaying: boolean;
  /** The final authored timestamp; protects a visualizer from runaway time. */
  readonly phraseEndTimeMs?: number;
  readonly playbackRate: number;
};

/**
 * Keeps a visual timeline continuous while the transport advances between
 * authored events. The active event is used as an anchor, but changing the
 * anchor never resets a running clock or makes the playhead jump backwards.
 */
export function usePlaybackClock({
  baseTimeMs,
  endTimeMs,
  isPlaying,
  phraseEndTimeMs,
  playbackRate,
}: UsePlaybackClockOptions): number {
  const [currentTimeMs, setCurrentTimeMs] = useState(baseTimeMs);
  const clockRef = useRef({ lastFrameMs: 0, timeMs: baseTimeMs });
  const lastBaseTimeRef = useRef(baseTimeMs);

  useEffect(() => {
    const previousBaseTimeMs = lastBaseTimeRef.current;
    if (previousBaseTimeMs === baseTimeMs) return;

    const hasWrapped = baseTimeMs < previousBaseTimeMs;
    const nextTimeMs = isPlaying && !hasWrapped
      ? Math.max(clockRef.current.timeMs, baseTimeMs)
      : baseTimeMs;

    clockRef.current.timeMs = nextTimeMs;
    clockRef.current.lastFrameMs = 0;
    lastBaseTimeRef.current = baseTimeMs;
    setCurrentTimeMs(nextTimeMs);
  }, [baseTimeMs, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    let animationFrame = 0;
    clockRef.current.lastFrameMs = performance.now();

    const renderFrame = (nowMs: number) => {
      const elapsedMs = Math.max(0, nowMs - clockRef.current.lastFrameMs);
      clockRef.current.lastFrameMs = nowMs;
      clockRef.current.timeMs += elapsedMs * safePlaybackRate(playbackRate);
      setCurrentTimeMs(clockRef.current.timeMs);
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    animationFrame = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying, playbackRate]);

  const hasReachedEnd =
    !isPlaying &&
    endTimeMs !== undefined &&
    currentTimeMs >= endTimeMs;

  // A long background-tab pause, a stale transport event, or a missed loop
  // transition must never push the visual playhead beyond the authored song.
  // The transport remains the source of truth; this is only a rendering
  // recovery path that re-anchors the canvas/DOM to its current event.
  const hasOverflowedPhrase =
    phraseEndTimeMs !== undefined &&
    Number.isFinite(phraseEndTimeMs) &&
    currentTimeMs > phraseEndTimeMs + 1_000;

  return hasReachedEnd || hasOverflowedPhrase ? baseTimeMs : currentTimeMs;
}
