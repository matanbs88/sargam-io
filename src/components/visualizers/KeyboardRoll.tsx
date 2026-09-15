"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { PERFORMANCE_PIANO_KEYS } from "@/src/lib/pianoGeometry";
import { formatRelativeNote, midiToRelativeNote, type MidiNoteEvent, type NotationSystem } from "@/src/lib/midiToSargam";
import { isNoteSounding } from "@/src/lib/visualTimeline";
import { drawKeyboardCabinet } from "@/src/components/instruments/keyboardArtwork";

export type KeyboardRollProps = {
  activeEventIndex: number; events: readonly MidiNoteEvent[]; isPlaying: boolean;
  notationSystem: NotationSystem; playbackRate: number; rootMidi: number;
  readTimeMs: () => number;
};
const W = 1200, H = 616, KEY_END = 540, STRIKE = 390, PPS = 110;
const keys = PERFORMANCE_PIANO_KEYS.map((key) => ({ ...key, x: key.left * W / 100, w: key.width * W / 100 }));

export function KeyboardRoll({ events, notationSystem, rootMidi, readTimeMs, title = "Piano", controls }: KeyboardRollProps & { title?: string; controls?: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const font = getComputedStyle(canvas).getPropertyValue(notationSystem === "Sargam_HI" ? "--font-sargam-devanagari" : "--font-sargam-sans").trim() || "sans-serif";
    let frame = 0;
    const draw = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== W * ratio || canvas.height !== H * ratio) { canvas.width = W * ratio; canvas.height = H * ratio; }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = "#101820"; ctx.fillRect(0, 0, W, H);
      const now = readTimeMs();
      const active = new Set(events.filter((n) => isNoteSounding(n, now)).map((n) => n.midi));
      for (const key of keys.filter((k) => !k.isBlack)) {
        ctx.strokeStyle = "#25343f"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(key.x, 0); ctx.lineTo(key.x, STRIKE); ctx.stroke();
      }
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, STRIKE); ctx.clip();
      for (const note of events) {
        const key = keys.find((k) => k.midi === note.midi);
        if (!key || note.durationMs <= 0) continue;
        const height = note.durationMs / 1000 * PPS;
        const bottom = STRIKE - (note.startMs - now) / 1000 * PPS;
        const top = bottom - height;
        if (bottom < 0 || top > STRIKE) continue;
        const sounding = isNoteSounding(note, now);
        ctx.fillStyle = sounding ? "#ffe08a" : key.isBlack ? "#88b8e8" : "#80cfff";
        ctx.beginPath(); ctx.roundRect(key.x, top, key.w, height, Math.min(key.w / 2, height / 2)); ctx.fill();
        if (sounding) { ctx.strokeStyle = "#f4f7fa"; ctx.lineWidth = 2; ctx.stroke(); }
        if (height > 24) {
          ctx.fillStyle = "#101820";
          ctx.font = `600 15px ${font}`;
          ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillText(formatRelativeNote(midiToRelativeNote(note.midi, rootMidi), notationSystem), key.x + key.w / 2, bottom - 6, key.w - 4);
        }
      }
      ctx.restore();
      ctx.fillStyle = "#080f15"; ctx.fillRect(0, STRIKE, W, H - STRIKE);
      for (const black of [false, true]) for (const key of keys.filter((k) => k.isBlack === black)) {
        const height = black ? 93 : KEY_END - STRIKE;
        const pressed = active.has(key.midi);
        ctx.fillStyle = pressed ? "#ffe08a" : black ? "#121b23" : "#eeeade";
        ctx.beginPath(); ctx.roundRect(key.x + .6, STRIKE, key.w - 1.2, height - 1, [0, 0, black ? 2 : 3, black ? 2 : 3]); ctx.fill();
        // Small planar bevels, never radial/metallic shading.
        ctx.fillStyle = pressed ? "#d5b85c" : black ? "#080f15" : "#c6c2b8";
        ctx.fillRect(key.x + 1, STRIKE + height - 7, key.w - 2, 5);
        ctx.fillStyle = pressed ? "#fff0b2" : black ? "#35434e" : "#faf8f0";
        ctx.fillRect(key.x + (black ? 3 : 1.5), STRIKE + 2, key.w - (black ? 6 : 3), black ? 2 : height - 11);
        if (black) {
          ctx.fillStyle = pressed ? "#ffe08a" : "#1e2a34";
          ctx.fillRect(key.x + 3, STRIKE + 5, key.w - 6, height - 15);
        }
        if (!black && key.midi % 12 === 0) {
          ctx.fillStyle = "#465764"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`C${Math.floor(key.midi / 12) - 1}`, key.x + key.w / 2, KEY_END - 16);
        }
        if (key.midi === rootMidi) {
          ctx.fillStyle = black ? "#80cfff" : "#006d63";
          ctx.beginPath(); ctx.arc(key.x + key.w / 2, STRIKE + height - 26, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      drawKeyboardCabinet(ctx, title === "Harmonium", W, KEY_END);
      ctx.strokeStyle = "#bb8b78"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, STRIKE); ctx.lineTo(W, STRIKE); ctx.stroke();
      frame = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(frame);
  }, [events, notationSystem, rootMidi, readTimeMs, title]);
  return <section aria-label={`${title} practice roll`} className="overflow-hidden rounded-lg bg-[#101820] text-[#f4f7fa]">
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <h3 className="text-base font-semibold">{title} <span className="ml-2 text-xs font-normal text-[#b7c5d0]">C3–C7 · length = duration</span></h3>
      {controls}
    </header>
    <div className="overflow-x-auto"><canvas ref={canvasRef} role="img" aria-label={`${title} notes aligned to keys. Open Setup & notes for individual note controls.`} className="keyboard-surface block w-full min-w-[740px]" style={{ aspectRatio: `${W}/${H}` }} /></div>
  </section>;
}
