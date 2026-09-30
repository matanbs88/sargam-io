import { describe, expect, it } from "vitest";
import { Midi } from "@tonejs/midi";
import { readFileSync } from "node:fs";
import source from "../../content/catalog/verified/minuet-g.json";
import silentNight from "../../content/catalog/verified/silent-night.json";
import wenceslas from "../../content/catalog/verified/good-king-wenceslas.json";
import raghupati from "../../content/catalog/verified/raghupati-raghav.json";
import raghupatiLedger from "../../content/catalog/research/raghupati-hymnary-reviewed.json";
import { minuetMelodyEvents, verifiedMelodyEvents, VERIFIED_REPERTOIRE, type VerifiedMelody } from "./verifiedRepertoire";

describe("verified repertoire meter validation", () => {
  it("preserves two-beat bhajan measures rather than padding to common time", () => {
    const events = verifiedMelodyEvents({ title: "Two-beat bhajan fixture", tempoBpm: 100,
      timeSignature: "2/4", form: [0], sections: [[[[60, 0.5], [59, 0.5], [60, 1]], [[62, 2]]]] });
    expect(events).toHaveLength(4);
    expect(events.at(-1)).toEqual({ midi: 62, startMs: 1200, durationMs: 1200, velocity: 88 });
  });
  it("preserves leading rests, silent bars and repeated rests without phantom notes", () => {
    const score: VerifiedMelody = { title: "Written rests", tempoBpm: 120,
      timeSignature: "4/4", form: [0, 0], sections: [[
        [[null, 1], [60, 1], [null, 1], [62, 1]],
        [[null, 4]],
        [[64, 4]],
      ]] };
    expect(verifiedMelodyEvents(score)).toEqual([
      { midi: 60, startMs: 500, durationMs: 500, velocity: 88 },
      { midi: 62, startMs: 1500, durationMs: 500, velocity: 88 },
      { midi: 64, startMs: 4000, durationMs: 2000, velocity: 88 },
      { midi: 60, startMs: 6500, durationMs: 500, velocity: 88 },
      { midi: 62, startMs: 7500, durationMs: 500, velocity: 88 },
      { midi: 64, startMs: 10000, durationMs: 2000, velocity: 88 },
    ]);
  });

  it("validates rest durations and repeat section references", () => {
    const score: VerifiedMelody = { title: "Bad rests", tempoBpm: 120,
      timeSignature: "4/4", form: [0], sections: [[[[null, 4]]]] };
    expect(verifiedMelodyEvents(score)).toEqual([]);
    expect(() => verifiedMelodyEvents({ ...score, sections: [[[[null, -1], [60, 5]]]] })).toThrow("valid notes");
    for (const section of [-1, 0.5, 1, NaN]) {
      expect(() => verifiedMelodyEvents({ ...score, form: [section] })).toThrow("source section");
    }
    expect(() => verifiedMelodyEvents({ ...score, sections: [[]] })).toThrow("source section");
    expect(() => verifiedMelodyEvents({ ...score, form: [] })).toThrow("source section");
    for (const note of [[60], [60, 4, 1], [60, null], [null, NaN], [128, 4]]) {
      expect(() => verifiedMelodyEvents({ ...score, sections: [[[note]]] })).toThrow("valid notes");
    }
  });

  it("rounds cumulative triplet time rather than accumulating rounded durations", () => {
    const notes: [number, number][] = Array.from({ length: 12 }, (_, i) => [60 + i % 3, 1 / 3]);
    const events = verifiedMelodyEvents({ title: "Triplets", tempoBpm: 84,
      timeSignature: "4/4", form: [0, 0], sections: [[notes]] });
    expect(events).toHaveLength(24);
    expect(events.at(-1)!.startMs + events.at(-1)!.durationMs).toBe(Math.round(8 * 60000 / 84));
    expect(events.every((e, i) => i === 0 || e.startMs === events[i - 1].startMs + events[i - 1].durationMs)).toBe(true);
  });

  it("uses the declared meter rather than assuming every source is a waltz", () => {
    const events = verifiedMelodyEvents({ title: "Four-beat fixture", tempoBpm: 120,
      timeSignature: "4/4", form: [0], sections: [[[[60, 1], [62, 1], [64, 2]]]] });
    expect(events).toEqual([
      { midi: 60, startMs: 0, durationMs: 500, velocity: 88 },
      { midi: 62, startMs: 500, durationMs: 500, velocity: 88 },
      { midi: 64, startMs: 1000, durationMs: 1000, velocity: 88 },
    ]);
  });

  it("rejects incomplete measures, zero durations and invalid tempo", () => {
    const score = { title: "Invalid fixture", tempoBpm: 120, timeSignature: "4/4",
      form: [0], sections: [[[[60, 3]]]] };
    expect(() => verifiedMelodyEvents(score)).toThrow("4 quarter beats");
    expect(() => verifiedMelodyEvents({ ...score, sections: [[[[60, 4], [62, 0]]]] })).toThrow("valid notes");
    expect(() => verifiedMelodyEvents({ ...score, tempoBpm: 0 })).toThrow("positive tempo");
  });
});

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
    expect(source.liveVerification).toEqual({ library: true, playback: true, pdf: true });
    expect(source.status).toBe("live-complete");
  });
});

