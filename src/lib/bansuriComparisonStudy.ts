import type {MidiNoteEvent} from './midiToSargam';
import {PUBLIC_DOMAIN_CATALOG} from './publicDomainCatalog';

export type BansuriStudyId = 'ode' | 'connections';

// Original diagnostic phrase, not a raga prescription. The repeated Pa and
// 500ms rest deliberately separate connections from re-attacks and silence.
export const CONNECTION_STUDY: MidiNoteEvent[] = [60,62,64,67,67,64,62,60].map((midi,index)=>({
  midi, startMs:index*1000+(index>=6?500:0), durationMs:1000, velocity:84,
}));

export function comparisonNotes(study:BansuriStudyId):readonly MidiNoteEvent[] {
  if(study==='connections')return CONNECTION_STUDY;
  const notes=PUBLIC_DOMAIN_CATALOG.find(s=>s.id==='pd-ode-to-joy-theme')?.noteEvents;
  if(!notes?.length)throw new Error('Comparison score missing');
  return notes;
}
