"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { EngineStore } from "@/src/engine/EngineStore";
import { GuideVoiceBank, type VoiceSettings } from "@/src/engine/GuideVoiceBank";
import type { MidiNoteEvent } from "@/src/lib/midiToSargam";
import { normalizeLoopRange, type EventLoopRange } from "@/src/lib/playback";

export function useEngineTransport({ events, isEnabled, loopRange, playbackRate, getContext, instrument, enabled, double, room, bansuriVoice }: {
  events: readonly MidiNoteEvent[]; isEnabled: boolean; loopRange: EventLoopRange | null;
  playbackRate: number; getContext: () => AudioContext;
} & VoiceSettings) {
  const bank = useMemo(() => new GuideVoiceBank(getContext, { instrument: "Piano", enabled: false, double: false, room: false }), [getContext]);
  const engine = useMemo(() => new EngineStore(bank), [bank]);
  const state = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  useEffect(() => { engine.setScore(events); }, [engine, events]);
  useEffect(() => { engine.setRate(playbackRate); }, [engine, playbackRate]);
  useEffect(() => {
    const loop = normalizeLoopRange(loopRange, events.length);
    engine.setLoop(loop ? {
      startMs: events[loop.startIndex].startMs,
      endMs: events[loop.endIndex].startMs + events[loop.endIndex].durationMs,
    } : null);
  }, [engine, events, loopRange]);
  useEffect(() => {
    engine.pause(); bank.configure({ instrument, enabled, double, room, bansuriVoice });
  }, [engine, bank, instrument, enabled, double, room, bansuriVoice]);
  useEffect(() => { if (!isEnabled) engine.pause(); }, [engine, isEnabled]);
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        if (engine.getSnapshot().playing && bank.isInterrupted()) engine.fail(new Error("Audio was interrupted. Press play to resume."));
        else engine.tick();
      } catch (error) { engine.fail(error); }
    }, 25);
    return () => { clearInterval(timer); engine.dispose(); bank.dispose(); };
  }, [engine, bank]);
  const end = events.reduce((max, n) => Math.max(max, n.startMs + n.durationMs), 0);
  return {
    activeEvent: events[state.index], activeEventIndex: state.index,
    isPlaying: state.playing, isLoading: state.loading, error: state.error,
    lastEventIndex: events.length - 1, playbackProgress: end ? state.positionMs / end * 100 : 0,
    pause: engine.pause, reset: () => engine.seek(0), togglePlayback: engine.toggle,
    readTimeMs: engine.readTimeMs,
    positionMs: state.positionMs, durationMs: end, seek: (ms: number) => engine.seek(ms),
    selectEvent: (index: number) => engine.seek(events[index]?.startMs ?? 0),
    step: (direction: -1 | 1) => engine.seek(events[Math.max(0, Math.min(events.length - 1, state.index + direction))]?.startMs ?? 0),
  };
}
