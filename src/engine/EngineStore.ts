import type { MidiNoteEvent } from "../lib/midiToSargam";

export interface AudioBackend {
  now(): number;
  prepare(events: readonly MidiNoteEvent[]): Promise<void>;
  schedule(event: MidiNoteEvent, when: number, duration: number, offset: number, rate: number): void;
  cancel(): void;
}
export type EngineSnapshot = Readonly<{
  playing: boolean; loading: boolean; index: number; positionMs: number;
  error: string | null;
}>;
export type TimeLoop = { startMs: number; endMs: number } | null;

/** Audio-clock transport. tick() fills the audio queue; it does not trigger notes now. */
export class EngineStore {
  private state: EngineSnapshot = { playing: false, loading: false, index: 0, positionMs: 0, error: null };
  private listeners = new Set<() => void>();
  private events: readonly MidiNoteEvent[] = [];
  private endMs = 0;
  private rate = 1;
  private loop: TimeLoop = null;
  private anchor = 0;
  private origin = 0;
  private cursor = 0;
  private generation = 0;
  constructor(private backend: AudioBackend) {}
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private publish(patch: Partial<EngineSnapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  setScore(events: readonly MidiNoteEvent[]) {
    this.pause();
    this.events = events;
    this.endMs = events.reduce((end, n) => Math.max(end, n.startMs + n.durationMs), 0);
    this.loop = null;
    this.seek(0);
  }
  setRate(rate: number) {
    if (!Number.isFinite(rate) || rate < 0.25 || rate > 2) throw new RangeError("Invalid tempo rate");
    if (rate === this.rate) return;
    const playing = this.state.playing;
    const position = this.readTimeMs();
    this.pause(); this.rate = rate; this.seek(position);
    if (playing) void this.play();
  }
  setLoop(loop: TimeLoop) {
    if (loop && (!Number.isFinite(loop.startMs) || !Number.isFinite(loop.endMs) || loop.startMs < 0 || loop.endMs > this.endMs || loop.endMs <= loop.startMs)) {
      throw new RangeError("Invalid loop");
    }
    const playing = this.state.playing;
    this.pause(); this.loop = loop;
    if (loop && (this.state.positionMs < loop.startMs || this.state.positionMs >= loop.endMs)) this.seek(loop.startMs);
    if (playing) void this.play();
  }
  private positionAt(now: number) {
    const raw = this.origin + Math.max(0, now - this.anchor) * 1000 * this.rate;
    if (this.loop) {
      const { startMs, endMs } = this.loop;
      return startMs + ((raw - startMs) % (endMs - startMs) + endMs - startMs) % (endMs - startMs);
    }
    return Math.min(this.endMs, raw);
  }
  readTimeMs = () => this.state.playing ? this.positionAt(this.backend.now()) : this.state.positionMs;
  private indexAt(position: number) {
    let index = 0;
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].startMs <= position) index = i;
      else break;
    }
    return index;
  }
  async play() {
    if (!this.events.length || this.state.playing || this.state.loading) return;
    const generation = ++this.generation;
    this.publish({ loading: true, error: null });
    try {
      await this.backend.prepare(this.events);
      if (generation !== this.generation) return;
      this.origin = this.state.positionMs >= this.endMs ? (this.loop?.startMs ?? 0) : this.state.positionMs;
      this.anchor = this.backend.now() + 0.06;
      this.cursor = this.anchor;
      this.publish({ playing: true, loading: false, positionMs: this.origin });
      this.tick();
    } catch (error) {
      if (generation !== this.generation) return;
      this.backend.cancel();
      this.publish({ playing: false, loading: false, error: error instanceof Error ? error.message : "Audio unavailable" });
    }
  }
  pause = () => {
    const positionMs = this.readTimeMs();
    ++this.generation;
    this.backend.cancel();
    this.publish({ playing: false, loading: false, positionMs, index: this.indexAt(positionMs) });
  };
  seek(positionMs: number) {
    if (!Number.isFinite(positionMs)) throw new RangeError("Invalid seek");
    this.pause();
    positionMs = Math.min(this.endMs, Math.max(0, positionMs));
    this.publish({ positionMs, index: this.indexAt(positionMs) });
  }
  toggle = () => { if (this.state.playing || this.state.loading) this.pause(); else void this.play(); };
  fail(error: unknown) {
    this.pause();
    this.publish({ error: error instanceof Error ? error.message : "Playback failed. Please retry." });
  }
  tick = () => {
    if (!this.state.playing) return;
    const now = this.backend.now();
    const positionMs = this.positionAt(now);
    if (!this.loop && positionMs >= this.endMs) { this.pause(); return; }
    const index = this.indexAt(positionMs);
    if (index !== this.state.index || Math.abs(positionMs - this.state.positionMs) >= 100) this.publish({ index, positionMs });
    // Recover from a stalled/background control thread without enqueueing the past.
    if (this.cursor < now) { this.backend.cancel(); this.cursor = now; }
    const horizon = now + 0.12;
    if (horizon <= this.cursor) return;
    let from = this.cursor;
    while (from < horizon) {
      const scoreFrom = this.positionAt(from);
      const scoreEnd = this.loop?.endMs ?? this.endMs;
      const until = Math.min(horizon, from + (scoreEnd - scoreFrom) / (1000 * this.rate));
      if (until <= from + 1e-9) break;
      for (const note of this.events) {
        const noteEnd = Math.min(note.startMs + note.durationMs, scoreEnd);
        const when = from + (note.startMs - scoreFrom) / (1000 * this.rate);
        const recovering = from === this.anchor || from === now || (this.loop !== null && Math.abs(scoreFrom - this.loop.startMs) < 1e-5);
        if (noteEnd <= scoreFrom || when >= until || (when < from - 1e-8 && !recovering)) continue;
        const actual = Math.max(from, when);
        const offsetMs = Math.max(0, scoreFrom - note.startMs);
        this.backend.schedule(note, actual, (noteEnd - Math.max(note.startMs, scoreFrom)) / (1000 * this.rate), offsetMs / 1000, this.rate);
      }
      from = until;
    }
    this.cursor = horizon;
  };
  dispose() { this.pause(); this.listeners.clear(); }
}
