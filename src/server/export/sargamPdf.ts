import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  formatRelativeMidiEvents,
  type MidiNoteEvent,
} from "@/src/lib/midiToSargam";

export type SargamPdfExportInput = {
  readonly events: readonly MidiNoteEvent[];
  readonly rootLabel: string;
  readonly rootMidi: number;
  readonly taalLabel: string;
  readonly tempoBpm: number;
  readonly timeSignature: string;
  readonly title: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 52;
const NOTES_PER_BAR = 4;
const BARS_PER_LINE = 3;
const FIRST_PAGE_NOTES_Y = PAGE_HEIGHT - 376;
const CONTINUATION_PAGE_NOTES_Y = PAGE_HEIGHT - 126;
const NOTE_ROW_HEIGHT = 62;
const FOOTER_Y = 85;

function cleanText(value: string, fallback: string, maximumLength: number): string {
  const cleaned = value.replaceAll(/[\r\n\t]+/g, " ").trim();
  return cleaned.length === 0 ? fallback : cleaned.slice(0, maximumLength);
}

function assertExportInput(input: SargamPdfExportInput): void {
  if (!Number.isInteger(input.rootMidi) || input.rootMidi < 0 || input.rootMidi > 127) {
    throw new RangeError("rootMidi must be an integer between 0 and 127.");
  }

  if (!Number.isFinite(input.tempoBpm) || input.tempoBpm < 20 || input.tempoBpm > 320) {
    throw new RangeError("tempoBpm must be between 20 and 320.");
  }

  if (input.events.length === 0 || input.events.length > 1_024) {
    throw new RangeError("A Sargam PDF requires between 1 and 1024 note events.");
  }
}

function formatSargamLines(events: readonly MidiNoteEvent[], rootMidi: number): string[] {
  const notes = formatRelativeMidiEvents(events, rootMidi, "Sargam_EN");
  const bars = Array.from(
    { length: Math.ceil(notes.length / NOTES_PER_BAR) },
    (_, index) =>
      notes
        .slice(index * NOTES_PER_BAR, (index + 1) * NOTES_PER_BAR)
        .join("  "),
  );

  return Array.from(
    { length: Math.ceil(bars.length / BARS_PER_LINE) },
    (_, index) =>
      bars
        .slice(index * BARS_PER_LINE, (index + 1) * BARS_PER_LINE)
        .join("    |    "),
  );
}

type PdfFonts = {
  readonly regular: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  readonly bold: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  readonly serif: Awaited<ReturnType<PDFDocument["embedFont"]>>;
};

const colors = {
  darkTeal: rgb(0.075, 0.376, 0.322),
  charcoal: rgb(0.059, 0.09, 0.165),
  mint: rgb(0.157, 0.694, 0.51),
  paper: rgb(0.98, 0.976, 0.95),
  mutedText: rgb(0.3, 0.35, 0.39),
  rule: rgb(0.74, 0.77, 0.72),
};

function drawPaper(page: ReturnType<PDFDocument["addPage"]>): void {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: colors.paper,
  });
}

function drawFooter(page: ReturnType<PDFDocument["addPage"]>, fonts: PdfFonts, pageNumber: number): void {
  page.drawLine({
    start: { x: PAGE_MARGIN, y: FOOTER_Y },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: FOOTER_Y },
    thickness: 0.7,
    color: rgb(0.76, 0.78, 0.73),
  });
  page.drawText(
    "Educational relative-pitch reference - not a Raga classification, shruti analysis, or definitive instrument fingering.",
    {
      x: PAGE_MARGIN,
      y: 63,
      size: 7.5,
      font: fonts.regular,
      color: rgb(0.36, 0.4, 0.43),
    },
  );
  page.drawText(`Sargam.io  /  ${pageNumber}`, {
    x: PAGE_WIDTH - PAGE_MARGIN - 84,
    y: 44,
    size: 8,
    font: fonts.bold,
    color: colors.darkTeal,
  });
}

function drawContinuationHeader(page: ReturnType<PDFDocument["addPage"]>, fonts: PdfFonts, title: string): void {
  page.drawText("sargam.io", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 48,
    size: 13,
    font: fonts.bold,
    color: colors.darkTeal,
  });
  page.drawText(title, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 79,
    size: 18,
    font: fonts.serif,
    color: colors.charcoal,
  });
  page.drawText("SARGAM / CONTINUED", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 106,
    size: 9,
    font: fonts.bold,
    color: colors.mint,
  });
}

