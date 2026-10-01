import { describe, expect, it } from 'vitest';
import score from '../../content/catalog/verified/joy-to-the-world.json';
import research from '../../content/catalog/research/world-digital-batch-3-2026-10-01.json';
import { verifiedMelodyEvents, VERIFIED_REPERTOIRE } from './verifiedRepertoire';

describe('Joy to the World complete Antioch soprano', () => {
  const witness = research.pieces.find(piece => piece.id === 'joy-to-the-world')!;
  it('preserves every independently decoded source bar and scalar interval', () => {
    expect(score.sections[0]).toHaveLength(19);
    expect(score.sections[0]).toEqual(witness.bars.map(bar => bar.events.map(event => event.slice(0, 2))));
    let quarter = 0;
    const expected = witness.bars.flatMap(bar => bar.events.map(([midi, duration]) => {
      const startMs = Math.round(quarter * 60000 / score.tempoBpm);
      quarter += Number(duration);
      return { midi, startMs, durationMs: Math.round(quarter * 60000 / score.tempoBpm) - startMs, velocity: 88 };
    }));
    const actual = verifiedMelodyEvents(score);
    expect(actual).toEqual(expected);
    expect(actual).toHaveLength(57);
    expect(quarter).toBe(38);
    expect(actual[0]).toMatchObject({ midi: 74, startMs: 0 });
    expect(actual.at(-1)).toMatchObject({ midi: 62, startMs: 22737, durationMs: 1263 });
    expect(witness.midiIndependentCheck.mismatchedExpectedPitchedEvents).toBe(0);
  });
  it('makes the complete score discoverable and exportable without changing source tonic', () => {
    expect(VERIFIED_REPERTOIRE.find(piece => piece.id === score.id)).toMatchObject({
      rootMidi: 62, tempoBpm: 95, timeSignature: '2/4', status: 'ready', exportAllowed: true,
    });
  });
});
