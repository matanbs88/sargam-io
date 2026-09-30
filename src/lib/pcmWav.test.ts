import {describe,it,expect} from 'vitest';
import {encodeMonoWav,measurePcm} from './pcmWav';
describe('comparison PCM exports',()=>{
  it('writes a standard mono PCM16 header and signed samples',()=>{
    const v=new DataView(encodeMonoWav(new Float32Array([-1,0,1]),44100));
    expect(v.byteLength).toBe(50);expect(v.getUint32(24,true)).toBe(44100);
    expect(v.getUint32(40,true)).toBe(6);expect(v.getInt16(44,true)).toBe(-32768);expect(v.getInt16(48,true)).toBe(32767);
  });
  it('measures RMS rather than peak and rejects invalid PCM',()=>{
    expect(measurePcm(new Float32Array([.5,-.5]))).toEqual({peak:.5,rms:.5});
    expect(()=>encodeMonoWav(new Float32Array([1.01]),44100)).toThrow();
    expect(()=>measurePcm(new Float32Array([NaN]))).toThrow();
    expect(()=>encodeMonoWav(new Float32Array([0]),0)).toThrow();
  });
});
