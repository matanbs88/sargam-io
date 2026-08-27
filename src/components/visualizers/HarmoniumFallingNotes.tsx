"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { PERFORMANCE_PIANO_KEYS } from "@/src/lib/pianoGeometry";
import type {
  HarmoniumReedMode,
  HarmoniumReverbMode,
} from "@/src/features/practice/useDigitalAccompaniment";
import { usePlaybackClock } from "@/src/lib/usePlaybackClock";

type HarmoniumFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly harmoniumReedMode: HarmoniumReedMode;
  readonly harmoniumReverbMode: HarmoniumReverbMode;
  readonly isPlaying: boolean;
  readonly notationSystem: NotationSystem;
  readonly onHarmoniumReedModeChange: (mode: HarmoniumReedMode) => void;
  readonly onHarmoniumReverbModeChange: (mode: HarmoniumReverbMode) => void;
  readonly playbackRate: number;
  readonly rootMidi: number;
};

const CANVAS_WIDTH = 1_600;
const ROLL_HEIGHT = 482;
const KEYBOARD_HEIGHT = 138;
const CANVAS_HEIGHT = ROLL_HEIGHT + KEYBOARD_HEIGHT;
const LOOK_AHEAD_SECONDS = 4;
const PIXELS_PER_SECOND = ROLL_HEIGHT / LOOK_AHEAD_SECONDS;

type CanvasKey = {
  readonly midi: number;
  readonly isBlack: boolean;
  readonly x: number;
  readonly width: number;
};

const CANVAS_KEYS: readonly CanvasKey[] = PERFORMANCE_PIANO_KEYS.map((key) => ({
  midi: key.midi,
  isBlack: key.isBlack,
  x: (key.left / 100) * CANVAS_WIDTH,
  width: (key.width / 100) * CANVAS_WIDTH,
}));

const CANVAS_KEY_BY_MIDI = new Map(
  CANVAS_KEYS.map((key) => [key.midi, key]),
);

function keyLabel(midi: number): string {
  const pitchClass = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ][((midi % 12) + 12) % 12];
  return `${pitchClass}${Math.floor(midi / 12) - 1}`;
}

