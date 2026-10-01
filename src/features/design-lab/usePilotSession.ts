"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PILOT, PILOT_EVENTS } from './pilotData';
export { PILOT, PILOT_EVENTS } from './pilotData';
import { formatRelativeMidiEvents, type NotationSystem } from '@/src/lib/midiToSargam';
import { useEngineTransport } from '@/src/features/practice/useEngineTransport';
import type { EventLoopRange } from '@/src/lib/playback';
import type { MidiNoteEvent } from '@/src/lib/midiToSargam';
import { DEFAULT_BANSURI_VOICE, type BansuriVoice } from '@/src/lib/ventusAudio';
import { expressBansuri, type BansuriArticulation, type BansuriExpression } from '@/src/lib/ventusPerformance';
import { adjustMidiEvent } from '@/src/lib/editableMidi';
import { evaluateBansuriSetup, projectBansuriSetup, type BansuriSetupMode } from '@/src/lib/bansuriSetup';
import { instrumentPart, resolveMelody, type MelodySource, type PracticePart } from '@/src/lib/practiceParts';

export type PracticePiece = MelodySource & { id?: string; title: string; artistOrSource?: string; rightsNote?: string; tempoBpm: number; timeSignature: string; rootMidi: number; noteEvents: readonly MidiNoteEvent[]; reviewIssues?: readonly string[] };
const DEFAULT_PIECE: PracticePiece = { ...PILOT, noteEvents: PILOT_EVENTS };

