/** Build the bank from actual named SustainNormal recordings, preserving attack.
 * node scripts/build-ventus-sustains.mjs "<Ventus library root>" */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { decodeVentusNcw } from './decode-ventus-ncw.mjs';
import { encodeMono16, spectrumPitch } from './prepare-ventus-candidate.mjs';
const root = process.argv[2];
if (!root) throw new Error('Library root required');
const directory = join(root, 'Samples', 'SustainNormal');
const output = resolve('public/audio/bansuri');
await mkdir(output, { recursive: true });
const manifest = [];
for (const file of (await readdir(directory)).filter(f => /^SusNormal_Close_[A-G]#?\d_V1_RR1\.ncw$/.test(f))) {
  const name = file.match(/Close_([A-G])(#?)(\d)/);
  const expected = (Number(name[3]) + 1) * 12 + ({ C:0,D:2,E:4,F:5,G:7,A:9,B:11 })[name[1]] + (name[2] ? 1 : 0);
  const original = await readFile(join(directory, file));
  const wav = decodeVentusNcw(original);
  const checks = [1, 2, 3].map(t => spectrumPitch(wav.mono.subarray(Math.round(t * wav.rate)), wav.rate).midi);
  if (checks.some(n => Math.abs(n - expected) > .6)) throw new Error(`Pitch check ${file}: expected ${expected}, measured ${checks}`);
  // Preserve the real attack and several seconds of changing breath/timbre.
  const samples = wav.mono.slice(0, Math.min(wav.mono.length, wav.rate * 7));
  const head = Math.round(wav.rate * 2), fade = Math.round(wav.rate * .15), end = samples.length - Math.round(wav.rate * .15);
  if (end <= head + fade) throw new Error('Sustain too short');
  for (let i=0; i<fade; i++) { const t=i/(fade-1); samples[end-fade+i] = samples[end-fade+i]*(1-t)+samples[head+i]*t; }
  const bytes = encodeMono16(samples, wav.rate);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const filename = `ventus-sustain-${expected}-${sha256.slice(0,8)}.wav`;
  await writeFile(join(output, filename), bytes);
  manifest.push({url:`/audio/bansuri/${filename}`, midi:expected, loopStart:(head+fade)/wav.rate, loopEnd:end/wav.rate, source:file, sourceSha256:createHash('sha256').update(original).digest('hex'), sha256, checks});
  console.log(file, checks.map(n=>n.toFixed(2)).join(', '));
}
manifest.sort((a,b)=>a.midi-b.midi);
if (manifest.length < 12) throw new Error('Incomplete sustain bank');
await writeFile(resolve('src/lib/ventusSamples.json'), JSON.stringify(manifest,null,2)+'\n');
