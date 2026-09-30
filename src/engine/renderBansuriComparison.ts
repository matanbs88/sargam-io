import {GuideVoiceBank} from './GuideVoiceBank';
import {expressBansuri,type BansuriExpression} from '../lib/ventusPerformance';
import {comparisonNotes,type BansuriStudyId} from '../lib/bansuriComparisonStudy';
import {encodeMonoWav,measurePcm} from '../lib/pcmWav';
export type ComparisonClip={mode:BansuriExpression;wav:ArrayBuffer;peakDb:number;rmsDb:number;connections:number};

/** Uses the SAME sampler/scheduler as practice, rendered by browser Web Audio.
 * It is not a Kontakt capture and does not certify stylistic authenticity. */
export async function renderBansuriComparison(signal:AbortSignal,onProgress:(message:string)=>void,study:BansuriStudyId='ode'):Promise<ComparisonClip[]> {
  if(typeof OfflineAudioContext==='undefined')throw new Error('This browser does not support offline audio rendering.');
  const notes=comparisonNotes(study);
  const rate=44100, lead=.05;
  const seconds=Math.max(...notes.map(n=>n.startMs+n.durationMs))/1000;
  const raw=[];
  for(const mode of ['plain','meend','gamak-study'] as const){
    signal.throwIfAborted();onProgress(`Rendering ${mode}…`);
    const context=new OfflineAudioContext(1,Math.ceil((seconds+lead+.05)*rate),rate);
    const bank=new GuideVoiceBank(()=>context,{instrument:'Bansuri',enabled:true,double:false,room:false,bansuriVoice:'ventus',bansuriArticulation:'natural',bansuriVolume:85});
    const cancel=()=>bank.cancel();signal.addEventListener('abort',cancel,{once:true});
    try{
      const events=expressBansuri(notes,mode);await bank.prepare(events);signal.throwIfAborted();
      for(const n of events)bank.schedule(n,lead+n.startMs/1000,n.durationMs/1000,0,1);
      const buffer=await context.startRendering();signal.throwIfAborted();
      const samples=buffer.getChannelData(0).slice(Math.round(lead*rate),Math.round((seconds+lead)*rate));
      const meter=measurePcm(samples);
      if(meter.rms===0||meter.peak>=1)throw new Error(`${mode}: silent or clipping render`);
      raw.push({mode,samples,...meter,connections:events.filter(n=>n.transition).length});
    } finally {signal.removeEventListener('abort',cancel);bank.dispose();}
  }
  const target=Math.min(.1,...raw.map(r=>.89*r.rms/r.peak));
  return raw.map(r=>{
    const gain=target/r.rms,samples=Float32Array.from(r.samples,n=>n*gain);
    return {mode:r.mode,wav:encodeMonoWav(samples,rate),peakDb:20*Math.log10(r.peak*gain),rmsDb:20*Math.log10(target),connections:r.connections};
  });
}
