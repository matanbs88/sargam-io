import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mockMidiData } from "@/src/lib/mockMidiData";
import { createSargamPdf } from "./sargamPdf";

describe("createSargamPdf", () => {
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
});
