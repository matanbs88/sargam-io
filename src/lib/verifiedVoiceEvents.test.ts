import { describe, expect, it } from 'vitest';
import gymnopedie from '../../content/catalog/verified/gymnopedie-1.json';
import reviewed from '../../content/catalog/research/gymnopedie-1-reviewed.json';
import performed from '../../content/catalog/research/gymnopedie-1-performed-events.json';
import { verifiedVoiceEvents, type WrittenVoiceScore } from './verifiedVoiceEvents';

describe('complete explicit Gymnopédie voice', () => {
  it('matches all 47 written bars of the independently reviewed source ledger', () => {
    const bars = gymnopedie.sections.flat();
    expect(bars).toHaveLength(47);
    expect(bars).toEqual(reviewed.bars.map(bar => bar.events.map(event => ({
      midi: event.midi, beats: event.durationQuarter,
      ...('tieOut' in event && event.tieOut ? { tieOut: true } : {}),
    }))));
  });
  it('matches all 128 independently unfolded scalar events, including every ending chord', () => {
    const events = verifiedVoiceEvents(gymnopedie);
    expect(events.map(({ midi, startMs, durationMs }) => ({ midi, startMs, durationMs }))).toEqual(performed.noteEvents);
    expect(events).toHaveLength(128);
    expect(events[0].startMs).toBe(13000);
    expect(events.filter(e => e.startMs === 231000).map(e => e.midi)).toEqual([74, 69, 65, 62]);
    expect(Math.max(...events.map(e => e.startMs + e.durationMs))).toBe(234000);
    expect(events.find(e => e.startMs === 24000)).toMatchObject({ midi: 66, durationMs: 12000 });
    expect(events.some(e => e.startMs === 130000)).toBe(true);
  });
  it('rejects unresolved, mismatched and rest-connected ties', () => {
    const score: WrittenVoiceScore = { tempoBpm: 60, beatsPerBar: 3, form: [0], sections: [[
      [{ midi: 60, beats: 3, tieOut: true }], [{ midi: 60, beats: 3 }],
    ]] };
    expect(verifiedVoiceEvents(score)).toEqual([{ midi: 60, startMs: 0, durationMs: 6000, velocity: 88 }]);
    expect(() => verifiedVoiceEvents({ ...score, sections: [[score.sections[0][0]]] })).toThrow('unresolved tie');
    for (const midi of [62, null, [60, 64]]) {
      expect(() => verifiedVoiceEvents({ ...score, sections: [[score.sections[0][0], [{ midi, beats: 3 }]]] })).toThrow('same pitches');
    }
    expect(() => verifiedVoiceEvents({ ...score, sections: [[[ { midi: [], beats: 3 } ]]] })).toThrow('Invalid written');
  });
});
