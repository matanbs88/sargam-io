/** Builds a small looped browser bank from measured, user-owned phrase sustains.
 * Originals are read-only. This is not the complete Kontakt articulation bank. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { decodePcmWav, analyzeWav } from './inspect-ventus-wav.mjs';
import { extractSustain, encodeMono16, spectrumPitch } from './prepare-ventus-candidate.mjs';

const source = process.argv[2];
if (!source) throw new Error('Pass the Ventus library root.');
const specs = [
  { file: 'Phrases_Close_212.wav', start: .3, end: 4, expected: 66 },
  { file: 'Phrases_Close_137.wav', start: .4, end: 2.2, expected: 69 },
  { file: 'Phrases_Close_136.wav', start: .5, end: 2.4, expected: 71 },
];
const directory = resolve('public/audio/bansuri'); await mkdir(directory, { recursive: true });
const manifest = [];
for (const spec of specs) {
  const original = await readFile(join(source, 'Phrases WAV', '5 UniqueNotesPhrases', spec.file));
  const wav = decodePcmWav(original);
  const samples = extractSustain(wav, spec.start, spec.end);
  const analysis = analyzeWav(encodeMono16(samples, wav.rate));
  const checks = [.2, .6, 1].map(t => spectrumPitch(samples.subarray(Math.round(t * wav.rate)), wav.rate).midi);
  if (checks.some(midi => Math.abs(midi - spec.expected) > .5)) throw new Error(`Pitch verification failed for ${spec.file}: ${checks}`);
  const measured = [...analysis.frames].map(f => f.midi).sort((a,b) => a-b);
  const midi = measured[Math.floor(measured.length / 2)];
  const head = Math.round(.2 * wav.rate), fade = Math.round(.06 * wav.rate);
  const end = samples.length - Math.round(.08 * wav.rate);
  // Blend the tail into the head, then resume just after the consumed head.
  // This preserves a finite attack and supports indefinite slow-tempo sustains.
  for (let i = 0; i < fade; i++) {
    const t = i / (fade - 1);
    samples[end - fade + i] = samples[end - fade + i] * (1-t) + samples[head + i] * t;
  }
  const bytes = encodeMono16(samples, wav.rate);
  const filename = `ventus-${spec.expected}.wav`;
  await writeFile(join(directory, filename), bytes);
  const seam = Math.abs(samples[end-1] - samples[head+fade]);
  manifest.push({ url: `/audio/bansuri/${filename}`, midi, loopStart: (head+fade)/wav.rate, loopEnd: end/wav.rate, source: spec.file, sourceSha256: createHash('sha256').update(original).digest('hex'), sha256: createHash('sha256').update(bytes).digest('hex'), seam, checks });
}
await writeFile(resolve('src/lib/ventusSamples.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
