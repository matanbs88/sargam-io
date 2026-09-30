import 'server-only';
import { Midi } from '@tonejs/midi';
import { PILOT, PILOT_EVENTS } from '@/src/features/design-lab/pilotData';
import type { TranscriptionResult } from '@/src/lib/transcriptionJob';

export type AudioSource = { kind: 'youtube'; url: string } | { kind: 'audio'; file: File };
export type ProviderState = 'queued' | 'processing' | 'completed' | 'failed';
export interface AudioTranscriptionProvider {
  mode: 'mock' | 'klangio';
  version: string;
  submit(source: AudioSource): Promise<string>;
  poll(id: string): Promise<{ status: ProviderState; progress: number | null }>;
  result(id: string): Promise<{ score: TranscriptionResult; midi: Uint8Array }>;
}

export class MockAudioProvider implements AudioTranscriptionProvider {
  mode = 'mock' as const;
  version = 'mock-ode-v1';
  async submit() { return String(Date.now()); }
  async poll(id: string) {
    const elapsed = Date.now() - Number(id);
    return { status: elapsed >= 3200 ? 'completed' as const : elapsed >= 800 ? 'processing' as const : 'queued' as const, progress: Math.min(100, Math.floor(elapsed / 32)) };
  }
  async result() {
    const midi = new Midi();
    midi.header.setTempo(PILOT.tempoBpm);
    const track = midi.addTrack();
    track.name = 'MOCK demo — not a transcription of your source';
    PILOT_EVENTS.forEach(n => track.addNote({ midi: n.midi, time: n.startMs / 1000, duration: n.durationMs / 1000, velocity: .75 }));
    return { score: { title: 'Demo · Ode to Joy', tempoBpm: PILOT.tempoBpm, timeSignature: '4/4', rootMidi: 60, noteEvents: PILOT_EVENTS.map(n => ({ ...n })), isDemo: true }, midi: midi.toArray() };
  }
}

/** Original MIDI bytes remain intact for export. The practice projection is
 * semitone-based; pitch bends and track editing need a subsequent score editor. */
export function scoreFromMidi(bytes: Uint8Array): TranscriptionResult {
  const midi = new Midi(bytes);
  const noteEvents = midi.tracks.filter(track => !track.instrument.percussion).flatMap(track => track.notes.map(n => ({ midi: n.midi, startMs: Math.round(n.time * 1000), durationMs: Math.max(1, Math.round(n.duration * 1000)), velocity: Math.round(n.velocity * 127) }))).sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  if (!noteEvents.length || noteEvents.length > 20_000 || noteEvents.some(n => !Number.isFinite(n.startMs) || !Number.isFinite(n.durationMs) || n.startMs < 0 || n.startMs + n.durationMs > 3_600_000)) throw new Error('The returned MIDI has no supported notes or exceeds the one-hour / 20,000-note limit.');
  return { title: 'Transcribed recording', tempoBpm: midi.header.tempos[0]?.bpm ?? 120, timeSignature: midi.header.timeSignatures[0]?.timeSignature.join('/') ?? '4/4', rootMidi: 60, noteEvents, isDemo: false };
}

export class KlangioAudioProvider implements AudioTranscriptionProvider {
  mode = 'klangio' as const;
  version = 'klangio-universal-midi-v1';
  constructor(private readonly key: string) {}
  private async request(path: string, init: RequestInit = {}) {
    const response = await fetch(`https://api.klang.io/${path}`, { ...init, headers: { 'kl-api-key': this.key }, signal: AbortSignal.timeout(30_000), cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'The transcription provider rejected the API credentials.' : response.status === 429 ? 'The provider is busy or its quota is exhausted. Try later.' : `Transcription provider returned HTTP ${response.status}.`);
    return response;
  }
  async submit(source: AudioSource) {
    // The documented public API accepts multipart audio. Do not invent a
    // YouTube parameter based on the vendor's separate consumer website.
    if (source.kind !== 'audio') throw new Error('Live YouTube acquisition is not connected. Upload the audio file, or use Mock mode to test the YouTube workflow.');
    const body = new FormData(); body.set('file', source.file); body.append('outputs', 'midi');
    const value = await (await this.request('transcription?model=universal', { method: 'POST', body })).json();
    if (typeof value.job_id !== 'string' || !/^[\w-]{1,200}$/.test(value.job_id)) throw new Error('The provider returned an invalid job identifier.');
    return value.job_id as string;
  }
  async poll(id: string) {
    const value = await (await this.request(`job/${encodeURIComponent(id)}/status`)).json();
    const states: Record<string, ProviderState> = { IN_QUEUE: 'queued', IN_PROGRESS: 'processing', COMPLETED: 'completed', FAILED: 'failed' };
    const status = states[value.status];
    if (!status) throw new Error('The provider returned an unknown job state.');
    return { status, progress: null };
  }
  async result(id: string) {
    const response = await this.request(`job/${encodeURIComponent(id)}/midi`);
    if (Number(response.headers.get('content-length')) > 4 * 1024 * 1024) throw new Error('Provider MIDI is too large.');
    const reader = response.body?.getReader(); if (!reader) throw new Error('Provider returned no MIDI.');
    const chunks: Uint8Array[] = []; let total = 0;
    try { while (true) { const item = await reader.read(); if (item.done) break; total += item.value.length; if (total > 4 * 1024 * 1024) throw new Error('Provider MIDI is too large.'); chunks.push(item.value); } }
    finally { await reader.cancel(); }
    const midi = new Uint8Array(total); let offset = 0; for (const chunk of chunks) { midi.set(chunk, offset); offset += chunk.length; }
    return { score: scoreFromMidi(midi), midi };
  }
}

/** The only provider selection boundary. Never put credentials in NEXT_PUBLIC_*. */
export function createAudioTranscriptionProvider(): AudioTranscriptionProvider {
  const mode = process.env.TRANSCRIPTION_PROVIDER ?? (process.env.KLANGIO_API_KEY ? 'klangio' : 'mock');
  if (mode === 'mock') return new MockAudioProvider();
  if (mode !== 'klangio' || !process.env.KLANGIO_API_KEY) throw new Error('Configure KLANGIO_API_KEY or select TRANSCRIPTION_PROVIDER=mock.');
  return new KlangioAudioProvider(process.env.KLANGIO_API_KEY);
}
