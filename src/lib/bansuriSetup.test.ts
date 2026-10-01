import { describe, expect, it } from 'vitest';
import { evaluateBansuriSetup, projectBansuriSetup } from './bansuriSetup';
import { midiToRelativeNote, type MidiNoteEvent } from './midiToSargam';
import { getBansuriReferenceFingering } from './bansuriFingering';

// An authored A-natural-minor fixture, not a detected mode or a claimed raga.
const phrase: readonly MidiNoteEvent[] = [69, 71, 72, 74, 76, 77, 79, 81].map((midi, index) =>
  Object.freeze({ midi, startMs: index * 600, durationMs: 400, velocity: 80 }));

describe('bansuri setup projection', () => {
  it('matching forces flute Sa to source Sa and leaves source events untouched', () => {
    expect(projectBansuriSetup(phrase, 69, 65, 'matching')).toEqual({
      events: phrase, songSa: 69, fluteSa: 69, shift: 0,
    });
    expect(projectBansuriSetup(phrase, 69, 65, 'matching').events).toBe(phrase);
    expect(evaluateBansuriSetup(phrase, 69, 65, 'matching').matchingMismatch).toBe(true);
    expect(evaluateBansuriSetup(phrase, 69, 69, 'matching').matchingMismatch).toBe(false);
    expect(evaluateBansuriSetup(phrase, 69, 57, 'matching').matchingMismatch).toBe(true);
  });

  it('original A on F remains song Sa but maps to physical Ga, offset four', () => {
    const result = projectBansuriSetup(phrase, 69, 65, 'original');
    expect(result).toEqual({ events: phrase, songSa: 69, fluteSa: 65, shift: 0 });
    expect(result.events).toBe(phrase);
    expect(midiToRelativeNote(69, result.songSa).sargamToken).toBe('S');
    expect(midiToRelativeNote(69, result.fluteSa)).toMatchObject({ interval: 4, sargamToken: 'G', octaveShift: 0 });
    expect(getBansuriReferenceFingering(69, result.fluteSa)?.holes).toEqual([
      'closed', 'open', 'open', 'open', 'open', 'open',
    ]);
    expect(midiToRelativeNote(72, result.songSa).sargamToken).toBe('g');
    expect(midiToRelativeNote(72, result.fluteSa).sargamToken).toBe('P');
  });

  it('transposes A minor to F minor, not F major, retaining source-relative labels', () => {
    const result = projectBansuriSetup(phrase, 69, 65, 'transpose');
    expect(result).toMatchObject({ songSa: 65, fluteSa: 65, shift: -4 });
    expect(result.events.map(event => event.midi)).toEqual([65, 67, 68, 70, 72, 73, 75, 77]);
    expect(result.events.map(event => midiToRelativeNote(event.midi, result.songSa).sargamToken)).toEqual(
      phrase.map(event => midiToRelativeNote(event.midi, 69).sargamToken));
    result.events.forEach((event, index) => {
      expect(event).not.toBe(phrase[index]);
      expect(event).toEqual({ ...phrase[index], midi: phrase[index].midi - 4 });
    });
    expect(phrase[0].midi).toBe(69);
    expect(projectBansuriSetup(phrase, 69, 65, 'transpose')).toEqual(result);
    expect(projectBansuriSetup(phrase, 69, 67, 'transpose').events[0].midi).toBe(67);
    expect(projectBansuriSetup(phrase, 69, 65, 'original').events).toBe(phrase);
  });

  it('shifts transition target once while preserving curve cents and all timings', () => {
    const curve = Object.freeze([{ offsetMs: 0, cents: 0 }, { offsetMs: 350, cents: 200 }]);
    const transition = Object.freeze({ kind: 'meend' as const, onsetMs: 250, targetMidi: 71 });
    const event = Object.freeze({ ...phrase[0], pitchCurve: curve, transition });
    const result = projectBansuriSetup([event], 69, 65, 'transpose').events[0];
    expect(result).toEqual({ ...event, midi: 65, transition: { ...transition, targetMidi: 67 } });
    expect(result.pitchCurve).toBe(curve);
    expect(result.transition).not.toBe(transition);
    expect(transition.targetMidi).toBe(71);
  });

  it('handles empty scores and zero-shift transpose without changing event structure', () => {
    expect(projectBansuriSetup([], 65, 65, 'transpose').events).toEqual([]);
    const result = projectBansuriSetup(phrase, 69, 69, 'transpose');
    expect(result.events).toEqual(phrase);
    expect(result.events).not.toBe(phrase);
    expect(result.events[0]).not.toHaveProperty('transition');
  });

  it('flags and rejects overflow, including transitions, without clamping', () => {
    const low = [{ ...phrase[0], midi: 0 }];
    expect(evaluateBansuriSetup(low, 69, 65, 'transpose').midiOutOfRangeEventIndices).toEqual([0]);
    expect(() => projectBansuriSetup(low, 69, 65, 'transpose')).toThrow(RangeError);
    const high = [{ ...phrase[0], transition: { kind: 'meend' as const, onsetMs: 200, targetMidi: 127 } }];
    expect(() => projectBansuriSetup(high, 65, 69, 'transpose')).toThrow(RangeError);
    expect(() => projectBansuriSetup([{ ...phrase[0], midi: 69.5 }], 69, 65, 'original')).toThrow(RangeError);
    expect(low[0].midi).toBe(0);
  });

  it('keeps flute range unverified unless caller supplies explicit bounds', () => {
    expect(evaluateBansuriSetup(phrase, 69, 65, 'original')).toEqual({
      matchingMismatch: false, midiOutOfRangeEventIndices: [],
      fluteRangeStatus: 'unverified', fluteOutOfRangeEventIndices: [],
    });
    expect(evaluateBansuriSetup(phrase, 69, 65, 'original', { minMidi: 69, maxMidi: 81 }).fluteRangeStatus).toBe('within');
    expect(evaluateBansuriSetup(phrase, 69, 65, 'transpose', { minMidi: 65, maxMidi: 76 })).toMatchObject({
      fluteRangeStatus: 'outside', fluteOutOfRangeEventIndices: [7],
    });
  });

  it('includes expressive excursions and targets in supplied range evaluation', () => {
    const events = [{ ...phrase[0], pitchCurve: [{ offsetMs: 0, cents: 0 }, { offsetMs: 350, cents: 150 }] }];
    expect(evaluateBansuriSetup(events, 69, 65, 'transpose', { minMidi: 65, maxMidi: 66 })).toMatchObject({
      fluteRangeStatus: 'outside', fluteOutOfRangeEventIndices: [0],
    });
    const curveOverflow = [{ ...phrase[0], midi: 127, pitchCurve: [{ offsetMs: 0, cents: 1 }] }];
    expect(() => projectBansuriSetup(curveOverflow, 69, 65, 'original')).toThrow(RangeError);
  });

  it('rejects invalid Sa, modes and supplied bounds', () => {
    for (const sa of [-1, 128, NaN, Infinity, 65.5]) {
      expect(() => projectBansuriSetup(phrase, sa, 65, 'original')).toThrow(RangeError);
      expect(() => projectBansuriSetup(phrase, 69, sa, 'matching')).toThrow(RangeError);
    }
    // Runtime guard for untyped callers.
    expect(() => projectBansuriSetup(phrase, 69, 65, 'unknown' as 'original')).toThrow(RangeError);
    expect(() => evaluateBansuriSetup(phrase, 69, 65, 'original', { minMidi: 81, maxMidi: 65 })).toThrow(RangeError);
  });
});