export const ROOT_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export function usePilotSession(piece: PracticePiece = DEFAULT_PIECE, catalogSelected = false) {
  const [sessionOpened, setOpened] = useState(false);
  const opened = sessionOpened || catalogSelected;
  const [instrument, setInstrument] = useState<'Piano' | 'Harmonium' | 'Bansuri'>('Piano');
  const [pianoPart, setPianoPart] = useState<PracticePart>('melody');
  const part = instrumentPart(instrument, pianoPart);
  const melody = useMemo(() => resolveMelody(piece.noteEvents, piece), [piece]);
  const partEvents = part === 'melody' ? melody.events : piece.noteEvents;
  const [rootChoice, setRootChoice] = useState<{ piece: PracticePiece; value: number } | null>(null);
  const sourceSa = rootChoice?.piece === piece ? rootChoice.value : piece.rootMidi;
  const setRoot = (value: number) => setRootChoice({ piece, value });
  const [fluteSetup, setFluteSetup] = useState<{ piece: PracticePiece; sourceSa: number; fluteSa: number; mode: BansuriSetupMode } | null>(null);
  const [bansuriSetupOpen, setBansuriSetupOpen] = useState(false);
  const [playAfterSetup, setPlayAfterSetup] = useState(false);
  const setupConfirmed = fluteSetup?.piece === piece && fluteSetup.sourceSa === sourceSa;
  const setupMode = setupConfirmed ? fluteSetup.mode : 'matching';
  const fluteSa = setupConfirmed ? fluteSetup.fluteSa : sourceSa;
  const [notation, setNotation] = useState<NotationSystem>('Sargam_EN');
  const [rate, setRate] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [double, setDouble] = useState(false);
  const [room, setRoom] = useState(false);
  const [bansuriVoice, setBansuriVoice] = useState<BansuriVoice>(DEFAULT_BANSURI_VOICE);
  const [bansuriArticulation, setBansuriArticulation] = useState<BansuriArticulation>('natural');
  const [bansuriExpression, setBansuriExpression] = useState<BansuriExpression>('plain');
  const [bansuriVolume, setBansuriVolume] = useState(85);
  const [corrections, setCorrections] = useState<{ piece: PracticePiece; part: PracticePart; events: readonly MidiNoteEvent[] } | null>(null);
  const sourceEvents = corrections?.piece === piece && corrections.part === part ? corrections.events : partEvents;
  const [setupError, setSetupError] = useState('');
  const correctNote = (index: number, delta: -1 | 1) => {
    const candidate = adjustMidiEvent(sourceEvents, index, delta);
    if (evaluateBansuriSetup(candidate, sourceSa, fluteSa, setupMode).midiOutOfRangeEventIndices.length) {
      if (instrument === 'Bansuri') { setSetupError('That correction exceeds the selected transposition range. Change flute octave or reset setup.'); return; }
      setFluteSetup(null);
    }
    setSetupError(''); setCorrections({ piece, part, events: candidate });
  };
  const resetCorrections = () => setCorrections(null);
  const projection = useMemo(() => projectBansuriSetup(sourceEvents, sourceSa, fluteSa, instrument === 'Bansuri' ? setupMode : 'matching'), [sourceEvents, sourceSa, fluteSa, setupMode, instrument]);
  const root = instrument === 'Bansuri' ? projection.songSa : sourceSa;
  const events = useMemo(() => instrument === 'Bansuri' ? expressBansuri(projection.events,bansuriExpression) : sourceEvents, [sourceEvents,instrument,bansuriExpression,projection]);
  const [loopChoice, setLoopChoice] = useState<{ piece: PracticePiece; part: PracticePart; value: EventLoopRange | null } | null>(null);
  const loop = loopChoice?.piece === piece && loopChoice.part === part ? loopChoice.value : null;
  const setLoop = (value: EventLoopRange | null) => setLoopChoice({ piece, part, value });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [pdf, setPdf] = useState<{ url: string; filename: string; events: readonly MidiNoteEvent[]; root: number; notation: NotationSystem; title: string } | null>(null);
  const pdfUrl = useRef<string | null>(null);
  const context = useRef<AudioContext | null>(null);
  const getContext = useCallback(() => {
    if (!context.current || context.current.state === 'closed') context.current = new AudioContext();
    return context.current;
  }, []);
  const engineTransport = useEngineTransport({ events, isEnabled: opened, loopRange: loop, playbackRate: rate, getContext, instrument, enabled: soundEnabled, double, room, bansuriVoice, bansuriArticulation, bansuriVolume });
  const pendingPlay = useRef(false);
  const pendingSeek = useRef<number | null>(null);
  useEffect(() => {
    if (pendingSeek.current !== null && setupConfirmed && instrument === 'Bansuri') {
      const position = pendingSeek.current; pendingSeek.current = null; engineTransport.seek(position);
    }
    if (pendingPlay.current && setupConfirmed && instrument === 'Bansuri') {
      pendingPlay.current = false; engineTransport.togglePlayback();
    }
  }, [setupConfirmed, instrument, events, engineTransport]);
  const transport = { ...engineTransport, togglePlayback: () => {
    if (instrument === 'Bansuri' && !setupConfirmed && !engineTransport.isPlaying && !engineTransport.isLoading) {
      setPlayAfterSetup(true); setBansuriSetupOpen(true); return;
    }
    engineTransport.togglePlayback();
  } };
  const openBansuriSetup = () => { engineTransport.pause(); setPlayAfterSetup(false); setBansuriSetupOpen(true); };
  const applyBansuriSetup = (mode: BansuriSetupMode, selectedFluteSa: number, confirmedSourceSa: number) => {
    if (evaluateBansuriSetup(sourceEvents, confirmedSourceSa, selectedFluteSa, mode).midiOutOfRangeEventIndices.length) {
      setSetupError('Choose a flute octave that keeps the score within the supported pitch range.'); return;
    }
    setSetupError('');
    pendingSeek.current = engineTransport.readTimeMs();
    engineTransport.pause(); setRoot(confirmedSourceSa);
    setFluteSetup({ piece, sourceSa: confirmedSourceSa, fluteSa: mode === 'matching' ? confirmedSourceSa : selectedFluteSa, mode });
    setBansuriSetupOpen(false); pendingPlay.current = playAfterSetup;
  };
  useEffect(() => () => { if (context.current?.state !== 'closed') void context.current?.close(); context.current = null; }, []);
  useEffect(() => () => { if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current); }, []);
  const notes = useMemo(() => formatRelativeMidiEvents(events, root, notation), [events, root, notation]);
  const partTitle = `${piece.title} · ${part === 'melody' ? 'melody' : 'melody + harmony'}`;
  const exportTitle = instrument === 'Bansuri' ? `${partTitle} [${setupMode}; flute Sa ${ROOT_NAMES[projection.fluteSa % 12]}${Math.floor(projection.fluteSa / 12)-1}]` : partTitle;
  async function download() {
    setExporting(true); setExportError('');
    try {
      const setupCredit = instrument === 'Bansuri' ? `Bansuri setup: ${setupMode}; source Sa ${ROOT_NAMES[sourceSa % 12]}${Math.floor(sourceSa / 12)-1}; flute native Sa ${ROOT_NAMES[projection.fluteSa % 12]}${Math.floor(projection.fluteSa / 12)-1}; pitch shift ${projection.shift} semitones. Generic fingering reference.` : '';
      const response = await fetch('/api/exports/sargam-pdf', { method: 'POST', signal: AbortSignal.timeout(30_000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events, rootMidi: root, rootLabel: `${ROOT_NAMES[((root % 12) + 12) % 12]}${Math.floor(root / 12) - 1}`, notation, title: partTitle, sourceCredit: [piece.rightsNote, part === 'melody' ? melody.credit : 'Complete stored arrangement, including harmony.', setupCredit].filter(Boolean).join(' '), tempoBpm: piece.tempoBpm, timeSignature: piece.timeSignature, compact: true }) });
      if (!response.ok) throw new Error('Could not export the score. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
      pdfUrl.current = url;
      const filename = `${piece.title.replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 80) || 'score'}-sargam.pdf`;
      setPdf({ url, filename, events, root, notation, title: exportTitle });
      const link = document.createElement('a'); link.href = url; link.download = filename;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { setExportError(error instanceof Error && error.name === 'TimeoutError' ? 'PDF preparation timed out. Your score is unchanged; try downloading again.' : error instanceof Error ? error.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  const generatedPdf = pdf?.events === events && pdf.root === root && pdf.notation === notation && pdf.title === exportTitle ? pdf : null;
  return { piece, opened, setOpened, instrument, setInstrument, pianoPart, setPianoPart, part, melody, root, setRoot, notation, setNotation, rate, setRate, soundEnabled, setSoundEnabled, double, setDouble, room, setRoom, bansuriVoice, setBansuriVoice, bansuriArticulation, setBansuriArticulation, bansuriExpression, setBansuriExpression, bansuriVolume, setBansuriVolume, loop, setLoop, notes, transport, download, exporting, exportError, generatedPdf, correctNote, resetCorrections, hasCorrections: sourceEvents !== partEvents, sourceEvents,
    events, sourceSa, fluteSa: projection.fluteSa, setupMode, setupConfirmed, bansuriSetupOpen, setBansuriSetupOpen, playAfterSetup, openBansuriSetup, applyBansuriSetup, setupError,
    roll: { events, activeEventIndex: transport.activeEventIndex, isPlaying: transport.isPlaying, notationSystem: notation, playbackRate: rate, rootMidi: root, fluteRootMidi: projection.fluteSa, readTimeMs: transport.readTimeMs } };
}
export type PilotSession = ReturnType<typeof usePilotSession>;
