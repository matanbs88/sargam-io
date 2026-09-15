export type PitchEstimate = { hz: number; confidence: number } | null;

/** Monophonic YIN-style difference estimator. Never treats silence as a note. */
export function estimatePitch(samples: Float32Array, sampleRate: number): PitchEstimate {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || samples.length < 512) return null;
  let power = 0;
  for (const value of samples) { if (!Number.isFinite(value)) return null; power += value * value; }
  if (Math.sqrt(power / samples.length) < 0.008) return null;
  const size = Math.floor(samples.length / 2);
  const maxLag = Math.min(size - 1, Math.floor(sampleRate / 70));
  const minLag = Math.max(2, Math.floor(sampleRate / 1200));
  const difference = new Float64Array(maxLag + 1);
  let sum = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    let d = 0;
    for (let i = 0; i < size; i++) { const delta = samples[i] - samples[i + lag]; d += delta * delta; }
    sum += d;
    difference[lag] = sum > 0 ? d * lag / sum : 1;
  }
  for (let lag = minLag; lag < maxLag; lag++) {
    if (difference[lag] >= 0.12) continue;
    while (lag + 1 <= maxLag && difference[lag + 1] < difference[lag]) lag++;
    const a = difference[lag - 1], b = difference[lag], c = difference[Math.min(maxLag, lag + 1)];
    const denominator = a - 2 * b + c;
    const adjustment = denominator === 0 ? 0 : Math.max(-0.5, Math.min(0.5, (a - c) / (2 * denominator)));
    const hz = sampleRate / (lag + adjustment);
    return hz >= 70 && hz <= 1200 ? { hz, confidence: Math.max(0, Math.min(1, 1 - b)) } : null;
  }
  return null;
}
