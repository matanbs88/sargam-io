import { describe, expect, it } from 'vitest';
import { PILOT, PILOT_EVENTS } from './pilotData';
describe('design lab canonical fixture', () => {
  it('loads the playable four-bar Ode from the public-domain catalog', () => {
    expect(PILOT.id).toBe('pd-ode-to-joy-theme');
    expect(PILOT_EVENTS).toHaveLength(15);
    expect(PILOT_EVENTS[0].midi).toBe(64);
    const last = PILOT_EVENTS.at(-1)!;
    expect(last.startMs + last.durationMs).toBeCloseTo(16 * 60000 / PILOT.tempoBpm, 0);
  });
});
