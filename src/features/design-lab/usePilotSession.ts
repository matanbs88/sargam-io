"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PILOT, PILOT_EVENTS } from './pilotData';
export { PILOT, PILOT_EVENTS } from './pilotData';
import { formatRelativeMidiEvents, type NotationSystem } from '@/src/lib/midiToSargam';
import { useEngineTransport } from '@/src/features/practice/useEngineTransport';
import type { EventLoopRange } from '@/src/lib/playback';

export const ROOT_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export function usePilotSession() {
  const [opened, setOpened] = useState(false);
  const [instrument, setInstrument] = useState<'Piano' | 'Harmonium' | 'Bansuri'>('Piano');
  const [root, setRoot] = useState(60);
  const [notation, setNotation] = useState<NotationSystem>('Sargam_EN');
  const [rate, setRate] = useState(1);
  const [double, setDouble] = useState(false);
  const [room, setRoom] = useState(false);
  const [bansuriVoice, setBansuriVoice] = useState<'procedural' | 'ventus-study'>('procedural');
  const [loop, setLoop] = useState<EventLoopRange | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const context = useRef<AudioContext | null>(null);
  const getContext = useCallback(() => {
    if (!context.current || context.current.state === 'closed') context.current = new AudioContext();
    return context.current;
  }, []);
  const transport = useEngineTransport({ events: PILOT_EVENTS, isEnabled: opened, loopRange: loop, playbackRate: rate, getContext, instrument, enabled: true, double, room, bansuriVoice });
  useEffect(() => () => { if (context.current?.state !== 'closed') void context.current?.close(); context.current = null; }, []);
  const notes = useMemo(() => formatRelativeMidiEvents(PILOT_EVENTS, root, notation), [root, notation]);
  async function download() {
    setExporting(true); setExportError('');
    try {
      const response = await fetch('/api/exports/sargam-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: PILOT_EVENTS, rootMidi: root, rootLabel: `${ROOT_NAMES[root - 60]}4`, notation, title: PILOT.title, tempoBpm: PILOT.tempoBpm, timeSignature: PILOT.timeSignature, compact: true }) });
      if (!response.ok) throw new Error('Could not export the score. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = 'ode-to-joy-sargam.pdf'; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setExportError(error instanceof Error ? error.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  return { opened, setOpened, instrument, setInstrument, root, setRoot, notation, setNotation, rate, setRate, double, setDouble, room, setRoom, bansuriVoice, setBansuriVoice, loop, setLoop, notes, transport, download, exporting, exportError,
    roll: { events: PILOT_EVENTS, activeEventIndex: transport.activeEventIndex, isPlaying: transport.isPlaying, notationSystem: notation, playbackRate: rate, rootMidi: root, readTimeMs: transport.readTimeMs } };
}
export type PilotSession = ReturnType<typeof usePilotSession>;
