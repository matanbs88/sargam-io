import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import bank from './ventusPerformanceSamples.json';
import { bansuriPeakGain, expressBansuri, scorePolyphony, selectPerformanceSample } from './ventusPerformance';
import { pitchCurveSampleSeconds } from './expressivePitch';
import { PUBLIC_DOMAIN_CATALOG } from './publicDomainCatalog';
const note={midi:69,startMs:0,durationMs:1000,velocity:84};
describe('Ventus performance bank',()=>{
  it('changes the actual Ode to Joy practice events in both modes',()=>{
    const events=PUBLIC_DOMAIN_CATALOG.find(s=>s.id==='pd-ode-to-joy-theme')!.noteEvents!;
    const meend=expressBansuri(events,'meend'), gamak=expressBansuri(events,'gamak-study');
    expect(meend.filter(n=>n.transition).length).toBeGreaterThan(5);
    expect(gamak.filter(n=>n.transition).length).toBe(meend.filter(n=>n.transition).length);
    expect(gamak).not.toEqual(meend);
  });
  it('keeps sample position correct when seeking into a meend',()=>{
    expect(pitchCurveSampleSeconds([{offsetMs:0,cents:0}],1000,1)).toBeCloseTo(1);
    expect(pitchCurveSampleSeconds([{offsetMs:0,cents:1200}],1000,.5)).toBeCloseTo(4);
    const slide=[{offsetMs:0,cents:0},{offsetMs:1000,cents:1200}];
    expect(pitchCurveSampleSeconds(slide,1000,1)).toBeCloseTo(1/Math.LN2);
  });
  it('selects actual dynamic layers and deterministic round robins',()=>{
    expect(selectPerformanceSample({...note,velocity:50},0).velocityLayer).toBe(1);
    expect(selectPerformanceSample(note,0).velocityLayer).toBe(2);
    expect(selectPerformanceSample(note,0).url).not.toBe(selectPerformanceSample(note,1).url);
    expect(selectPerformanceSample(note,0)).toEqual(selectPerformanceSample(note,3));
    for(const mode of ['natural','tongued','breath','flutter'] as const) expect(selectPerformanceSample(note,0,mode).articulation).toBe(mode);
  });
  it('raises the old quiet level without unsafe polyphonic sums',()=>{
    expect(bansuriPeakGain(84)).toBeGreaterThan(.7);
    expect(bansuriPeakGain(127,100,4)*4).toBeLessThanOrEqual(1);
    expect(bansuriPeakGain(84,0)).toBe(0);
    expect(scorePolyphony([note,{...note,startMs:1000}])).toBe(1);
    expect(scorePolyphony([note,{...note,startMs:500}])).toBe(2);
  });
  it('keeps plain scores unchanged and never overwrites explicit pitch curves',()=>{
    const notes=[note,{...note,midi:71,startMs:1000}];
    expect(expressBansuri(notes,'plain')).toBe(notes);
    const slide=expressBansuri(notes,'meend')[0];
    expect(slide.pitchCurve?.[0].cents).toBe(0);
    expect(slide.pitchCurve?.at(-1)?.cents).toBe(200);
    expect(slide.transition?.onsetMs).toBe(740);
    expect(expressBansuri([note,{...note,startMs:1500,midi:71}],'meend')[1].pitchCurve).toBeUndefined();
    expect(expressBansuri([slide],'gamak-study')[0]).toBe(slide);
    expect(expressBansuri([note],'gamak-study')[0]).toBe(note);
    const gamak=expressBansuri(notes,'gamak-study')[0];
    expect(gamak.transition?.onsetMs).toBe(790);
    expect(gamak.pitchCurve?.at(-1)?.cents).toBe(200);
  });
  it('never infers meend voice-leading in a polyphonic score',()=>{
    const chord=[note,{...note,midi:72},{...note,midi:74,startMs:1000}];
    expect(expressBansuri(chord,'meend')).toBe(chord);
    expect(expressBansuri(chord,'gamak-study')).toBe(chord);
  });
  it('keeps duration and onset unchanged, resolves descending connections and leaves rests alone',()=>{
    const sequence=[note,{...note,midi:67,startMs:1000},{...note,midi:65,startMs:2300}];
    for(const mode of ['meend','gamak-study'] as const){
      const out=expressBansuri(sequence,mode);
      expect(out.map(n=>[n.startMs,n.durationMs,n.midi])).toEqual(sequence.map(n=>[n.startMs,n.durationMs,n.midi]));
      expect(out[0].pitchCurve?.at(-1)?.cents).toBe(-200);
      expect(out[1].pitchCurve).toBeUndefined();
      expect(out[2].pitchCurve).toBeUndefined();
    }
  });
  it('ships intact non-clipping PCM assets with valid loop points',()=>{
    expect(bank.length).toBeGreaterThanOrEqual(300);
    for(const sample of bank){
      const bytes=readFileSync(new URL(`../../public${sample.url}`,import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(sample.sha256);
      const rate=bytes.readUInt32LE(24), duration=(bytes.length-44)/2/rate;
      expect(sample.loopEnd).toBeLessThan(duration);
      expect(sample.loopStart).toBeLessThan(sample.loopEnd);
      let peak=0;for(let i=44;i<bytes.length;i+=2)peak=Math.max(peak,Math.abs(bytes.readInt16LE(i)));
      expect(peak).toBeLessThan(32767);
    }
  },30000);
});
