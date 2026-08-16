import "server-only";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
  type RelativeMidiNote,
} from "@/src/lib/midiToSargam";
import type { ImportedScore } from "@/src/server/score-import/musicXml";

const nodeRequire = createRequire(import.meta.url);
const fontkit = nodeRequire("fontkit") as Parameters<PDFDocument["registerFontkit"]>[0];

export type BhatkhandeTaal = {
  /** Explicit matras per vibhag. Never inferred from a Western time signature. */
  readonly vibhagMatras: readonly number[];
  /** Zero-based vibhag index. Defaults to the first vibhag. */
  readonly samVibhagIndex?: number;
  /** Zero-based vibhag index, if the tala has a khali. */
  readonly khaliVibhagIndex?: number;
};

export type SargamPdfScore = Pick<
  ImportedScore,
  "divisionsPerQuarter" | "measures" | "timeSignature" | "title"
>;

export type SargamPdfExportInput = {
  /** Dense A4 layout for longer, print-first scores. */
  readonly compact?: boolean;
  readonly events?: readonly MidiNoteEvent[];
  readonly notation?: NotationSystem;
  readonly rootLabel: string;
  readonly rootMidi: number;
  /** A label is informational. It does not authorize fabricating a tala grid. */
  readonly taalLabel?: string;
  readonly taal?: BhatkhandeTaal;
  readonly tempoBpm?: number;
  readonly timeSignature?: string;
  readonly title: string;
  /** Parsed MusicXML/MXL data from the local score-import pilot. */
  readonly score?: SargamPdfScore;
};

type RenderEvent = {
  readonly duration: number;
  readonly midi: number | null;
  readonly start: number;
  readonly tie: "none" | "start" | "stop" | "continue";
};

type RenderMeasure = {
  readonly duration: number;
  readonly events: readonly RenderEvent[];
  readonly number: number;
};

export type NotationMeasureCell = {
  readonly isContinuation: boolean;
  readonly midi: number | null;
  readonly isRest: boolean;
};

