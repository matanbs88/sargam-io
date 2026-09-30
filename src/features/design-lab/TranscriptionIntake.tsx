"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MAX_AUDIO_BYTES, type TranscriptionJob, type TranscriptionResult } from '@/src/lib/transcriptionJob';
import { normalizeYouTubeUrl } from '@/src/lib/transcription';
import { formatRelativeMidiEvents } from '@/src/lib/midiToSargam';
import s from './transcription-intake.module.css';

const endpoint = '/api/transcription-jobs';
export function TranscriptionIntake({ onPractice }: { onPractice: (result: TranscriptionResult) => void }) {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'mock' | 'klangio' | null>(null);
  const [job, setJob] = useState<TranscriptionJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const submission = useRef<Promise<TranscriptionJob> | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const activeGeneration = generation;
    const abort = new AbortController();
    fetch(endpoint, { signal: abort.signal }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setMode(data.mode); }).catch(e => { if (!abort.signal.aborted) setError(e.message); });
    return () => { abort.abort(); activeGeneration.current++; controller.current?.abort(); };
  }, []);
  useEffect(() => { if (job?.status === 'completed') resultHeading.current?.focus(); }, [job?.status]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    if (!file && !normalizeYouTubeUrl(url)) { setError('Paste a valid HTTPS YouTube video link or choose an audio file.'); return; }
    if (file && (!file.size || file.size > MAX_AUDIO_BYTES)) { setError('Choose a non-empty file up to 4 MB.'); return; }
    const run = ++generation.current; const abort = new AbortController(); controller.current = abort; submission.current = null;
    setBusy(true); setError(''); setJob(null);
    let currentId: string | undefined;
    try {
      const config = await fetch(endpoint, { signal: abort.signal }); const info = await config.json(); if (!config.ok) throw new Error(info.error); setMode(info.mode);
      let body: BodyInit; const headers: HeadersInit = {};
      if (file) { const data = new FormData(); data.set('audio', file); body = data; }
      else { headers['Content-Type'] = 'application/json'; body = JSON.stringify({ sourceUrl: url }); }
      // Let submission finish after UI cancellation, then cancel the returned
      // job. Otherwise a paid job could be orphaned before its id is received.
      submission.current = (async () => {
        const response = await fetch(endpoint, { method: 'POST', headers, body, signal: AbortSignal.timeout(60_000) });
        const value = await response.json();
        if (!response.ok) throw new Error(value.error ?? 'Unable to submit audio.');
        return value as TranscriptionJob;
      })();
      let next = await submission.current;
      currentId = next.id;
      if (generation.current !== run) { void fetch(`${endpoint}?id=${encodeURIComponent(next.id)}`, { method: 'DELETE', keepalive: true }); return; }
      const deadline = Date.now() + 12 * 60_000;
      while (true) {
        if (generation.current !== run) return;
        setJob(next);
        if (next.status === 'failed') throw new Error(next.message);
        if (next.status === 'completed' || next.status === 'cancelled') break;
        if (Date.now() > deadline) throw new Error('Conversion timed out. Please retry.');
        await new Promise<void>((resolve, reject) => {
          const cancelled = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
          const timer = setTimeout(() => { abort.signal.removeEventListener('abort', cancelled); resolve(); }, 1000);
          abort.signal.addEventListener('abort', cancelled, { once: true });
        });
        const poll = await fetch(`${endpoint}?id=${encodeURIComponent(next.id)}`, { signal: abort.signal, cache: 'no-store' });
        const data = await poll.json(); if (!poll.ok) throw new Error(data.error ?? 'Unable to read job status.');
        next = { ...data, cached: next.cached };
      }
    } catch (e) {
      if (generation.current === run && !abort.signal.aborted) setError(e instanceof Error ? e.message : 'Conversion failed. Retry the same source.');
      if (currentId && abort.signal.aborted) void fetch(`${endpoint}?id=${encodeURIComponent(currentId)}`, { method: 'DELETE', keepalive: true });
    } finally { if (generation.current === run) setBusy(false); }
  }
  async function cancel() {
    const cancelledRun = ++generation.current; controller.current?.abort();
    setError('Cancelling…');
    // Keep submission disabled until the remote id is known and cancellation is
    // acknowledged, so an immediate retry cannot reuse the soon-cancelled job.
    try {
      const submitted = await submission.current;
      if (submitted) await fetch(`${endpoint}?id=${encodeURIComponent(submitted.id)}`, { method: 'DELETE', signal: AbortSignal.timeout(10_000) });
    } catch { /* The stopped UI never promotes a late result to success. */ }
    finally {
      if (generation.current === cancelledRun) {
        setBusy(false); setJob(null);
        setError('Cancelled. Remote processing may still finish; you can start another request.');
      }
    }
  }
  return <section className={s.panel} aria-label="Song transcription">
    <p className={s.mode}>{mode === 'mock' ? 'MOCK PREVIEW · simulated conversion, not your song' : mode === 'klangio' ? 'KLANGIO · audio transcription' : 'Connecting to transcription service…'}</p>
    <form onSubmit={submit}>
      <fieldset disabled={busy}>
        <label htmlFor="song-source">YouTube link<input id="song-source" type="url" maxLength={2048} value={url} disabled={!!file} onChange={e => { setUrl(e.target.value); setError(''); setJob(null); }} placeholder="https://www.youtube.com/watch?v=…" aria-describedby="conversion-help" /></label>
        <div className={s.upload}><span>or upload audio</span><input ref={upload} id="song-audio" type="file" accept=".wav,.mp3,.m4a,.ogg,.flac" onChange={e => { setFile(e.target.files?.[0] ?? null); setJob(null); setError(''); }} aria-label="Upload audio" />{file && <button type="button" onClick={() => { setFile(null); if (upload.current) upload.current.value = ''; }}>Remove file</button>}</div>
        <p id="conversion-help">WAV, MP3, M4A, OGG or FLAC · up to 4 MB. Results stay in this server session for up to 30 minutes and can disappear earlier on restart. {mode === 'klangio' ? 'Audio is sent to Klangio for analysis.' : 'Mock mode uploads to our server but does not analyze audio or send it to a transcription provider.'} <Link href="/privacy">How your uploads are handled</Link></p>
        <button className={s.primary} type="submit">{error ? 'Retry conversion' : 'Convert to notes →'}</button>
      </fieldset>
      {busy && <button type="button" onClick={cancel}>Cancel</button>}
    </form>
    {busy && <div aria-busy="true"><label htmlFor="conversion-progress">{mode === 'mock' ? 'Simulated progress' : 'Conversion status'}</label><progress id="conversion-progress" max={100} value={job?.progress ?? undefined} /><p role="status">{job?.message ?? 'Submitting source…'}</p></div>}
    {error && <p className={s.error} role="alert">{error}</p>}
    {job?.status === 'cancelled' && <p role="status">{job.message}</p>}
    {job?.status === 'completed' && job.result && <div className={s.result}>
      <h2 ref={resultHeading} tabIndex={-1}>{job.result.title}</h2>
      <p>{job.message} {job.cached && 'Reused cached result — no new conversion.'}</p>
      <p>{job.result.noteEvents.length} notes · {Math.round(job.result.tempoBpm)} BPM · Sa reference: C4 (adjust in practice)</p>
      {!job.result.isDemo && <p>All pitched tracks are combined for this preview. Original MIDI retains tracks and pitch bends; the practice guide uses semitone notes.</p>}
      <div className={s.notes} aria-label="Sargam preview">{formatRelativeMidiEvents(job.result.noteEvents.slice(0, 32), 60, 'Sargam_EN').map((note, i) => <span key={i}>{note}</span>)}</div>
      <div className={s.actions}><button onClick={() => onPractice(job.result!)}>Open {job.result.isDemo ? 'demo ' : ''}score & practice →</button><a href={`${endpoint}?id=${encodeURIComponent(job.id)}&format=midi`} download>Download {job.result.isDemo ? 'demo ' : ''}MIDI</a></div>
    </div>}
  </section>;
}
