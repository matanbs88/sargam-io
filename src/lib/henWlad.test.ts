import { expect, it } from 'vitest';
import score from '../../content/catalog/verified/hen-wlad-fy-nhadau.json';
import ledger from '../../content/catalog/research/world-digital-batch-3-2026-10-01.json';
import { verifiedMelodyEvents } from './verifiedRepertoire';

it('preserves the complete 28-bar Welsh anthem and its explicit initial skip', () => {
  const source = ledger.pieces.find(piece => piece.id === 'hen-wlad-fy-nhadau')!;
  expect(score.sections[0]).toEqual(source.bars.map(bar => bar.events.map(event => event.slice(0, 2))));
  const events = verifiedMelodyEvents(score);
  expect(events).toHaveLength(75);
  expect(events[0]).toMatchObject({ midi: 63, startMs: 2000, durationMs: 1000 });
  expect(events.at(-1)).toMatchObject({ midi: 63, startMs: 81000, durationMs: 3000 });
});
