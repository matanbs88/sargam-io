"use client";

import { useState, type ReactNode } from 'react';
import { ROOT_NAMES, type PilotSession } from './usePilotSession';
import s from './living-score.module.css';

type View = 'both' | 'score' | 'instrument';
type Practice = 'free' | 'listen' | 'repeat' | 'phrase';

/** Presentation only: every surface reads the same session and audio clock. */
export function LivingScoreWorkspace({ session: p, settings, transport, visualizer, renderScore }: {
  session: PilotSession;
  settings: ReactNode;
  transport: ReactNode;
  visualizer: ReactNode;
  renderScore: (select: (index: number) => void) => ReactNode;
}) {
  const [view, setView] = useState<View>('both');
  const [practice, setPractice] = useState<Practice>('free');
  function choosePractice(next: Practice) {
    p.transport.pause();
    p.setLoop(next === 'repeat' ? { startIndex: 0, endIndex: 7 } : null);
    p.setRate(next === 'repeat' ? 0.75 : 1);
    p.transport.reset();
    setPractice(next);
  }
  function selectNote(index: number) {
    // Choosing outside a guided loop must not silently jump back into that loop.
    if (practice === 'repeat' && index > 7) {
      p.transport.pause();
      p.setLoop(null);
      setPractice('free');
    }
    p.transport.selectEvent(index);
  }
  return <section className={s.workspace} aria-label="Living score practice workspace">
    <div className={s.toolbar}>{settings}<div className={s.views} role="group" aria-label="Workspace view">
      {(['both', 'score', 'instrument'] as const).map(v => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v === 'both' ? 'Score + instrument' : v === 'score' ? 'Score only' : 'Instrument only'}</button>)}
    </div></div>
    <div className={s.anchor}>
      <p><span>YOUR SA</span><strong>{ROOT_NAMES[p.root - 60]}4</strong><small>4/4 · ♩ 92</small></p>
      <p><span>{p.transport.isPlaying ? 'FOLLOW' : 'SELECTED NOTE'}</span><strong>{p.notes[p.transport.activeEventIndex] ?? '—'}</strong></p>
    </div>
    <div className={s.stage} data-view={view}>
      {view !== 'score' && <section className={s.instrument} aria-label="Instrument timing guide">{visualizer}</section>}
      {view !== 'instrument' && <section className={s.paper} aria-label="Playable score">
        <div className={s.paperTitle}><h2>The melody</h2><span>01—04 / FOUR BARS</span></div>
        {renderScore(selectNote)}
        <p className={s.caption}>Choose any note, then press Play. Horizontal spacing follows musical time.</p>
      </section>}
    </div>
    <div className={s.transport}>{transport}</div>
    <details className={s.guidance}>
      <summary>Guided practice <span>Listen → repeat → bring it together</span></summary>
      <div className={s.steps} role="group" aria-label="Practice stage">
        {([['listen', '01', 'Listen', 'Whole phrase · original tempo'], ['repeat', '02', 'Repeat eight notes', 'First two bars · loop at ¾ speed'], ['phrase', '03', 'Play the phrase', 'Four bars · adjust speed freely']] as const).map(([id, number, title, hint]) => <button key={id} aria-pressed={practice === id} onClick={() => choosePractice(id)}><small>{number}</small><strong>{title}</strong><span>{hint}</span></button>)}
      </div>
      <p role="status">{practice === 'repeat' ? 'First eight notes are looping. Selecting a later note leaves the loop.' : practice === 'free' ? 'Free practice. Choose a stage when you want structure.' : 'Whole phrase selected. Press Play when ready.'} No microphone scoring.</p>
    </details>
    {practice === 'repeat' && <p className={s.loopNotice}>Loop: first eight notes <button onClick={() => choosePractice('free')}>Leave loop</button></p>}
  </section>;
}
