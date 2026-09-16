/** Read-only PCM WAV pitch triage. Candidates require listening and loop QA.
 * Usage: node scripts/inspect-ventus-wav.mjs "vendor folder" [file limit]
 * Never modifies or copies source audio; reports JSON to stdout.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function decodePcmWav(bytes) {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Not RIFF WAVE');
  let fmt, data, sampler = null;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const id = bytes.toString('ascii', offset, offset + 4), size = bytes.readUInt32LE(offset + 4), start = offset + 8;
    if (start + size > bytes.length) throw new Error('Truncated WAV chunk');
    if (id === 'fmt ') {
      if (size < 16) throw new Error('Invalid fmt chunk');
      fmt = { encoding: bytes.readUInt16LE(start), channels: bytes.readUInt16LE(start + 2), rate: bytes.readUInt32LE(start + 4), align: bytes.readUInt16LE(start + 12), bits: bytes.readUInt16LE(start + 14) };
    }
    if (id === 'data') data = bytes.subarray(start, start + size);
    if (id === 'smpl' && size >= 36) sampler = { unityMidi: bytes.readUInt32LE(start + 12), loopCount: bytes.readUInt32LE(start + 28) };
    offset = start + size + (size % 2);
  }
  if (!fmt || !data || fmt.encoding !== 1 || ![16, 24, 32].includes(fmt.bits) || fmt.channels < 1 || fmt.rate < 4000 || fmt.align !== fmt.channels * fmt.bits / 8) throw new Error('Unsupported PCM format');
  const count = Math.floor(data.length / fmt.align), mono = new Float32Array(count);
  for (let frame = 0; frame < count; frame++) for (let ch = 0; ch < fmt.channels; ch++) {
    mono[frame] += data.readIntLE(frame * fmt.align + ch * fmt.bits / 8, fmt.bits / 8) / 2 ** (fmt.bits - 1) / fmt.channels;
  }
  return { ...fmt, mono, duration: count / fmt.rate, sampler };
}

export function estimatePitch(input, rate) {
  // Average decimation for bounded analysis cost. This is triage, not transcription.
  const stride = Math.max(1, Math.floor(rate / 12000)), sr = rate / stride;
  const x = new Float64Array(Math.floor(input.length / stride));
  for (let i = 0; i < x.length; i++) for (let k = 0; k < stride; k++) x[i] += input[i * stride + k] / stride;
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  let energy = 0;
  for (let i = 0; i < x.length; i++) { x[i] -= mean; energy += x[i] ** 2; }
  const rms = Math.sqrt(energy / x.length);
  if (!Number.isFinite(rms) || rms < 0.004) return null;
  const lo = Math.floor(sr / 1600), hi = Math.min(Math.ceil(sr / 100), Math.floor(x.length / 3));
  const correlations = new Float64Array(hi + 2);
  for (let lag = lo - 1; lag <= hi + 1; lag++) {
    let cross = 0, a = 0, b = 0;
    for (let i = 0; i < x.length - hi - 1; i++) { cross += x[i] * x[i + lag]; a += x[i] ** 2; b += x[i + lag] ** 2; }
    correlations[lag] = cross / Math.sqrt(a * b || 1);
  }
  const peaks = [];
  for (let lag = lo; lag <= hi; lag++) if (correlations[lag] > correlations[lag - 1] && correlations[lag] >= correlations[lag + 1]) peaks.push(lag);
  const best = Math.max(...peaks.map(lag => correlations[lag]));
  const lag = peaks.find(lag => correlations[lag] >= Math.max(0.85, best * 0.98));
  if (!lag) return null;
  const a = correlations[lag - 1], b = correlations[lag], c = correlations[lag + 1];
  const refined = lag + (a - c) / (2 * (a - 2 * b + c) || 1);
  const hz = sr / refined, midi = 69 + 12 * Math.log2(hz / 440);
  return { hz, midi, confidence: b, rms };
}

export function analyzeWav(bytes) {
  const wav = decodePcmWav(bytes), frames = [], window = Math.round(wav.rate * 0.1), hop = Math.round(wav.rate * 0.1);
  for (let start = 0; start + window <= wav.mono.length; start += hop) {
    const result = estimatePitch(wav.mono.subarray(start, start + window), wav.rate);
    if (result) frames.push({ seconds: Number((start / wav.rate).toFixed(3)), ...result });
  }
  const pitches = frames.map(f => f.midi).sort((a, b) => a - b);
  const median = pitches.length ? pitches[Math.floor(pitches.length / 2)] : null;
  const spreadCents = pitches.length ? (pitches[Math.floor((pitches.length - 1) * .95)] - pitches[Math.floor((pitches.length - 1) * .05)]) * 100 : null;
  let bestSegment = null;
  for (let a = 0; a < frames.length; a++) {
    let lo = frames[a].midi, hi = lo;
    for (let b = a; b < frames.length; b++) {
      const f = frames[b]; lo = Math.min(lo, f.midi); hi = Math.max(hi, f.midi);
      if (f.confidence < .95 || hi - lo > .6 || (b > a && f.seconds - frames[b - 1].seconds > .11)) break;
      const duration = f.seconds + .1 - frames[a].seconds;
      if (duration >= .8 && (!bestSegment || duration > bestSegment.duration)) {
        const values = frames.slice(a, b + 1).map(x => x.midi).sort((x, y) => x - y);
        const measuredMidi = values[Math.floor(values.length / 2)];
        bestSegment = { start: frames[a].seconds, end: Number((f.seconds + .1).toFixed(3)), duration: Number(duration.toFixed(3)), measuredMidi: Number(measuredMidi.toFixed(3)), nearestMidi: Math.round(measuredMidi), tuningCents: Number(((measuredMidi - Math.round(measuredMidi)) * 100).toFixed(1)), rangeCents: Number(((hi - lo) * 100).toFixed(1)) };
      }
    }
  }
  return { duration: wav.duration, sampleRate: wav.rate, bits: wav.bits, channels: wav.channels, sampler: wav.sampler, voicedWindows: frames.length, analyzedWindows: Math.max(0, Math.floor((wav.mono.length - window) / hop) + 1), medianMidi: median, spreadCents, candidateOnly: median !== null && frames.length >= 8 && spreadCents < 50, bestSegment, frames: frames.map(f => ({ seconds: f.seconds, midi: Number(f.midi.toFixed(3)), confidence: Number(f.confidence.toFixed(3)) })) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const folder = process.argv[2];
  if (!folder) throw new Error('Pass a WAV folder; originals will not be modified.');
  const limit = Math.max(1, Math.min(100, Number(process.argv[3]) || 10));
  const files = (await readdir(folder)).filter(name => /\.wav$/i.test(name) && /close/i.test(name)).sort().slice(0, limit);
  for (const name of files) {
    try {
      const result = analyzeWav(await readFile(join(folder, name)));
      if (process.argv.includes('--summary')) delete result.frames;
      console.log(JSON.stringify({ file: basename(name), ...result }));
    }
    catch (error) { console.log(JSON.stringify({ file: name, error: String(error) })); }
  }
}
