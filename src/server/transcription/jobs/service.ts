import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { TranscriptionJob } from '@/src/lib/transcriptionJob';
import { normalizeYouTubeUrl } from '@/src/lib/transcription';
import { MAX_AUDIO_BYTES } from '@/src/lib/transcriptionJob';
import type { AudioSource, AudioTranscriptionProvider } from './provider';

type RecordEntry = { owner: string; key: string; created: number; job: TranscriptionJob; provider: AudioTranscriptionProvider; remote: string; midi?: Uint8Array; polling?: Promise<void>; lastPoll: number };
const TTL = 30 * 60_000;

/** Bounded single-instance pilot store. Replace this class with shared durable
 * jobs/cache and distributed idempotency before multi-instance paid deployment. */
export class TranscriptionJobs {
  private jobs = new Map<string, RecordEntry>();
  private pending = new Map<string, Promise<TranscriptionJob>>();
  private prune() { for (const [id, entry] of this.jobs) if (Date.now() - entry.created > TTL) this.jobs.delete(id); }
  async submit(owner: string, source: AudioSource, provider: AudioTranscriptionProvider) {
    this.prune();
    const hash = createHash('sha256');
    if (source.kind === 'youtube') { const url = normalizeYouTubeUrl(source.url); if (!url) throw new Error('Enter a valid HTTPS YouTube video link.'); source = { kind: 'youtube', url }; hash.update(url); }
    else { if (!source.file.size || source.file.size > MAX_AUDIO_BYTES) throw new Error('Choose a non-empty audio file up to 4 MB.'); hash.update(new Uint8Array(await source.file.arrayBuffer())); }
    const key = `${owner}:${provider.version}:${source.kind}:${hash.digest('hex')}`;
    const existing = [...this.jobs.values()].find(e => e.key === key && !['failed', 'cancelled'].includes(e.job.status));
    if (existing) return { ...existing.job, cached: true };
    const pending = this.pending.get(key); if (pending) return { ...await pending, cached: true };
    if (this.jobs.size + this.pending.size >= 128) throw new Error('The transcription queue is full. Please try later.');
    if ([...this.jobs.values()].filter(e => e.owner === owner && Date.now() - e.created < 60_000).length >= 5) throw new Error('Please wait one minute before starting another transcription.');
    const work = (async () => {
      const remote = await provider.submit(source);
      const job: TranscriptionJob = { id: randomUUID(), mode: provider.mode, status: 'queued', progress: provider.mode === 'mock' ? 0 : null, cached: false, message: provider.mode === 'mock' ? 'Simulated conversion — demo notes only.' : 'Queued at transcription provider.' };
      this.jobs.set(job.id, { owner, key, created: Date.now(), job, provider, remote, lastPoll: 0 });
      return { ...job };
    })();
    this.pending.set(key, work);
    try { return await work; } finally { this.pending.delete(key); }
  }
  private find(owner: string, id: string) { this.prune(); const entry = this.jobs.get(id); return entry?.owner === owner ? entry : undefined; }
  async get(owner: string, id: string): Promise<TranscriptionJob | null> {
    const entry = this.find(owner, id); if (!entry) return null;
    if (!['queued', 'processing'].includes(entry.job.status)) return { ...entry.job };
    if (!entry.polling && Date.now() - entry.lastPoll >= 700) {
      entry.polling = (async () => {
        try {
          if (Date.now() - entry.created > 12 * 60_000) throw new Error('Conversion timed out. Start a new request.');
          const state = await entry.provider.poll(entry.remote);
          if (entry.job.status === 'cancelled') return;
          if (state.status === 'failed') throw new Error('The provider could not transcribe this audio. Try a clearer recording.');
          if (state.status === 'completed') {
            const output = await entry.provider.result(entry.remote);
            if ((entry.job.status as string) === 'cancelled') return;
            entry.midi = output.midi;
            entry.job = { ...entry.job, status: 'completed', progress: 100, result: output.score, message: output.score.isDemo ? 'Demo ready — these notes do not come from your source.' : 'Transcription ready. Review the notes and choose your Sa before practice.' };
          } else entry.job = { ...entry.job, ...state, message: entry.provider.mode === 'mock' ? 'Simulating note detection — no audio analysis is performed.' : state.status === 'queued' ? 'Waiting in the provider queue.' : 'Analyzing audio. The provider does not report a percentage.' };
        } catch (error) { if (entry.job.status !== 'cancelled') entry.job = { ...entry.job, status: 'failed', progress: null, message: error instanceof Error ? error.message : 'Conversion failed.' }; }
        finally { entry.lastPoll = Date.now(); entry.polling = undefined; }
      })();
    }
    await entry.polling;
    return { ...entry.job };
  }
  cancel(owner: string, id: string) { const entry = this.find(owner, id); if (!entry) return null; if (entry.job.status !== 'completed') entry.job = { ...entry.job, status: 'cancelled', progress: null, message: 'Stopped waiting. A remote provider job may still finish.' }; return { ...entry.job }; }
  midi(owner: string, id: string) { return this.find(owner, id)?.midi; }
}

const shared = globalThis as typeof globalThis & { sargamTranscriptionJobs?: TranscriptionJobs };
export const transcriptionJobs = shared.sargamTranscriptionJobs ??= new TranscriptionJobs();
