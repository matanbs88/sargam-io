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
