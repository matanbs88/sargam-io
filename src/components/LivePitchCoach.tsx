"use client";
import { useEffect, useRef, useState } from "react";
import type { PitchEstimate } from "@/src/lib/pitchDetection";
import { centsFromSa } from "@/src/lib/expressivePitch";

/** Opt-in local tuner, deliberately not an uncalibrated accuracy score. */
export function LivePitchCoach({ rootMidi, getContext }: { rootMidi: number; getContext: () => AudioContext }) {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pitch, setPitch] = useState<PitchEstimate>(null);
  const cleanupRef = useRef<() => void>(() => {});
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; cleanupRef.current(); }, []);
  async function start() {
    const token = ++generation.current;
    setLoading(true); setError(null);
    let stream: MediaStream | null = null;
    let worker: Worker | null = null;
    const nodes: AudioNode[] = [];
    const cleanup = () => { stream?.getTracks().forEach(t => t.stop()); worker?.terminate(); nodes.forEach(n => n.disconnect()); };
    cleanupRef.current = cleanup;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone requires HTTPS or localhost and browser support.");
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      if (token !== generation.current) { cleanup(); return; }
      const ctx = getContext(); await ctx.resume();
      await ctx.audioWorklet.addModule("/audio/pitch-capture.js");
      if (token !== generation.current) { cleanup(); return; }
      worker = new Worker(new URL("../workers/pitch.worker.ts", import.meta.url), { type: "module" });
      const source = ctx.createMediaStreamSource(stream);
      const capture = new AudioWorkletNode(ctx, "sargam-pitch-capture");
      const silent = ctx.createGain(); silent.gain.value = 0;
      nodes.push(source, capture, silent);
      source.connect(capture).connect(silent).connect(ctx.destination);
      let busy = false;
      capture.port.onmessage = event => { if (!busy) { busy = true; worker?.postMessage(event.data, [event.data.samples.buffer]); } };
      worker.onmessage = event => { busy = false; if (token === generation.current) setPitch(event.data as PitchEstimate); };
      worker.onerror = () => {
        cleanup();
        if (token === generation.current) { setRunning(false); setError("Pitch analysis stopped. Please retry."); }
      };
      setRunning(true);
    } catch (cause) {
      cleanup(); if (token === generation.current) setError(cause instanceof Error ? cause.message : "Microphone unavailable");
    } finally { if (token === generation.current) setLoading(false); }
  }
  const cents = pitch ? centsFromSa(pitch.hz, 440 * 2 ** ((rootMidi - 69) / 12)) : null;
  return <details className="mt-3 rounded-lg bg-[#192630] p-4 text-[#f4f7fa]">
    <summary className="cursor-pointer text-sm font-medium">Live Sa tuner <span className="ml-2 text-xs text-[#b7c5d0]">Optional beta · microphone</span></summary>
    <p className="my-3 text-xs text-[#b7c5d0]">One voice or flute at a time. Use headphones. Audio stays on this device; nothing is recorded or uploaded. This is pitch guidance, not a scored performance.</p>
    <button className="min-h-11 rounded-md bg-[#80cfff] px-4 text-sm font-semibold text-[#101820]" type="button" onClick={() => {
      if (running || loading) { generation.current++; cleanupRef.current(); setRunning(false); setLoading(false); setPitch(null); }
      else void start();
    }}>{loading ? "Cancel microphone setup" : running ? "Stop microphone" : "Enable microphone"}</button>
    <output className="ml-4 text-sm tabular-nums">{running ? cents === null ? "Waiting for a clear note" : `${pitch!.hz.toFixed(1)} Hz · ${cents >= 0 ? "+" : ""}${Math.round(cents)} cents from Sa` : "Microphone off"}</output>
    {error && <p role="alert" className="mt-2 text-sm text-[#ffe08a]">{error}</p>}
  </details>;
}
