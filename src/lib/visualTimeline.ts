import { getPlaybackClockTime } from "./playbackClock";

export type VisualClockOptions = {
  readonly baseTimeMs: number;
  readonly isPlaying: boolean;
  readonly playbackRate: number;
  readonly phraseEndTimeMs?: number;
};

/** Transitional clock for the event-based transport, not an audio scheduler. */
export class VisualTimeline {
  private options: VisualClockOptions;
  private anchorTimeMs: number;
  private anchorNowMs: number;

  constructor(options: VisualClockOptions, nowMs: number) {
    this.options = options;
    this.anchorTimeMs = options.baseTimeMs;
    this.anchorNowMs = nowMs;
  }

  sync(options: VisualClockOptions, nowMs: number): void {
    const previousTime = this.read(nowMs);
    const changedEvent = options.baseTimeMs !== this.options.baseTimeMs;
    const changedPlayback = options.isPlaying !== this.options.isPlaying;
    // Legacy transport resumes/restarts the selected event, not its offset.
    this.anchorTimeMs = changedEvent || changedPlayback
      ? options.baseTimeMs : previousTime;
    this.anchorNowMs = nowMs;
    this.options = options;
  }

  read(nowMs: number): number {
    const time = getPlaybackClockTime({
      baseTimeMs: this.anchorTimeMs,
      isPlaying: this.options.isPlaying,
      playbackRate: this.options.playbackRate,
      nowMs,
      startedAtMs: this.anchorNowMs,
    });
    const end = this.options.phraseEndTimeMs;
    return end !== undefined && Number.isFinite(end)
      ? Math.min(time, Math.max(0, end)) : time;
  }
}

type TimedNote = { readonly startMs: number; readonly durationMs: number };

export function isNoteSounding(note: TimedNote, timeMs: number): boolean {
  return timeMs >= note.startMs && timeMs < note.startMs + note.durationMs;
}

/** Units can be pixels or percentages, but must be consistent. No minimums. */
export function noteExtent(durationMs: number, unitsPerSecond: number): number {
  return Math.max(0, durationMs) / 1000 * unitsPerSecond;
}

export function horizontalNoteStart(
  startMs: number, timeMs: number, playhead: number, unitsPerSecond: number,
): number {
  return playhead + (startMs - timeMs) / 1000 * unitsPerSecond;
}