export type NotationMeasureLayout = {
  readonly cells: readonly NotationMeasureCell[];
  readonly duration: number;
  readonly number: number;
  readonly slots: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const FOOTER_Y = 43;
const MEASURE_HEIGHT = 74;
const ROW_GAP = 22;
const COMPACT_MEASURE_HEIGHT = 50;
const COMPACT_ROW_GAP = 9;
const MAX_SLOTS_PER_MEASURE = 16;
const DEVANAGARI_FONT_URL = new URL("./fonts/NotoSansDevanagari-Regular.ttf", import.meta.url);

const colors = {
  charcoal: rgb(0.059, 0.09, 0.165),
  darkTeal: rgb(0.075, 0.376, 0.322),
  grid: rgb(0.73, 0.77, 0.74),
  mint: rgb(0.157, 0.694, 0.51),
  paper: rgb(0.98, 0.976, 0.95),
  softTeal: rgb(0.9, 0.96, 0.93),
  yellow: rgb(1, 0.94, 0.6),
};

type PdfFonts = {
  readonly bold: PDFFont;
  readonly devanagari: PDFFont;
  readonly regular: PDFFont;
  readonly serif: PDFFont;
};

type MeasureDrawing = {
  readonly continuationSize: number;
  readonly continuationY: number;
  readonly height: number;
  readonly hiNotationSize: number;
  readonly measureNumberSize: number;
  readonly notationSize: number;
  readonly notationY: number;
  readonly vibhagMarkerSize: number;
};

const STANDARD_MEASURE_DRAWING: MeasureDrawing = {
  continuationSize: 14,
  continuationY: 28,
  height: MEASURE_HEIGHT,
  hiNotationSize: 14,
  measureNumberSize: 7.2,
  notationSize: 16,
  notationY: 26,
  vibhagMarkerSize: 7.4,
};

const COMPACT_MEASURE_DRAWING: MeasureDrawing = {
  continuationSize: 10,
  continuationY: 18,
  height: COMPACT_MEASURE_HEIGHT,
  hiNotationSize: 9.5,
  measureNumberSize: 5.8,
  notationSize: 10.5,
  notationY: 16,
  vibhagMarkerSize: 5.8,
};

function cleanText(value: string, fallback: string, maximumLength: number): string {
  const cleaned = value.replaceAll(/[\r\n\t]+/g, " ").trim();
  return cleaned.length === 0 ? fallback : cleaned.slice(0, maximumLength);
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

function parseTimeSignature(value: string | null | undefined): { readonly beats: number; readonly beatType: number } | null {
  if (value === undefined || value === null) return null;
  const match = /^(\d{1,2})\/(\d{1,2})$/.exec(value.trim());
  if (match === null) return null;
  const beats = Number(match[1]);
  const beatType = Number(match[2]);
  if (!Number.isInteger(beats) || !Number.isInteger(beatType) || beats < 1 || beats > 32 || ![1, 2, 4, 8, 16].includes(beatType)) {
    return null;
  }
  return { beats, beatType };
}

function assertExportInput(input: SargamPdfExportInput): void {
  if (!Number.isInteger(input.rootMidi) || input.rootMidi < 0 || input.rootMidi > 127) {
    throw new RangeError("rootMidi must be an integer between 0 and 127.");
  }
  if (input.events === undefined && input.score === undefined) {
    throw new RangeError("A Sargam PDF needs either timeline events or an imported score.");
  }
  if (input.events !== undefined && input.score !== undefined) {
    throw new RangeError("Provide either timeline events or an imported score, not both.");
  }
  if (input.events !== undefined) {
    if (input.events.length === 0 || input.events.length > 1_024) {
      throw new RangeError("A Sargam PDF requires between 1 and 1024 note events.");
    }
    if (!Number.isFinite(input.tempoBpm) || input.tempoBpm === undefined || input.tempoBpm < 20 || input.tempoBpm > 320) {
      throw new RangeError("tempoBpm must be between 20 and 320 for timeline events.");
    }
    if (parseTimeSignature(input.timeSignature) === null) {
      throw new RangeError("timeline events need a valid timeSignature such as 3/4 or 4/4.");
    }
  }
  if (input.score !== undefined) {
    if (!Number.isInteger(input.score.divisionsPerQuarter) || input.score.divisionsPerQuarter < 1) {
      throw new RangeError("Imported score divisionsPerQuarter must be a positive integer.");
    }
    if (input.score.measures.length === 0 || input.score.measures.length > 512) {
      throw new RangeError("An imported score requires between 1 and 512 measures.");
    }
  }
  if (input.taal !== undefined) {
    if (input.taal.vibhagMatras.length < 2 || input.taal.vibhagMatras.length > 8 || input.taal.vibhagMatras.some((matra) => !Number.isInteger(matra) || matra < 1 || matra > 16)) {
      throw new RangeError("A Bhatkhande tala needs two to eight positive vibhag lengths.");
    }
  }
}

function timelineToMeasures(input: SargamPdfExportInput): RenderMeasure[] {
  const signature = parseTimeSignature(input.timeSignature);
  const events = input.events;
  if (signature === null || events === undefined || input.tempoBpm === undefined) {
    throw new Error("Timeline measure conversion requires valid event timing.");
  }
  const beatDuration = (60_000 / input.tempoBpm) * (4 / signature.beatType);
  const measureDuration = beatDuration * signature.beats;
  const totalDuration = Math.max(...events.map((event) => event.startMs + event.durationMs));
  const count = Math.max(1, Math.ceil(totalDuration / measureDuration));

  return Array.from({ length: count }, (_, index) => {
    const measureStart = index * measureDuration;
    const measureEvents = events
      .filter((event) => event.startMs >= measureStart && event.startMs < measureStart + measureDuration)
      .map((event) => ({
        duration: Math.min(event.durationMs, measureDuration - (event.startMs - measureStart)),
        midi: event.midi,
        start: event.startMs - measureStart,
        tie: "none" as const,
      }));
    return { duration: measureDuration, events: measureEvents, number: index + 1 };
  });
}

function importedScoreToMeasures(score: SargamPdfScore): RenderMeasure[] {
  const signature = parseTimeSignature(score.timeSignature);
  const nominalDuration = signature === null
    ? 0
    : score.divisionsPerQuarter * signature.beats * (4 / signature.beatType);

  return score.measures.map((measure) => ({
    duration: Math.max(
      nominalDuration,
      ...measure.events.map((event) => event.startDivisions + event.durationDivisions),
    ),
    events: measure.events.map((event) => ({
      duration: event.durationDivisions,
      midi: event.midi,
      start: event.startDivisions,
      tie: event.tie,
    })),
    number: measure.number,
  }));
}

function gridQuantum(measure: RenderMeasure): number {
  const values = measure.events.flatMap((event) => [event.duration, event.start]).filter((value) => value > 0);
  if (values.length === 0) return Math.max(1, measure.duration);
  const exact = values.reduce(greatestCommonDivisor);
  return Math.max(1, Math.ceil(measure.duration / MAX_SLOTS_PER_MEASURE), exact);
}

/**
 * Converts preserved measure timing into cells. A duration becomes a starting
 * swara followed by hyphens; rests remain blank. This is the data model used
 * by the print renderer and is deliberately independent of a guessed tala.
 */
export function createNotationMeasureLayout(measure: RenderMeasure): NotationMeasureLayout {
  const quantum = gridQuantum(measure);
  const slots = Math.max(1, Math.ceil(measure.duration / quantum));
  const cells: NotationMeasureCell[] = Array.from({ length: slots }, () => ({
    isContinuation: false,
    isRest: true,
    midi: null,
  }));

  for (const event of measure.events) {
    const start = Math.min(slots - 1, Math.floor(event.start / quantum));
    const width = Math.max(1, Math.ceil(event.duration / quantum));
    const continuationOnly = event.tie === "stop" || event.tie === "continue";
    for (let offset = 0; offset < width && start + offset < slots; offset += 1) {
      const index = start + offset;
      if (index === undefined || !cells[index]?.isRest) continue;
      cells[index] = {
        isContinuation: continuationOnly || offset > 0,
        isRest: event.midi === null,
        midi: event.midi,
      };
    }
  }

  return { cells, duration: measure.duration, number: measure.number, slots };
}

function drawPaper(page: PDFPage): void {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: colors.paper });
}

