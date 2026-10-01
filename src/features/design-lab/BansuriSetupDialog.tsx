"use client";
import { useEffect, useId, useRef, useState } from 'react';
import { ROOT_NAMES, type PilotSession } from './usePilotSession';
import { evaluateBansuriSetup, type BansuriSetupMode } from '@/src/lib/bansuriSetup';
import { formatRelativeNote, midiToRelativeNote } from '@/src/lib/midiToSargam';
import s from './bansuri-setup.module.css';

export function pitchName(midi: number) { return `${ROOT_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`; }
const modes = [
  ['matching', 'Use a matching flute', 'Keep the source pitches. Choose a flute whose native Sa matches the song’s Sa.'],
  ['transpose', 'Transpose to my flute', 'Shift the song so its Sa matches your flute’s native Sa. Keep song-relative Sargam; the sounding key changes.'],
  ['original', 'Keep source pitches on my flute', 'Keep this score’s pitches and song-relative Sargam. Fingerings change for your flute.'],
] as const;

export function BansuriSetupDialog({ session: p }: { session: PilotSession }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId(), group = useId();
  const [mode, setMode] = useState<BansuriSetupMode>(p.setupMode);
  const [source, setSource] = useState(p.sourceSa);
  const [flute, setFlute] = useState(p.fluteSa);
  // Mount a fresh draft on each opening. Cancel never commits its values.
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    return () => { element?.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  const effectiveFlute = mode === 'matching' ? source : flute;
  const shift = mode === 'transpose' ? flute - source : 0;
  const songSa = mode === 'transpose' ? flute : source;
  const flags = evaluateBansuriSetup(p.sourceEvents, source, effectiveFlute, mode);
  const rootFingering = formatRelativeNote(midiToRelativeNote(songSa, effectiveFlute), 'Sargam_EN');
  const invalid = flags.midiOutOfRangeEventIndices.length > 0;
  const cancel = () => p.setBansuriSetupOpen(false);
  const selectPitch = (value: number, change: (midi: number) => void, label: string) => <label>{label}<select value={value} onChange={e => change(Number(e.target.value))}>{Array.from({ length: 48 }, (_, i) => i + 48).map(midi => <option key={midi} value={midi}>{pitchName(midi)}</option>)}{(value < 48 || value > 95) && <option value={value}>{pitchName(value)}</option>}</select></label>;
  return <dialog ref={dialog} className={s.dialog} aria-labelledby={title} onCancel={e => { e.preventDefault(); cancel(); }} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }}>
    <header><p>BANSURI · BEFORE YOU PLAY</p><h2 id={title}>Set up your bansuri</h2><p>Keep the source key, or adapt the song to your flute.</p></header>
    <div className={s.body}>
      <h3>{p.piece.title}</h3>
      {selectPitch(source, setSource, 'Source song Sa (confirm reference)')}
      <p className={s.hint}>Imported pitch reference: {pitchName(p.piece.rootMidi)}. A key or raga mode is not inferred. Confirm the song’s tonic; this is not the first note.</p>
      {source !== p.sourceSa && <p role="status">Changing Song Sa recalculates the Sargam labels. Transposition preserves labels relative to this newly confirmed tonic.</p>}
      <fieldset><legend>How would you like to play?</legend>{modes.map(([id, name, hint]) => <label key={id} className={s.choice} data-selected={mode === id}><input type="radio" name={group} value={id} checked={mode === id} onChange={() => setMode(id)} /><span><strong>{name}{id === 'matching' && <small>Recommended</small>}</strong><span>{hint}</span></span></label>)}</fieldset>
      {mode === 'matching' ? <p>Matching flute native Sa: <strong>{pitchName(source)}</strong></p> : selectPitch(flute, setFlute, 'My flute’s native Sa (three upper holes closed)')}
      <p className={s.hint}>Use the sounding pitch and octave, not an ambiguous maker’s key label or the all-holes-closed pitch.</p>
      <div className={s.preview} aria-live="polite"><h3>What will change</h3><dl><dt>Song Sa</dt><dd>{pitchName(songSa)}</dd><dt>Flute native Sa</dt><dd>{pitchName(effectiveFlute)}</dd><dt>Playback / pitch-name score / PDF</dt><dd>{shift ? `${shift > 0 ? '+' : ''}${shift} semitones` : 'Original pitches — unchanged'}</dd><dt>Song-relative Sargam</dt><dd>Unchanged relative to confirmed song Sa</dd><dt>Song Sa on this flute</dt><dd>{rootFingering} fingering · song label S</dd></dl></div>
      <p className={s.hint}>Generic six-hole fingering reference. Your flute’s playable range, half-holes and octave response need player confirmation. No automatic octave shifting.</p>
      {invalid && <p role="alert">This transposition exceeds the supported MIDI pitch range. Choose another flute octave.</p>}
    </div>
    <footer><button onClick={cancel}>Cancel</button><button disabled={invalid} onClick={() => p.applyBansuriSetup(mode, effectiveFlute, source)}>{p.playAfterSetup ? 'Apply and play' : 'Apply setup'}</button></footer>
  </dialog>;
}
