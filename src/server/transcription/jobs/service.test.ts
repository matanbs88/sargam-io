import { afterEach, describe, expect, it, vi } from 'vitest';
import { TranscriptionJobs } from './service';
import { MockAudioProvider, KlangioAudioProvider, scoreFromMidi, type AudioTranscriptionProvider } from './provider';
const source = { kind: 'youtube' as const, url: 'https://youtu.be/abcdefghijk' };
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('audio transcription jobs', () => {
  it('deduplicates concurrent and canonical source requests within one session', async () => {
    const jobs = new TranscriptionJobs(); const provider = new MockAudioProvider(); const submit = vi.spyOn(provider, 'submit');
    const [a, b] = await Promise.all([jobs.submit('alice', source, provider), jobs.submit('alice', { kind: 'youtube', url: 'https://www.youtube.com/watch?v=abcdefghijk&t=42' }, provider)]);
    expect(a.id).toBe(b.id); expect(b.cached).toBe(true); expect(submit).toHaveBeenCalledTimes(1);
    expect(await jobs.get('bob', a.id)).toBeNull(); expect(jobs.midi('bob', a.id)).toBeUndefined();
  });
  it('simulates latency, completes a real MIDI, and labels every demo result', async () => {
    vi.useFakeTimers(); const jobs = new TranscriptionJobs(); const job = await jobs.submit('alice', source, new MockAudioProvider());
    expect((await jobs.get('alice', job.id))?.status).toBe('queued');
    vi.advanceTimersByTime(4000);
    const ready = await jobs.get('alice', job.id);
    expect(ready?.status).toBe('completed'); expect(ready?.result?.isDemo).toBe(true);
    expect(scoreFromMidi(jobs.midi('alice', job.id)!).noteEvents).toHaveLength(15);
    expect((await jobs.submit('alice', source, new MockAudioProvider())).cached).toBe(true);
    vi.advanceTimersByTime(31 * 60_000); expect(await jobs.get('alice', job.id)).toBeNull();
  });
  it('hashes file contents, not names, and separates sessions', async () => {
    const jobs = new TranscriptionJobs(); const provider = new MockAudioProvider();
    const a = await jobs.submit('a', { kind: 'audio', file: new File(['abc'], 'a.wav') }, provider);
    const b = await jobs.submit('a', { kind: 'audio', file: new File(['abc'], 'renamed.wav') }, provider);
    const c = await jobs.submit('b', { kind: 'audio', file: new File(['abc'], 'a.wav') }, provider);
    expect(a.id).toBe(b.id); expect(c.id).not.toBe(a.id);
  });
  it('does not let a late result revive a cancelled job', async () => {
    let resolve!: (state: { status: 'completed'; progress: number }) => void;
    const provider: AudioTranscriptionProvider = { ...new MockAudioProvider(), mode: 'mock', version: 'race', submit: async () => '1', poll: () => new Promise(r => { resolve = r; }), result: vi.fn() };
    const jobs = new TranscriptionJobs(); const job = await jobs.submit('a', source, provider); const reading = jobs.get('a', job.id);
    jobs.cancel('a', job.id); resolve({ status: 'completed', progress: 100 });
    expect((await reading)?.status).toBe('cancelled'); expect(provider.result).not.toHaveBeenCalled();
  });
  it('allows retry after failure and does not cache rejected submissions', async () => {
    const jobs = new TranscriptionJobs(); const provider = new MockAudioProvider();
    vi.spyOn(provider, 'submit').mockRejectedValueOnce(new Error('offline'));
    await expect(jobs.submit('a', source, provider)).rejects.toThrow('offline');
    expect((await jobs.submit('a', source, provider)).status).toBe('queued');
    await expect(jobs.submit('a', { kind: 'youtube', url: 'http://127.0.0.1/' }, provider)).rejects.toThrow();
  });
  it('keeps the live adapter off-network for unsupported YouTube input', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    await expect(new KlangioAudioProvider('test').submit(source)).rejects.toThrow('Live YouTube');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('uses documented multipart audio contract and fails unknown provider states', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ job_id: 'job-1' })).mockResolvedValueOnce(Response.json({ status: 'UNEXPECTED' })); vi.stubGlobal('fetch', fetcher);
    const provider = new KlangioAudioProvider('test-key');
    expect(await provider.submit({ kind: 'audio', file: new File(['audio'], 'test.wav') })).toBe('job-1');
    expect(fetcher.mock.calls[0][0]).toBe('https://api.klang.io/transcription?model=universal');
    expect(fetcher.mock.calls[0][1].headers['kl-api-key']).toBe('test-key');
    expect(fetcher.mock.calls[0][1].body.get('outputs')).toBe('midi');
    await expect(provider.poll('job-1')).rejects.toThrow('unknown');
  });
});