function formatPlaybackTimestamp(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawHarmoniumCanvas(
  canvas: HTMLCanvasElement,
  events: readonly MidiNoteEvent[],
  activeEventIndex: number,
  notationSystem: NotationSystem,
  rootMidi: number,
  currentTimeMs: number,
): void {
  const context = canvas.getContext("2d");
  if (context === null) return;

  const devicePixelRatio = window.devicePixelRatio || 1;
  const pixelWidth = CANVAS_WIDTH * devicePixelRatio;
  const pixelHeight = CANVAS_HEIGHT * devicePixelRatio;
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const background = context.createLinearGradient(0, 0, 0, ROLL_HEIGHT);
  background.addColorStop(0, "#10100e");
  background.addColorStop(0.58, "#090b0e");
  background.addColorStop(1, "#17100a");
  context.fillStyle = background;
  context.fillRect(0, 0, CANVAS_WIDTH, ROLL_HEIGHT);

  const glow = context.createRadialGradient(
    CANVAS_WIDTH * 0.52,
    ROLL_HEIGHT,
    0,
    CANVAS_WIDTH * 0.52,
    ROLL_HEIGHT,
    CANVAS_WIDTH * 0.6,
  );
  glow.addColorStop(0, "rgba(231, 189, 114, 0.14)");
  glow.addColorStop(1, "rgba(231, 189, 114, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, CANVAS_WIDTH, ROLL_HEIGHT);

  const whiteKeys = CANVAS_KEYS.filter((key) => !key.isBlack);
  context.lineWidth = 1;
  for (const key of whiteKeys) {
    context.strokeStyle = "rgba(231, 189, 114, 0.09)";
    context.beginPath();
    context.moveTo(Math.round(key.x) + 0.5, 0);
    context.lineTo(Math.round(key.x) + 0.5, ROLL_HEIGHT);
    context.stroke();
  }

  for (const [index, event] of events.entries()) {
    const key = CANVAS_KEY_BY_MIDI.get(event.midi);
    if (key === undefined) continue;

    const height = Math.max(42, (event.durationMs / 1000) * PIXELS_PER_SECOND);
    const distanceFromStrike =
      ((event.startMs - currentTimeMs) / 1000) * PIXELS_PER_SECOND;
    const top = ROLL_HEIGHT - distanceFromStrike - height;
    const isActive = index === activeEventIndex;
    const isPast = event.startMs + event.durationMs < currentTimeMs;
    const radius = Math.min(14, key.width / 2, height / 2);

    context.save();
    context.globalAlpha = isPast ? 0.24 : 1;
    context.shadowColor = isActive
      ? "rgba(255, 240, 153, 0.78)"
      : "rgba(231, 189, 114, 0.38)";
    context.shadowBlur = isActive ? 19 : 12;

    const noteGradient = context.createLinearGradient(0, top, 0, top + height);
    if (isActive) {
      noteGradient.addColorStop(0, "#fff4af");
      noteGradient.addColorStop(0.5, "#e7bd72");
      noteGradient.addColorStop(1, "#ad6d27");
    } else {
      noteGradient.addColorStop(0, "#d99a42");
      noteGradient.addColorStop(0.45, "#a96625");
      noteGradient.addColorStop(1, "#6f3e17");
    }
    context.fillStyle = noteGradient;
    roundedRect(context, key.x + 1, top, Math.max(2, key.width - 2), height, radius);
    context.fill();

    context.shadowColor = "transparent";
    context.strokeStyle = isActive
      ? "rgba(255, 255, 255, 0.92)"
      : "rgba(255, 225, 157, 0.58)";
    context.lineWidth = 1;
    context.stroke();

    const label = formatRelativeNote(
      midiToRelativeNote(event.midi, rootMidi),
      notationSystem,
    );
    if (key.width >= 24 && height >= 30 && top < ROLL_HEIGHT) {
      context.fillStyle = isActive ? "#211307" : "rgba(255, 247, 211, 0.94)";
      context.font = notationSystem === "Sargam_HI"
        ? "700 12px sans-serif"
        : "700 11px ui-monospace, monospace";
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.fillText(
        label,
        key.x + key.width / 2,
        Math.min(ROLL_HEIGHT - 5, top + height - 8),
      );
    }
    context.restore();
  }

  context.save();
  context.strokeStyle = "#e7bd72";
  context.shadowColor = "rgba(231, 189, 114, 0.95)";
  context.shadowBlur = 18;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, ROLL_HEIGHT);
  context.lineTo(CANVAS_WIDTH, ROLL_HEIGHT);
  context.stroke();
  context.restore();

  const keyboardGradient = context.createLinearGradient(
    0,
    ROLL_HEIGHT,
    0,
    CANVAS_HEIGHT,
  );
  keyboardGradient.addColorStop(0, "#d7b375");
  keyboardGradient.addColorStop(0.08, "#9a5d25");
  keyboardGradient.addColorStop(0.12, "#f0cb83");
  keyboardGradient.addColorStop(1, "#6b3916");
  context.fillStyle = keyboardGradient;
  context.fillRect(0, ROLL_HEIGHT, CANVAS_WIDTH, KEYBOARD_HEIGHT);

  context.strokeStyle = "rgba(255, 229, 163, 0.74)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, ROLL_HEIGHT + 0.5);
  context.lineTo(CANVAS_WIDTH, ROLL_HEIGHT + 0.5);
  context.stroke();

  for (const key of whiteKeys) {
    const isActive = key.midi === events[activeEventIndex]?.midi;
    const isRoot = key.midi === rootMidi;
    const keyGradient = context.createLinearGradient(key.x, 0, key.x + key.width, 0);
    if (isActive) {
      keyGradient.addColorStop(0, "#c9872b");
      keyGradient.addColorStop(0.45, "#fff1a7");
      keyGradient.addColorStop(1, "#d79b3b");
    } else {
      keyGradient.addColorStop(0, "#cfb77e");
      keyGradient.addColorStop(0.43, "#fff4d0");
      keyGradient.addColorStop(1, "#c2a367");
    }
    context.fillStyle = keyGradient;
    context.fillRect(key.x, ROLL_HEIGHT, key.width, KEYBOARD_HEIGHT);
    context.strokeStyle = "rgba(69, 39, 17, 0.72)";
    context.strokeRect(key.x + 0.5, ROLL_HEIGHT + 0.5, key.width - 1, KEYBOARD_HEIGHT - 1);

    const relative = midiToRelativeNote(key.midi, rootMidi);
    context.fillStyle = "rgba(64, 37, 18, 0.68)";
    context.font = notationSystem === "Sargam_HI"
      ? "700 9px sans-serif"
      : "700 9px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText(
      formatRelativeNote(relative, notationSystem),
      key.x + key.width / 2,
      ROLL_HEIGHT + 13,
    );

    if (isRoot) {
      context.fillStyle = "#28b182";
      context.shadowColor = "rgba(40, 177, 130, 0.9)";
      context.shadowBlur = 11;
      context.beginPath();
      context.arc(key.x + key.width / 2, CANVAS_HEIGHT - 14, 5, 0, Math.PI * 2);
      context.fill();
      context.shadowColor = "transparent";
    }
  }

  for (const key of CANVAS_KEYS.filter((candidate) => candidate.isBlack)) {
    const isActive = key.midi === events[activeEventIndex]?.midi;
    context.fillStyle = isActive ? "#fff099" : "#21160d";
    context.shadowColor = isActive
      ? "rgba(255, 240, 153, 0.75)"
      : "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = isActive ? 14 : 9;
    roundedRect(context, key.x, ROLL_HEIGHT, key.width, 88, 5);
    context.fill();
    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(255, 235, 180, 0.24)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(key.x + 1, ROLL_HEIGHT + 1);
    context.lineTo(key.x + key.width - 1, ROLL_HEIGHT + 1);
    context.stroke();
  }
}

