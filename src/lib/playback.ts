/** Returns -1 when no note events are available. */
export function getLastEventIndex(eventCount: number): number {
  return eventCount > 0 ? eventCount - 1 : -1;
}

/** Keeps a requested position inside an event list. */
export function clampEventIndex(index: number, eventCount: number): number {
  const lastEventIndex = getLastEventIndex(eventCount);
  if (lastEventIndex < 0) return -1;
  return Math.min(Math.max(index, 0), lastEventIndex);
}

/** Moves a transport one event without allowing off-by-one overflow. */
export function stepEventIndex(
  activeEventIndex: number,
  direction: -1 | 1,
  eventCount: number,
): number {
  return clampEventIndex(activeEventIndex + direction, eventCount);
}

/** Calculates a stable 0–100 progress value for a note-event transport. */
export function getPlaybackProgress(
  activeEventIndex: number,
  eventCount: number,
): number {
  const lastEventIndex = getLastEventIndex(eventCount);
  if (lastEventIndex <= 0) return 0;
  return (clampEventIndex(activeEventIndex, eventCount) / lastEventIndex) * 100;
}

export type EventLoopRange = {
  readonly endIndex: number;
  readonly startIndex: number;
};

/** Normalizes a selected phrase boundary to valid, ascending event indices. */
export function normalizeLoopRange(
  range: EventLoopRange | null,
  eventCount: number,
): EventLoopRange | null {
  if (range === null || eventCount === 0) return null;

  const startIndex = clampEventIndex(range.startIndex, eventCount);
  const endIndex = clampEventIndex(range.endIndex, eventCount);

  return {
    startIndex: Math.min(startIndex, endIndex),
    endIndex: Math.max(startIndex, endIndex),
  };
}

/** Resolves the next event, returning null when an unlooped phrase has ended. */
export function getNextEventIndex(
  activeEventIndex: number,
  eventCount: number,
  loopRange: EventLoopRange | null,
): number | null {
  const normalizedLoop = normalizeLoopRange(loopRange, eventCount);
  const lastEventIndex = normalizedLoop?.endIndex ?? getLastEventIndex(eventCount);

  if (lastEventIndex < 0 || activeEventIndex >= lastEventIndex) {
    return normalizedLoop?.startIndex ?? null;
  }

  return activeEventIndex + 1;
}

/** Keeps practice-speed controls from producing unusably short visual notes. */
export function getPlaybackDelay(durationMs: number, playbackRate: number): number {
  const safeRate = Number.isFinite(playbackRate)
    ? Math.min(Math.max(playbackRate, 0.25), 2)
    : 1;

  return Math.max(120, durationMs / safeRate);
}

type TimedPlaybackEvent = {
  readonly durationMs: number;
  readonly startMs: number;
};

/**
 * Returns the delay to the next timeline event. Sequential events follow the
 * authored start-time delta; a phrase loop falls back to the current note's
 * duration when the next index wraps back to an earlier timestamp.
 */
export function getEventAdvanceDelay(
  currentEvent: TimedPlaybackEvent,
  nextEvent: TimedPlaybackEvent | null,
  playbackRate: number,
): number {
  const timelineDelta = nextEvent
    ? nextEvent.startMs - currentEvent.startMs
    : Number.NaN;
  const delayMs = Number.isFinite(timelineDelta) && timelineDelta > 0
    ? timelineDelta
    : currentEvent.durationMs;

  return getPlaybackDelay(delayMs, playbackRate);
}
