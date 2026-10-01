import { describe, expect, it, vi } from "vitest";
import { PDFDocument, PDFPage } from "pdf-lib";
import { mockMidiData } from "@/src/lib/mockMidiData";
import { createNotationMeasureLayout, createSargamPdf } from "./sargamPdf";

describe("createSargamPdf", () => {
  it("draws actual concert ABC pitches through the shared formatter", async () => {
    const draw = vi.spyOn(PDFPage.prototype, "drawText");
    try {
      await createSargamPdf({
        events: [
          { midi: 62, startMs: 0, durationMs: 500 },
          { midi: 74, startMs: 500, durationMs: 500 },
        ],
        rootMidi: 62, rootLabel: "D4", notation: "ABC",
        tempoBpm: 120, timeSignature: "4/4", title: "Concert pitch fixture",
      });
      const texts = draw.mock.calls.map(([text]) => text);
      expect(texts).toContain("D4");
      expect(texts).toContain("D5");
      expect(texts).not.toContain("C4");
      expect(texts).not.toContain("C5");
    } finally {
      draw.mockRestore();
    }
  });
  it("preserves every chord voice and a new attack over a sustained voice", () => {
    const layout = createNotationMeasureLayout({ duration: 3, number: 1, events: [
      { midi: 72, start: 0, duration: 3, tie: 'none' },
      { midi: 69, start: 0, duration: 3, tie: 'none' },
      { midi: 64, start: 0, duration: 3, tie: 'none' },
      { midi: 60, start: 0, duration: 3, tie: 'none' },
      { midi: 67, start: 1, duration: 1, tie: 'none' },
    ] });
    expect(layout.cells[0].voices).toEqual([72, 69, 64, 60].map(midi => ({ midi, isContinuation: false })));
    expect(layout.cells[1].voices).toEqual([
      ...[72, 69, 64, 60].map(midi => ({ midi, isContinuation: true })),
      { midi: 67, isContinuation: false },
    ]);
    expect(layout.cells[1].isContinuation).toBe(false);
    expect(layout.cells[2].voices.map(voice => voice.midi)).toEqual([72, 69, 64, 60]);
    expect(layout.cells[2].isContinuation).toBe(true);
  });
  it("creates a readable one-page Sargam practice sheet", async () => {
    const bytes = await createSargamPdf({
      events: mockMidiData.noteEvents,
      rootLabel: "D4 is Sa",
      rootMidi: mockMidiData.detectedKey.rootMidi,
      taalLabel: "Teentaal",
      tempoBpm: mockMidiData.tempoBpm,
      timeSignature: mockMidiData.timeSignature,
      title: mockMidiData.title,
    });
    const document = await PDFDocument.load(bytes);

    expect(document.getPageCount()).toBe(1);
    expect(document.getTitle()).toBe(mockMidiData.title);
  });

  it("continues a long phrase onto additional pages", async () => {
    const repeatedPhrase = Array.from({ length: 10 }, (_, phraseIndex) =>
      mockMidiData.noteEvents.map((event, eventIndex) => ({
        ...event,
        startMs: event.startMs + (phraseIndex * mockMidiData.noteEvents.length + eventIndex) * 1_000,
      })),
    ).flat();
    const bytes = await createSargamPdf({
      events: repeatedPhrase,
      rootLabel: "C4 is Sa",
      rootMidi: 60,
      taalLabel: "Teentaal",
      tempoBpm: 120,
      timeSignature: "4/4",
      title: "Long practice phrase",
    });
    const document = await PDFDocument.load(bytes);

    expect(document.getPageCount()).toBeGreaterThan(1);
  });

  it("preserves a 3/4 imported-score grid and embeds the Devanagari notation path", async () => {
    const layout = createNotationMeasureLayout({
      duration: 6,
      events: [
        { duration: 2, midi: 65, start: 0, tie: "none" },
        { duration: 2, midi: 67, start: 2, tie: "none" },
        { duration: 2, midi: 69, start: 4, tie: "none" },
      ],
      number: 1,
    });
    expect(layout.slots).toBe(3);
    expect(layout.cells.map((cell) => cell.midi)).toEqual([65, 67, 69]);

    const bytes = await createSargamPdf({
      notation: "Sargam_HI",
      rootLabel: "F4 is Sa",
      rootMidi: 65,
      score: {
        divisionsPerQuarter: 2,
        measures: [
          {
            divisionsPerQuarter: 2,
            events: [
              { durationDivisions: 2, midi: 65, startDivisions: 0, tie: "none" },
              { durationDivisions: 2, midi: 67, startDivisions: 2, tie: "none" },
              { durationDivisions: 2, midi: 69, startDivisions: 4, tie: "none" },
            ],
            number: 1,
            timeSignature: "3/4",
          },
        ],
        timeSignature: "3/4",
        title: "Three beat source",
      },
      title: "Three beat source",
    });
    const document = await PDFDocument.load(bytes);

    expect(document.getPageCount()).toBe(1);
    expect(document.getTitle()).toBe("Three beat source");
  });

  it("fits 49 short 3/4 measures into one compact Roman Sargam page", async () => {
    const measures = Array.from({ length: 49 }, (_, index) => ({
      divisionsPerQuarter: 2,
      events: [
        { durationDivisions: 2, midi: 65, startDivisions: 0, tie: "none" as const },
        { durationDivisions: 2, midi: 67, startDivisions: 2, tie: "none" as const },
        { durationDivisions: 2, midi: 69, startDivisions: 4, tie: "none" as const },
      ],
      number: index + 1,
      timeSignature: "3/4",
    }));
    const bytes = await createSargamPdf({
      compact: true,
      rootLabel: "F4 is Sa",
      rootMidi: 65,
      score: { divisionsPerQuarter: 2, measures, timeSignature: "3/4", title: "Compact Roman score" },
      title: "Compact Roman score",
    });
    const document = await PDFDocument.load(bytes);

    expect(document.getPageCount()).toBe(1);
  });
});
