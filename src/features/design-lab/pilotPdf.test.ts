import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile } from 'node:fs/promises';
import { POST } from '@/app/api/exports/sargam-pdf/route';
import { formatRelativeMidiEvents } from '@/src/lib/midiToSargam';
import { PILOT, PILOT_EVENTS } from './pilotData';
import { timelineToMeasures, createNotationMeasureLayout } from '@/src/server/export/sargamPdf';

describe('design lab pilot export journey', () => {
  it('preserves 15 distinct onsets across exactly four bars despite millisecond rounding', () => {
    const measures = timelineToMeasures({ events: PILOT_EVENTS, rootMidi: 60, rootLabel: 'C4', title: PILOT.title, tempoBpm: PILOT.tempoBpm, timeSignature: PILOT.timeSignature });
    expect(measures).toHaveLength(4);
    const onsets = measures.flatMap(measure => createNotationMeasureLayout(measure).cells.filter(cell => !cell.isRest && !cell.isContinuation).map(cell => cell.midi));
    expect(onsets).toEqual(PILOT_EVENTS.map(note => note.midi));
    expect(measures[3].events.map(event => event.duration)).toEqual([144,48,192]);
  });
  it('carries a held note across a barline without inventing another onset', () => {
    const measures = timelineToMeasures({ events: [{midi:60,startMs:1500,durationMs:1500}], rootMidi:60,rootLabel:'C4',title:'Tie',tempoBpm:120,timeSignature:'4/4' });
    expect(measures).toHaveLength(2);
    expect(measures[1].events[0]).toMatchObject({start:0,duration:192,tie:'continue'});
  });
  for (const notation of ['Sargam_EN', 'Sargam_HI', 'ABC'] as const) {
    it(`exports the actual pilot through the PDF handler in ${notation}`, async () => {
      const response = await POST(new Request('http://localhost/api/exports/sargam-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: PILOT_EVENTS, rootMidi: 60, rootLabel: 'C4', notation, title: PILOT.title, tempoBpm: PILOT.tempoBpm, timeSignature: PILOT.timeSignature, compact: true }),
      }));
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/pdf');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      expect(pdf.getPageCount()).toBe(1);
      expect(pdf.getTitle()).toBe(PILOT.title);
      expect(pdf.getPage(0).getWidth()).toBeGreaterThan(590);
      if (process.env.SARGAM_PDF_QA_OUTPUT === '1') {
        await mkdir('output/pdf/pilot-qa', { recursive: true });
        await writeFile(`output/pdf/pilot-qa/ode-${notation}.pdf`, bytes);
      }
    });
  }
  it('keeps the expected C-root Latin phrase and unchanged source events', () => {
    expect(formatRelativeMidiEvents(PILOT_EVENTS, 60, 'Sargam_EN')).toEqual(['G','G','m','P','P','m','G','R','S','S','R','G','G','R','R']);
    expect(PILOT_EVENTS.map(n => n.midi)).toEqual([64,64,65,67,67,65,64,62,60,60,62,64,64,62,62]);
  });
});
