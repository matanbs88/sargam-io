"use client";

import { useEffect, useRef } from "react";
import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { PERFORMANCE_PIANO_KEYS } from "@/src/lib/pianoGeometry";
import { getPlaybackClockTime } from "@/src/lib/playbackClock";

type FallingNotesPianoRollProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly isPlaying: boolean;
  readonly notationSystem: NotationSystem;
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

function createCanvasKeyGeometry(): readonly CanvasKey[] {
  const whiteMidis = PERFORMANCE_PIANO_KEYS.filter((key) => !key.isBlack).map(
    (key) => key.midi,
  );
  const whiteIndexByMidi = new Map(
    whiteMidis.map((midi, index) => [midi, index]),
  );
  const whiteWidth = CANVAS_WIDTH / whiteMidis.length;
  const blackWidth = whiteWidth * 0.62;

  return PERFORMANCE_PIANO_KEYS.map((key) => {
    if (!key.isBlack) {
      return {
        midi: key.midi,
        isBlack: false,
        x: (whiteIndexByMidi.get(key.midi) ?? 0) * whiteWidth,
        width: whiteWidth,
      };
    }

    const precedingWhiteIndex = whiteIndexByMidi.get(key.midi - 1) ?? 0;
    return {
      midi: key.midi,
      isBlack: true,
      x: (precedingWhiteIndex + 1) * whiteWidth - blackWidth / 2,
      width: blackWidth,
    };
  });
}

const CANVAS_KEYS = createCanvasKeyGeometry();
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

