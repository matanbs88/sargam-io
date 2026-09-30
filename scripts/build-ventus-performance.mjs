/** Close-mic performance bank; original files remain read-only. */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { decodeVentusNcw } from './decode-ventus-ncw.mjs';
import { encodeMono16 } from './prepare-ventus-candidate.mjs';
const root=process.argv[2]; if(!root) throw new Error('Library root required');
const out=resolve('public/audio/bansuri/performance'); await mkdir(out,{recursive:true});
const manifest=[];
for(const [folder,articulation] of [['SustainNormal','natural'],['SustainTongued','tongued'],['Vibrato','breath'],['Flutter','flutter']]) {
  const dir=join(root,'Samples',folder);
  for(const file of (await readdir(dir)).sort()) {
    const match=file.match(/_Close_([A-G])(#?)(\d)_V(\d+)_RR(\d+)\.ncw$/);
    if(!match) continue;
    const midi=(Number(match[3])+1)*12+({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[match[1]]+(match[2]?1:0);
    const original=await readFile(join(dir,file)), wav=decodeVentusNcw(original);
    const samples=wav.mono.slice(0,Math.min(wav.mono.length,7*wav.rate));
    const head=2*wav.rate, fade=Math.round(.15*wav.rate), end=samples.length-fade;
    if(end<=head+fade) throw new Error(`Short sustain: ${file}`);
    for(let i=0;i<fade;i++){const t=i/(fade-1);samples[end-fade+i]=samples[end-fade+i]*(1-t)+samples[head+i]*t;}
    const bytes=encodeMono16(samples,wav.rate), sha256=createHash('sha256').update(bytes).digest('hex');
    const name=`${articulation}-${midi}-v${match[4]}-rr${match[5]}-${sha256.slice(0,8)}.wav`;
    await writeFile(join(out,name),bytes);
    manifest.push({articulation,midi,velocityLayer:Number(match[4]),roundRobin:Number(match[5]),url:`/audio/bansuri/performance/${name}`,loopStart:(head+fade)/wav.rate,loopEnd:end/wav.rate,source:`${folder}/${file}`,sha256,sourceSha256:createHash('sha256').update(original).digest('hex')});
  }
  console.log(folder,manifest.filter(s=>s.articulation===articulation).length);
}
await writeFile('src/lib/ventusPerformanceSamples.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Total',manifest.length);
