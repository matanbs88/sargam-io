import { expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createSargamPdf } from './sargamPdf';

it.each(['E♭4', 'C♯4', 'F♮4'])('exports the real UI root label %s without WinAnsi failure', async rootLabel => {
  const bytes = await createSargamPdf({ rootLabel, rootMidi: 63, notation: 'Sargam_EN', title: 'Accidental export', compact: true,
    events: [{ midi: 63, startMs: 0, durationMs: 3000 }], timeSignature: '3/4', tempoBpm: 60 });
  expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
});
