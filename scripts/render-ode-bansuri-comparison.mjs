/** Offline diagnostic, not a browser recording. Matches dry GuideVoiceBank
 * note timing, nearest-sample selection, pitch rate and gain envelope.
 * Linear sample interpolation may differ from a browser's resampler. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { decodePcmWav } from './inspect-ventus-wav.mjs';
import { encodeMono16 } from './prepare-ventus-candidate.mjs';

const source = await readFile('src/lib/publicDomainCatalog.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { PUBLIC_DOMAIN_CATALOG } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const piece = PUBLIC_DOMAIN_CATALOG.find(p => p.id === 'pd-ode-to-joy-theme');
if (!piece?.noteEvents?.length) throw new Error('Practice piece missing');
const manifest = JSON.parse(await readFile('src/lib/ventusPerformanceSamples.json', 'utf8'));
// Reuse the production selector/gain instead of maintaining a second model.
const performanceSource = (await readFile('src/lib/ventusPerformance.ts', 'utf8'))
  .replace("import bank from './ventusPerformanceSamples.json';", `const bank = ${JSON.stringify(manifest)};`);
const performanceJs = ts.transpileModule(performanceSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { selectPerformanceSample, bansuriPeakGain, scorePolyphony } = await import(`data:text/javascript;base64,${Buffer.from(performanceJs).toString('base64')}`);
const rate = 44100;
const durationMs = Math.max(...piece.noteEvents.map(n => n.startMs + n.durationMs));
const mix = new Float32Array(Math.ceil(durationMs / 1000 * rate));
const cache = new Map();
const mapping = [];
for (const [noteIndex, note] of piece.noteEvents.entries()) {
  const sample = selectPerformanceSample(note, noteIndex, 'natural');
  if (!cache.has(sample.url)) cache.set(sample.url, decodePcmWav(await readFile(resolve(`public${sample.url}`))));
  const wav = cache.get(sample.url);
  const pitchRate = 2 ** ((note.midi - sample.midi) / 12);
  const gain = bansuriPeakGain(note.velocity, 85, scorePolyphony(piece.noteEvents));
  const duration = note.durationMs / 1000, attack = Math.min(.012, duration / 3);
  const start = Math.round(note.startMs / 1000 * rate);
  for (let i=0; i<Math.round(duration * rate) && start+i<mix.length; i++) {
    const t = i/rate;
    let sampleTime = t*pitchRate;
    if (sampleTime >= sample.loopEnd) sampleTime = sample.loopStart + (sampleTime - sample.loopStart) % (sample.loopEnd - sample.loopStart);
    const position = sampleTime * wav.rate, index = Math.floor(position), fraction = position-index;
    const value = (wav.mono[index] ?? 0)*(1-fraction) + (wav.mono[index+1] ?? 0)*fraction;
    const envelope = t < attack ? t/attack : t > duration-.006 ? Math.max(0,(duration-t)/.006) : 1;
    mix[start+i] += value * gain * envelope;
  }
  mapping.push({ ...note, source:sample.source, pitchRate, gain, gainDb:20*Math.log10(gain) });
}
const peak = mix.reduce((p,n)=>Math.max(p,Math.abs(n)),0);
const rms = Math.sqrt(mix.reduce((sum,n)=>sum+n*n,0)/mix.length);
if (!peak || peak >= 1 || !Number.isFinite(rms)) throw new Error('Invalid rendered output');
const normalizedGain = 10 ** (-1/20) / peak;
const louder = Float32Array.from(mix,n=>n*normalizedGain);
const directory = resolve('output/audio-comparison');
await mkdir(directory,{recursive:true});
await writeFile(resolve(directory,'ode-to-joy-ventus-performance.wav'),encodeMono16(mix,rate));
await writeFile(resolve(directory,'ode-to-joy-ventus-performance-normalized.wav'),encodeMono16(louder,rate));
const report = { piece:piece.id, tempoBpm:piece.tempoBpm, rootMidi:piece.rootMidi, durationMs, noteCount:piece.noteEvents.length, settings:{voice:'ventus',speed:1,room:false}, method:'offline reconstruction; linear interpolation, not browser capture', peakDbfs:20*Math.log10(peak),rmsDbfs:20*Math.log10(rms), louderGainDb:20*Math.log10(normalizedGain), mapping };
await writeFile(resolve(directory,'ode-to-joy-performance-comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({directory,...report,mapping:undefined},null,2));
