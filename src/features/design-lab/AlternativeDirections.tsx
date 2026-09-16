"use client";
import { useState } from 'react';
import Link from 'next/link';
import { KeyboardRoll } from '@/src/components/visualizers/KeyboardRoll';
import { BansuriFallingNotes } from '@/src/components/visualizers/BansuriFallingNotes';
import type { NotationSystem } from '@/src/lib/midiToSargam';
import { usePilotSession, type PilotSession, PILOT, PILOT_EVENTS, ROOT_NAMES } from './usePilotSession';
import s from './alternatives.module.css';

type Direction = 'score' | 'riyaz' | 'coach';
function Settings({ session: p }: { session: PilotSession }) {
  return <div className={s.settings}>
    <label>Instrument<select value={p.instrument} onChange={e => p.setInstrument(e.target.value as PilotSession['instrument'])}>{['Piano', 'Harmonium', 'Bansuri'].map(i => <option key={i}>{i}</option>)}</select></label>
    {p.instrument === 'Bansuri' && <label>Voice comparison<select value={p.bansuriVoice} onChange={e => p.setBansuriVoice(e.target.value as PilotSession['bansuriVoice'])}><option value="procedural">Procedural reference</option><option value="ventus-study">Ventus sustain · experimental</option></select><small>Single sampled anchor, C4–C5. Listening QA pending.</small></label>}
    <label>Sa<select value={p.root} onChange={e => p.setRoot(Number(e.target.value))}>{ROOT_NAMES.map((n, i) => <option key={n} value={60 + i}>{n}4</option>)}</select></label>
    <label>Notation<select value={p.notation} onChange={e => p.setNotation(e.target.value as NotationSystem)}><option value="Sargam_EN">Sargam</option><option value="Sargam_HI">देवनागरी</option><option value="ABC">C D E</option></select></label>
    {p.instrument === 'Harmonium' && <><label>Reeds<select value={String(p.double)} onChange={e => p.setDouble(e.target.value === 'true')}><option value="false">Single</option><option value="true">Double</option></select></label><label>Space<select value={String(p.room)} onChange={e => p.setRoom(e.target.value === 'true')}><option value="false">Dry</option><option value="true">Room</option></select></label></>}
  </div>;
}
function Transport({ session: p }: { session: PilotSession }) {
  const t = p.transport;
  return <div className={s.transport}>
    <button className={s.play} onClick={() => void t.togglePlayback()}>{t.isLoading ? 'Cancel loading' : t.isPlaying ? 'Pause' : 'Play'}</button>
    <button onClick={t.reset}>Restart</button>
    <label className={s.seek}>Position<input type="range" min={0} max={t.durationMs} value={t.positionMs} onChange={e => t.seek(Number(e.target.value))} /><span>{(t.positionMs / 1000).toFixed(1)}s</span></label>
    <label>Speed<select value={p.rate} onChange={e => p.setRate(Number(e.target.value))}>{[0.5, 0.75, 1, 1.25].map(rate => <option key={rate} value={rate}>{rate}×</option>)}</select></label>
  </div>;
}
function Roll({ session: p }: { session: PilotSession }) {
  return <div className={s.roll}>{p.instrument === 'Bansuri' ? <BansuriFallingNotes {...p.roll} /> : <KeyboardRoll {...p.roll} title={p.instrument} />}</div>;
}
function Score({ session: p }: { session: PilotSession }) {
  // Measured beat positions, not an equal-width row: held notes retain their span.
  const beatMs = 60000 / PILOT.tempoBpm;
  return <div className={s.score} aria-label="Four-bar score">
    {[0, 1, 2, 3].map(bar => <div className={s.bar} key={bar}><small>{bar + 1}</small><div className={s.beats}>{PILOT_EVENTS.map((note, index) => {
      const beat = note.startMs / beatMs;
      if (Math.floor((beat + 0.001) / 4) !== bar) return null;
      return <button key={index} style={{ left: `${(beat - bar * 4) * 25}%`, width: `${note.durationMs / beatMs * 25}%` }} aria-current={p.transport.activeEventIndex === index ? 'step' : undefined} aria-label={`Bar ${bar + 1}, note ${index + 1}: ${p.notes[index]}`} onClick={() => p.transport.selectEvent(index)}>{p.notes[index]}<span>{(note.durationMs / beatMs).toFixed(1).replace('.0', '')} beat{note.durationMs / beatMs > 1.01 ? 's' : ''}</span></button>;
    })}</div></div>)}
  </div>;
}
export function AlternativeDirections({ direction }: { direction: Direction }) {
  const p = usePilotSession();
  const [step, setStep] = useState(0);
  const [showInstrument, setShowInstrument] = useState(false);
  function stage(index: number) {
    p.transport.pause(); setStep(index);
    p.setLoop(index === 1 ? { startIndex: 0, endIndex: 7 } : null);
    p.transport.reset();
    p.setRate(index === 1 ? 0.75 : 1);
  }
  const names = { score: 'The living score', riyaz: 'The riyaz room', coach: 'Your practice path' };
  return <main className={`${s.shell} ${direction === 'score' ? '' : s[direction]}`}>
    <nav className={s.nav}><Link href="/design-lab">← All directions</Link><strong>sargam</strong><button onClick={() => { p.transport.pause(); p.setOpened(false); }}>Library</button></nav>
    {!p.opened ? <section className={s.entry}>
      <div><p className={s.kicker}>{names[direction]}</p><h1>{direction === 'score' ? <>Read the music.<br />Hear it unfold.</> : direction === 'riyaz' ? <>Make room<br />for your riyaaz.</> : <>One phrase.<br />One small step.</>}</h1><p>{direction === 'score' ? 'A playable score you can read, mark by ear, and take to your instrument.' : direction === 'riyaz' ? 'Choose your instrument, settle into your Sa, and spend a little time with a melody.' : 'Listen first. Practice slowly. Then bring the whole phrase together.'}</p></div>
      <button className={s.selection} onClick={() => p.setOpened(true)}><span>01 / BEGINNER</span><h2>Ode to Joy</h2><p>Beethoven · Four-bar opening study</p><strong>{direction === 'score' ? 'Open the score' : direction === 'riyaz' ? 'Enter practice' : 'Begin session'} →</strong></button>
    </section> : <>
      <header className={s.heading}><div><p className={s.kicker}>BEETHOVEN · OPENING STUDY</p><h1>Ode to Joy</h1></div><button onClick={p.download} disabled={p.exporting}>{p.exporting ? 'Preparing…' : 'Download score'}</button></header>
      {direction === 'score' ? <div className={s.editorial}>
        <article className={s.paper}><div className={s.paperHeading}><span>01</span><div><h2>Ode to Joy</h2><p>4/4 · ♩ = 92 · {ROOT_NAMES[p.root - 60]}4 = Sa</p></div></div><Score session={p} /><p className={s.caption}>Tap a note to set your starting point, then press Play. Note spacing follows musical time.</p><Transport session={p} /></article>
        <aside className={s.margin}><h2>At your instrument</h2><Settings session={p} /><button aria-expanded={showInstrument} onClick={() => setShowInstrument(!showInstrument)}>{showInstrument ? 'Hide instrument guide' : 'Show instrument guide'}</button><p>The score stays in view. Open the instrument guide when you need a hand position or timing reference.</p></aside>
        {showInstrument && <div className={s.wide}><Roll session={p} /></div>}
      </div> : direction === 'riyaz' ? <div className={s.roomLayout}>
        <aside className={s.anchor}><span>YOUR SA</span><strong>{ROOT_NAMES[p.root - 60]}</strong><span>Octave 4</span><hr /><p>NOW IN THE PHRASE</p><b>{p.notes[p.transport.activeEventIndex] ?? '—'}</b><p>Reference voice · {p.instrument}</p></aside>
        <section className={s.roomStage}><Settings session={p} /><Roll session={p} /><Transport session={p} /><Score session={p} /></section>
      </div> : <div className={s.coachLayout}>
        <ol className={s.steps}>{['Listen to the phrase', 'Repeat the first half', 'Play it all together'].map((label, i) => <li key={label}><button aria-current={step === i ? 'step' : undefined} onClick={() => stage(i)}><span>0{i + 1}</span>{label}</button></li>)}</ol>
        <section className={s.lesson}><div className={s.lessonHeading}><span>STEP {step + 1} / 3</span><h2>{['Listen before you play.', 'Take eight notes slowly.', 'Now, the whole phrase.'][step]}</h2><p>{['Follow the melody once at its original tempo.', 'The first eight notes repeat at ¾ speed. Move on whenever you feel ready.', 'Play the four bars at your own pace. You can always revisit a step.'][step]}</p></div><Settings session={p} /><Roll session={p} /><Transport session={p} /><div className={s.next}><p>No microphone scoring — your judgment guides this practice.</p>{step < 2 ? <button className={s.play} onClick={() => stage(step + 1)}>Ready for the next step →</button> : <button onClick={() => stage(0)}>Practice again</button>}</div></section>
        <details className={s.noteDetails}><summary>Read and navigate the notes</summary><p>Choose a starting note with Tab and Enter, then press Play. In step 2, playback stays within the first eight notes.</p><Score session={p} /></details>
      </div>}
      <footer className={s.footer}><p>Sa changes the relative labels, not the source pitches. Bansuri fingering is a reference, not a calibrated instrument profile.</p>{(p.transport.error || p.exportError) && <p role="alert">{p.transport.error || p.exportError}</p>}</footer>
    </>}
  </main>;
}
