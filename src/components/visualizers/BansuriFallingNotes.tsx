"use client";
import { useEffect, useRef, useState } from "react";
import { BansuriIllustration } from "@/src/components/instruments/BansuriIllustration";
import { getBansuriReferenceFingering } from "@/src/lib/bansuriFingering";
import { formatRelativeNote, midiToRelativeNote } from "@/src/lib/midiToSargam";
import { isNoteSounding } from "@/src/lib/visualTimeline";
import { pitchCentsAt, validatePitchCurve } from "@/src/lib/expressivePitch";
import type { KeyboardRollProps } from "./KeyboardRoll";

const W = 1000, H = 470, PLAY = 200, PPS = 150;
export function BansuriFallingNotes({ events, rootMidi, notationSystem, readTimeMs }: KeyboardRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const font = getComputedStyle(canvas).getPropertyValue(notationSystem === "Sargam_HI" ? "--font-sargam-devanagari" : "--font-sargam-sans").trim() || "sans-serif";
    const bounds = events.reduce(([lo, hi], n) => {
      const pitches = n.pitchCurve && validatePitchCurve(n.pitchCurve, n.durationMs)
        ? n.pitchCurve.map(p => n.midi + p.cents / 100) : [n.midi];
      return pitches.reduce(([a, b], p) => [Math.min(a, p), Math.max(b, p)], [lo, hi]);
    }, [rootMidi - 5, rootMidi + 12]);
    const minMidi = Math.floor(bounds[0]) - 1;
    const maxMidi = Math.ceil(bounds[1]) + 1;
    const y = (midi: number) => 30 + (maxMidi - midi) / (maxMidi - minMidi) * (H - 60);
    let frame = 0;
    let previous: number | null | undefined;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#101820"; ctx.fillRect(0, 0, W, H);
      const now = readTimeMs();
      const midi = events.find(n => isNoteSounding(n, now))?.midi ?? null;
      if (midi !== previous) { previous = midi; setActiveMidi(midi); }
      for (let pitch = minMidi; pitch <= maxMidi; pitch++) {
        const note = midiToRelativeNote(pitch, rootMidi);
        ctx.strokeStyle = pitch === rootMidi ? "#617b88" : "#22313b";
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y(pitch)); ctx.lineTo(W, y(pitch)); ctx.stroke();
        ctx.fillStyle = "#b7c5d0"; ctx.font = `12px ${font}`; ctx.textAlign = "left";
        ctx.fillText(formatRelativeNote(note, notationSystem), 6, y(pitch) - 3);
      }
      ctx.save(); ctx.beginPath(); ctx.rect(48, 0, W - 48, H); ctx.clip();
      for (const note of events) {
        const x = PLAY + (note.startMs - now) / 1000 * PPS;
        const width = note.durationMs / 1000 * PPS;
        if (width <= 0 || x + width < 48 || x > W) continue;
        ctx.fillStyle = isNoteSounding(note, now) ? "#ffe08a" : "#80cfff";
        ctx.beginPath(); ctx.roundRect(x, y(note.midi) - 9, width, 18, Math.min(width / 2, 9)); ctx.fill();
        if (note.pitchCurve && validatePitchCurve(note.pitchCurve, note.durationMs)) {
          ctx.strokeStyle = "#f4f7fa"; ctx.lineWidth = 3; ctx.beginPath();
          const steps = Math.max(2, Math.min(200, Math.ceil(width / 4)));
          for (let i = 0; i <= steps; i++) {
            const px = x + width * i / steps;
            const py = y(note.midi + pitchCentsAt(note.pitchCurve, note.durationMs * i / steps) / 100);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        if (width > 30) {
          ctx.fillStyle = "#101820"; ctx.font = `600 12px ${font}`; ctx.textAlign = "left";
          ctx.fillText(formatRelativeNote(midiToRelativeNote(note.midi, rootMidi), notationSystem), x + 7, y(note.midi) + 4, width - 12);
        }
      }
      ctx.restore();
      ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PLAY, 0); ctx.lineTo(PLAY, H); ctx.stroke();
      frame = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(frame);
  }, [events, notationSystem, rootMidi, readTimeMs]);
  const fingering = getBansuriReferenceFingering(activeMidi, rootMidi);
  const label = activeMidi === null ? "Rest" : formatRelativeNote(midiToRelativeNote(activeMidi, rootMidi), notationSystem);
  const register = activeMidi === null ? "" : `Register ${Math.floor((activeMidi - rootMidi) / 12)} relative to Sa`;
  return <section aria-label="Bansuri melody runway" className="overflow-hidden rounded-lg bg-[#101820] text-[#f4f7fa]">
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <h3 className="text-base font-semibold">Bansuri</h3>
      <span className="text-xs text-[#b7c5d0]">Pitch height · true duration · six-hole reference</span>
    </header>
    <div className="bansuri-surface grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[130px_minmax(0,1fr)]">
      <figure className="flex min-w-0 flex-col items-center justify-center px-2 pb-3">
        <figcaption className="mb-2 text-xl font-semibold text-[#ffe08a]">{label}</figcaption>
        <BansuriIllustration holes={fingering?.holes}/>
        <span className="mt-2 text-center text-[10px] text-[#b7c5d0]">{register}</span>
      </figure>
      <div className="min-w-0 overflow-x-auto"><canvas ref={canvasRef} role="img" aria-label="Bansuri pitch timeline. The adjacent flute shows the complete fingering, not one hole per pitch." className="block h-full min-h-[320px] w-full min-w-[480px]" /></div>
    </div>
    <p className="px-4 py-3 text-xs text-[#b7c5d0]">○ open · split half-covered · ✓ closed. Generic profile: register and breath technique require calibration.</p>
  </section>;
}