function drawFooter(page: PDFPage, fonts: PdfFonts, pageNumber: number): void {
  page.drawLine({ start: { x: PAGE_MARGIN, y: FOOTER_Y + 13 }, end: { x: PAGE_WIDTH - PAGE_MARGIN, y: FOOTER_Y + 13 }, thickness: 0.6, color: colors.grid });
  page.drawText("Relative Sargam transcription. Review all imported scores before publishing or performance.", {
    x: PAGE_MARGIN,
    y: FOOTER_Y,
    size: 7.4,
    font: fonts.regular,
    color: colors.charcoal,
  });
  page.drawText(`Sargam.io  /  ${pageNumber}`, {
    x: PAGE_WIDTH - PAGE_MARGIN - 68,
    y: FOOTER_Y,
    size: 7.8,
    font: fonts.bold,
    color: colors.darkTeal,
  });
}

function drawHeader(page: PDFPage, fonts: PdfFonts, input: SargamPdfExportInput, isContinuation: boolean): number {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 102, width: PAGE_WIDTH, height: 102, color: colors.darkTeal });
  page.drawText("sargam.io", { x: PAGE_MARGIN, y: PAGE_HEIGHT - 35, size: 14, font: fonts.bold, color: colors.yellow });
  page.drawText(isContinuation ? "SARGAM NOTATION / CONTINUED" : "SARGAM NOTATION", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 63,
    size: 18,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(isContinuation ? cleanText(input.title, "Untitled score", 80) : "Measure-aware practice print", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 83,
    size: 8.5,
    font: fonts.regular,
    color: rgb(0.85, 0.94, 0.9),
  });

  if (isContinuation) return PAGE_HEIGHT - 194;

  const title = cleanText(input.title, "Untitled Sargam score", 80);
  page.drawText(title, { x: PAGE_MARGIN, y: PAGE_HEIGHT - 139, size: 24, font: fonts.serif, color: colors.charcoal });
  const meter = input.score?.timeSignature ?? input.timeSignature ?? "Unmetered";
  const notationName = input.notation === "Sargam_HI" ? "Bhatkhande / Devanagari" : "Bhatkhande / Roman Sargam";
  const metadata = [
    `Sa  ${cleanText(input.rootLabel, "Selected Sa", 24)}`,
    `Meter  ${cleanText(meter, "Unmetered", 12)}`,
    `Notation  ${notationName}`,
  ];
  metadata.forEach((item, index) => {
    const x = PAGE_MARGIN + index * 166;
    page.drawRectangle({ x, y: PAGE_HEIGHT - 187, width: 154, height: 28, color: index === 0 ? colors.softTeal : rgb(0.94, 0.94, 0.91) });
    page.drawText(item, { x: x + 8, y: PAGE_HEIGHT - 176, size: 7.8, font: fonts.bold, color: index === 0 ? colors.darkTeal : colors.charcoal });
  });
  page.drawText(
    input.taal === undefined
      ? "Meter mode: no tala, raga, or vibhag has been inferred from the source."
      : "Bhatkhande vibhag markers are printed only where the supplied tala matches the measure grid.",
    { x: PAGE_MARGIN, y: PAGE_HEIGHT - 211, size: 8.2, font: fonts.regular, color: colors.charcoal },
  );
  // Leave a distinct reading gap after metadata and its no-inference notice.
  return PAGE_HEIGHT - 306;
}

