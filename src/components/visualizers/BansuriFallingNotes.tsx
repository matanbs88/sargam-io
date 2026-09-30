"use client";
import { useEffect, useRef, useState } from "react";
import { BansuriIllustration } from "@/src/components/instruments/BansuriIllustration";
import { getBansuriReferenceFingering } from "@/src/lib/bansuriFingering";
import { formatRelativeNote, midiToRelativeNote } from "@/src/lib/midiToSargam";
import { isNoteSounding } from "@/src/lib/visualTimeline";
import { pitchCentsAt, validatePitchCurve } from "@/src/lib/expressivePitch";
import type { KeyboardRollProps } from "./KeyboardRoll";
import { previewPixelsPerSecond } from "@/src/lib/previewWindow";
import { createNoteWindow } from "@/src/lib/noteWindow";
import { canvasResolution } from "@/src/lib/canvasResolution";
import styles from './bansuri-runway.module.css';
import { bansuriArtworkY } from '@/src/lib/bansuriArtworkGeometry';

export function BansuriFallingNotes({ events, rootMidi, notationSystem, readTimeMs, playbackRate, fitViewport = false }: KeyboardRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluteRef = useRef<HTMLDivElement>(null);
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const font = getComputedStyle(canvas).getPropertyValue(notationSystem === "Sargam_HI" ? "--font-sargam-devanagari" : "--font-sargam-sans").trim() || "sans-serif";
    const visibleNotes = createNoteWindow(events);
    let frame = 0;
    let previous: number | null | undefined;
    const draw = () => {
      const W = fitViewport ? Math.max(160, canvas.clientWidth) : 1000;
      const H = Math.max(120, canvas.clientHeight);
      const PLAY = fitViewport ? Math.max(58, W * .2) : 200;
      const PPS = fitViewport ? previewPixelsPerSecond(W - PLAY, playbackRate) : 150;
      // Use the illustration's actual SVG transform, including letterboxing.
      // Octaves share fingering landmarks; their labels retain the register.
      const matrix = fluteRef.current?.querySelector('svg')?.getScreenCTM();
      const rect = canvas.getBoundingClientRect();
      const y = (midi: number) => {
        const artY = bansuriArtworkY(midi - rootMidi);
        return matrix && matrix.d > 0 && rect.height > 0
          ? (matrix.d * artY + matrix.f - rect.top) * H / rect.height
          : 28 + (artY - 30) / 1480 * (H - 56);
      };
      const resolution = canvasResolution(W, H, window.devicePixelRatio || 1);
      if (canvas.width !== resolution.width || canvas.height !== resolution.height) { canvas.width = resolution.width; canvas.height = resolution.height; }
      ctx.setTransform(resolution.scaleX, 0, 0, resolution.scaleY, 0, 0);
      ctx.fillStyle = "#101820"; ctx.fillRect(0, 0, W, H);
      const now = readTimeMs();
      const visible = visibleNotes(now - (PLAY - 48) / PPS * 1000, now + (W - PLAY) / PPS * 1000);
      const midi = visible.find(n => isNoteSounding(n, now))?.midi ?? null;
      if (midi !== previous) { previous = midi; setActiveMidi(midi); }
      for (let pitch = rootMidi - 5; pitch <= rootMidi + 6; pitch++) {
        const note = midiToRelativeNote(pitch, rootMidi);
        ctx.strokeStyle = pitch === rootMidi ? "#617b88" : "#22313b";
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y(pitch)); ctx.lineTo(W, y(pitch)); ctx.stroke();
        {
          ctx.fillStyle = "#b7c5d0"; ctx.font = `12px ${font}`; ctx.textAlign = "left";
          ctx.fillText(formatRelativeNote(note, notationSystem), 6, y(pitch) + 4);
        }
      }
      ctx.save(); ctx.beginPath(); ctx.rect(48, 0, W - 48, H); ctx.clip();
      for (const note of visible) {
        const x = PLAY + (note.startMs - now) / 1000 * PPS;
        const width = note.durationMs / 1000 * PPS;
        if (width <= 0 || x + width < 48 || x > W) continue;
        ctx.fillStyle = isNoteSounding(note, now) ? "#ffe08a" : "#80cfff";
        const bodyWidth = note.transition ? note.transition.onsetMs / 1000 * PPS : width;
        ctx.beginPath(); ctx.roundRect(x, y(note.midi) - 9, bodyWidth, 18, Math.min(bodyWidth / 2, 9)); ctx.fill();
        if (note.transition) {
          // Both gestures read as a connection. The extra gamak articulation is
          // audible, not a misleading oscillating ribbon over a held note.
          const from = x + bodyWidth, to = x + width;
          ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
          ctx.moveTo(from, y(note.midi));
          ctx.bezierCurveTo(from + (to-from)*.4, y(note.midi), to-(to-from)*.4, y(note.transition.targetMidi), to, y(note.transition.targetMidi));
          ctx.stroke(); ctx.lineCap = 'butt';
        } else if (note.pitchCurve && validatePitchCurve(note.pitchCurve, note.durationMs)) {
          ctx.strokeStyle = "#f4f7fa"; ctx.lineWidth = 3; ctx.beginPath();
          const steps = Math.max(2, Math.min(200, Math.ceil(width / 4)));
          for (let i = 0; i <= steps; i++) {
            const px = x + width * i / steps;
            const py = y(note.midi + pitchCentsAt(note.pitchCurve, note.durationMs * i / steps) / 100);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        const labelLeft = Math.max(48, x), labelRight = Math.min(W, x + bodyWidth);
        if (labelRight - labelLeft >= 18) {
          ctx.fillStyle = "#101820"; ctx.font = `600 12px ${font}`; ctx.textAlign = "center";
          ctx.fillText(formatRelativeNote(midiToRelativeNote(note.midi, rootMidi), notationSystem), (labelLeft + labelRight) / 2, y(note.midi) + 4, labelRight - labelLeft - 4);
        }
      }
      ctx.restore();
      ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PLAY, 0); ctx.lineTo(PLAY, H); ctx.stroke();
    };
    const animate = () => { draw(); frame = requestAnimationFrame(animate); };
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    animate(); return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [events, notationSystem, rootMidi, readTimeMs, fitViewport, playbackRate]);
  const fingering = getBansuriReferenceFingering(activeMidi, rootMidi);
  const label = activeMidi === null ? "Rest" : formatRelativeNote(midiToRelativeNote(activeMidi, rootMidi), notationSystem);
  const register = activeMidi === null ? "" : `Register ${Math.floor((activeMidi - rootMidi) / 12)} relative to Sa`;
  return <section aria-label="Bansuri melody runway" className="overflow-hidden rounded-lg bg-[#101820] text-[#f4f7fa]">
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <h3 className="text-base font-semibold">Bansuri</h3>
      <span className="text-xs text-[#b7c5d0]">Fingering lanes · true duration · octaves share landmarks</span>
    </header>
    <div style={{ height: fitViewport ? 'clamp(360px, 34vw, 490px)' : 470 }} className={`${styles.surface} bansuri-surface grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[130px_minmax(0,1fr)]`}>
      <figure className={styles.figure}>
        <figcaption className="mb-2 text-xl font-semibold text-[#ffe08a]">{label}</figcaption>
        <div ref={fluteRef} className={styles.flute}><BansuriIllustration holes={fingering?.holes}/></div>
        <div className={styles.compact} aria-label="Compact fingering, holes one to six from the blowing end">
          {Array.from({ length: 6 }, (_, i) => <svg key={i} viewBox="0 0 18 32" role="img" aria-label={`Hole ${i + 1}: ${fingering?.holes[i] ?? 'no note'}`}>
            <circle cx="9" cy="10" r="7" fill={fingering?.holes[i] === 'closed' ? '#93d6d0' : '#101820'} stroke="#b7c5d0" />
            {fingering?.holes[i] === 'half-open' && <path d="M2 10A7 7 0 0 0 16 10Z" fill="#93d6d0" />}
            <text x="9" y="29" textAnchor="middle" fontSize="9" fill="#b7c5d0">{i + 1}</text>
          </svg>)}
        </div>
        <span className="mt-2 text-center text-[10px] text-[#b7c5d0]">{register}</span>
      </figure>
      <div className="min-w-0 min-h-0 overflow-x-auto"><canvas ref={canvasRef} role="img" aria-label="Bansuri fingering timeline. Natural note lanes align with fingering landmarks; the flute shows the complete fingering." className={`block h-full w-full ${fitViewport ? '' : 'min-w-[480px]'}`} /></div>
    </div>
    <p className="px-4 py-3 text-xs text-[#b7c5d0]">Dark: open · split: half-covered · filled: closed. Generic six-hole reference; octave and breath technique require calibration.</p>
  </section>;
}
