import type { MidiNoteEvent } from './midiToSargam';

export type WrittenVoiceScore = {
  readonly tempoBpm: number;
  readonly beatsPerBar: number;
  readonly form: readonly number[];
  readonly sections: readonly (readonly (readonly {
    readonly midi: number | readonly number[] | null;
    readonly beats: number;
    readonly tieOut?: boolean;
  }[])[])[];
};

/** Only for editions whose reviewed chord order explicitly lists the melody
 * first (Horetzky 21 and Satie's ending chords). Never infer this for imports. */
export function reviewedLeadingMelodyEvents(score: WrittenVoiceScore): readonly MidiNoteEvent[] {
  return verifiedVoiceEvents({ ...score, sections: score.sections.map(section => section.map(bar =>
    bar.map(segment => ({ ...segment, midi: Array.isArray(segment.midi) ? segment.midi[0] : segment.midi })),
  )) });
}

/** Literal single authored voice, including its explicit chords and cross-bar ties. */
export function verifiedVoiceEvents(score: WrittenVoiceScore): readonly MidiNoteEvent[] {
  if (!Number.isFinite(score.tempoBpm) || score.tempoBpm <= 0
    || !Number.isFinite(score.beatsPerBar) || score.beatsPerBar <= 0 || !score.form.length) {
    throw new Error('Written voice requires positive timing and a nonempty form.');
  }
  const events: { midi: number; startMs: number; durationMs: number; velocity: number }[] = [];
  let beat = 0;
  let pending = new Map<number, number>();
  const beatMs = 60000 / score.tempoBpm;
  for (const sectionIndex of score.form) {
    const section = score.sections[sectionIndex];
    if (!Number.isInteger(sectionIndex) || !section?.length) throw new Error('Invalid voice form section.');
    for (const bar of section) {
      if (!bar.length || Math.abs(bar.reduce((sum, segment) => sum + segment.beats, 0) - score.beatsPerBar) > 1e-9) {
        throw new Error('Incomplete written voice measure.');
      }
      for (const segment of bar) {
        const pitches = segment.midi === null ? [] : typeof segment.midi === 'number' ? [segment.midi] : [...segment.midi];
        if (!Number.isFinite(segment.beats) || segment.beats <= 0
          || (segment.midi !== null && !pitches.length)
          || pitches.some(midi => !Number.isInteger(midi) || midi < 0 || midi > 127)
          || new Set(pitches).size !== pitches.length) throw new Error('Invalid written voice segment.');
        if (pending.size && (pitches.length !== pending.size || pitches.some(midi => !pending.has(midi)))) {
          throw new Error('Written tie must continue the same pitches without a rest.');
        }
        const startMs = Math.round(beat * beatMs);
        beat += segment.beats;
        const endMs = Math.round(beat * beatMs);
        if (endMs <= startMs) throw new Error('Written segment is below millisecond resolution.');
        const nextPending = new Map<number, number>();
        for (const midi of pitches) {
          let index = pending.get(midi);
          if (index === undefined) {
            index = events.length;
            events.push({ midi, startMs, durationMs: endMs - startMs, velocity: 88 });
          } else {
            const event = events[index];
            if (event.startMs + event.durationMs !== startMs) throw new Error('Noncontiguous written tie.');
            event.durationMs = endMs - event.startMs;
          }
          if (segment.tieOut) nextPending.set(midi, index);
        }
        if (segment.tieOut && !pitches.length) throw new Error('A rest cannot be tied.');
        pending = nextPending;
      }
    }
  }
  if (pending.size) throw new Error('Written voice ends with an unresolved tie.');
  return events;
}