/**
 * A deliberately restrained header used for long score imports. Seven 3/4
 * measures fit per row, allowing a common 49-measure song to print on one
 * readable A4 page without changing its musical grid.
 */
function drawCompactHeader(page: PDFPage, fonts: PdfFonts, input: SargamPdfExportInput, isContinuation: boolean): number {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 62, width: PAGE_WIDTH, height: 62, color: colors.darkTeal });
  page.drawText("sargam.io", { x: PAGE_MARGIN, y: PAGE_HEIGHT - 26, size: 12, font: fonts.bold, color: colors.yellow });
  page.drawText(isContinuation ? "COMPACT PRACTICE PRINT / CONTINUED" : "COMPACT PRACTICE PRINT", {
    x: PAGE_WIDTH - PAGE_MARGIN - 174,
    y: PAGE_HEIGHT - 25,
    size: 7.2,
    font: fonts.bold,
    color: rgb(0.85, 0.94, 0.9),
  });

  const title = cleanText(input.title, "Untitled Sargam score", 74);
  const meter = input.score?.timeSignature ?? input.timeSignature ?? "Unmetered";
  const notationName = input.notation === "Sargam_HI" ? "Devanagari" : input.notation === "ABC" ? "Pitch names" : "Roman Sargam";
  page.drawText(title, { x: PAGE_MARGIN, y: PAGE_HEIGHT - 91, size: 16.5, font: fonts.serif, color: colors.charcoal });
  page.drawText(
    `Sa  ${cleanText(input.rootLabel, "Selected Sa", 24)}   ·   Meter  ${cleanText(meter, "Unmetered", 12)}   ·   ${notationName}`,
    { x: PAGE_MARGIN, y: PAGE_HEIGHT - 109, size: 7.8, font: fonts.bold, color: colors.darkTeal },
  );
  page.drawText(
    input.taal === undefined
      ? "Source meter preserved. Tala has not been inferred."
      : "Supplied tala markers are shown only where they match the source grid.",
    { x: PAGE_MARGIN, y: PAGE_HEIGHT - 123, size: 7.2, font: fonts.regular, color: colors.charcoal },
  );
  // Keep a real reading gap below the metadata; the first measure's label
  // must never compete with the key, meter, or notation declaration.
  return PAGE_HEIGHT - 184;
}

