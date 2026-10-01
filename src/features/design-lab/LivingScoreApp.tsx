"use client";

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { READY_PRACTICE_CATALOG } from '@/src/lib/practiceCatalog';
import { ScoreImportPanel } from '@/src/components/ScoreImportPanel';
import { usePilotSession, PILOT, PILOT_EVENTS, type PracticePiece } from './usePilotSession';
import { Settings, Roll, Transport } from './AlternativeDirections';
import { LivingScoreWorkspace } from './LivingScoreWorkspace';
import { LibraryScore } from './LibraryScore';
import { TranscriptionHome } from './TranscriptionHome';
import { browseCatalog, CATALOG_PAGE_SIZE } from '@/src/lib/catalogBrowse';
import { usePreviewNavigation, type PreviewScreen } from './usePreviewNavigation';
import s from './alternatives.module.css';
import a from './living-app.module.css';
import { IndianHome, IndianBrand, type IndianDirection } from './IndianDirections';
import indian from './indian-directions.module.css';
import { LOCAL_PRACTICE_DRAFT_KEY, readLocalPracticeDraft, saveLocalPracticeDraft, deleteLocalPracticeDraft } from '@/src/lib/localPracticeDraft';

const library = READY_PRACTICE_CATALOG;

export function LivingScoreApp({ direction, published = false }: { direction?: IndianDirection; published?: boolean } = {}) {
  const [piece, setPiece] = useState<PracticePiece>({ ...PILOT, noteEvents: PILOT_EVENTS });
  const [localPiece, setLocalPiece] = useState(false);
  const [savedDraft, setSavedDraft] = useState<PracticePiece | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [draftError, setDraftError] = useState('');
  useEffect(() => {
    let active = true;
    // Storage is browser-only. Do not read it during SSR or hydration, and
    // never autosave the initial demo over an existing imported draft.
    const load = () => {
      const result = readLocalPracticeDraft();
      if (!active) return;
      setSavedDraft(result.piece); setDraftError(result.error ?? ''); setDraftReady(true);
    };
    queueMicrotask(load);
    const changed = (event: StorageEvent) => {
      if (event.key === LOCAL_PRACTICE_DRAFT_KEY || event.key === null) load();
    };
    window.addEventListener('storage', changed);
    return () => { active = false; window.removeEventListener('storage', changed); };
  }, []);
  const navigation = usePreviewNavigation();
  const main = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [fullOnly, setFullOnly] = useState(false);
  const [sort, setSort] = useState<'title' | 'tempo'>('title');
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();
  const fullOnlyDescriptionId = useId();
  const [importNotice, setImportNotice] = useState('');
  const catalogPiece = useMemo(() => {
    const song = library.find(song => song.id === navigation.scoreId);
    return song?.noteEvents?.length ? { ...song, noteEvents: song.noteEvents } : null;
  }, [navigation.scoreId]);
  const currentPiece: PracticePiece = catalogPiece ?? piece;
  const p = usePilotSession(currentPiece, catalogPiece !== null);
  // Never silently substitute the demo or a saved draft for a missing session.
  // Explicit Restore is available after refresh, including on #practice.
  const unavailable = navigation.scoreId !== null && catalogPiece === null;
  const screen = navigation.screen === 'practice' && (!p.opened || unavailable) ? 'library' : navigation.screen;
  const pause = p.transport.pause;
  useEffect(() => {
    pause();
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  }, [screen, pause]);
  function open(next: PracticePiece, isLocal = false) {
    if (!next.noteEvents.length) { setImportNotice('No playable notes were found. Please import another score.'); return; }
    p.transport.pause(); p.setLoop(null); p.setRate(1); p.setRoot(next.rootMidi);
    setPiece(next); setLocalPiece(isLocal); p.setOpened(true);
    navigation.navigate('practice', isLocal ? null : next.id ?? null);
  }
  function saveDraft() {
    const result = saveLocalPracticeDraft({ ...currentPiece,
      noteEvents: p.part === 'arrangement' ? p.sourceEvents : currentPiece.noteEvents,
      ...(p.part === 'melody' ? { melodyEvents: p.sourceEvents, melodyCredit: p.melody.credit, melodyEstimated: p.melody.estimated } : {}),
    });
    setDraftError(result.error ?? '');
    setDraftMessage('');
    if (result.piece) {
      setSavedDraft(result.piece);
      setDraftMessage('Draft saved on this device. Saving another draft replaces it. Practice settings are not saved.');
    }
  }
  function restoreDraft() {
    // Re-read on activation so another tab's deletion is never resurrected.
    const result = readLocalPracticeDraft();
    setSavedDraft(result.piece); setDraftError(result.error ?? ''); setDraftMessage('');
    if (result.piece) {
      setImportNotice('Restored local review draft. Check the notes and choose your practice settings.');
      open(result.piece, true);
      setDraftMessage('Local score restored. Saved notes only; practice settings were not persisted.');
    } else if (!result.error) setDraftMessage('No saved local draft remains. Import or transcribe a score to save one.');
  }
  function deleteDraft() {
    const result = deleteLocalPracticeDraft();
    setDraftError(result.error ?? ''); setDraftMessage('');
    if (!result.error) {
      setSavedDraft(null);
      setDraftMessage('Saved local draft deleted. The open practice score is unchanged and will be lost on refresh unless saved again.');
    }
  }
  function navigate(next: PreviewScreen) {
    p.transport.pause();
    navigation.navigate(next);
  }
  function changePage(next: number) {
    setPage(next);
    // Pagination should land at the new results, not leave a mobile reader
    // stranded below the table at the previous page's scroll offset.
    const caption = main.current?.querySelector<HTMLTableCaptionElement>('caption');
    caption?.focus({ preventScroll: true });
    caption?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  const filtersActive = category !== 'All' || difficulty !== 'All' || sort !== 'title' || fullOnly;
  function clearFilters() {
    setQuery(''); setCategory('All'); setDifficulty('All'); setSort('title'); setFullOnly(false); setPage(0);
  }
  const results = browseCatalog(library, { query, category, difficulty, sort, page, fullOnly });
  const Home = direction ? IndianHome : TranscriptionHome;
  return <main ref={main} data-design-direction={direction} data-screen={screen} className={`${s.shell} ${s.scoreShell} ${a.app} ${direction ? `${indian.variant} ${indian[direction]}` : ''}`}>
    <nav className={s.nav} aria-label="Main navigation"><button className={a.brand} onClick={() => navigate('home')}>{direction ? <IndianBrand direction={direction}/> : 'sargam'}</button><div className={a.navLinks}>
      <button aria-current={screen === 'home' ? 'page' : undefined} onClick={() => navigate('home')}>Transcribe</button>
      <button aria-current={screen === 'library' ? 'page' : undefined} onClick={() => navigate('library')}>Library</button>
      <button aria-current={screen === 'import' ? 'page' : undefined} onClick={() => navigate('import')}>Import a score</button>
      {p.opened && <button aria-current={screen === 'practice' ? 'page' : undefined} onClick={() => navigate('practice')}>Resume practice</button>}
    </div></nav>
    {((localPiece && p.opened && !catalogPiece) || savedDraft || draftError) && <section aria-label="Local practice draft" className={a.notice}>
      <p>One local draft on this device only — not cloud-saved. Saves score notes and metadata, not source audio, links or practice settings. Save again after replacing the score.</p>
      {savedDraft && <p>Saved draft: {savedDraft.title}</p>}
      {screen === 'practice' && localPiece && !catalogPiece && <button disabled={!draftReady} onClick={saveDraft}>{savedDraft ? 'Replace saved local draft' : 'Save local draft'}</button>}
      <button disabled={!draftReady || !savedDraft} onClick={restoreDraft}>Restore local draft</button>
      <button disabled={!draftReady || (!savedDraft && !draftError)} onClick={deleteDraft}>Delete saved local draft</button>
      {draftMessage && <p role="status">{draftMessage}</p>}
      {draftError && <p role="alert">{draftError}</p>}
    </section>}
    {screen === 'home' && <Home direction={direction} onPractice={result => { setImportNotice(result.isDemo ? 'MOCK demo — these notes are not a transcription of your source.' : 'Machine transcription — review notes and choose your Sa. C4 is only the initial reference.'); open(result, !result.isDemo); }} onLibrary={() => navigate('library')} onImport={() => navigate('import')} onDemo={() => { setImportNotice('Demo study — these notes are not generated from your YouTube link.'); open({ ...PILOT, noteEvents: PILOT_EVENTS }); }} />}
    {screen === 'library' && <section className={a.library}>
      <header className={a.libraryHeading}><div><p className={s.kicker}>THE SARGAM COLLECTION</p><h1 tabIndex={-1}>Find your next song.</h1><p>Playable scores and clearly labelled studies. Choose a piece to practice or print.</p></div><button onClick={() => navigate('home')}>Transcribe a song →</button></header>
      {navigation.screen === 'practice' && (!p.opened || unavailable) && <p className={a.notice} role="status">{unavailable ? 'This library score is not available. Choose another piece below.' : 'Your previous in-memory session is unavailable. Open a library score or import your file again.'}{savedDraft && ' You can also restore your saved local draft above.'}</p>}
      <div className={a.filters}>
        <label>Search<input type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Title or composer" /></label>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', minHeight: 44, gap: 8 }}><input type="checkbox" checked={fullOnly} aria-describedby={fullOnlyDescriptionId} style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, padding: 0 }} onChange={e => { setFullOnly(e.target.checked); setPage(0); }} />Full pieces only</label>
          <small id={fullOnlyDescriptionId}>Only scores marked complete. Excludes excerpts, studies and unclassified scores.</small>
        </div>
        <button className={a.filterToggle} aria-label={filtersActive ? 'Library filters · active' : 'Library filters'} aria-expanded={filtersOpen} aria-controls={filtersId} onClick={() => setFiltersOpen(open => !open)}>Filters{filtersActive ? ' · active' : ''}</button>
        <div className={a.advancedFilters} id={filtersId} data-expanded={filtersOpen}>
        <label>Collection<select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>{['All', ...new Set(library.map(s => s.category))].map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Level<select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(0); }}>{['All', ...new Set(library.map(s => s.difficulty))].map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Sort<select value={sort} onChange={e => { setSort(e.target.value as 'title' | 'tempo'); setPage(0); }}><option value="title">Title A–Z</option><option value="tempo">Tempo: low to high</option></select></label>
        </div>
        {(query || filtersActive) && <button onClick={clearFilters}>Clear filters</button>}
        <span role="status">{results.total} {fullOnly ? 'full' : 'playable'} {results.total === 1 ? 'piece' : 'pieces'}</span>
      </div>
      {results.total ? <>
        <div className={a.tableWrap}><table className={a.songTable}><caption tabIndex={-1}>Playable Sargam scores · page {results.page + 1} of {results.pages}</caption><thead><tr><th scope="col">Title / composer</th><th scope="col">Collection</th><th scope="col">Level</th><th scope="col">Tempo</th><th scope="col"><span className={a.srOnly}>Open score</span></th></tr></thead><tbody>{results.items.map(song => <tr key={song.id}><td><strong>{song.title}</strong><small>{song.artistOrSource}</small></td><td>{song.category}</td><td>{song.difficulty}</td><td>{song.tempoBpm} BPM<small>{song.timeSignature}</small></td><td><button aria-label={`Open ${song.title}`} onClick={() => { setImportNotice(''); open({ ...song, noteEvents: song.noteEvents! }); }}>Open →</button></td></tr>)}</tbody></table></div>
        <nav className={a.pagination} aria-label="Library pages"><span>{results.page * CATALOG_PAGE_SIZE + 1}–{Math.min((results.page + 1) * CATALOG_PAGE_SIZE, results.total)} of {results.total}</span><button disabled={results.page === 0} onClick={() => changePage(results.page - 1)}>Previous</button><span>Page {results.page + 1} / {results.pages}</span><button disabled={results.page + 1 >= results.pages} onClick={() => changePage(results.page + 1)}>Next</button></nav>
      </> : <div className={a.empty}><h2>{fullOnly ? 'No matching full pieces' : 'No matching pieces'}</h2><p>{fullOnly ? 'Try another title, turn off Full pieces only or clear the filters.' : 'Try another title, clear the filters or bring a song of your own.'}</p><button onClick={clearFilters}>Clear filters</button><button onClick={() => navigate('home')}>Transcribe a song</button></div>}
    </section>}
    {screen === 'import' && <section className={a.import}>
      <p className={s.kicker}>FROM STAFF NOTATION TO SARGAM</p><h1 tabIndex={-1}>Bring your own score.</h1><p>MusicXML and MXL preserve notes and rhythm. PDF recognition is experimental and may need corrections.</p>
      {importNotice && <p role="status">{importNotice}</p>}
      <ScoreImportPanel onImported={score => { setImportNotice(score.validation.requiresReview ? score.validation.issues.map(i => i.message).join(' · ') || 'This imported score needs musical review.' : 'Imported score. Check Sa and timing before practice.'); open({ title: score.title, tempoBpm: 96, rootMidi: 60, timeSignature: score.timeSignature ?? '4/4', noteEvents: score.noteEvents, melodyEvents: score.melodyEvents, melodyCredit: score.melodyCredit, melodyEstimated: score.melodyEstimated, reviewIssues: score.validation.issues.map(i => i.message) }, true); }} />
      <p className={a.importFormats}>MusicXML / MXL: up to 6 MB. PDF: up to 12 MB. Use Save local draft in practice to keep the notes across refreshes. Unsaved drafts are temporary; keep your original file.</p>
      <aside><h2>What happens next?</h2><ol><li>Review the notes in your chosen notation.</li><li>Choose Sa, instrument and practice BPM.</li><li>Practice with the live score or download its PDF.</li></ol><p>Imports use the existing 96 BPM reference timeline. They are session drafts, not cloud-saved files.</p></aside>
      <p>Have a song instead of sheet music? <button className={a.textAction} onClick={() => navigate('home')}>Return to Transcribe →</button></p>
    </section>}
    {screen === 'practice' && <>
      <header className={s.heading}><div><p className={s.kicker}>LIVING SCORE · PRACTICE</p><h1 tabIndex={-1}>{currentPiece.title}</h1>{currentPiece.artistOrSource && <p className={a.pieceSource}>{currentPiece.artistOrSource}</p>}</div><button onClick={p.download} disabled={p.exporting}>{p.exporting ? 'Preparing…' : 'Download score'}</button></header>
      {catalogPiece?.category === 'Devotional' && <p className={a.notice}>Practice arrangement, not a transcription of a particular recording. Traditional melodies vary.</p>}
      {importNotice && <p className={a.notice} role="status">{importNotice}</p>}
      {p.generatedPdf && <p className={a.notice} role="status">Your PDF is ready. If the download did not start, <a href={p.generatedPdf.url} download={p.generatedPdf.filename}>save the generated score</a>.</p>}
      {!!currentPiece.reviewIssues?.length && <aside className={a.notice} aria-label="Source review issues"><h2>Review before sharing</h2><ul>{currentPiece.reviewIssues.map((issue, index) => <li key={index}>{issue}</li>)}</ul><p>Use Correct selected note in Settings for pitch edits. Rhythm and voice warnings require correcting the source and re-importing. Downloading does not certify these issues are resolved.</p></aside>}
      <LivingScoreWorkspace key={currentPiece.id ?? currentPiece.title + currentPiece.noteEvents.length} session={p} settings={<Settings session={p}/>} transport={<Transport session={p}/>} visualizer={<Roll session={p} fitViewport/>} renderScore={select => <LibraryScore session={p} onSelect={select}/>}/>
      {p.exportError && <p role="alert">{p.exportError}</p>}
    </>}
    <footer className={s.footer}>{published ? 'Sargam · playable scores and clearly labelled practice studies.' : <>Preview workspace · only pieces with playable notes are listed. <Link href={direction ? '/design-lab/indian' : '/design-lab'}>Compare design directions</Link></>}</footer>
  </main>;
}
