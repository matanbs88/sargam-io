import samples from './ventusSamples.json';

export type BansuriVoice = 'ventus' | 'procedural' | 'ventus-study';
export const DEFAULT_BANSURI_VOICE: BansuriVoice = 'ventus';
export function selectVentusSample(midi: number) {
  if (!Number.isFinite(midi) || midi < 0 || midi > 127) throw new Error('Invalid Bansuri MIDI pitch.');
  return samples.reduce((best, sample) => Math.abs(sample.midi - midi) < Math.abs(best.midi - midi) ? sample : best);
}
export function ventusResumeOffset(elapsed: number, loopStart: number, loopEnd: number) {
  return elapsed < loopEnd ? Math.max(0, elapsed) : loopStart + (elapsed - loopStart) % (loopEnd - loopStart);
}
