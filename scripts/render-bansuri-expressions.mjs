/** Offline diagnostic, NOT a browser/Kontakt capture. Production event curves,
 * sample selection and gain; linear PCM interpolation approximates resampling. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import ts from 'typescript';
import {decodePcmWav} from './inspect-ventus-wav.mjs';
import {encodeMono16} from './prepare-ventus-candidate.mjs';
async function moduleFrom(path,replace=s=>s){
  const source=replace(await readFile(path,'utf8'));
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const bank=JSON.parse(await readFile('src/lib/ventusPerformanceSamples.json','utf8'));
const {expressBansuri,selectPerformanceSample,bansuriPeakGain}=await moduleFrom('src/lib/ventusPerformance.ts',s=>s.replace("import bank from './ventusPerformanceSamples.json';",`const bank=${JSON.stringify(bank)};`));
const {pitchCentsAt}=await moduleFrom('src/lib/expressivePitch.ts');
const {PUBLIC_DOMAIN_CATALOG}=await moduleFrom('src/lib/publicDomainCatalog.ts');
const piece=PUBLIC_DOMAIN_CATALOG.find(p=>p.id==='pd-ode-to-joy-theme');
const rate=44100,cache=new Map(),renders=[];
for(const mode of ['plain','meend','gamak-study']){
  const events=expressBansuri(piece.noteEvents,mode);
  const frames=Math.ceil(Math.max(...events.map(n=>n.startMs+n.durationMs))/1000*rate);
  const mix=new Float32Array(frames);
  for(const [i,n] of events.entries()){
    const sample=selectPerformanceSample(n,i,'natural');
    if(!cache.has(sample.url))cache.set(sample.url,decodePcmWav(await readFile(resolve(`public${sample.url}`))));
    const wav=cache.get(sample.url),duration=n.durationMs/1000;
    const previous=events[i-1];
    const joined=previous?.transition?.targetMidi===n.midi && Math.abs(previous.startMs+previous.durationMs-n.startMs)<.5;
    const next=events[i+1];
    const fadeOut=n.transition&&next?Math.min(.018,next.durationMs/3000):.006;
    const extended=Boolean(n.transition&&next);
    const attack=Math.min(joined?.018:.012,duration/3);
    const gain=bansuriPeakGain(n.velocity,85,1),start=Math.round(n.startMs/1000*rate);
    let phase=joined?sample.loopStart:0;
    for(let j=0;j<Math.ceil((duration+(extended?fadeOut:0))*rate)&&start+j<frames;j++){
      const t=j/rate;
      if(phase>=sample.loopEnd)phase=sample.loopStart+(phase-sample.loopStart)%(sample.loopEnd-sample.loopStart);
      const pos=phase*wav.rate,k=Math.floor(pos),f=pos-k;
      const value=(wav.mono[k]??0)*(1-f)+(wav.mono[k+1]??0)*f;
      const envelope=t<attack?t/attack:extended?(t<=duration?1:Math.max(0,1-(t-duration)/fadeOut)):Math.min(1,Math.max(0,(duration-t)/fadeOut));
      mix[start+j]+=value*gain*envelope;
      phase+=2**((n.midi-sample.midi)/12+(n.pitchCurve?pitchCentsAt(n.pitchCurve,Math.min(n.durationMs,(t+.5/rate)*1000)):0)/1200)/rate;
    }
  }
  const peak=mix.reduce((v,x)=>Math.max(v,Math.abs(x)),0),rms=Math.sqrt(mix.reduce((v,x)=>v+x*x,0)/frames);
  if(!Number.isFinite(rms)||!rms||peak>=1)throw Error(`Invalid mix: ${mode}`);
  renders.push({mode,mix,peak,rms,connections:events.filter(n=>n.transition).length});
}
// Match RMS, not peak: avoid a louder example biasing the musical comparison.
const targetRms=Math.min(.1,...renders.map(r=>r.rms*.89/r.peak));
const directory=resolve('output/audio-comparison/expressions');await mkdir(directory,{recursive:true});
const report={piece:piece.id,method:'Offline reconstruction, not browser or Kontakt capture; RMS matched, linear interpolation.',targetRmsDb:20*Math.log10(targetRms),sampleRate:rate,variants:[]};
for(const r of renders){
  const gain=targetRms/r.rms,pcm=Float32Array.from(r.mix,x=>x*gain),name=`ode-${r.mode}.wav`;
  await writeFile(resolve(directory,name),encodeMono16(pcm,rate));
  report.variants.push({mode:r.mode,file:name,connections:r.connections,originalPeakDb:20*Math.log10(r.peak),originalRmsDb:20*Math.log10(r.rms),matchedPeakDb:20*Math.log10(r.peak*gain),appliedGainDb:20*Math.log10(gain)});
}
await writeFile(resolve(directory,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({directory,...report},null,2));
