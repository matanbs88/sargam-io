"use client";

import { useEffect, useRef, useState } from "react";

function safePlaybackRate(playbackRate: number): number {
  return Number.isFinite(playbackRate)
    ? Math.min(Math.max(playbackRate, 0.25), 2)
    : 1;
}

type UsePlaybackClockOptions = {
  readonly baseTimeMs: number;
  readonly isPlaying: boolean;
  readonly playbackRate: number;
};

/**
 * Keeps a visual timeline continuous while the transport advances between
 * authored events. The active event is used as an anchor, but changing the
 * anchor never resets a running clock or makes the playhead jump backwards.
 */
export function usePlaybackClock({
  baseTimeMs,
  isPlaying,
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

  return currentTimeMs;
}
