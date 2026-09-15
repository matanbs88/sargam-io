import { describe, expect, it } from "vitest";
import { EngineStore, type AudioBackend } from "./EngineStore";

function rig() {
  let time = 0;
  const scheduled: { when: number; duration: number; offset: number; midi: number }[] = [];
  let cancelled = 0;
  const backend: AudioBackend = {
    now: () => time, prepare: async () => {},
    schedule: (note, when, duration, offset) => scheduled.push({ when, duration, offset, midi: note.midi }),
    cancel: () => { cancelled++; },
  };
  const engine = new EngineStore(backend);
  return { engine, backend, scheduled, at: (t: number) => { time = t; }, cancellations: () => cancelled };
}
const notes = [
  { midi: 60, startMs: 0, durationMs: 400, velocity: 64 },
  { midi: 62, startMs: 500, durationMs: 100, velocity: 64 },
];
describe("audio-authoritative transport", () => {
  it("schedules ahead once at the audio anchor", async () => {
    const r = rig(); r.engine.setScore(notes); await r.engine.play();
    expect(r.scheduled).toHaveLength(1);
    expect(r.scheduled[0]).toEqual({ midi: 60, when: 0.06, duration: 0.4, offset: 0 });
    for (let t = 0.025; t < 0.6; t += 0.025) { r.at(t); r.engine.tick(); }
    expect(r.scheduled).toHaveLength(2);
    expect(r.scheduled[1].when).toBeCloseTo(0.56);
  });
  it("preserves pause offset and schedules only the remaining sustain", async () => {
    const r = rig(); r.engine.setScore(notes); await r.engine.play();
    r.at(0.26); r.engine.pause(); expect(r.engine.readTimeMs()).toBeCloseTo(200);
    r.at(10); await r.engine.play();
    expect(r.scheduled.at(-1)?.duration).toBeCloseTo(0.2);
    expect(r.scheduled.at(-1)?.offset).toBeCloseTo(0.2);
  });
  it("loops a single note indefinitely without React index transitions", async () => {
    const r = rig(); r.engine.setScore([notes[0]]); r.engine.setLoop({ startMs: 0, endMs: 400 }); await r.engine.play();
    for (let t = 0.025; t < 2; t += 0.025) { r.at(t); r.engine.tick(); }
    expect(r.scheduled.length).toBeGreaterThanOrEqual(5);
    expect(r.scheduled[1].when).toBeCloseTo(0.46);
    expect(r.engine.getSnapshot().playing).toBe(true);
  });
  it("does not skip a last-note seek when starting playback", async () => {
    const r = rig(); r.engine.setScore(notes); r.engine.seek(500); await r.engine.play();
    expect(r.scheduled[0].midi).toBe(62);
  });
  it("stops at authored end and cancels voices", async () => {
    const r = rig(); r.engine.setScore(notes); await r.engine.play();
    const before = r.cancellations(); r.at(0.7); r.engine.tick();
    expect(r.engine.getSnapshot().playing).toBe(false);
    expect(r.engine.readTimeMs()).toBe(600);
    expect(r.cancellations()).toBeGreaterThan(before);
  });
  it("cancel during preparation prevents delayed playback", async () => {
    const r = rig(); let ready!: () => void;
    r.backend.prepare = () => new Promise<void>((resolve) => { ready = resolve; });
    r.engine.setScore(notes); const pending = r.engine.play(); r.engine.pause(); ready(); await pending;
    expect(r.scheduled).toHaveLength(0);
    expect(r.engine.getSnapshot().playing).toBe(false);
  });
  it("reports preparation failure without moving time", async () => {
    const r = rig(); r.backend.prepare = async () => { throw new Error("offline"); };
    r.engine.setScore(notes); await r.engine.play();
    expect(r.engine.getSnapshot()).toMatchObject({ error: "offline", playing: false, loading: false });
  });
  it("rejects invalid rates and loops", () => {
    const r = rig(); r.engine.setScore(notes);
    expect(() => r.engine.setRate(NaN)).toThrow();
    expect(() => r.engine.setLoop({ startMs: 0, endMs: 0 })).toThrow();
  });
  it("recovers a sustained note after a scheduling stall without replaying expired notes", async () => {
    const r = rig(); r.engine.setScore([{ ...notes[0], durationMs: 2000 }]); await r.engine.play();
    r.at(1.06); r.engine.tick();
    expect(r.scheduled.at(-1)?.offset).toBeCloseTo(1);
    expect(r.scheduled.at(-1)?.duration).toBeCloseTo(1);
    expect(r.engine.readTimeMs()).toBeCloseTo(1000);
  });
  it("schedules simultaneous voices without dropping chord members", async () => {
    const r = rig(); r.engine.setScore([notes[0], { ...notes[0], midi: 64 }]); await r.engine.play();
    expect(r.scheduled.map(n => n.midi)).toEqual([60, 64]);
    expect(r.scheduled[0].when).toBe(r.scheduled[1].when);
  });
  it("scales duration and onset together at half speed", async () => {
    const r = rig(); r.engine.setScore(notes); r.engine.setRate(0.5); await r.engine.play();
    expect(r.scheduled[0].duration).toBeCloseTo(0.8);
    r.at(0.26); expect(r.engine.readTimeMs()).toBeCloseTo(100);
  });
});
