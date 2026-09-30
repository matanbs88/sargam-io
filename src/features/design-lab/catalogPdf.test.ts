import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile } from 'node:fs/promises';
import { POST } from '@/app/api/exports/sargam-pdf/route';
import { VERIFIED_REPERTOIRE } from '@/src/lib/verifiedRepertoire';
import { createNotationMeasureLayout, timelineToMeasures } from '@/src/server/export/sargamPdf';

/** Same payload used by practice downloads; no separate simplified PDF tune. */
describe('complete catalog PDF acceptance', () => {
  for (const song of VERIFIED_REPERTOIRE) {
    it(`preserves the complete played melody for ${song.id}`, async () => {
      const events = song.noteEvents!;
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const payload = {
        events, rootMidi: song.rootMidi,
        rootLabel: `${roots[song.rootMidi % 12]}${Math.floor(song.rootMidi / 12) - 1}`,
        notation: 'Sargam_EN', title: song.title, sourceCredit: song.rightsNote,
        tempoBpm: song.tempoBpm, timeSignature: song.timeSignature, compact: true,
      } as const;
      const measures = timelineToMeasures(payload);
      const onsets = measures.flatMap(measure => createNotationMeasureLayout(measure).cells
        .flatMap(cell => cell.voices.filter(voice => !voice.isContinuation).map(voice => voice.midi)));
      expect(onsets).toEqual(events.map(note => note.midi));
      const last = events.at(-1)!;
      const [n, d] = song.timeSignature.split('/').map(Number);
      expect(measures).toHaveLength(Math.round((last.startMs + last.durationMs) / (60000 / song.tempoBpm * n * 4 / d)));

      const response = await POST(new Request('http://localhost/api/exports/sargam-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      }));
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/pdf');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      expect(pdf.getTitle()).toBe(song.title);
      expect(pdf.getPageCount()).toBeGreaterThan(0);
      if (song.id === 'verified-gymnopedie-1-complete') expect(pdf.getPageCount()).toBe(1);
      for (const page of pdf.getPages()) expect(page.getWidth()).toBeCloseTo(595.28, 1);
      // Explicit opt-in artifact generation, never a test-only live completion claim.
      if (process.env.SARGAM_CATALOG_PDF_QA_ID === song.id) {
        await mkdir('output/pdf/catalog-qa', { recursive: true });
        await writeFile(`output/pdf/catalog-qa/${song.id}.pdf`, bytes);
      }
    });
  }
});
