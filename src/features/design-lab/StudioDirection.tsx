"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { PILOT as study, PILOT_EVENTS as events } from './pilotData';
import { formatRelativeMidiEvents, type NotationSystem } from '@/src/lib/midiToSargam';
import { useEngineTransport } from '@/src/features/practice/useEngineTransport';
import { FallingNotesPianoRoll } from '@/src/components/visualizers/FallingNotesPianoRoll';
import { BansuriFallingNotes } from '@/src/components/visualizers/BansuriFallingNotes';
import { KeyboardRoll } from '@/src/components/visualizers/KeyboardRoll';
import styles from './studio.module.css';

const instruments = ['Piano', 'Harmonium', 'Bansuri'] as const;
const roots = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export function StudioDirection() {
  const [instrument, setInstrument] = useState<typeof instruments[number]>('Piano');
  const [root, setRoot] = useState(60);
  const [notation, setNotation] = useState<NotationSystem>('Sargam_EN');
  const [rate, setRate] = useState(1);
  const [double, setDouble] = useState(false);
  const [room, setRoom] = useState(false);
  const [bansuriVoice, setBansuriVoice] = useState<'procedural' | 'ventus-study'>('procedural');
  const [opened, setOpened] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const context = useRef<AudioContext | null>(null);
  const getContext = useCallback(() => {
    if (!context.current || context.current.state === 'closed') context.current = new AudioContext();
    return context.current;
  }, []);
  useEffect(() => () => { void context.current?.close(); context.current = null; }, []);
  const transport = useEngineTransport({ events, isEnabled: opened, loopRange: null, playbackRate: rate, getContext, instrument, enabled: true, double, room, bansuriVoice });
  const notes = useMemo(() => formatRelativeMidiEvents(events, root, notation), [root, notation]);
  const roll = { events, activeEventIndex: transport.activeEventIndex, isPlaying: transport.isPlaying, notationSystem: notation, playbackRate: rate, rootMidi: root, readTimeMs: transport.readTimeMs };
  async function download() {
    setExporting(true); setExportError('');
    try {
      const response = await fetch('/api/exports/sargam-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events, rootMidi: root, rootLabel: `${roots[root - 60]}4`, notation, title: study.title, tempoBpm: study.tempoBpm, timeSignature: study.timeSignature, compact: true }) });
      if (!response.ok) throw new Error('The score could not be exported. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = 'ode-to-joy-sargam.pdf'; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setExportError(error instanceof Error ? error.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  return <main className={styles.studio}>
    <header className={styles.header}><Link href="/design-lab">sargam<span> / studio</span></Link><span>DESIGN STUDY 01</span><Link href="/design-lab">All directions</Link></header>
    <div className={styles.layout}>
      <aside className={styles.library}>
        <p className={styles.eyebrow}>YOUR MUSIC</p><h1>Practice library</h1>
        <button className={styles.piece} onClick={() => setOpened(true)} aria-current={opened ? 'page' : undefined}><span className={styles.number}>01</span><strong>Ode to Joy</strong><span>Beethoven · Opening study</span><small>4 bars / 15 notes / Beginner</small></button>
        <p className={styles.libraryNote}>One phrase. Three instruments.<br />Find your way into the music.</p>
        <div className={styles.source}>SOURCE<br /><strong>Public-domain melody study</strong><p>This four-bar opening is a practice excerpt, not the full work.</p></div>
      </aside>
      <section className={styles.workspace}>
        {!opened ? <div className={styles.entry}><p className={styles.eyebrow}>THE PRACTICE ROOM</p><h2>A little music.<br />Your full attention.</h2><p>Begin with four bars of Ode to Joy. Listen, slow it down, and follow each note in your Sa.</p><button className={styles.primary} onClick={() => setOpened(true)}>Practice Ode to Joy</button><span>Choose your instrument once you enter.</span></div> : <>
          <div className={styles.title}><div><p className={styles.eyebrow}>BEETHOVEN / 4-BAR STUDY</p><h2>Ode to Joy</h2></div><button onClick={download} disabled={exporting}>{exporting ? 'Preparing score…' : 'Print / PDF'}</button></div>
          <div className={styles.setup}>
            <div className={styles.instruments} aria-label="Instrument">{instruments.map(item => <button key={item} aria-pressed={instrument === item} onClick={() => setInstrument(item)}>{item}</button>)}</div>
            <label>Sa<select value={root} onChange={event => setRoot(Number(event.target.value))}>{roots.map((name, index) => <option key={name} value={60 + index}>{name}4</option>)}</select></label>
            {instrument === 'Bansuri' && <label>Voice comparison<select value={bansuriVoice} onChange={event => setBansuriVoice(event.target.value as typeof bansuriVoice)}><option value="procedural">Procedural reference</option><option value="ventus-study">Ventus sustain · experimental</option></select><small>Single sampled anchor, C4–C5. Listening QA pending.</small></label>}
            <label>Notation<select value={notation} onChange={event => setNotation(event.target.value as NotationSystem)}><option value="Sargam_EN">Sargam</option><option value="Sargam_HI">देवनागरी</option><option value="ABC">C D E</option></select></label>
            {instrument === 'Harmonium' && <>
              <label>Reeds<select value={double ? 'double' : 'single'} onChange={event => setDouble(event.target.value === 'double')}><option value="single">Single</option><option value="double">Double</option></select></label>
              <label>Space<select value={room ? 'room' : 'dry'} onChange={event => setRoom(event.target.value === 'room')}><option value="dry">Dry</option><option value="room">Room</option></select></label>
            </>}
          </div>
          <div className={styles.roll}>{instrument === 'Piano' ? <FallingNotesPianoRoll {...roll} /> : instrument === 'Harmonium' ? <KeyboardRoll {...roll} title="Harmonium" /> : <BansuriFallingNotes {...roll} />}</div>
          <div className={styles.transport}><button className={styles.primary} onClick={() => void transport.togglePlayback()}>{transport.isLoading ? 'Cancel loading' : transport.isPlaying ? 'Pause' : 'Play'}</button><button onClick={transport.reset}>Restart</button><label className={styles.seek}>Position<input aria-label="Playback position" type="range" min={0} max={transport.durationMs} value={transport.positionMs} onChange={event => transport.seek(Number(event.target.value))} /><span>{(transport.positionMs / 1000).toFixed(1)} / {(transport.durationMs / 1000).toFixed(1)}s</span></label><label>Speed<select value={rate} onChange={event => setRate(Number(event.target.value))}>{[0.5, 0.75, 1, 1.25].map(speed => <option key={speed} value={speed}>{speed}×</option>)}</select></label></div>
          <div className={styles.phrase} aria-label="Phrase navigation">{notes.map((note, index) => <button key={index} aria-label={`Note ${index + 1}: ${note}`} aria-current={transport.activeEventIndex === index ? 'step' : undefined} onClick={() => transport.selectEvent(index)}>{note}</button>)}</div>
          <p className={styles.hint}>{roots[root - 60]}4 is Sa. Changing Sa changes the relative labels; it does not change the recorded pitches.</p>
          {(transport.error || exportError) && <p role="alert">{transport.error || exportError}</p>}
        </>}
      </section>
    </div>
  </main>;
}
