/** Mono PCM16 export; no limiter/normalizer hidden in the encoder. */
export function encodeMonoWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 192000) throw new RangeError('Invalid sample rate');
  const data = new ArrayBuffer(44 + samples.length * 2), view = new DataView(data);
  const text = (offset: number, value: string) => { for (let i=0;i<value.length;i++) view.setUint8(offset+i,value.charCodeAt(i)); };
  text(0,'RIFF');view.setUint32(4,36+samples.length*2,true);text(8,'WAVE');text(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  text(36,'data');view.setUint32(40,samples.length*2,true);
  samples.forEach((value,i)=>{
    if(!Number.isFinite(value)||Math.abs(value)>1)throw new RangeError('Non-finite or clipping PCM');
    view.setInt16(44+i*2,Math.round(value*(value<0?32768:32767)),true);
  });
  return data;
}
export function measurePcm(samples:Float32Array){
  if(!samples.length)throw new RangeError('Empty PCM');
  let peak=0,sum=0;for(const x of samples){if(!Number.isFinite(x))throw new RangeError('Non-finite PCM');peak=Math.max(peak,Math.abs(x));sum+=x*x;}
  return {peak,rms:Math.sqrt(sum/samples.length)};
}