function drawPianoCanvas(
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

  context.fillStyle = "#070a0f";
  context.fillRect(0, 0, CANVAS_WIDTH, ROLL_HEIGHT);

  const rollGlow = context.createRadialGradient(
    CANVAS_WIDTH * 0.5,
    ROLL_HEIGHT,
    0,
    CANVAS_WIDTH * 0.5,
    ROLL_HEIGHT,
    CANVAS_WIDTH * 0.62,
  );
  rollGlow.addColorStop(0, "rgba(88, 166, 255, 0.12)");
  rollGlow.addColorStop(1, "rgba(88, 166, 255, 0)");
  context.fillStyle = rollGlow;
  context.fillRect(0, 0, CANVAS_WIDTH, ROLL_HEIGHT);

  const whiteKeys = CANVAS_KEYS.filter((key) => !key.isBlack);
  context.lineWidth = 1;
  for (const key of whiteKeys) {
    context.strokeStyle = "rgba(255, 255, 255, 0.075)";
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
    const radius = Math.min(12, key.width / 2, height / 2);

    context.save();
    context.globalAlpha = isPast ? 0.24 : 1;
    context.shadowColor = isActive
      ? "rgba(255, 240, 153, 0.72)"
      : "rgba(40, 177, 130, 0.32)";
    context.shadowBlur = isActive ? 18 : 11;

    const gradient = context.createLinearGradient(0, top, 0, top + height);
    if (isActive) {
      gradient.addColorStop(0, "#fff7bb");
      gradient.addColorStop(1, "#f1d36a");
    } else {
      gradient.addColorStop(0, "#4eb59a");
      gradient.addColorStop(1, "#136052");
    }
    context.fillStyle = gradient;
    roundedRect(context, key.x + 1, top, Math.max(2, key.width - 2), height, radius);
    context.fill();

    context.shadowColor = "transparent";
    context.strokeStyle = isActive
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(190, 255, 237, 0.62)";
    context.lineWidth = 1;
    context.stroke();

    const label = formatRelativeNote(
      midiToRelativeNote(event.midi, rootMidi),
      notationSystem,
    );
    if (key.width >= 24 && height >= 30 && top < ROLL_HEIGHT) {
      context.fillStyle = isActive ? "#0f172a" : "rgba(255, 255, 255, 0.92)";
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
  context.strokeStyle = "#58a6ff";
  context.shadowColor = "rgba(88, 166, 255, 0.9)";
  context.shadowBlur = 18;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, ROLL_HEIGHT);
  context.lineTo(CANVAS_WIDTH, ROLL_HEIGHT);
  context.stroke();
  context.restore();

  context.fillStyle = "#d8d7d2";
  context.fillRect(0, ROLL_HEIGHT, CANVAS_WIDTH, KEYBOARD_HEIGHT);
  context.strokeStyle = "rgba(31, 41, 55, 0.84)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, ROLL_HEIGHT + 0.5);
  context.lineTo(CANVAS_WIDTH, ROLL_HEIGHT + 0.5);
  context.stroke();

  for (const key of whiteKeys) {
    const isActive = key.midi === events[activeEventIndex]?.midi;
    const isRoot = key.midi === rootMidi;
    context.fillStyle = isActive ? "#fff099" : "#ffffff";
    context.fillRect(key.x, ROLL_HEIGHT, key.width, KEYBOARD_HEIGHT);
    context.strokeStyle = "rgba(31, 41, 55, 0.78)";
    context.strokeRect(key.x + 0.5, ROLL_HEIGHT + 0.5, key.width - 1, KEYBOARD_HEIGHT - 1);

    if (key.midi % 12 === 0) {
      context.fillStyle = "rgba(15, 23, 42, 0.42)";
      context.font = "700 10px ui-monospace, monospace";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(keyLabel(key.midi), key.x + key.width / 2, ROLL_HEIGHT + 13);
    }

    if (isRoot) {
      context.fillStyle = "#28b182";
      context.shadowColor = "rgba(40, 177, 130, 0.75)";
      context.shadowBlur = 10;
      context.beginPath();
      context.arc(key.x + key.width / 2, ROLL_HEIGHT + KEYBOARD_HEIGHT - 14, 5, 0, Math.PI * 2);
      context.fill();
      context.shadowColor = "transparent";
    }
  }

  for (const key of CANVAS_KEYS.filter((candidate) => candidate.isBlack)) {
    const isActive = key.midi === events[activeEventIndex]?.midi;
    context.fillStyle = isActive ? "#fff099" : "#0f172a";
    context.shadowColor = isActive
      ? "rgba(255, 240, 153, 0.7)"
      : "rgba(0, 0, 0, 0.58)";
    context.shadowBlur = isActive ? 14 : 8;
    roundedRect(context, key.x, ROLL_HEIGHT, key.width, 88, 5);
    context.fill();
    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(255, 255, 255, 0.2)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(key.x + 1, ROLL_HEIGHT + 1);
    context.lineTo(key.x + key.width - 1, ROLL_HEIGHT + 1);
    context.stroke();
  }
}

/**
 * Canvas piano roll. The canvas and keyboard use one fixed coordinate system,
 * so a falling note and its physical key can never drift apart through CSS.
 */
export function FallingNotesPianoRoll({
  activeEventIndex,
  events,
  isPlaying,
  notationSystem,
  playbackRate,
  rootMidi,
}: FallingNotesPianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeMidi = events[activeEventIndex]?.midi ?? rootMidi;
  const activeKey = CANVAS_KEY_BY_MIDI.get(activeMidi);
  const baseTimeMs = events[activeEventIndex]?.startMs ?? 0;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (
      scrollContainer === null ||
      activeKey === undefined ||
      scrollContainer.scrollWidth <= scrollContainer.clientWidth
    ) {
      return;
    }

    const targetScrollLeft = Math.max(
      0,
      activeKey.x + activeKey.width / 2 - scrollContainer.clientWidth / 2,
    );
    scrollContainer.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }, [activeKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    let animationFrame = 0;
    const startedAt = performance.now();
    const safePlaybackRate = Number.isFinite(playbackRate)
      ? Math.min(Math.max(playbackRate, 0.25), 2)
      : 1;

    const renderFrame = (now: number) => {
      const currentTimeMs = getPlaybackClockTime({
        baseTimeMs,
        isPlaying,
        nowMs: now,
        playbackRate: safePlaybackRate,
        startedAtMs: startedAt,
      });
      drawPianoCanvas(
        canvas,
        events,
        activeEventIndex,
        notationSystem,
        rootMidi,
        currentTimeMs,
      );
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    animationFrame = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeEventIndex, baseTimeMs, events, isPlaying, notationSystem, playbackRate, rootMidi]);

  return (
    <section
      aria-label="Falling MIDI piano roll"
      className="relative overflow-hidden rounded-[0.9rem] border border-white/[0.08] bg-[#06090e] shadow-[0_24px_64px_rgba(0,0,0,0.32)]"
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-[linear-gradient(180deg,rgba(5,9,14,0.78),transparent)] px-4 py-3 sm:px-5">
        <div>
          <h3 className="font-heading text-xl leading-none text-white sm:text-2xl">Performance piano roll</h3>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Fixed pitch lanes · note length is drawn to duration
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-soft">
          C3 — C7
        </span>
      </div>

      <div
        className="h-[620px] snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
        ref={scrollContainerRef}
      >
        <canvas
          aria-label={`Piano roll from C3 to C7, current position ${formatPlaybackTimestamp(baseTimeMs)}`}
          className="block h-[620px] w-[1600px]"
          ref={canvasRef}
          role="img"
        />
      </div>
    </section>
  );
}
