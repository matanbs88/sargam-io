import {describe,it,expect} from 'vitest';
import {comparisonNotes,CONNECTION_STUDY} from './bansuriComparisonStudy';
import {expressBansuri} from './ventusPerformance';

describe('connected swara listening study',()=>{
  it('has five pitch connections, a repeated Pa and a real half-second rest',()=>{
    for(const mode of ['meend','gamak-study'] as const){
      const out=expressBansuri(CONNECTION_STUDY,mode);
      expect(out.filter(n=>n.transition)).toHaveLength(5);
      expect(out[3].transition).toBeUndefined();
      expect(out[5].transition).toBeUndefined();
      expect(out[5].startMs+out[5].durationMs).toBe(6000);
      expect(out[6].startMs).toBe(6500);
      expect(out[0].pitchCurve?.at(-1)?.cents).toBe(200);
      expect(out[4].pitchCurve?.at(-1)?.cents).toBe(-300);
      expect(out.map(n=>[n.midi,n.startMs,n.durationMs])).toEqual(CONNECTION_STUDY.map(n=>[n.midi,n.startMs,n.durationMs]));
    }
  });
  it('retains Ode and leaves the plain study unmodified',()=>{
    expect(comparisonNotes('ode')).toHaveLength(15);
    expect(expressBansuri(comparisonNotes('connections'),'plain')).toBe(CONNECTION_STUDY);
  });
});
