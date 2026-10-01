import { describe, expect, it } from 'vitest';
import source from '../../content/catalog/verified/hark-herald.json';
import review from '../../content/catalog/research/world-digital-batch-2026-10-01.json';
import { verifiedMelodyEvents } from './verifiedRepertoire';

describe('complete Hark! source soprano', () => {
  it('retains all 76 source attacks, durations and the complete 20-bar form', () => {
    const ledger = review.pieces.find(piece => piece.mutopiaId === 1261)!;
    const events = verifiedMelodyEvents(source);
    const beatMs = 60000 / source.tempoBpm;
    expect(source.sections[0]).toHaveLength(20);
    expect(events).toHaveLength(76);
    expect(events.map(note => [note.midi, note.startMs, note.durationMs])).toEqual(
      ledger.events.map(([pitch, start, duration]) => [pitch,
        Math.round(start! * beatMs),
        Math.round((start! + duration!) * beatMs) - Math.round(start! * beatMs)]),
    );
    expect(events.at(-1)).toMatchObject({ midi: 65 });
    expect(events.at(-1)!.startMs + events.at(-1)!.durationMs).toBe(Math.round(80 * beatMs));
    expect(ledger.validation.exactPitchOnsetDurationMatches).toBe(76);
    expect(ledger.validation.unmatched).toEqual([]);
  });
});
