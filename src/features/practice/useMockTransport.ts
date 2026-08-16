"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MidiNoteEvent } from "@/src/lib/midiToSargam";
import {
  getLastEventIndex,
  getPlaybackProgress,
  stepEventIndex,
} from "@/src/lib/playback";

type UseMockTransportOptions = {
  readonly events: readonly MidiNoteEvent[];
  readonly isEnabled: boolean;
};

/**
 * Client-only transport for deterministic mock MIDI events. Keeping timing and
 * navigation here isolates the page from playback rules before live polling or
 * audio synchronization is introduced.
 */
export function useMockTransport({
  events,
  isEnabled,
}: UseMockTransportOptions) {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastEventIndex = getLastEventIndex(events.length);
  const activeEvent = events[activeEventIndex];
  const playbackProgress = getPlaybackProgress(activeEventIndex, events.length);

  const pause = useCallback(() => setIsPlaying(false), []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setActiveEventIndex(0);
  }, []);

  const selectEvent = useCallback(
    (index: number) => {
      setIsPlaying(false);
      setActiveEventIndex(index);
    },
    [],
  );

  const step = useCallback(
    (direction: -1 | 1) => {
      setIsPlaying(false);
      setActiveEventIndex((currentIndex) =>
        stepEventIndex(currentIndex, direction, events.length),
      );
    },
    [events.length],
  );

  const togglePlayback = useCallback(() => {
    if (lastEventIndex < 0) return;

    if (activeEventIndex >= lastEventIndex) {
      setActiveEventIndex(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((currentValue) => !currentValue);
  }, [activeEventIndex, lastEventIndex]);

  useEffect(() => {
    if (!isPlaying || !isEnabled || activeEvent === undefined) return;

    const timer = window.setTimeout(() => {
      if (activeEventIndex >= lastEventIndex) {
        setIsPlaying(false);
        return;
      }
      setActiveEventIndex((currentIndex) => currentIndex + 1);
    }, Math.max(activeEvent.durationMs, 160));

    return () => window.clearTimeout(timer);
  }, [activeEvent, activeEventIndex, isEnabled, isPlaying, lastEventIndex]);

  return useMemo(
    () => ({
      activeEvent,
      activeEventIndex,
      isPlaying,
      lastEventIndex,
      pause,
      playbackProgress,
      reset,
      selectEvent,
      step,
      togglePlayback,
    }),
    [
      activeEvent,
      activeEventIndex,
      isPlaying,
      lastEventIndex,
      pause,
      playbackProgress,
      reset,
      selectEvent,
      step,
      togglePlayback,
    ],
  );
}
