"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { PERFORMANCE_PIANO_KEYS } from "@/src/lib/pianoGeometry";
import { adaptiveKeyboardGeometry } from "@/src/lib/practiceKeyboard";
import { previewPixelsPerSecond } from "@/src/lib/previewWindow";
import { createNoteWindow } from "@/src/lib/noteWindow";
import { canvasResolution } from "@/src/lib/canvasResolution";
import { formatRelativeNote, midiToRelativeNote, type MidiNoteEvent, type NotationSystem } from "@/src/lib/midiToSargam";
import { isNoteSounding } from "@/src/lib/visualTimeline";
import { drawKeyboardCabinet } from "@/src/components/instruments/keyboardArtwork";

export type KeyboardRollProps = {
  activeEventIndex: number; events: readonly MidiNoteEvent[]; isPlaying: boolean;
  notationSystem: NotationSystem; playbackRate: number; rootMidi: number;
  readTimeMs: () => number;
  fitViewport?: boolean;
};
const W = 1200, H = 616, PPS = 110;

export function KeyboardRoll({ events, notationSystem, rootMidi, readTimeMs, playbackRate, fitViewport = false, title = "Piano", controls }: KeyboardRollProps & { title?: string; controls?: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const font = getComputedStyle(canvas).getPropertyValue(notationSystem === "Sargam_HI" ? "--font-sargam-devanagari" : "--font-sargam-sans").trim() || "sans-serif";
    let frame = 0;
    const pitches = events.map(n => n.midi);
    const visibleNotes = createNoteWindow(events);
    let previousWidth = -1;
    let keys: { midi: number; isBlack: boolean; x: number; w: number }[] = [];
    const draw = () => {
      const W = fitViewport ? Math.max(240, canvas.clientWidth) : 1200;
      const H = fitViewport ? Math.max(120, canvas.clientHeight) : 616;
      const KEY_END = H - (fitViewport ? 22 : 76), STRIKE = KEY_END - (fitViewport ? Math.min(120, H * .25) : 150);
      const pixelsPerSecond = fitViewport ? previewPixelsPerSecond(STRIKE, playbackRate) : PPS;
      if (previousWidth !== W) {
        keys = (fitViewport ? adaptiveKeyboardGeometry(pitches, W) : PERFORMANCE_PIANO_KEYS)
          .map(key => ({ ...key, x: key.left * W / 100, w: key.width * W / 100 }));
        previousWidth = W;
      }
      const resolution = canvasResolution(W, H, window.devicePixelRatio || 1);
      if (canvas.width !== resolution.width || canvas.height !== resolution.height) { canvas.width = resolution.width; canvas.height = resolution.height; }
      ctx.setTransform(resolution.scaleX, 0, 0, resolution.scaleY, 0, 0);
      ctx.fillStyle = "#101820"; ctx.fillRect(0, 0, W, H);
      const now = readTimeMs();
      const visible = visibleNotes(now, now + STRIKE / pixelsPerSecond * 1000);
      const active = new Set(visible.filter((n) => isNoteSounding(n, now)).map((n) => n.midi));
      for (const key of keys.filter((k) => !k.isBlack)) {
        ctx.strokeStyle = "#25343f"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(key.x, 0); ctx.lineTo(key.x, STRIKE); ctx.stroke();
      }
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, STRIKE); ctx.clip();
      for (const note of visible) {
        const key = keys.find((k) => k.midi === note.midi);
        if (!key || note.durationMs <= 0) continue;
        const height = note.durationMs / 1000 * pixelsPerSecond;
        const bottom = STRIKE - (note.startMs - now) / 1000 * pixelsPerSecond;
        const top = bottom - height;
        if (bottom < 0 || top > STRIKE) continue;
        const sounding = isNoteSounding(note, now);
        ctx.fillStyle = sounding ? "#ffe08a" : key.isBlack ? "#88b8e8" : "#80cfff";
        ctx.beginPath(); ctx.roundRect(key.x, top, key.w, height, Math.min(key.w / 2, height / 2)); ctx.fill();
        if (sounding) { ctx.strokeStyle = "#f4f7fa"; ctx.lineWidth = 2; ctx.stroke(); }
        const visibleBottom = Math.min(STRIKE, bottom);
        const visibleHeight = visibleBottom - Math.max(0, top);
        const labelSize = Math.min(15, (visibleHeight - 3) / (notationSystem === 'Sargam_HI' ? 1.5 : 1));
        if (labelSize >= 10 && key.w >= 18) {
          ctx.fillStyle = "#101820";
          ctx.font = `600 ${labelSize}px ${font}`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(formatRelativeNote(midiToRelativeNote(note.midi, rootMidi), notationSystem), key.x + key.w / 2, visibleBottom - Math.min(visibleHeight / 2, labelSize / 2 + 5), key.w - 4);
        }
      }
      ctx.restore();
      ctx.fillStyle = "#080f15"; ctx.fillRect(0, STRIKE, W, H - STRIKE);
      for (const black of [false, true]) for (const key of keys.filter((k) => k.isBlack === black)) {
        const height = black ? (KEY_END - STRIKE) * .64 : KEY_END - STRIKE;
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
          ctx.beginPath(); ctx.arc(key.x + key.w / 2, STRIKE + Math.max(8, height - 26), 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      drawKeyboardCabinet(ctx, title === "Harmonium", W, KEY_END, H - KEY_END);
      ctx.strokeStyle = fitViewport ? "#e3c690" : "#bb8b78"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, STRIKE); ctx.lineTo(W, STRIKE); ctx.stroke();
    };
    const animate = () => { draw(); frame = requestAnimationFrame(animate); };
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    animate(); return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [events, notationSystem, rootMidi, readTimeMs, title, fitViewport, playbackRate]);
  return <section aria-label={`${title} practice roll`} className="overflow-hidden rounded-lg bg-[#101820] text-[#f4f7fa]">
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <h3 className="text-base font-semibold">{title} <span className="ml-2 text-xs font-normal text-[#b7c5d0]">{fitViewport ? 'Adaptive range' : 'C3–C7'} · length = duration</span></h3>
      {controls}
    </header>
    <div className="overflow-x-auto"><canvas ref={canvasRef} role="img" aria-label={`${title} visual timing guide: notes align with keys; their length represents duration.`} className={`keyboard-surface block w-full ${fitViewport ? '' : 'min-w-[740px]'}`} style={fitViewport ? { height: 'clamp(360px, 34vw, 490px)' } : { aspectRatio: `${W}/${H}` }} /></div>
  </section>;
}
