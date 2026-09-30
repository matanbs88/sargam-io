"use client";
import type { ComponentProps } from 'react';
import { TranscriptionHome } from './TranscriptionHome';
import { TranscriptionIntake } from './TranscriptionIntake';
import { BansuriIllustration } from '@/src/components/instruments/BansuriIllustration';
import c from './indian-directions.module.css';

export type IndianDirection = 'mehfil' | 'raag' | 'riyaz';
export const INDIAN_DIRECTIONS = [
  {id:'mehfil',name:'Mehfil',description:'An intimate listening room. Plum, brass and bamboo; a quiet side navigation and a generous musical stage.'},
  {id:'raag',name:'Raag Studio',description:'A contemporary Indian music studio. Indigo, saffron and mint; direct tools, a live-workbench layout and bold typography.'},
  {id:'riyaz',name:'Riyaz Journal',description:'A musician’s daily journal. Vermilion, warm paper and ink; an editorial masthead and a notation-first rhythm.'},
] as const;

export function IndianBrand({ direction }: { direction: IndianDirection }) {
  return <span className={c.brand}><span aria-hidden="true" className={c.mark}>{direction==='riyaz'?'सा':<svg viewBox="0 0 40 40"><path d={direction==='mehfil'?'M8 29V15Q20 -2 32 15V29M8 23Q20 10 32 23M20 10V33':'M5 27H12V12H19V30H26V7H33'} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="20" cy="33" r="3" fill="currentColor"/></svg>}</span><span>sargam<small>{INDIAN_DIRECTIONS.find(d=>d.id===direction)?.name}</small></span></span>;
}

type Props = ComponentProps<typeof TranscriptionHome> & { direction?: IndianDirection };
export function IndianHome({direction='mehfil',onPractice,onLibrary,onImport,onDemo}:Props) {
  const heading=direction==='mehfil'?<>Every melody<br/>begins with <em>Sa.</em></>:direction==='raag'?<>Your song.<br/><em>Your Sargam.</em></>:<>A song to learn.<br/><em>A practice to keep.</em></>;
  const intro=<header className={c.intro}><p className={c.eyebrow}>{direction==='mehfil'?'YOUR PERSONAL MEHFIL':direction==='raag'?'LISTEN. TRANSCRIBE. MAKE IT YOURS.':'THE DAILY PRACTICE OF MUSIC'}</p><h1 tabIndex={-1}>{heading}</h1><p>Bring a song you love. Read it in Sargam, find your Sa, and play it on bansuri, harmonium or piano.</p></header>;
  const intake=<div className={c.intake}><div className={c.intakeLabel}><span>01 / Bring your music</span><span>YouTube · Audio</span></div><TranscriptionIntake onPractice={onPractice}/><button className={c.importLink} onClick={onImport}>Have sheet music? Import a score ↗</button></div>;
  const study=<aside className={c.study}><div><p className={c.eyebrow}>A MOMENT OF RIYAZ</p><h2>Listen. Connect.<br/>Let the melody breathe.</h2><p>Explore a playable study with your own Sa and tempo.</p><div className={c.phrase} aria-label="Sargam: Sa Re Ga Ma Pa"><span>S</span><span>R</span><span>G</span><span>m</span><span>P</span></div><button onClick={onDemo}>Open the practice room →</button><small>Demo study · no upload needed</small></div><div className={c.art}><BansuriIllustration holes={['closed','closed','closed','open','open','open']}/></div></aside>;
  const collection=<div className={c.collection}><span className={c.collectionIndex}>02</span><div><h2>Your next melody is waiting.</h2><p>Search playable scores, devotional arrangements and practice studies.</p></div><button onClick={onLibrary}>Explore the collection →</button></div>;
  return <section className={c.home}>
    {direction==='riyaz' && <div className={c.journalRule}><span>स्वर · SWARA</span><span>A musician’s companion</span><span>रियाज़ · RIYAZ</span></div>}
    <div className={c.composition}>{intro}{intake}{study}</div>
    {collection}
    <div className={c.method}><span><b>Sa reference</b> Choose the root for notation. Playback stays at the score’s pitch.</span><span><b>Three instruments</b> One shared musical score.</span><span><b>Take it with you</b> Printable Sargam notation.</span></div>
  </section>;
}
