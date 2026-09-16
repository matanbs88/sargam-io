/** Reproducible experimental sustain extraction. Source is read-only.
 * Outputs only to ignored output/ventus-candidates; never to public/ by default.
 * node scripts/prepare-ventus-candidate.mjs "path/to/Phrases_Close_212.wav"
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { decodePcmWav, analyzeWav } from './inspect-ventus-wav.mjs';

export function spectrumPitch(samples, rate) {
  // Independent frequency-domain peak check, not autocorrelation.
  const n = Math.min(samples.length, Math.round(rate * .2));
  if (n < 64) throw new Error('Spectral check requires at least 64 samples');
  const x = Float64Array.from(samples.subarray(0, n), (v, i) => v * (.5 - .5 * Math.cos(2 * Math.PI * i / (n - 1))));
  function power(hz) {
    const coefficient = 2 * Math.cos(2 * Math.PI * hz / rate);
    let prev = 0, prev2 = 0;
    for (const sample of x) { const next = sample + coefficient * prev - prev2; prev2 = prev; prev = next; }
    return prev2 * prev2 + prev * prev - coefficient * prev * prev2;
  }
  let hz = 0, best = -Infinity;
  for (let f = 100; f <= 1600; f += 2) { const p = power(f); if (p > best) { best = p; hz = f; } }
  const center = hz;
  for (let f = center - 2; f <= center + 2; f += .05) { const p = power(f); if (p > best) { best = p; hz = f; } }
  return { hz, midi: 69 + 12 * Math.log2(hz / 440) };
}
export function encodeMono16(samples, rate) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), 44 + i * 2));
  return buffer;
}
export function extractSustain(wav, start, end) {
  if (start < 0 || end > wav.duration || end <= start) throw new Error('Invalid trim bounds');
  const samples = wav.mono.slice(Math.round(start * wav.rate), Math.round(end * wav.rate));
  const fade = Math.min(Math.round(.025 * wav.rate), Math.floor(samples.length / 2));
  for (let i = 0; i < fade; i++) { const gain = Math.sin(i / fade * Math.PI / 2) ** 2; samples[i] *= gain; samples[samples.length - 1 - i] *= gain; }
  return samples;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const source = resolve(process.argv[2] || 'missing');
  if (basename(source) !== 'Phrases_Close_212.wav') throw new Error('This experiment is bound to inspected candidate 212.');
  const bytes = await readFile(source), wav = decodePcmWav(bytes);
  const start = .3, end = 4, extracted = extractSustain(wav, start, end);
  const checks = [.6, 1.5, 2.5, 3.5].map(seconds => ({ seconds, ...spectrumPitch(wav.mono.subarray(Math.round(seconds * wav.rate)), wav.rate) }));
  if (checks.some(check => Math.abs(check.midi - 66) > .3)) throw new Error('Independent pitch check rejected MIDI 66 anchor.');
  const destination = resolve('output/ventus-candidates'); await mkdir(destination, { recursive: true });
  const rendered = encodeMono16(extracted, wav.rate);
  const analysis = analyzeWav(rendered); delete analysis.frames;
  const report = { sourceFile: basename(source), sourceSha256: createHash('sha256').update(bytes).digest('hex'), outputSha256: createHash('sha256').update(rendered).digest('hex'), startSeconds: start, endSeconds: end, fadeMs: 25, outputBits: 16, checks, analysis, status: 'experimental-sustain-not-integrated', limitations: ['attack replaced by fade', 'no validated loop', 'no listening or browser QA yet'] };
  await writeFile(resolve(destination, 'ventus-fsharp4-sustain.wav'), rendered);
  await writeFile(resolve(destination, 'ventus-fsharp4-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
