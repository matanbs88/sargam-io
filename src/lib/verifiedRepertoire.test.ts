import { describe, expect, it } from "vitest";
import { Midi } from "@tonejs/midi";
import { readFileSync } from "node:fs";
import source from "../../content/catalog/verified/minuet-g.json";
import { minuetMelodyEvents, VERIFIED_REPERTOIRE } from "./verifiedRepertoire";

describe("source-verified Minuet", () => {
  it("matches every principal pitch and duration in the archived source MIDI", () => {
    const midi = new Midi(readFileSync("content/catalog/inbox/launch-100/minuet-g.mid"));
    const principal = midi.tracks[0].notes.filter((note) =>
      note.durationTicks >= 100 && !(note.ticks === 35712 && note.midi !== 67),
    );
    const written = source.sections.flat(2);
    expect(written).toHaveLength(126);
    expect(principal.map((note) => note.midi)).toEqual(written.map(([pitch]) => pitch));
    const durationBeats = principal.map((note) =>
      // Source grace borrows 44 ticks from the preceding G eighth note.
      note.ticks === 7872 ? 0.5 : note.durationTicks / midi.header.ppq,
    );
    expect(durationBeats).toEqual(written.map(([, duration]) => duration));
  });

  it("unfolds both repeats into 64 complete bars without artificial gaps", () => {
    const events = minuetMelodyEvents();
    expect(events).toHaveLength(252);
    expect(source.sections.every((section) => section.length === 16)).toBe(true);
    expect(events[0].startMs).toBe(0);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].startMs).toBe(events[i - 1].startMs + events[i - 1].durationMs);
    }
    const last = events.at(-1)!;
    expect(last.startMs + last.durationMs).toBe(Math.round(192 * 60_000 / 140));
    expect(VERIFIED_REPERTOIRE[0].noteEvents).toEqual(events);
    expect(source.liveVerification).toEqual({ library: false, playback: false, pdf: false });
  });
});
