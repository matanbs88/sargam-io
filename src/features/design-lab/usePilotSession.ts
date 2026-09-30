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

export type PracticePiece = { id?: string; title: string; artistOrSource?: string; rightsNote?: string; tempoBpm: number; timeSignature: string; rootMidi: number; noteEvents: readonly MidiNoteEvent[]; reviewIssues?: readonly string[] };
const DEFAULT_PIECE: PracticePiece = { ...PILOT, noteEvents: PILOT_EVENTS };

export const ROOT_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export function usePilotSession(piece: PracticePiece = DEFAULT_PIECE, catalogSelected = false) {
  const [sessionOpened, setOpened] = useState(false);
  const opened = sessionOpened || catalogSelected;
  const [instrument, setInstrument] = useState<'Piano' | 'Harmonium' | 'Bansuri'>('Piano');
  const [rootChoice, setRootChoice] = useState<{ piece: PracticePiece; value: number } | null>(null);
  const root = rootChoice?.piece === piece ? rootChoice.value : piece.rootMidi;
  const setRoot = (value: number) => setRootChoice({ piece, value });
  const [notation, setNotation] = useState<NotationSystem>('Sargam_EN');
  const [rate, setRate] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [double, setDouble] = useState(false);
  const [room, setRoom] = useState(false);
  const [bansuriVoice, setBansuriVoice] = useState<BansuriVoice>(DEFAULT_BANSURI_VOICE);
  const [bansuriArticulation, setBansuriArticulation] = useState<BansuriArticulation>('natural');
  const [bansuriExpression, setBansuriExpression] = useState<BansuriExpression>('plain');
  const [bansuriVolume, setBansuriVolume] = useState(85);
  const [corrections, setCorrections] = useState<{ piece: PracticePiece; events: readonly MidiNoteEvent[] } | null>(null);
  const sourceEvents = corrections?.piece === piece ? corrections.events : piece.noteEvents;
  const correctNote = (index: number, delta: -1 | 1) => setCorrections({ piece, events: adjustMidiEvent(sourceEvents, index, delta) });
  const resetCorrections = () => setCorrections(null);
  const events = useMemo(() => instrument === 'Bansuri' ? expressBansuri(sourceEvents,bansuriExpression) : sourceEvents, [sourceEvents,instrument,bansuriExpression]);
  const [loopChoice, setLoopChoice] = useState<{ piece: PracticePiece; value: EventLoopRange | null } | null>(null);
  const loop = loopChoice?.piece === piece ? loopChoice.value : null;
  const setLoop = (value: EventLoopRange | null) => setLoopChoice({ piece, value });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [pdf, setPdf] = useState<{ url: string; filename: string; events: readonly MidiNoteEvent[]; root: number; notation: NotationSystem; title: string } | null>(null);
  const pdfUrl = useRef<string | null>(null);
  const context = useRef<AudioContext | null>(null);
  const getContext = useCallback(() => {
    if (!context.current || context.current.state === 'closed') context.current = new AudioContext();
    return context.current;
  }, []);
  const transport = useEngineTransport({ events, isEnabled: opened, loopRange: loop, playbackRate: rate, getContext, instrument, enabled: soundEnabled, double, room, bansuriVoice, bansuriArticulation, bansuriVolume });
  useEffect(() => () => { if (context.current?.state !== 'closed') void context.current?.close(); context.current = null; }, []);
  useEffect(() => () => { if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current); }, []);
  const notes = useMemo(() => formatRelativeMidiEvents(events, root, notation), [events, root, notation]);
  async function download() {
    setExporting(true); setExportError('');
    try {
      const response = await fetch('/api/exports/sargam-pdf', { method: 'POST', signal: AbortSignal.timeout(30_000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events, rootMidi: root, rootLabel: `${ROOT_NAMES[((root % 12) + 12) % 12]}${Math.floor(root / 12) - 1}`, notation, title: piece.title, sourceCredit: piece.rightsNote, tempoBpm: piece.tempoBpm, timeSignature: piece.timeSignature, compact: true }) });
      if (!response.ok) throw new Error('Could not export the score. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
      pdfUrl.current = url;
      const filename = `${piece.title.replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 80) || 'score'}-sargam.pdf`;
      setPdf({ url, filename, events, root, notation, title: piece.title });
      const link = document.createElement('a'); link.href = url; link.download = filename;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { setExportError(error instanceof Error && error.name === 'TimeoutError' ? 'PDF preparation timed out. Your score is unchanged; try downloading again.' : error instanceof Error ? error.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  const generatedPdf = pdf?.events === events && pdf.root === root && pdf.notation === notation && pdf.title === piece.title ? pdf : null;
  return { piece, opened, setOpened, instrument, setInstrument, root, setRoot, notation, setNotation, rate, setRate, soundEnabled, setSoundEnabled, double, setDouble, room, setRoom, bansuriVoice, setBansuriVoice, bansuriArticulation, setBansuriArticulation, bansuriExpression, setBansuriExpression, bansuriVolume, setBansuriVolume, loop, setLoop, notes, transport, download, exporting, exportError, generatedPdf, correctNote, resetCorrections, hasCorrections: sourceEvents !== piece.noteEvents, sourceEvents,
    roll: { events, activeEventIndex: transport.activeEventIndex, isPlaying: transport.isPlaying, notationSystem: notation, playbackRate: rate, rootMidi: root, readTimeMs: transport.readTimeMs } };
}
export type PilotSession = ReturnType<typeof usePilotSession>;
