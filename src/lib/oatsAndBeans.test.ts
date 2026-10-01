import { describe, expect, it } from 'vitest';
import source from '../../content/catalog/verified/oats-and-beans.json';
import research from '../../content/catalog/research/world-digital-batch-2-2026-10-01.json';
import { verifiedMelodyEvents } from './verifiedRepertoire';

describe('complete Oats and Beans singer voice', () => {
  it('preserves all 38 official-source intervals and the final partner cadence', () => {
    const witness = research.pieces.find(piece => piece.mutopiaId === 888)!;
    const events = verifiedMelodyEvents(source);
    expect(source.sections[0]).toHaveLength(10);
    expect(events).toHaveLength(38);
    expect(events.map(event => [event.midi, event.startMs / 600, event.durationMs / 600]))
      .toEqual(witness.performedScalarEvents.map(event => event.slice(0, 3)));
    expect(events.at(-1)).toEqual({midi:60,startMs:17100,durationMs:900,velocity:88});
    expect(events.at(-1)!.startMs + events.at(-1)!.durationMs).toBe(18000);
    expect(source.timeSignature).toBe('6/8');
  });
});