function drawSargamRow(
  page: ReturnType<PDFDocument["addPage"]>,
  fonts: PdfFonts,
  line: string,
  y: number,
): void {
  page.drawRectangle({
    x: PAGE_MARGIN,
    y: y - 13,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    height: 42,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.82, 0.84, 0.8),
    borderWidth: 0.6,
  });
  page.drawText(line, {
    x: PAGE_MARGIN + 14,
    y,
    size: 19,
    font: fonts.serif,
    color: colors.charcoal,
  });
}

/**
 * Produces a compact, printable Latin-Sargam practice sheet. Devanagari PDF
 * export is intentionally deferred until a licensed, embeddable Unicode font
 * is part of the server bundle.
 */
export async function createSargamPdf(
  input: SargamPdfExportInput,
): Promise<Uint8Array> {
  assertExportInput(input);

  const document = await PDFDocument.create();
  document.setTitle(cleanText(input.title, "Sargam Practice Sheet", 120));
  document.setAuthor("Sargam.io");
  document.setSubject("Relative Sargam practice notation");
  document.setKeywords(["Sargam", "Indian music", "practice notation"]);

  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRoman);
  const fonts: PdfFonts = { regular, bold, serif };
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  drawPaper(page);
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 118,
    width: PAGE_WIDTH,
    height: 118,
    color: colors.darkTeal,
  });
  page.drawText("sargam.io", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 47,
    size: 13,
    font: bold,
    color: rgb(1, 0.94, 0.6),
  });
  page.drawText("RELATIVE SARGAM PRACTICE SHEET", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 82,
    size: 20,
    font: bold,
    color: rgb(1, 1, 1),
  });

  const title = cleanText(input.title, "Untitled practice phrase", 80);
  page.drawText(title, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 164,
    size: 23,
    font: serif,
    color: colors.charcoal,
  });
  page.drawText("A learner-facing relative pitch reference. Review before performance.", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 188,
    size: 9.5,
    font: regular,
    color: rgb(0.28, 0.33, 0.38),
  });

  const metadata = [
    `SA  ${cleanText(input.rootLabel, "Selected Sa", 32)}`,
    `TAAL  ${cleanText(input.taalLabel, "Practice cycle", 32)}`,
    `TEMPO  ${Math.round(input.tempoBpm)} BPM`,
    `METER  ${cleanText(input.timeSignature, "4/4", 12)}`,
  ];
  const metadataY = PAGE_HEIGHT - 238;
  metadata.forEach((entry, index) => {
    const x = PAGE_MARGIN + index * 122;
    page.drawRectangle({
      x,
      y: metadataY - 10,
      width: 112,
      height: 30,
      color: index === 0 ? rgb(0.89, 0.97, 0.94) : rgb(0.94, 0.94, 0.91),
    });
    page.drawText(entry, {
      x: x + 8,
      y: metadataY,
      size: 7.3,
      font: bold,
      color: index === 0 ? colors.darkTeal : colors.charcoal,
    });
  });

  page.drawLine({
    start: { x: PAGE_MARGIN, y: PAGE_HEIGHT - 274 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_HEIGHT - 274 },
    thickness: 0.8,
    color: rgb(0.74, 0.77, 0.72),
  });
  page.drawText("SARGAM", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 306,
    size: 10,
    font: bold,
    color: colors.mint,
  });
  page.drawText("Bars separate four-note practice groups. Apostrophes indicate taar saptak; periods indicate mandra saptak.", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 323,
    size: 8.5,
    font: regular,
    color: colors.mutedText,
  });

  let currentPage = page;
  let pageNumber = 1;
  let y = FIRST_PAGE_NOTES_Y;

  for (const line of formatSargamLines(input.events, input.rootMidi)) {
    if (y - 13 < FOOTER_Y + 30) {
      drawFooter(currentPage, fonts, pageNumber);
      currentPage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNumber += 1;
      drawPaper(currentPage);
      drawContinuationHeader(currentPage, fonts, title);
      y = CONTINUATION_PAGE_NOTES_Y;
    }

    drawSargamRow(currentPage, fonts, line, y);
    y -= NOTE_ROW_HEIGHT;
  }

  drawFooter(currentPage, fonts, pageNumber);

  return document.save();
}
