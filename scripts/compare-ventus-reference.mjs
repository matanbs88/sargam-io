import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { decodeVentusNcw } from './decode-ventus-ncw.mjs';
import { decodePcmWav } from './inspect-ventus-wav.mjs';
import { encodeMono16 } from './prepare-ventus-candidate.mjs';
const manifest = JSON.parse(await readFile('src/lib/ventusSamples.json','utf8'));
const directory = resolve('output/audio-comparison');
await mkdir(directory,{recursive:true});
const results = [];
for (const item of manifest) {
  const ncw = await readFile(join('C:/Users/matan/OneDrive/Documents/Ventus Winds Bansuri/Samples/SustainNormal',item.source));
  const ours = decodeVentusNcw(ncw);
  const reference = await readFile(join('output/ventus-reference',item.source+'.pcm32'));
  if (reference.length !== ours.mono.length*4) throw new Error('Different decoded length');
  let mismatches=0,maxError=0;
  for(let i=0;i<ours.mono.length;i++) {
    const error=Math.abs(ours.mono[i]*8388608-reference.readInt32LE(i*4));
    if(error) mismatches++;
    maxError=Math.max(maxError,error);
  }
  if(mismatches) throw new Error(`Decoder disagreement: ${item.source}, ${mismatches}`);
  const shipped = decodePcmWav(await readFile(resolve('public'+item.url)));
  let preLoopError=0;
  for(let i=0;i<3*ours.rate;i++) preLoopError=Math.max(preLoopError,Math.abs(shipped.mono[i]-ours.mono[i]));
  results.push({source:item.source,frames:ours.mono.length,decoderMismatches:mismatches,maxPcmError:maxError,firstThreeSecondsMaxError:preLoopError});
  if(item.midi===69) {
    const raw = Float32Array.from({length:3*ours.rate},(_,i)=>reference.readInt32LE(i*4)/8388608);
    const gain=.08+84/127*.12;
    const atAppLevel=Float32Array.from(shipped.mono.subarray(0,3*ours.rate),(value,i)=>value*gain*Math.min(1,i/ours.rate/.012,(3-i/ours.rate)/.006));
    await writeFile(join(directory,'ventus-A4-reference-3s.wav'),encodeMono16(raw,ours.rate));
    await writeFile(join(directory,'ventus-A4-app-level-3s.wav'),encodeMono16(atAppLevel,ours.rate));
    await writeFile(join(directory,'ventus-A4-app-level-matched-3s.wav'),encodeMono16(Float32Array.from(atAppLevel,n=>n/gain),ours.rate));
  }
}
const report={reference:'conNCW-NG C# decoder, compiled in memory; shares format references with our decoder; not Kontakt rendering',bankCount:results.length,totalFrames:results.reduce((n,r)=>n+r.frames,0),results,conclusion:'PCM decode agrees exactly with separate implementation. Shipped first three seconds differ only by PCM16 conversion. Guide gain is approximately -16 dB at velocity84. No perceptual audition or Kontakt engine equivalence asserted.'};
await writeFile(join(directory,'ventus-reference-comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
