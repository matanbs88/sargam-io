"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ROOT_NAMES, type PilotSession } from './usePilotSession';
import s from './living-score.module.css';
import { isAtScoreEnd } from '@/src/lib/transportPresentation';

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
  const [focus, setFocus] = useState(false);
  const [scoreShare, setScoreShare] = useState(24);
  const [loopAnchor, setLoopAnchor] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const atEnd = !p.transport.isPlaying && !p.transport.isLoading && isAtScoreEnd(p.transport.positionMs, p.transport.durationMs);
  const settingsId = useId();
  const settingsButton = useRef<HTMLButtonElement>(null);
  const settingsVisible = useRef(settingsOpen);
  useEffect(() => { settingsVisible.current = settingsOpen; }, [settingsOpen]);
  const stage = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLElement>(null);
  const focusButton = useRef<HTMLButtonElement>(null);
  const liveSession = useRef(p);
  useEffect(() => { liveSession.current = p; }, [p]);
  useEffect(() => {
    if (!focus) return;
    const returnFocus = focusButton.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const siblings = Array.from(workspace.current?.parentElement?.children ?? []).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== workspace.current).map(node => ({ node, inert: node.inert }));
    siblings.forEach(({ node }) => { node.inert = true; });
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (settingsVisible.current) {
          event.preventDefault();
          setSettingsOpen(false);
          settingsButton.current?.focus();
          return;
        }
        setSettingsOpen(false);
        setFocus(false);
        if (document.fullscreenElement === workspace.current) void document.exitFullscreen().catch(() => {});
      }
    };
    const fullscreen = () => { if (!document.fullscreenElement) setFocus(false); };
    document.addEventListener('keydown', escape);
    document.addEventListener('fullscreenchange', fullscreen);
    return () => {
      document.body.style.overflow = previous;
      siblings.forEach(({ node, inert }) => { node.inert = inert; });
      document.removeEventListener('keydown', escape);
      document.removeEventListener('fullscreenchange', fullscreen);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [focus]);
  useEffect(() => {
    const element = workspace.current;
    if (!element) return;
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.closest('input,select,textarea,button,a,[contenteditable=true]')) return;
      if (event.code === 'Space' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        void liveSession.current.transport.togglePlayback();
      }
    };
    element.addEventListener('keydown', keyboard);
    return () => element.removeEventListener('keydown', keyboard);
  }, []);
  function toggleFocus() {
    if (focus) {
      setSettingsOpen(false);
      setFocus(false);
      if (document.fullscreenElement === workspace.current) void document.exitFullscreen().catch(() => {});
    } else {
      setFocus(true);
      // Unsupported/denied fullscreen still gets an edge-to-edge viewport layout.
      void workspace.current?.requestFullscreen?.().catch(() => {});
    }
  }
  function choosePractice(next: Practice) {
    setLoopAnchor(null);
    p.transport.pause();
    p.setLoop(next === 'repeat' ? { startIndex: 0, endIndex: Math.min(7, p.notes.length - 1) } : null);
    p.setRate(next === 'repeat' ? 0.75 : 1);
    p.transport.reset();
    setPractice(next);
  }
  function selectNote(index: number) {
    // Choosing outside a guided loop must not silently jump back into that loop.
    if (p.loop && (index < p.loop.startIndex || index > p.loop.endIndex)) {
      p.transport.pause();
      p.setLoop(null);
      setPractice('free');
    }
    p.transport.selectEvent(index);
  }
  function clearLoop() {
    p.transport.pause(); p.setLoop(null); setLoopAnchor(null); setPractice('free');
  }
  return <section ref={workspace} className={s.workspace} data-practice-focus={focus} aria-label="Living score practice workspace" tabIndex={-1}>
    <div className={s.toolbar}>
      {focus && <div className={s.focusIdentity}><h1 className={s.focusTitle} title={p.piece.title}>{p.piece.title}<span>Living Score · practice</span></h1><button ref={settingsButton} aria-expanded={settingsOpen} aria-controls={settingsId} onClick={() => setSettingsOpen(open => !open)}>Settings</button></div>}
      <div id={settingsId} className={s.settingsPanel} data-expanded={settingsOpen}>{settings}{focus && settingsOpen && <button onClick={() => { setSettingsOpen(false); settingsButton.current?.focus(); }}>Done</button>}</div><div className={s.views} role="group" aria-label="Workspace view">
      {(['both', 'score', 'instrument'] as const).map(v => <button key={v} aria-label={v === 'both' ? 'Score + instrument' : v === 'score' ? 'Score only' : 'Instrument only'} aria-pressed={view === v} onClick={() => setView(v)}><span className={s.viewLong}>{v === 'both' ? 'Score + instrument' : v === 'score' ? 'Score only' : 'Instrument only'}</span><span className={s.viewShort} aria-hidden="true">{v === 'both' ? 'Both' : v === 'score' ? 'Score' : 'Instrument'}</span></button>)}
      <button ref={focusButton} aria-pressed={focus} onClick={toggleFocus}>{focus ? 'Exit focus' : 'Focus'}</button>
    </div></div>
    <div className={s.anchor}>
      <p><span>YOUR SA</span><strong>{ROOT_NAMES[((p.root % 12) + 12) % 12]}{Math.floor(p.root / 12) - 1}</strong><small>{p.piece.timeSignature} · ♩ {Math.round(p.piece.tempoBpm * p.rate)}</small></p>
      <p><span>{p.transport.isPlaying ? 'FOLLOW' : atEnd ? 'END OF SCORE' : 'SELECTED NOTE'}</span><strong>{p.notes[p.transport.activeEventIndex] ?? '—'}</strong></p>
    </div>
    <span className={s.completionNotice} role="status">{atEnd ? 'End of score. Choose Replay to practice again, or select a note to revisit a passage.' : ''}</span>
    <div ref={stage} className={s.stage} data-view={view} style={{ '--score-share': `${scoreShare}%` } as CSSProperties}>
      {view !== 'instrument' && <section className={s.paper} aria-label="Playable score" tabIndex={0}>
        <div className={s.sheetHeader}><div className={s.paperTitle}><h2>The melody</h2><span>{p.notation === 'ABC' ? 'PITCH NAMES' : p.notation === 'Sargam_HI' ? 'देवनागरी' : 'SARGAM'}</span></div>
        <div className={s.noteNavigation} role="group" aria-label="Navigate individual notes">
          <button disabled={p.transport.activeEventIndex <= 0} onClick={() => selectNote(p.transport.activeEventIndex - 1)} aria-label="Previous note">←</button>
          <span>Note {Math.max(0, p.transport.activeEventIndex) + 1} / {p.notes.length}</span>
          <button disabled={p.transport.activeEventIndex >= p.notes.length - 1} onClick={() => selectNote(p.transport.activeEventIndex + 1)} aria-label="Next note">→</button>
        </div>
        </div>
        {renderScore(selectNote)}
        <p className={s.caption}>Notes share a beat group · — sustain · · rest. Select a note to start there.</p>
      </section>}
      {focus && view === 'both' && <div className={s.splitter} role="separator" aria-label="Resize score and instrument" aria-orientation="horizontal" aria-valuemin={15} aria-valuemax={60} aria-valuenow={scoreShare} aria-valuetext={`${scoreShare}% score, remaining space instrument`} tabIndex={0}
        onKeyDown={event => {
          const next = event.key === 'ArrowUp' ? scoreShare - 5 : event.key === 'ArrowDown' ? scoreShare + 5 : event.key === 'Home' ? 15 : event.key === 'End' ? 60 : null;
          if (next !== null) { event.preventDefault(); setScoreShare(Math.max(15, Math.min(60, next))); }
        }}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.focus(); }}
        onPointerMove={event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const bounds = stage.current?.getBoundingClientRect();
          if (bounds?.height) setScoreShare(Math.max(15, Math.min(60, Math.round((event.clientY - bounds.top) / bounds.height * 100))));
        }}
        onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      ><span /></div>}
      {view !== 'score' && <section className={s.instrument} aria-label="Instrument timing guide">{visualizer}</section>}
    </div>
    <div className={s.transport}>{transport}</div>
    {view === 'instrument' && <div className={s.accessibleScore} aria-label="Readable note sequence">
      <ol>{p.piece.noteEvents.map((note, index) => <li key={index}><button aria-current={p.transport.activeEventIndex === index ? 'step' : undefined} onClick={() => selectNote(index)}>Note {index + 1}: {p.notes[index]}, starts {(note.startMs / 1000).toFixed(2)} seconds, duration {(note.durationMs / 1000).toFixed(2)} seconds</button></li>)}</ol>
    </div>}
    {focus && <div className={s.focusLoop} role="group" aria-label="Passage loop">
      <button onClick={() => { clearLoop(); setLoopAnchor(Math.max(0, p.transport.activeEventIndex)); }}>Set A</button>
      <button disabled={loopAnchor === null} onClick={() => { if (loopAnchor === null) return; p.transport.pause(); const end = Math.max(0, p.transport.activeEventIndex); p.setLoop({ startIndex: Math.min(loopAnchor, end), endIndex: Math.max(loopAnchor, end) }); setLoopAnchor(null); }}>Set B</button>
      <button disabled={!p.loop && loopAnchor === null} onClick={clearLoop}>Clear loop</button>
      <span>{loopAnchor !== null ? `A: note ${loopAnchor + 1}` : p.loop ? `Loop ${p.loop.startIndex + 1}–${p.loop.endIndex + 1}` : 'Space: play/pause · Esc: exit'}</span>
    </div>}
    {p.transport.error && <p className={s.playbackError} role="alert">{p.transport.error}</p>}
    <details className={s.guidance}>
      <summary>Guided practice <span>Listen → repeat → bring it together</span></summary>
      <div className={s.steps} role="group" aria-label="Practice stage">
        {([['listen', '01', 'Listen', 'Whole piece · original tempo'], ['repeat', '02', 'Repeat the opening', 'Up to eight notes · loop at ¾ speed'], ['phrase', '03', 'Play it together', 'Whole piece · adjust speed freely']] as const).map(([id, number, title, hint]) => <button key={id} aria-pressed={practice === id} onClick={() => choosePractice(id)}><small>{number}</small><strong>{title}</strong><span>{hint}</span></button>)}
      </div>
      <div className={s.rangeControls} role="group" aria-label="Repeat a chosen passage">
        <span>Choose notes in the score to mark a passage.</span>
        <button onClick={() => { clearLoop(); setLoopAnchor(Math.max(0, p.transport.activeEventIndex)); }}>Set start A</button>
        <button disabled={loopAnchor === null} onClick={() => {
          if (loopAnchor === null) return;
          p.transport.pause();
          const end = Math.max(0, p.transport.activeEventIndex);
          p.setLoop({ startIndex: Math.min(loopAnchor, end), endIndex: Math.max(loopAnchor, end) });
          setPractice('free'); setLoopAnchor(null);
        }}>Set end B</button>
        {loopAnchor !== null && <span role="status">A: note {loopAnchor + 1}. Select the last note, then set B.</span>}
      </div>
      <p role="status">{p.loop ? `Notes ${p.loop.startIndex + 1}–${p.loop.endIndex + 1} will repeat. Selecting a note outside this range leaves the loop.` : practice === 'free' ? 'Free practice. Choose a stage when you want structure.' : 'Whole phrase selected. Press Play when ready.'} No microphone scoring.</p>
      <p>Keyboard: use ← / → on a score note to move through the melody; Home / End jump to its start / end. Space on the score background plays or pauses. Escape leaves Focus.</p>
    </details>
    {p.loop && <p className={s.loopNotice}>Loop: notes {p.loop.startIndex + 1}–{p.loop.endIndex + 1} <button onClick={clearLoop}>Leave loop</button></p>}
  </section>;
}
