import { expect, it } from 'vitest';
import { previewPixelsPerSecond } from './previewWindow';
it('provides five real seconds of lookahead at every supported speed and size', () => {
  for (const distance of [100, 300, 650, 1400]) for (const rate of [.25, .5, 1, 1.25, 2]) {
    const pixels = previewPixelsPerSecond(distance, rate);
    expect(distance / pixels / rate).toBeCloseTo(5);
    expect(5 * rate * pixels).toBeCloseTo(distance);
  }
});