function notationBase(note: RelativeMidiNote, notation: NotationSystem): string {
  return formatRelativeNote({ ...note, octaveMarker: "" }, notation);
}

function drawNotation(page: PDFPage, fonts: PdfFonts, midi: number, rootMidi: number, notation: NotationSystem, x: number, y: number, width: number, size: number): void {
  const note = midiToRelativeNote(midi, rootMidi);
  const useDevanagari = notation === "Sargam_HI";
  const font = useDevanagari ? fonts.devanagari : fonts.serif;
  const text = notationBase(note, notation);
  const textWidth = font.widthOfTextAtSize(text, size);
  const textX = x + Math.max(2, (width - textWidth) / 2);
  page.drawText(text, { x: textX, y, size, font, color: colors.charcoal });

  // Traditional semantic markers are drawn as marks, not appended ASCII.
  if (note.octaveShift !== 0) {
    const dotY = note.octaveShift > 0 ? y + size + 2 : y - 4;
    const dotCount = Math.abs(note.octaveShift);
    for (let index = 0; index < dotCount; index += 1) {
      page.drawCircle({ x: x + width / 2 + (index - (dotCount - 1) / 2) * 3.5, y: dotY, size: 1.15, color: colors.charcoal });
    }
  }
}

function vibhagBoundaries(layout: NotationMeasureLayout, taal: BhatkhandeTaal | undefined): number[] {
  if (taal === undefined) return [];
  const totalMatras = taal.vibhagMatras.reduce((total, matra) => total + matra, 0);
  if (totalMatras !== layout.slots) return [];
  return taal.vibhagMatras.slice(0, -1).reduce<number[]>((boundaries, matra) => {
    boundaries.push((boundaries.at(-1) ?? 0) + matra);
    return boundaries;
  }, []);
}

function drawMeasure(page: PDFPage, fonts: PdfFonts, layout: NotationMeasureLayout, input: SargamPdfExportInput, drawing: MeasureDrawing, x: number, y: number, width: number): void {
  const notation = input.notation ?? "Sargam_EN";
  const cellWidth = width / layout.slots;
  const boundaries = vibhagBoundaries(layout, input.taal);
  page.drawText(String(layout.number), { x, y: y + drawing.height + 5, size: drawing.measureNumberSize, font: fonts.bold, color: colors.darkTeal });
  page.drawRectangle({ x, y, width, height: drawing.height, color: rgb(1, 1, 1), borderColor: colors.grid, borderWidth: 0.65 });

  for (let index = 0; index <= layout.slots; index += 1) {
    const boundary = boundaries.includes(index);
    page.drawLine({
      start: { x: x + cellWidth * index, y },
      end: { x: x + cellWidth * index, y: y + drawing.height },
      thickness: index === 0 || index === layout.slots ? 0.65 : boundary ? 1.35 : 0.34,
      color: boundary ? colors.darkTeal : colors.grid,
    });
  }

  const firstVibhagMarker = input.taal?.samVibhagIndex ?? 0;
  if (input.taal !== undefined && input.taal.vibhagMatras.reduce((total, matra) => total + matra, 0) === layout.slots) {
    let matraStart = 0;
    input.taal.vibhagMatras.forEach((matras, index) => {
      const mark = index === firstVibhagMarker ? "x" : index === input.taal?.khaliVibhagIndex ? "0" : String(index + 1);
      page.drawText(mark, { x: x + matraStart * cellWidth + 3, y: y + drawing.height - 10, size: drawing.vibhagMarkerSize, font: fonts.bold, color: colors.darkTeal });
      matraStart += matras;
    });
  }

  layout.cells.forEach((cell, index) => {
    const cellX = x + index * cellWidth;
    if (cell.isRest) return;
    if (cell.isContinuation) {
      page.drawText("-", { x: cellX + cellWidth / 2 - 2, y: y + drawing.continuationY, size: drawing.continuationSize, font: fonts.serif, color: colors.charcoal });
      return;
    }
    if (cell.midi !== null) {
      drawNotation(
        page,
        fonts,
        cell.midi,
        input.rootMidi,
        notation,
        cellX,
        y + drawing.notationY,
        cellWidth,
        notation === "Sargam_HI" ? drawing.hiNotationSize : drawing.notationSize,
      );
    }
  });
}

