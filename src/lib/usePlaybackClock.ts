"use client";

import { useEffect, useRef, useState } from "react";
import { VisualTimeline, type VisualClockOptions } from "./visualTimeline";

type UsePlaybackClockOptions = VisualClockOptions & {
  readonly endTimeMs?: number;
  readonly readTimeMs?: () => number;
};

/** Absolute frame anchors: never integrate page uptime into song time. */
export function usePlaybackClock({
  baseTimeMs, isPlaying, playbackRate, phraseEndTimeMs, endTimeMs, readTimeMs,
}: UsePlaybackClockOptions): number {
  const [currentTimeMs, setCurrentTimeMs] = useState(baseTimeMs);
  const clockRef = useRef<VisualTimeline | null>(null);
  const bound = phraseEndTimeMs ?? endTimeMs;

  useEffect(() => {
    const options = { baseTimeMs, isPlaying, playbackRate, phraseEndTimeMs: bound };
    const now = performance.now();
    const clock = clockRef.current ?? new VisualTimeline(options, now);
    clock.sync(options, now);
    clockRef.current = clock;
    let frame = 0;

    const render = (timestamp: number) => {
      setCurrentTimeMs(readTimeMs ? readTimeMs() : clock.read(timestamp));
      if (isPlaying) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [baseTimeMs, isPlaying, playbackRate, bound, readTimeMs]);

  return currentTimeMs;
}
