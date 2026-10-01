import { describe, expect, it } from 'vitest';
import source from '../../content/catalog/verified/au-clair-de-la-lune.json';
import witness from '../../content/catalog/research/au-clair-de-la-lune-1111-verified-source.json';
import { verifiedVoiceEvents } from './verifiedVoiceEvents';

describe('Au Clair de la Lune complete harmonized upper voice', () => {
  it('retains all source intervals, 17 dyads, rests and final octave', () => {
    const events = verifiedVoiceEvents(source);
    expect(source.sections[0]).toHaveLength(16);
    expect(events).toHaveLength(62);
    expect(events.map(({midi,startMs,durationMs})=>({midi,startMs,durationMs})))
      .toEqual(witness.noteEvents);
    expect(source.sections[0].flat().filter(segment=>Array.isArray(segment.midi)))
      .toHaveLength(17);
    expect(events.filter(note=>note.startMs>=7000 && note.startMs<8000)).toEqual([]);
    expect(events.filter(note=>note.startMs>=15000 && note.startMs<16000)).toEqual([]);
    expect(events.filter(note=>note.startMs>=23000 && note.startMs<24000)).toEqual([]);
    expect(events.slice(-2)).toEqual([
      {midi:72,startMs:30000,durationMs:2000,velocity:88},
      {midi:60,startMs:30000,durationMs:2000,velocity:88},
    ]);
  });
});