describe("source-verified Silent Night", () => {
  it("matches every explicit source-voice note, not a highest-note heuristic", () => {
    const midi = new Midi(readFileSync("content/catalog/inbox/launch-100/silent-night.mid"));
    const events = verifiedMelodyEvents(silentNight);
    expect(silentNight.sections[0]).toHaveLength(23);
    expect(events.at(-1)).toMatchObject({ midi: 67, startMs: 66000, durationMs: 3000 });
    for (const event of events) {
      const tick = event.startMs / 1000 * midi.header.ppq;
      const note = midi.tracks[0].notes.find((n) => n.ticks === tick && n.midi === event.midi);
      expect(note, `Missing source pitch at ${tick}`).toBeDefined();
      expect(note!.durationTicks / midi.header.ppq * 1000).toBe(event.durationMs);
    }
    expect(events.every((e, i) => i === 0 || e.startMs === events[i - 1].startMs + events[i - 1].durationMs)).toBe(true);
    expect(events[0]).toMatchObject({ midi: 74, startMs: 0, durationMs: 1500 });
  });
});

describe("complete Good King Wenceslas source intake", () => {
  it("matches every explicit soprano onset, pitch and duration in source MIDI", () => {
    const midi = new Midi(readFileSync("content/catalog/inbox/launch-100/good-king-wenceslas.mid"));
    const events = verifiedMelodyEvents(wenceslas);
    expect(wenceslas.sections[0]).toHaveLength(17);
    expect(events.at(-1)).toMatchObject({ midi: 69, startMs: 32000, durationMs: 2000 });
    for (const event of events) {
      const ticks = event.startMs / 500 * midi.header.ppq;
      const note = midi.tracks[0].notes.find(n => n.ticks === ticks && n.midi === event.midi);
      expect(note, `Missing soprano note at ${ticks}`).toBeDefined();
      expect(note!.durationTicks / midi.header.ppq * 500).toBe(event.durationMs);
    }
    expect(events.every((e, i) => i === 0 || e.startMs === events[i - 1].startMs + events[i - 1].durationMs)).toBe(true);
  });
});

describe("complete Raghupati RAM source intake", () => {
  it("matches every selected-stanza pitch and exact duration in the independent scan ledger", () => {
    const written = raghupati.sections.flat();
    expect(written).toHaveLength(20);
    for (const [index, bar] of written.entries()) {
      const ledger = raghupatiLedger.bars[index].selectedStanzaNotes;
      expect(bar.map(([pitch]) => pitch)).toEqual(ledger.map(n => n.midi));
      bar.forEach(([, beats], i) => expect(beats).toBeCloseTo(ledger[i].durationTicks / 12, 12));
    }
  });

  it("unfolds the printed repeat without gaps and preserves the final source cadence", () => {
    const events = verifiedMelodyEvents(raghupati);
    expect(events).toHaveLength(80);
    expect(events.at(-1)).toMatchObject({ midi: 65, startMs: 32400, durationMs: 1200 });
    expect(events.every((e, i) => i === 0 || e.startMs === events[i - 1].startMs + events[i - 1].durationMs)).toBe(true);
    expect(events.filter(e => e.durationMs === 200)).toHaveLength(6);
    expect(VERIFIED_REPERTOIRE.find(s => s.id === raghupati.id)).toMatchObject({
      timeSignature: "2/4", rootMidi: 60, tempoBpm: 100,
    });
    expect(raghupati.status).not.toBe("live-complete");
    expect(raghupati.liveVerification).toEqual({ library: false, playback: false, pdf: false });
  });
});
