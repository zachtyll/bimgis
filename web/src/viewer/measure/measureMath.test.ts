import { describe, expect, it } from 'vitest';

import {
  baseHeight,
  distance3d,
  formatArea,
  formatLength,
  formatVolume,
  horizontal,
  pathLength,
  perimeter,
  planArea,
  prismVolume,
  ringStep,
  surfaceArea,
  type P3,
} from './measureMath';

const square: P3[] = [[0, 0, 5], [10, 0, 5], [10, 10, 5], [0, 10, 5]];

describe('measuring', () => {
  it('measures straight lines and paths', () => {
    expect(distance3d([0, 0, 0], [3, 4, 12])).toBe(13);
    expect(horizontal([0, 0, 0], [3, 4, 12])).toBe(5);
    expect(pathLength([[0, 0, 0], [3, 4, 0], [3, 4, 10]])).toBe(15);
    expect(perimeter(square)).toBe(40);
  });

  it('measures areas on the map and along a slope', () => {
    expect(planArea(square)).toBe(100);
    expect(surfaceArea(square)).toBeCloseTo(100);
    // A roof sloping 45°: same plan area, √2 times the surface.
    const roof: P3[] = [[0, 0, 0], [10, 0, 0], [10, 10, 10], [0, 10, 10]];
    expect(planArea(roof)).toBe(100);
    expect(surfaceArea(roof)).toBeCloseTo(100 * Math.SQRT2);
  });

  it('measures the volume of a body raised from a polygon', () => {
    expect(baseHeight(square)).toBe(5);
    expect(prismVolume(square, 17)).toBeCloseTo(1200);
    expect(prismVolume(square, 3)).toBe(0); // a top below the base is no body
  });

  it('picks round ring steps', () => {
    expect(ringStep(100)).toBe(50);
    expect(ringStep(37)).toBe(10);
    expect(ringStep(850)).toBe(500);
  });

  it('writes numbers the Swedish way', () => {
    const plain = (s: string) => s.replace(/\s/g, ' ');
    expect(plain(formatLength(3.456))).toBe('3,46 m');
    expect(plain(formatLength(1234))).toBe('1,23 km');
    expect(plain(formatArea(250))).toBe('250 m²');
    expect(plain(formatArea(25_000))).toBe('2,50 ha (25 000 m²)');
    expect(plain(formatVolume(14808))).toBe('14 808 m³');
  });
});
