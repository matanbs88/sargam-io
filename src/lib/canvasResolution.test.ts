import { expect, it } from 'vitest';
import { canvasResolution } from './canvasResolution';

it('uses stable integer pixels at fractional desktop scaling', () => {
  const result = canvasResolution(1334, 419, 1.25);
  expect(result.width).toBe(1668);
  expect(result.height).toBe(524);
  expect(result.scaleX * 1334).toBeCloseTo(result.width);
  expect(result.scaleY * 419).toBeCloseTo(result.height);
  expect(canvasResolution(1334, 419, 1.25)).toEqual(result);
});
it('caps retina allocation while retaining exact geometry', () => {
  expect(canvasResolution(390, 529, 3)).toEqual({width:780,height:1058,scaleX:2,scaleY:2});
  expect(canvasResolution(390, 529, NaN)).toEqual({width:390,height:529,scaleX:1,scaleY:1});
});
