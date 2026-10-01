import type { MidiNoteEvent } from './midiToSargam';

export type PracticePart = 'melody' | 'arrangement';
export type MelodySource = { melodyEvents?: readonly MidiNoteEvent[]; melodyCredit?: string; melodyEstimated?: boolean };

export function isMonophonic(events: readonly MidiNoteEvent[]): boolean {
  let end = -Infinity;
  for (const event of [...events].sort((a, b) => a.startMs - b.startMs)) {
    if (event.startMs < end) return false;
    end = event.startMs + event.durationMs;
  }
  return true;
}

/** An upper-envelope estimate, NOT a guaranteed melody transcription.
 * Sustaining upper notes win over intervening bass attacks. Endpoints are
 * half-open: adjacent notes touch without simultaneous pitched voices.
 * Original data is never changed. Source-reviewed melody always wins.
 */
export function estimateUpperMelody(events: readonly MidiNoteEvent[]): readonly MidiNoteEvent[] {
  if (isMonophonic(events)) return events;
  const boundaries = events.flatMap((note, index) => [
    { time: note.startMs, index, start: true },
    { time: note.startMs + note.durationMs, index, start: false },
  ]).sort((a, b) => a.time - b.time);
  const active = new Set<number>();
  const heap: number[] = [];
  const above = (a: number, b: number) => events[a].midi > events[b].midi
    || (events[a].midi === events[b].midi && (events[a].startMs > events[b].startMs
      || (events[a].startMs === events[b].startMs && a < b)));
  const push = (index: number) => {
    heap.push(index);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!above(heap[i], heap[parent])) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]]; i = parent;
    }
  };
  const pop = () => {
    const last = heap.pop();
    if (!heap.length || last === undefined) return;
    heap[0] = last;
    let i = 0;
    while (i * 2 + 1 < heap.length) {
      let child = i * 2 + 1;
      if (child + 1 < heap.length && above(heap[child + 1], heap[child])) child++;
      if (!above(heap[child], heap[i])) break;
      [heap[i], heap[child]] = [heap[child], heap[i]]; i = child;
    }
  };
  const spans: { index: number; start: number; end: number }[] = [];
  for (let i = 0; i < boundaries.length;) {
    const time = boundaries[i].time;
    while (i < boundaries.length && boundaries[i].time === time) {
      const point = boundaries[i++];
      if (point.start) { active.add(point.index); push(point.index); }
      else active.delete(point.index);
    }
    while (heap.length && !active.has(heap[0])) pop();
    const end = boundaries[i]?.time;
    if (!heap.length || end === undefined || end <= time) continue;
    const index = heap[0];
    const previous = spans.at(-1);
    if (previous?.index === index && previous.end === time) previous.end = end;
    else spans.push({ index, start: time, end });
  }
  return spans.map(({ index, start, end }) => {
    const note = events[index];
    const offset = start - note.startMs;
    const durationMs = end - start;
    // A split gesture cannot retain a transition to a removed harmony note.
    const { pitchCurve, transition, ...body } = note;
    if (offset === 0 && durationMs === note.durationMs) return note;
    const centsAt = (time: number) => {
      if (!pitchCurve?.length) return 0;
      const right = pitchCurve.findIndex(point => point.offsetMs >= time);
      if (right < 0) return pitchCurve.at(-1)!.cents;
      if (right === 0) return pitchCurve[0].cents;
      const a = pitchCurve[right - 1], b = pitchCurve[right];
      return a.cents + (b.cents - a.cents) * (time - a.offsetMs) / (b.offsetMs - a.offsetMs);
    };
    return { ...body, startMs: start, durationMs,
      ...(pitchCurve?.length ? { pitchCurve: [
        { offsetMs: 0, cents: centsAt(offset) },
        ...pitchCurve.filter(p => p.offsetMs > offset && p.offsetMs < offset + durationMs)
          .map(p => ({ ...p, offsetMs: p.offsetMs - offset })),
        { offsetMs: durationMs, cents: centsAt(offset + durationMs) },
      ] } : {}),
      ...(transition && offset === 0 && durationMs === note.durationMs ? { transition } : {}),
    };
  });
}

export function resolveMelody(events: readonly MidiNoteEvent[], source: MelodySource) {
  if (source.melodyEvents) {
    if (!isMonophonic(source.melodyEvents)) throw new Error('Authored melody contains overlapping voices.');
    return { events: source.melodyEvents, estimated: source.melodyEstimated ?? false, credit: source.melodyCredit ?? 'Authored melody' };
  }
  const estimated = !isMonophonic(events);
  return { events: estimated ? estimateUpperMelody(events) : events, estimated,
    credit: estimated ? 'Automatic upper-voice estimate — check against the original melody.' : 'Single melodic voice' };
}

export function instrumentPart(instrument: 'Piano' | 'Bansuri' | 'Harmonium', pianoPart: PracticePart): PracticePart {
  return instrument === 'Piano' ? pianoPart : 'melody';
}
