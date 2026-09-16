import { describe, expect, it } from 'vitest';
import { EngineStore, type AudioBackend } from '@/src/engine/EngineStore';
import { PILOT_EVENTS } from './pilotData';

describe('canonical pilot transport (simulated audio clock, not device latency)', () => {
  it.each([0.5, 0.75, 1, 1.25])('schedules all 15 authored notes exactly once at %sx', async rate => {
    let now = 0;
    const scheduled: { midi: number; when: number; duration: number; offset: number }[] = [];
    const backend: AudioBackend = {
      now: () => now,
      prepare: async () => {},
      cancel: () => {},
      schedule: (note, when, duration, offset) => scheduled.push({ midi: note.midi, when, duration, offset }),
    };
    const engine = new EngineStore(backend);
    engine.setScore(PILOT_EVENTS);
    engine.setRate(rate);
    await engine.play();
    const anchor = scheduled[0].when;
    const last = PILOT_EVENTS.at(-1)!;
    const endMs = last.startMs + last.durationMs;
    // Model the scheduler's regular 25ms polling, independently of render rate.
    for (now = 0.025; now < anchor + endMs / (1000 * rate) + 0.1; now += 0.025) engine.tick();
    expect(scheduled).toHaveLength(PILOT_EVENTS.length);
    scheduled.forEach((event, index) => {
      const authored = PILOT_EVENTS[index];
      expect(event.midi).toBe(authored.midi);
      expect(event.when).toBeCloseTo(anchor + authored.startMs / (1000 * rate), 8);
      expect(event.duration).toBeCloseTo(authored.durationMs / (1000 * rate), 8);
      expect(event.offset).toBeCloseTo(0, 8);
    });
    expect(engine.getSnapshot().playing).toBe(false);
    expect(engine.readTimeMs()).toBe(endMs);
  });
});
