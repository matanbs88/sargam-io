"use client";

import { TranscriptionIntake } from './TranscriptionIntake';
import type { TranscriptionResult } from '@/src/lib/transcriptionJob';
import s from './alternatives.module.css';
import a from './living-app.module.css';

export function TranscriptionHome({ onDemo, onLibrary, onImport, onPractice }: { onDemo: () => void; onLibrary: () => void; onImport: () => void; onPractice: (result: TranscriptionResult) => void }) {
  return <section className={a.home}>
    <p className={s.kicker}>FROM THE SONG YOU LOVE TO THE NOTES YOU PLAY</p>
    <h1 tabIndex={-1}>Your song.<br /><em>In your Sa.</em></h1>
    <p className={a.lead}>Turn a YouTube song into Sargam. Follow the melody on piano, harmonium or bansuri, then take the score with you.</p>
    <TranscriptionIntake onPractice={onPractice}/>
    <div className={a.entryActions}><button onClick={onDemo}>Try a playable demo</button><button onClick={onImport}>Already have sheet music? Import it →</button></div>
    <ol className={a.journey}><li><span>01</span><strong>Bring a song</strong><p>A YouTube link or an existing score.</p></li><li><span>02</span><strong>Make it your Sa</strong><p>Read Latin Sargam, Devanagari or pitch names.</p></li><li><span>03</span><strong>Play. Practice. Print.</strong><p>One score for the live visualizer and your PDF.</p></li></ol>
    <div className={a.libraryEntry}><div><h2>Or find your next song.</h2><p>Search the growing collection of playable scores and practice studies.</p></div><button onClick={onLibrary}>Browse the library →</button></div>
  </section>;
}
