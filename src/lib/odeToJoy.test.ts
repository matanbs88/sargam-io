import { describe, expect, it } from 'vitest';
import source from '../../content/catalog/verified/ode-to-joy.json';
import { verifiedMelodyEvents } from './verifiedRepertoire';

describe('complete Ode to Joy hymn soprano', () => {
  it('retains all four phrases, bridge eighths and source low-D register', () => {
    const events = verifiedMelodyEvents(source);
    expect(source.sections[0]).toHaveLength(16);
    expect(events).toHaveLength(62);
    expect(events.filter(note => note.startMs >= 26400 && note.startMs < 28800))
      .toEqual([
        {midi:67,startMs:26400,durationMs:600,velocity:88},
        {midi:69,startMs:27000,durationMs:600,velocity:88},
        {midi:62,startMs:27600,durationMs:1200,velocity:88},
      ]);
    expect(events.at(-1)!.startMs + events.at(-1)!.durationMs).toBe(38400);
    expect(events.filter(note => note.durationMs === 300)).toHaveLength(7);
  });
});
