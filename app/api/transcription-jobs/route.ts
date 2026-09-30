import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { MAX_AUDIO_BYTES } from '@/src/lib/transcriptionJob';
import { createAudioTranscriptionProvider, type AudioSource } from '@/src/server/transcription/jobs/provider';
import { transcriptionJobs } from '@/src/server/transcription/jobs/service';

export const runtime = 'nodejs';
export const maxDuration = 60;
const COOKIE = 'sargam-transcription-session';
const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const ownerOf = (r: NextRequest) => r.cookies.get(COOKIE)?.value ?? '';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: HEADERS });

async function boundedBody(request: Request) {
  const limit = MAX_AUDIO_BYTES + 64 * 1024;
  if (Number(request.headers.get('content-length')) > limit) throw new Error('Upload must be at most 4 MB.');
  const reader = request.body?.getReader(); if (!reader) throw new Error('Missing request body.');
  const chunks: Uint8Array[] = []; let length = 0;
  try { while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > limit) throw new Error('Upload must be at most 4 MB.'); chunks.push(part.value); } }
  finally { await reader.cancel(); }
  const data = new Uint8Array(length); let offset = 0; for (const part of chunks) { data.set(part, offset); offset += part.length; }
  return new Request(request.url, { method: 'POST', headers: { 'Content-Type': request.headers.get('content-type') ?? '' }, body: data });
}
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    try {
      const provider = createAudioTranscriptionProvider();
      const response = json({ mode: provider.mode, maxAudioBytes: MAX_AUDIO_BYTES });
      if (!ownerOf(request)) response.cookies.set(COOKIE, randomUUID(), { httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:', path: '/', maxAge: 24 * 3600 });
      return response;
    } catch { return json({ error: 'Transcription provider configuration is incomplete.' }, 503); }
  }
  const owner = ownerOf(request); if (!owner) return json({ error: 'Session expired. Start again.' }, 401);
  if (request.nextUrl.searchParams.get('format') === 'midi') {
    const bytes = transcriptionJobs.midi(owner, id);
    if (!bytes) return json({ error: 'MIDI is not ready or has expired.' }, 404);
    return new Response(new Uint8Array(bytes), { headers: { ...HEADERS, 'Content-Type': 'audio/midi', 'Content-Disposition': 'attachment; filename="sargam-transcription.mid"' } });
  }
  const job = await transcriptionJobs.get(owner, id);
  return job ? json(job) : json({ error: 'This job expired or the server restarted. Submit again.' }, 404);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: 'Cross-origin requests are not accepted.' }, 403);
  const owner = ownerOf(request); if (!owner) return json({ error: 'Initialize the transcription session first.' }, 401);
  let source: AudioSource;
  try {
    const body = await boundedBody(request);
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const data = await body.formData(); const file = data.get('audio');
      if (!(file instanceof File) || !file.size || file.size > MAX_AUDIO_BYTES) return json({ error: 'Select a non-empty audio file up to 4 MB.' }, 400);
      if (!/\.(wav|mp3|m4a|ogg|flac)$/i.test(file.name)) return json({ error: 'Supported audio: WAV, MP3, M4A, OGG and FLAC.' }, 400);
      source = { kind: 'audio', file };
    } else {
      const value = await body.json();
      if (typeof value?.sourceUrl !== 'string' || value.sourceUrl.length > 2048) return json({ error: 'Provide a YouTube sourceUrl.' }, 400);
      source = { kind: 'youtube', url: value.sourceUrl };
    }
  } catch { return json({ error: 'Invalid request. Audio uploads must be at most 4 MB.' }, 400); }
  try { return json(await transcriptionJobs.submit(owner, source, createAudioTranscriptionProvider()), 202); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to start transcription.' }, 422); }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: 'Cross-origin requests are not accepted.' }, 403);
  const job = transcriptionJobs.cancel(ownerOf(request), request.nextUrl.searchParams.get('id') ?? '');
  return job ? json(job) : json({ error: 'Job not found.' }, 404);
}
