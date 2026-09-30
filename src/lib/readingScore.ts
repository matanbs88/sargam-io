import type { MidiNoteEvent } from './midiToSargam';

/** Metrical reading groups; continuations never create new playback events. */
export function buildReadingScore(events: readonly MidiNoteEvent[], tempo: number, meter: string) {
  const [n, d] = meter.split('/').map(Number);
  const numerator = Number.isInteger(n) && n > 0 && n <= 32 ? n : 4;
  const denominator = [1, 2, 4, 8, 16, 32].includes(d) ? d : 4;
  const quarterMs = 60000 / (Number.isFinite(tempo) && tempo > 0 ? tempo : 96);
  const beatMs = quarterMs * 4 / denominator;
  const barMs = numerator * beatMs;
  // Reading-only tick grid, matching the PDF timeline. Repeated rounded-ms
  // steps accumulate beyond a 1ms tolerance and otherwise move onsets into
  // the preceding beat. Audio/rendering keep their original unmodified times.
  const ticksPerQuarter = 96;
  const beatTicks = ticksPerQuarter * 4 / denominator;
  const timeline = events.map(event => {
    const start = Math.max(0, Math.round(event.startMs / quarterMs * ticksPerQuarter));
    return { start, end: Math.max(start + 1, Math.round((event.startMs + event.durationMs) / quarterMs * ticksPerQuarter)) };
  });
  const end = timeline.reduce((last, event) => Math.max(last, event.end), 0);
  const bars = Array.from({ length: Math.max(1, Math.ceil(end / (beatTicks * numerator))) }, () => Array.from({ length: numerator }, () => [] as { index: number; continued: boolean }[]));
  timeline.forEach((event, index) => {
    const first = Math.floor(event.start / beatTicks);
    const last = Math.ceil(event.end / beatTicks) - 1;
    for (let beat = first; beat <= last; beat++) bars[Math.floor(beat / numerator)]?.[beat % numerator].push({ index, continued: beat > first });
  });
  // Follow uses the same reading grid as grouping. A rounded source onset can
  // sit just before an exact bar boundary (e.g. 2856ms at 84 BPM); raw division
  // would follow the previous row while the selected note is printed on the next.
  function barAt(positionMs: number) {
    const tick = Math.round((Number.isFinite(positionMs) ? positionMs : 0) / quarterMs * ticksPerQuarter);
    return Math.max(0, Math.min(bars.length - 1, Math.floor(tick / (beatTicks * numerator))));
  }
  return { bars, barMs, barAt };
}