async function createFonts(document: PDFDocument): Promise<PdfFonts> {
  document.registerFontkit(fontkit as Parameters<PDFDocument["registerFontkit"]>[0]);
  const [regular, bold, serif, devanagariBytes] = await Promise.all([
    document.embedFont(StandardFonts.Helvetica),
    document.embedFont(StandardFonts.HelveticaBold),
    document.embedFont(StandardFonts.TimesRoman),
    readFile(DEVANAGARI_FONT_URL),
  ]);
  // fontkit v2 provides reliable Indic shaping but not the streaming subset
  // interface expected by pdf-lib, so embed this small (141 KB) font whole.
  const devanagari = await document.embedFont(devanagariBytes, { subset: false });
  return { bold, devanagari, regular, serif };
}

/**
 * Creates an A4, measure-aware Sargam score. It preserves source measures and
 * durations, prints sustain hyphens, and never invents a tala from Western
 * meter. Explicit tala metadata is rendered only when it exactly matches the
 * supplied rhythmic grid.
 */
export async function createSargamPdf(input: SargamPdfExportInput): Promise<Uint8Array> {
  assertExportInput(input);
  const measures = input.score === undefined ? timelineToMeasures(input) : importedScoreToMeasures(input.score);
  const document = await PDFDocument.create();
  document.setTitle(cleanText(input.title, "Sargam Practice Sheet", 120));
  document.setAuthor("Sargam.io");
  document.setSubject("Measure-aware relative Sargam notation");
  document.setKeywords(["Sargam", "Bhatkhande", "Indian music", "practice notation"]);
  const fonts = await createFonts(document);

  const compact = input.compact === true;
  const drawing = compact ? COMPACT_MEASURE_DRAWING : STANDARD_MEASURE_DRAWING;
  const measuresPerRow = compact ? 7 : 3;
  const measureGap = compact ? 4 : 10;
  const rowGap = compact ? COMPACT_ROW_GAP : ROW_GAP;
  const measureWidth = (CONTENT_WIDTH - measureGap * (measuresPerRow - 1)) / measuresPerRow;

  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNumber = 1;
  drawPaper(page);
  let y = compact ? drawCompactHeader(page, fonts, input, false) : drawHeader(page, fonts, input, false);

  for (let index = 0; index < measures.length; index += measuresPerRow) {
    if (y - drawing.height < FOOTER_Y + 32) {
      drawFooter(page, fonts, pageNumber);
      page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNumber += 1;
      drawPaper(page);
      y = compact ? drawCompactHeader(page, fonts, input, true) : drawHeader(page, fonts, input, true);
    }
    measures.slice(index, index + measuresPerRow).forEach((measure, offset) => {
      drawMeasure(page, fonts, createNotationMeasureLayout(measure), input, drawing, PAGE_MARGIN + offset * (measureWidth + measureGap), y, measureWidth);
    });
    y -= drawing.height + rowGap;
  }
  drawFooter(page, fonts, pageNumber);
  return document.save();
}
