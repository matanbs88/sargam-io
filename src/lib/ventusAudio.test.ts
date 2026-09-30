import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import samples from './ventusSamples.json';
import { DEFAULT_BANSURI_VOICE, selectVentusSample, ventusResumeOffset } from './ventusAudio';

describe('recorded Ventus bank', () => {
  it('selects measured nearest anchors and defaults to real samples', () => {
    expect(DEFAULT_BANSURI_VOICE).toBe('ventus');
    expect(selectVentusSample(66).midi).toBe(66);
    expect(selectVentusSample(69).midi).toBe(69);
    expect(Math.abs(selectVentusSample(72).midi - 72)).toBeLessThanOrEqual(1);
    expect(samples).toHaveLength(16);
    for (let midi = 64; midi <= 90; midi++) expect(Math.abs(selectVentusSample(midi).midi - midi)).toBeLessThanOrEqual(1);
    expect(samples.every(s => s.source.startsWith('SusNormal_Close_'))).toBe(true);
    expect(() => selectVentusSample(NaN)).toThrow();
  });
  it('ships verified WAVs with valid loop boundaries and no clipping', () => {
    for (const sample of samples) {
      const bytes = readFileSync(new URL(`../../public${sample.url}`, import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(sample.sha256);
      expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
      const duration = (bytes.length - 44) / 2 / bytes.readUInt32LE(24);
      expect(sample.loopStart).toBeGreaterThan(0); expect(sample.loopEnd).toBeLessThan(duration);
      expect(sample.loopEnd).toBeGreaterThan(sample.loopStart);
      let peak = 0; for (let i = 44; i < bytes.length; i += 2) peak = Math.max(peak, Math.abs(bytes.readInt16LE(i)));
      expect(peak).toBeLessThan(32767);
    }
  });
  it('wraps arbitrarily long seek offsets into the sustain loop', () => {
    expect(ventusResumeOffset(.1, .26, 3.62)).toBe(.1);
    for (const elapsed of [3.62, 20, 600]) {
      const offset = ventusResumeOffset(elapsed, .26, 3.62);
      expect(offset).toBeGreaterThanOrEqual(.26); expect(offset).toBeLessThan(3.62);
    }
  });
});
