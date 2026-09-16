import { test } from 'vitest';
import assert from 'node:assert/strict';
import { spectrumPitch, encodeMono16, extractSustain } from './prepare-ventus-candidate.mjs';
import { decodePcmWav } from './inspect-ventus-wav.mjs';
test('spectral estimate verifies F#4 independently', () => {
  const rate = 22050, hz = 440 * 2 ** (-3 / 12);
  const samples = Float32Array.from({length:rate}, (_, i) => .4 * Math.sin(2 * Math.PI * hz * i / rate));
  assert.ok(Math.abs(spectrumPitch(samples, rate).midi - 66) < .02);
});
test('trim, fade and PCM serialization preserve duration and avoid clipping', () => {
  const samples = new Float32Array(10000).fill(.4);
  const trimmed = extractSustain({mono:samples,rate:10000,duration:1}, .1, .9);
  assert.equal(trimmed.length, 8000); assert.equal(trimmed[0], 0); assert.equal(trimmed.at(-1), 0);
  const decoded = decodePcmWav(encodeMono16(trimmed,10000));
  assert.equal(decoded.duration,.8); assert.equal(decoded.bits,16);
  assert.ok(decoded.mono.every(x => Math.abs(x) <= .401));
  assert.throws(() => extractSustain({mono:samples,rate:10000,duration:1},0,2));
});
