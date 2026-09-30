export type PitchPoint = Readonly<{ offsetMs: number; cents: number }>;
/** Cents are offsets from the note's nominal MIDI, so transposition preserves shape. */
export function validatePitchCurve(points: readonly PitchPoint[], durationMs: number): boolean {
  return points.length > 0 && points[0].offsetMs === 0 && points.every((p, i) =>
    Number.isFinite(p.offsetMs) && Number.isFinite(p.cents) && p.offsetMs >= 0 && p.offsetMs <= durationMs &&
    (i === 0 || p.offsetMs > points[i - 1].offsetMs));
}
export function pitchCentsAt(points: readonly PitchPoint[], timeMs: number): number {
  if (!points.length) return 0;
  if (timeMs <= points[0].offsetMs) return points[0].cents;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (timeMs <= b.offsetMs) return a.cents + (b.cents - a.cents) * (timeMs - a.offsetMs) / (b.offsetMs - a.offsetMs);
  }
  return points[points.length - 1].cents;
}
export function frequencyFromSa(saHz: number, cents: number): number {
  if (!Number.isFinite(saHz) || saHz <= 0 || !Number.isFinite(cents)) throw new RangeError("Invalid pitch");
  return saHz * 2 ** (cents / 1200);
}
export function centsFromSa(hz: number, saHz: number): number | null {
  return hz > 0 && saHz > 0 && Number.isFinite(hz) && Number.isFinite(saHz) ? 1200 * Math.log2(hz / saHz) : null;
}

/** Sample seconds consumed by a piecewise-linear cents curve in score time.
 * Required for a seek into a glide: elapsed time alone is not sample position. */
export function pitchCurveSampleSeconds(points: readonly PitchPoint[], offsetMs: number, tempoRate: number): number {
  if (offsetMs <= 0) return 0;
  let total = 0, start = 0;
  const ends = [...points.filter(p=>p.offsetMs>0 && p.offsetMs<offsetMs).map(p=>p.offsetMs), offsetMs];
  for(const end of ends) {
    const a=pitchCentsAt(points,start), b=pitchCentsAt(points,end), duration=(end-start)/1000;
    const exponent=(b-a)*Math.LN2/1200;
    total += duration * 2**(a/1200) * (Math.abs(exponent)<1e-10 ? 1 : Math.expm1(exponent)/exponent);
    start=end;
  }
  return total/tempoRate;
}
