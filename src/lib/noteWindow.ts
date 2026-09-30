import type { MidiNoteEvent } from './midiToSargam';

/** Immutable interval index. A long held note is not lost when newer notes start. */
export function createNoteWindow(events: readonly MidiNoteEvent[]) {
  const ordered = events.filter(n => Number.isFinite(n.startMs) && Number.isFinite(n.durationMs) && n.durationMs > 0)
    .slice().sort((a, b) => a.startMs - b.startMs);
  let maxEnd = -Infinity;
  const ends = ordered.map(n => (maxEnd = Math.max(maxEnd, n.startMs + n.durationMs)));
  return (from: number, to: number): readonly MidiNoteEvent[] => {
    if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return [];
    let lo = 0, hi = ordered.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (ends[mid] < from) lo = mid + 1; else hi = mid; }
    const first = lo;
    hi = ordered.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (ordered[mid].startMs <= to) lo = mid + 1; else hi = mid; }
    return ordered.slice(first, lo).filter(n => n.startMs + n.durationMs >= from);
  };
}
