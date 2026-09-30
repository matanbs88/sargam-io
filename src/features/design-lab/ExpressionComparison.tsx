"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {ComparisonClip} from '@/src/engine/renderBansuriComparison';
import type {BansuriStudyId} from '@/src/lib/bansuriComparisonStudy';
import styles from './expression-comparison.module.css';
type Clip=Omit<ComparisonClip,'wav'>&{url:string};
export function ExpressionComparison(){
  const [study,setStudy]=useState<BansuriStudyId>('ode');
  const title=study==='ode'?'Ode to Joy':'Connected swara study';
  const [clips,setClips]=useState<Clip[]>([]),[busy,setBusy]=useState(false),[status,setStatus]=useState('Ready to render in your browser.'),[error,setError]=useState('');
  const controller=useRef<AbortController|null>(null),urls=useRef<string[]>([]);
  const players=useRef<HTMLDivElement>(null);
  useEffect(()=>()=>{controller.current?.abort();urls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  function clearClips(){
    players.current?.querySelectorAll('audio').forEach(audio=>audio.pause());
    urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];
    setClips([]);
  }
  async function render(){
    if(controller.current)return;
    const run=new AbortController();controller.current=run;setBusy(true);setError('');
    clearClips();
    try{
      const {renderBansuriComparison}=await import('@/src/engine/renderBansuriComparison');
      const rendered=await renderBansuriComparison(run.signal,setStatus,study);run.signal.throwIfAborted();
      urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];
      const result=rendered.map(({wav,...clip})=>{const url=URL.createObjectURL(new Blob([wav],{type:'audio/wav'}));urls.current.push(url);return {...clip,url};});
      setClips(result);setStatus('Three browser-rendered clips ready. Average level is matched for a fair comparison.');
    }catch(e){if(!run.signal.aborted)setError(e instanceof Error?e.message:'Rendering failed. Try again.');}
    finally{if(!run.signal.aborted)setBusy(false);if(controller.current===run)controller.current=null;}
  }
  function cancel(){controller.current?.abort();controller.current=null;setBusy(false);setStatus('Cancelled. You can render again.');}
  return <main className={styles.page}>
    <Link href="/design-lab/indian">← Design studies</Link>
    <p className={styles.kicker}>BANSURI / LISTENING ROOM</p>
    <h1>Hear the connection.</h1>
    <p>{title}, played by the same Ventus sampler as the practice room. Compare the original melody with two optional transition studies.</p>
    <p className={styles.note}>Rendered locally by Web Audio, not a Kontakt recording. RMS-matched volume; no reverb. These studies are not a universal interpretation of Indian ornamentation.</p>
    <label className={styles.study}>Listening study
      <select value={study} disabled={busy} onChange={event=>{
        clearClips();setStudy(event.target.value as BansuriStudyId);setError('');
        setStatus('Study changed. Render to hear this phrase.');
      }}>
        <option value="ode">Ode to Joy</option>
        <option value="connections">Connected swaras · Sa Re Ga Pa Pa Ga · Re Sa</option>
      </select>
    </label>
    {study==='connections'&&<p className={styles.note}>Sa = C4 · 60 BPM. Three rising connections, a fresh attack on repeated Pa, one descending connection, a half-second silence, then Re → Sa. Five connected pairs; neither repetition nor rest is bridged.</p>}
    <div className={styles.actions}>
      <button onClick={render} disabled={busy}>{busy?'Rendering…':clips.length?'Render again':'Render comparison'}</button>
      {busy&&<button onClick={cancel}>Cancel</button>}
    </div>
    <p role="status">{status}</p>{error&&<p role="alert">{error}</p>}
    <div className={styles.clips} ref={players}>{clips.map(clip=><section key={clip.mode}>
      <h2>{clip.mode==='plain'?'As written':clip.mode==='meend'?'Meend':'Gamak study'}</h2>
      <p>{clip.mode==='plain'?'Original timing, no added transition.':clip.mode==='meend'?'Smooth travel into the next pitch.':'Articulated pitch movement in the connection.'}</p>
      <audio controls preload="metadata" src={clip.url} aria-label={`${clip.mode} ${title} comparison`} onPlay={event=>{const current=event.currentTarget;players.current?.querySelectorAll('audio').forEach(audio=>{if(audio!==current)audio.pause();});}}/>
      <small>{clip.connections} connections · RMS {clip.rmsDb.toFixed(1)} dBFS · peak {clip.peakDb.toFixed(1)} dBFS</small>
      <a href={clip.url} download={`${study}-${clip.mode}-browser.wav`}>Download WAV ↓</a>
    </section>)}</div>
    <Link href="/living-score?score=pd-ode-to-joy-theme#practice">Open Ode to Joy in practice →</Link>
  </main>;
}
