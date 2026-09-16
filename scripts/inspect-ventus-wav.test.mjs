import { test } from 'vitest';
import assert from 'node:assert/strict';
import { estimatePitch, decodePcmWav } from './inspect-ventus-wav.mjs';
test('detects known pure and harmonic notes without octave substitution', () => {
  for (const midi of [48, 60, 64, 67, 72, 79]) {
    const rate = 44100, hz = 440 * 2 ** ((midi - 69) / 12);
    const x = Float32Array.from({length:4410}, (_, i) => .3 * Math.sin(2 * Math.PI * hz * i / rate) + .05 * Math.sin(4 * Math.PI * hz * i / rate));
    const pitch = estimatePitch(x, rate);
    assert.ok(pitch); assert.ok(Math.abs(pitch.midi - midi) < .1, `${midi}: ${pitch.midi}`);
  }
});
test('rejects silence and malformed containers', () => {
  assert.equal(estimatePitch(new Float32Array(4410), 44100), null);
  assert.throws(() => decodePcmWav(Buffer.from('not a wave')));
});
