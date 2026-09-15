import { describe, expect, it } from "vitest";
import { VisualTimeline, horizontalNoteStart, isNoteSounding, noteExtent } from "./visualTimeline";

const playing = { baseTimeMs: 0, isPlaying: true, playbackRate: 1, phraseEndTimeMs: 6800 };

describe("visual clock regression", () => {
  it("does not add ten minutes of page uptime on note changes", () => {
    const clock = new VisualTimeline(playing, 600_000);
    expect(clock.read(600_499)).toBe(499);
    clock.sync({ ...playing, baseTimeMs: 500 }, 600_500);
    expect(clock.read(600_516)).toBe(516);
    clock.sync({ ...playing, baseTimeMs: 1000 }, 601_000);
    expect(clock.read(601_016)).toBe(1016);
  });

  it("keeps subframes continuous rather than stepping at note boundaries", () => {
    const clock = new VisualTimeline(playing, 900_000);
    expect([16, 32, 48].map((t) => clock.read(900_000 + t))).toEqual([16, 32, 48]);
  });

  it("clamps at the phrase end after background suspension, without wrapping", () => {
    const clock = new VisualTimeline(playing, 1000);
    expect(clock.read(900_000)).toBe(6800);
    expect(clock.read(900_016)).toBe(6800);
  });

  it("reanchors a backwards seek or loop to the authored time", () => {
    const clock = new VisualTimeline({ ...playing, baseTimeMs: 5000 }, 1000);
    clock.sync({ ...playing, baseTimeMs: 500 }, 1500);
    expect(clock.read(1516)).toBe(516);
  });

  it("preserves position when only rate changes", () => {
    const clock = new VisualTimeline(playing, 1000);
    clock.sync({ ...playing, playbackRate: 2 }, 1250);
    expect(clock.read(1250)).toBe(250);
    expect(clock.read(1500)).toBe(750);
  });

  it("follows legacy pause/resume at the selected event", () => {
    const clock = new VisualTimeline(playing, 1000);
    clock.sync({ ...playing, isPlaying: false }, 1200);
    expect(clock.read(9000)).toBe(0);
    clock.sync(playing, 9000);
    expect(clock.read(9016)).toBe(16);
  });

  it("survives identical effect setup without jumping or double speed", () => {
    const clock = new VisualTimeline(playing, 1000);
    clock.sync(playing, 1100);
    clock.sync(playing, 1100);
    expect(clock.read(1200)).toBe(200);
  });
});

describe("authored note geometry", () => {
  it("does not inflate short notes or cap long ones", () => {
    expect(noteExtent(50, 100)).toBe(5);
    expect(noteExtent(8000, 25)).toBe(200);
  });
  it("joins consecutive notes and retains real rests", () => {
    const left = horizontalNoteStart(1000, 1100, 26, 25);
    const end = left + noteExtent(500, 25);
    expect(end).toBe(horizontalNoteStart(1500, 1100, 26, 25));
    expect(horizontalNoteStart(1580, 1100, 26, 25) - end).toBe(2);
    expect(left).toBeLessThan(26); // active note is not pinned to playhead
  });
  it("releases at note end, including rests and zero-duration events", () => {
    const note = { startMs: 500, durationMs: 420 };
    expect(isNoteSounding(note, 500)).toBe(true);
    expect(isNoteSounding(note, 919)).toBe(true);
    expect(isNoteSounding(note, 920)).toBe(false);
    expect(isNoteSounding(note, 999)).toBe(false);
    expect(isNoteSounding({ startMs: 0, durationMs: 0 }, 0)).toBe(false);
  });
});