/**
 * Harmonium roll using the same fixed coordinate system as the piano roll.
 * The instrument palette changes, but note timing, lane geometry and strike
 * alignment remain identical across instruments.
 */
export function HarmoniumFallingNotes({
  activeEventIndex,
  events,
  harmoniumReedMode,
  harmoniumReverbMode,
  isPlaying,
  notationSystem,
  onHarmoniumReedModeChange,
  onHarmoniumReverbModeChange,
  playbackRate,
  rootMidi,
}: HarmoniumFallingNotesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phraseEndTimeMs = useMemo(
    () => events.length > 0
      ? events.reduce(
          (latestEnd, event) =>
            Math.max(latestEnd, event.startMs + event.durationMs),
          0,
        )
      : undefined,
    [events],
  );

  const currentTimeMs = usePlaybackClock({
    baseTimeMs: events[activeEventIndex]?.startMs ?? 0,
    endTimeMs:
      activeEventIndex === events.length - 1
        ? (events[activeEventIndex]?.startMs ?? 0) +
          (events[activeEventIndex]?.durationMs ?? 0)
        : undefined,
    isPlaying,
    phraseEndTimeMs,
    playbackRate,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    drawHarmoniumCanvas(
      canvas,
      events,
      activeEventIndex,
      notationSystem,
      rootMidi,
      currentTimeMs,
    );
  }, [activeEventIndex, currentTimeMs, events, notationSystem, rootMidi]);

  return (
    <section
      aria-label="Falling MIDI harmonium roll"
      className="relative overflow-hidden rounded-[0.9rem] border border-[#c78d46]/25 bg-[#090c10] shadow-[0_24px_64px_rgba(0,0,0,0.34)]"
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-[linear-gradient(180deg,rgba(12,14,17,0.96),rgba(12,14,17,0.78),transparent)] px-4 py-4 sm:px-5">
        <div>
          <h3 className="font-heading text-xl leading-none text-[#f4d58f] sm:text-2xl">
            Harmonium melody roll
          </h3>
          <p className="mt-1 text-[10px] font-bold text-white/65">
            Fixed pitch lanes · reed tone · note length follows duration
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-yellow-soft/45 bg-yellow-soft px-2.5 py-1 text-[10px] font-black text-charcoal shadow-[0_0_15px_rgba(255,240,153,0.2)]">
            {keyLabel(rootMidi)} = Sa
          </span>
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/35 p-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
            <span className="px-1.5">Reeds</span>
            {["single", "double"].map((mode) => (
              <button
                aria-pressed={harmoniumReedMode === mode}
                className={[
                  "rounded px-2 py-1 transition",
                  harmoniumReedMode === mode
                    ? "bg-[#e7bd72] text-[#211307] shadow-[0_0_12px_rgba(231,189,114,0.28)]"
                    : "text-white/45 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                key={mode}
                onClick={() => onHarmoniumReedModeChange(mode as HarmoniumReedMode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/35 p-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
            <span className="px-1.5">Space</span>
            {["dry", "room"].map((mode) => (
              <button
                aria-pressed={harmoniumReverbMode === mode}
                className={[
                  "rounded px-2 py-1 transition",
                  harmoniumReverbMode === mode
                    ? "bg-mint-emerald text-[#07121f] shadow-[0_0_12px_rgba(40,177,130,0.28)]"
                    : "text-white/45 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                key={mode}
                onClick={() => onHarmoniumReverbModeChange(mode as HarmoniumReverbMode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[620px] snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth">
        <canvas
          aria-label={`Harmonium roll from C3 to C7, current position ${formatPlaybackTimestamp(currentTimeMs)}`}
          className="block h-[620px] w-[1600px]"
          ref={canvasRef}
          role="img"
        />
      </div>

      <p className="border-t border-[#e7bd72]/15 bg-[#120d08] px-4 py-2.5 text-[9px] font-semibold leading-4 text-white/45 sm:px-5">
        Harmonium mode uses the same relative timeline and exact key lanes as the piano roll. Sa follows the selected tonic.
      </p>
    </section>
  );
}
