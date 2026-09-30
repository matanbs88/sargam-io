import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from './route';

const address = 'http://localhost:3010/api/transcription-jobs';
beforeEach(() => vi.stubEnv('TRANSCRIPTION_PROVIDER', 'mock'));
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
describe('transcription job API boundaries', () => {
  it('runs the full Mock URL → poll → MIDI download contract', async () => {
    vi.useFakeTimers();
    const cookie = 'sargam-transcription-session=route-completion-owner';
    const started = await POST(new NextRequest(address, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ sourceUrl: 'https://youtu.be/abcdefghijk' }) }));
    const job = await started.json(); expect(started.status).toBe(202);
    vi.advanceTimersByTime(4000);
    const ready = await (await GET(new NextRequest(`${address}?id=${job.id}`, { headers: { cookie } }))).json();
    expect(ready.status).toBe('completed'); expect(ready.result.isDemo).toBe(true); expect(ready.result.noteEvents).toHaveLength(15);
    const midi = await GET(new NextRequest(`${address}?id=${job.id}&format=midi`, { headers: { cookie } }));
    expect(midi.headers.get('content-type')).toBe('audio/midi');
    expect(new TextDecoder().decode(new Uint8Array(await midi.arrayBuffer()).slice(0, 4))).toBe('MThd');
  });
  it('requires an initialized session before uploads', async () => {
    const response = await POST(new NextRequest(address, { method: 'POST', body: '{}' }));
    expect(response.status).toBe(401);
  });
  it('sets a private HttpOnly session and rejects cross-origin mutation', async () => {
    const response = await GET(new NextRequest(address));
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('cache-control')).toContain('no-store');
    const bad = await POST(new NextRequest(address, { method: 'POST', headers: { origin: 'https://unrelated.example' }, body: '{}' }));
    expect(bad.status).toBe(403);
  });
  it('rejects malformed JSON, oversized bodies and non-audio uploads', async () => {
    const headers = { cookie: 'sargam-transcription-session=test-owner', 'content-type': 'application/json' };
    expect((await POST(new NextRequest(address, { method: 'POST', headers, body: 'broken' }))).status).toBe(400);
    expect((await POST(new NextRequest(address, { method: 'POST', headers: { ...headers, 'content-length': '9999999' }, body: '{}' }))).status).toBe(400);
    const form = new FormData(); form.set('audio', new File(['data'], 'document.html'));
    expect((await POST(new NextRequest(address, { method: 'POST', headers: { cookie: headers.cookie }, body: form }))).status).toBe(400);
  });
  it('accepts mock audio, scopes jobs to their session and cancels them', async () => {
    const cookie = 'sargam-transcription-session=route-audio-owner';
    const form = new FormData(); form.set('audio', new File(['RIFF demo fixture'], 'test.wav', { type: 'audio/wav' }));
    const response = await POST(new NextRequest(address, { method: 'POST', headers: { cookie }, body: form }));
    expect(response.status).toBe(202); const job = await response.json();
    expect(job.mode).toBe('mock');
    const foreign = await GET(new NextRequest(`${address}?id=${job.id}`, { headers: { cookie: 'sargam-transcription-session=another-owner' } }));
    expect(foreign.status).toBe(404);
    const cancelled = await DELETE(new NextRequest(`${address}?id=${job.id}`, { method: 'DELETE', headers: { cookie } }));
    expect((await cancelled.json()).status).toBe('cancelled');
    expect((await GET(new NextRequest(`${address}?id=${job.id}&format=midi`, { headers: { cookie } }))).status).toBe(404);
  });
});
