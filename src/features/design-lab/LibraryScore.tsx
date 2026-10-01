"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PilotSession } from './usePilotSession';
import { buildReadingScore } from '@/src/lib/readingScore';
import s from './reading-score.module.css';
import { readingScoreLayout } from '@/src/lib/readingScoreLayout';

export function LibraryScore({ session: p, onSelect }: { session: PilotSession; onSelect: (index: number) => void }) {
  const [follow, setFollow] = useState(true);
  const viewport = useRef<HTMLDivElement>(null);
  const score = useMemo(() => buildReadingScore(p.events, p.piece.tempoBpm, p.piece.timeSignature), [p.events, p.piece.tempoBpm, p.piece.timeSignature]);
  const activeBar = score.barAt(p.transport.positionMs);
  useEffect(() => {
    const container = viewport.current;
    if (!container) return;
    // Dense beat groups need more room; never shrink glyphs until they overlap.
    const minimum = Math.max(240, ...score.bars.map(beats => 24 + beats.reduce((width, notes) => width + Math.max(1, notes.length) * 30 + 6, 0)));
    const resize = new ResizeObserver(() => {
      const layout = readingScoreLayout(container.clientWidth - 8, container.clientHeight, score.bars.length, minimum);
      container.style.setProperty('--score-columns', String(layout.columns));
      container.style.setProperty('--score-row-height', `${layout.rowHeight}px`);
      container.style.setProperty('--score-font-size', `${layout.fontSize}px`);
    });
    resize.observe(container);
    return () => resize.disconnect();
  }, [score]);
  useEffect(() => {
    const container = viewport.current;
    if (!container || !follow) return;
    const bar = container.querySelector<HTMLElement>(`[data-bar="${activeBar}"]`);
    if (!bar) return;
    const bounds = container.getBoundingClientRect(), target = bar.getBoundingClientRect();
    if (target.top < bounds.top || target.bottom > bounds.bottom) container.scrollTo({ top: container.scrollTop + target.top - bounds.top - 8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [activeBar, follow]);
  return <div className={s.reader}>
    <div className={s.tools}><span>{score.bars.length} bars · score{p.loop && ` · A–B: ${p.loop.startIndex + 1}–${p.loop.endIndex + 1}`}</span><label><input type="checkbox" checked={follow} onChange={e => setFollow(e.target.checked)} /> Follow playback</label></div>
    <div ref={viewport} className={s.viewport} tabIndex={0} aria-label="Complete Sargam score, scroll vertically" onWheel={() => setFollow(false)} onTouchMove={() => setFollow(false)} onKeyDown={e => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) setFollow(false); }}>
      <div className={s.bars} data-notation={p.notation}>{score.bars.map((beats, bar) => <section className={s.bar} data-bar={bar} key={bar} aria-label={`Bar ${bar + 1}`}>
        <span className={s.number}>{bar + 1}</span>
        <div className={s.beats} style={{ gridTemplateColumns: `repeat(${beats.length}, minmax(0, 1fr))` }}>{beats.map((notes, beat) => <div className={s.beat} key={beat}>
          {notes.length ? notes.map(note => <button key={note.index} className={s.note} data-onset={note.continued ? undefined : note.index} tabIndex={!note.continued && Math.max(0, p.transport.activeEventIndex) === note.index ? 0 : -1} aria-current={p.transport.activeEventIndex === note.index ? 'step' : undefined} aria-label={`Bar ${bar + 1}, beat ${beat + 1}, ${note.continued ? 'sustain ' : ''}${p.notes[note.index]}`} title={`${p.notes[note.index]} · ${Math.round(p.events[note.index].durationMs)} ms`} onClick={() => onSelect(note.index)} onKeyDown={event => {
            const index = event.key === 'ArrowRight' ? note.index + 1 : event.key === 'ArrowLeft' ? note.index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? p.notes.length - 1 : null;
            if (index === null) return;
            event.preventDefault(); event.stopPropagation();
            const next = Math.max(0, Math.min(p.notes.length - 1, index));
            setFollow(true); onSelect(next);
            viewport.current?.querySelector<HTMLButtonElement>(`[data-onset="${next}"]`)?.focus({ preventScroll: true });
          }}>{note.continued ? '—' : p.notes[note.index]}</button>) : <span className={s.rest} aria-label="Rest">·</span>}
        </div>)}</div>
      </section>)}</div>
    </div>
  </div>;
}
