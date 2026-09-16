/** Stage only the measured prototype asset; never copies the source library. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const input = new URL('../output/ventus-candidates/ventus-fsharp4-sustain.wav', import.meta.url);
const bytes = await readFile(input);
const hash = createHash('sha256').update(bytes).digest('hex');
if (hash !== '49fa0dea225ba69a9a496832296ed7cf9d5356bf1d07ebf351901a983606ab7a') {
  throw new Error('Unverified candidate: regenerate and review before staging.');
}
const folder = new URL('../public/audio/preview/', import.meta.url);
await mkdir(folder, { recursive: true });
const target = new URL('ventus-fsharp4-sustain.wav', folder);
try {
  const existing = await readFile(target);
  if (!existing.equals(bytes)) throw new Error('Refusing to overwrite a different preview asset.');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(target, bytes);
console.log(`Staged prototype sustain (${bytes.length} bytes; SHA256 ${hash}).`);
