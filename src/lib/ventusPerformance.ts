import bank from './ventusPerformanceSamples.json';
import type { MidiNoteEvent } from './midiToSargam';
export type BansuriArticulation = 'natural' | 'tongued' | 'breath' | 'flutter';
export type BansuriExpression = 'plain' | 'meend' | 'gamak-study';
export function selectPerformanceSample(note: MidiNoteEvent, index: number, articulation: BansuriArticulation = 'natural') {
  const candidates = bank.filter(s => s.articulation === articulation);
  if (!candidates.length || !Number.isFinite(note.midi)) throw new Error('Invalid Ventus sample request');
  const nearest = candidates.reduce((a,b) => Math.abs(a.midi-note.midi) <= Math.abs(b.midi-note.midi) ? a : b).midi;
  const pitched = candidates.filter(s=>s.midi===nearest);
  const layer = (note.velocity ?? 64) >= 80 ? 2 : 1;
  const availableLayer = pitched.some(s=>s.velocityLayer===layer) ? layer : pitched[0].velocityLayer;
  const variations = pitched.filter(s=>s.velocityLayer===availableLayer).sort((a,b)=>a.roundRobin-b.roundRobin);
  return variations[Math.abs(Math.trunc(index)) % variations.length];
}
export function bansuriPeakGain(velocity = 64, volume = 85, concurrency = 1) {
  const safeVolume = Number.isFinite(volume) ? Math.max(0,Math.min(100,volume)) / 100 : .85;
  return safeVolume * (.7 + .3 * Math.max(0,Math.min(127,velocity))/127) / Math.max(1,concurrency);
}
/** Independent master control, smoothed by the audio engine. */
export function bansuriVolumeGain(volume = 85) {
  return Number.isFinite(volume) ? Math.max(0, Math.min(100, volume)) / 100 : .85;
}
export function scorePolyphony(events: readonly MidiNoteEvent[]) {
  const edges=events.filter(n=>n.durationMs>0).flatMap(n=>[[n.startMs,1],[n.startMs+n.durationMs,-1]]);
  edges.sort((a,b)=>a[0]-b[0] || a[1]-b[1]);
  let active=0,max=1; for(const [,delta] of edges){active+=delta;max=Math.max(max,active);} return max;
}
/** Opt-in study gestures, NOT a raga-aware interpretation or Kontakt legato.
 * Explicit imported pitch curves always take precedence. */
export function expressBansuri(events: readonly MidiNoteEvent[], mode: BansuriExpression): readonly MidiNoteEvent[] {
  if(mode==='plain') return events;
  // A phrase-level automatic glide cannot infer voice-leading in chords.
  // Preserve authored curves but do not invent connections between voices.
  if(scorePolyphony(events)>1) return events;
  return events.map((note,i)=>{
    if(note.pitchCurve?.length || note.durationMs<180) return note;
    const next=events[i+1];
    // Only connect consecutive notes, never bridge rests, chords or authored ornaments.
    if(!next || next.pitchCurve?.length || Math.abs(note.startMs+note.durationMs-next.startMs)>.5 || next.midi===note.midi || Math.abs(next.midi-note.midi)>7) return note;
    const duration=Math.min(mode==='meend'?260:210,note.durationMs*.35);
    const onsetMs=note.durationMs-duration;
    const cents=(next.midi-note.midi)*100;
    // Keep the body of the source note steady. Resolve at the NEXT note's onset.
    // Gamak study uses two directed finger-like articulations in the connection,
    // not a vibrato applied indiscriminately to the whole sustained note.
    const contour=mode==='meend'
      ? Array.from({length:17},(_,j)=>{const t=j/16;return [t,t*t*(3-2*t)];})
      : [[0,0],[.18,.62],[.32,.16],[.53,.86],[.66,.48],[.85,1],[1,1]];
    const pitchCurve=[{offsetMs:0,cents:0},...contour.map(([t,p])=>({offsetMs:onsetMs+t*duration,cents:cents*p}))];
    return {...note,transition:{kind:mode,onsetMs,targetMidi:next.midi},pitchCurve};
  });
}
