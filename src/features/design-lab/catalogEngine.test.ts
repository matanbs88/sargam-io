import { describe, expect, it } from 'vitest';
import { EngineStore, type AudioBackend } from '@/src/engine/EngineStore';
import { VERIFIED_REPERTOIRE } from '@/src/lib/verifiedRepertoire';
import { isMonophonic, resolveMelody } from '@/src/lib/practiceParts';

/** Batch transport contract, not a substitute for sample/device listening QA. */
describe('complete repertoire audio-clock scheduling', () => {
  it.each([0.5, 1, 2])('Au Clair bansuri/harmonium schedule only 45 nonoverlapping melody attacks at %sx', async rate => {
    const piece = VERIFIED_REPERTOIRE.find(p => p.id === 'verified-au-clair-de-la-lune-complete')!;
    const events = resolveMelody(piece.noteEvents!, piece).events;
    let now = 0;
    const heard: { midi: number; startMs: number; durationMs: number }[] = [];
    const engine = new EngineStore({ now: () => now, prepare: async () => {}, cancel: () => {},
      schedule: (note, when, duration) => heard.push({ midi: note.midi, startMs: when * 1000, durationMs: duration * 1000 }),
    });
    engine.setScore(events); engine.setRate(rate); await engine.play();
    for (now = 0.025; now < 32 / rate + 0.2; now += 0.025) engine.tick();
    expect(heard).toHaveLength(45);
    // Scheduling uses floating seconds; compare intervals with sub-nanosecond tolerance.
    for (let i = 1; i < heard.length; i++) expect(heard[i].startMs + 1e-8).toBeGreaterThanOrEqual(heard[i-1].startMs + heard[i-1].durationMs);
    expect(isMonophonic(events)).toBe(true);
    expect(engine.getSnapshot().playing).toBe(false);
    engine.dispose();
  });
  for (const piece of VERIFIED_REPERTOIRE) {
    it.each([0.5, 1, 2])(`${piece.id}: all source events exactly once at %sx`, async rate => {
      let now = 0;
      const scheduled: { midi: number; when: number; duration: number; offset: number }[] = [];
      const events = piece.noteEvents!;
      const end = Math.max(...events.map(note => note.startMs + note.durationMs));
      const backend: AudioBackend = {
        now: () => now, prepare: async () => {}, cancel: () => {},
        schedule: (note, when, duration, offset) => scheduled.push({ midi: note.midi, when, duration, offset }),
      };
      const engine = new EngineStore(backend);
      engine.setScore(events); engine.setRate(rate);
      await engine.play();
      // Engine prepares a 60ms start lead. Includes silent introduction bars.
      const anchor = 0.06;
      for (now = 0.025; now <= anchor + end / (1000 * rate) + 0.1; now += 0.025) engine.tick();
      expect(scheduled).toHaveLength(events.length);
      scheduled.forEach((note, index) => {
        expect(note.midi).toBe(events[index].midi);
        expect(note.when).toBeCloseTo(anchor + events[index].startMs / (1000 * rate), 7);
        expect(note.duration).toBeCloseTo(events[index].durationMs / (1000 * rate), 7);
        expect(note.offset).toBeCloseTo(0, 7);
      });
      expect(engine.getSnapshot().playing).toBe(false);
      expect(engine.readTimeMs()).toBe(end);
      expect(engine.getSnapshot().error).toBeNull();
      engine.dispose();
    });
  }
});
