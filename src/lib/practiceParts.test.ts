import { describe, expect, it } from 'vitest';
import { estimateUpperMelody, instrumentPart, isMonophonic, resolveMelody } from './practiceParts';
import { VERIFIED_REPERTOIRE } from './verifiedRepertoire';
import { READY_PRACTICE_CATALOG } from './practiceCatalog';
import type { MidiNoteEvent } from './midiToSargam';

const note = (midi: number, startMs: number, durationMs: number): MidiNoteEvent => ({ midi, startMs, durationMs });
describe('instrument musical parts', () => {
  it('forces bansuri and harmonium to single-line practice regardless of piano choice', () => {
    expect(instrumentPart('Bansuri', 'arrangement')).toBe('melody');
    expect(instrumentPart('Harmonium', 'arrangement')).toBe('melody');
    expect(instrumentPart('Piano', 'arrangement')).toBe('arrangement');
    expect(instrumentPart('Piano', 'melody')).toBe('melody');
  });
  it('keeps touching notes and rests, but rejects real overlaps', () => {
    expect(isMonophonic([note(60, 0, 500), note(62, 500, 500), note(64, 1500, 500)])).toBe(true);
    expect(isMonophonic([note(60, 0, 501), note(62, 500, 500)])).toBe(false);
  });
  it('uses the reviewed melody rather than blindly taking the highest pitch', () => {
    const source = [note(60, 0, 1000), note(84, 0, 1000)];
    const melodyEvents = [source[0]];
    expect(resolveMelody(source, { melodyEvents }).events).toBe(melodyEvents);
    expect(resolveMelody(source, { melodyEvents }).estimated).toBe(false);
    expect(() => resolveMelody(source, { melodyEvents: source })).toThrow('overlapping');
  });
  it('retains a sustained upper note across intervening bass attacks', () => {
    const source = [note(72, 0, 2000), note(48, 0, 500), note(50, 500, 500), note(52, 1000, 500), note(74, 2500, 500)];
    const copy = structuredClone(source);
    expect(estimateUpperMelody(source)).toEqual([source[0], source[4]]);
    expect(source).toEqual(copy);
    expect(resolveMelody(source, {}).estimated).toBe(true);
  });
  it('resolves overlapping tails without phantom chords or collapsed rests', () => {
    const source = [note(72, 0, 1200), note(74, 1000, 1000), note(76, 2300, 500)];
    expect(estimateUpperMelody(source)).toEqual([note(72, 0, 1000), source[1], source[2]]);
    expect(isMonophonic(estimateUpperMelody(source))).toBe(true);
  });
  it('preserves repeated attacks and clips pitch gestures with offset interpolation', () => {
    expect(estimateUpperMelody([note(72, 0, 1100), note(72, 1000, 1000)])).toEqual([note(72, 0, 1000), note(72, 1000, 1000)]);
    const curved = { ...note(72, 0, 2000), pitchCurve: [{ offsetMs: 0, cents: 0 }, { offsetMs: 2000, cents: 200 }] };
    const result = estimateUpperMelody([curved, note(84, 500, 500)]);
    expect(result[0].pitchCurve).toEqual([{ offsetMs: 0, cents: 0 }, { offsetMs: 500, cents: 50 }]);
    expect(result[2].pitchCurve).toEqual([{ offsetMs: 0, cents: 100 }, { offsetMs: 1000, cents: 200 }]);
    expect(isMonophonic(result)).toBe(true);
  });
  it('fixes the screenshot piece: 45 melodic attacks, not 62 chord pitches', () => {
    const piece = VERIFIED_REPERTOIRE.find(p => p.id === 'verified-au-clair-de-la-lune-complete')!;
    expect(piece.noteEvents).toHaveLength(62);
    const melody = resolveMelody(piece.noteEvents!, piece);
    expect(melody.events).toHaveLength(45);
    expect(melody.estimated).toBe(false);
    expect(melody.events.slice(0, 6).map(n => n.midi)).toEqual([72, 72, 72, 74, 76, 74]);
    expect(melody.events.at(-1)).toMatchObject({ midi: 72, startMs: 30000, durationMs: 2000 });
    expect(isMonophonic(melody.events)).toBe(true);
    expect(isMonophonic(piece.noteEvents!)).toBe(false);
  });
  it('keeps Gymnopédie introduction, ties and both endings in single-line mode', () => {
    const piece = VERIFIED_REPERTOIRE.find(p => p.id === 'verified-gymnopedie-1-complete')!;
    const melody = resolveMelody(piece.noteEvents!, piece);
    expect(melody.events).toHaveLength(116);
    expect(melody.events[0].startMs).toBe(13000);
    expect(melody.events.find(n => n.startMs === 24000)?.durationMs).toBe(12000);
    expect(melody.events.at(-1)).toMatchObject({ midi: 74, startMs: 231000, durationMs: 3000 });
    expect(isMonophonic(melody.events)).toBe(true);
  });
  it('every playable library score resolves to at most one simultaneous melodic note', () => {
    for (const piece of READY_PRACTICE_CATALOG) {
      expect(isMonophonic(resolveMelody(piece.noteEvents!, piece).events), piece.id).toBe(true);
    }
  });
});
