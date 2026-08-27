"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MidiNoteEvent } from "@/src/lib/midiToSargam";
import {
  getNextEventIndex,
  getEventAdvanceDelay,
  getLastEventIndex,
  getPlaybackProgress,
  normalizeLoopRange,
  stepEventIndex,
  type EventLoopRange,
} from "@/src/lib/playback";

type UseMockTransportOptions = {
  readonly events: readonly MidiNoteEvent[];
  readonly isEnabled: boolean;
  readonly loopRange: EventLoopRange | null;
  readonly playbackRate: number;
};

/**
 * Client-only transport for deterministic mock MIDI events. Keeping timing and
 * navigation here isolates the page from playback rules before live polling or
 * audio synchronization is introduced.
 */
export function useMockTransport({
  events,
  isEnabled,
  loopRange,
  playbackRate,
}: UseMockTransportOptions) {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastEventIndex = getLastEventIndex(events.length);
  const normalizedLoopRange = useMemo(
    () => normalizeLoopRange(loopRange, events.length),
    [events.length, loopRange],
  );
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

    const phraseStartIndex = normalizedLoopRange?.startIndex ?? 0;
    const phraseEndIndex = normalizedLoopRange?.endIndex ?? lastEventIndex;

    if (activeEventIndex >= phraseEndIndex) {
      setActiveEventIndex(phraseStartIndex);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((currentValue) => !currentValue);
  }, [activeEventIndex, lastEventIndex, normalizedLoopRange]);

  useEffect(() => {
    if (!isPlaying || !isEnabled || activeEvent === undefined) return;

    const nextEventIndex = getNextEventIndex(
        activeEventIndex,
        events.length,
        normalizedLoopRange,
      );

    const nextEvent = nextEventIndex === null ? null : events[nextEventIndex];
    const timer = window.setTimeout(() => {

      if (nextEventIndex === null) {
        setIsPlaying(false);
        return;
      }
      setActiveEventIndex(nextEventIndex);
    }, getEventAdvanceDelay(activeEvent, nextEvent ?? null, playbackRate));

    return () => window.clearTimeout(timer);
  }, [
    activeEvent,
    activeEventIndex,
    events,
    events.length,
    isEnabled,
    isPlaying,
    normalizedLoopRange,
    playbackRate,
  ]);

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
