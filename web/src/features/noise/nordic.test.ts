import { describe, expect, it } from 'vitest';

import { compass, computeNoise, emission, facadeReceivers, SCREENING_DB, type Receiver } from './nordic';

/** A long straight street along the x axis. */
const street = (y = 0, half = 2000) => ({ street: 's', points: [[-half, y], [half, y]] as [number, number][] });
const receiver = (y: number, h = 1.5, ny = -1): Receiver => ({ x: 0, y, h, nx: 0, ny, facade: 0, floor: 0 });

describe('Nordic road traffic noise (simplified)', () => {
  it('gives typical levels at 10 m', () => {
    // Sandviksgatan in the plan's table: 17,700 ÅDT, 50 km/h, 7 % heavy (forecast 2045).
    const big = emission({ adt: 17700, speed: 50, heavyPct: 7 });
    expect(big.leq10).toBeGreaterThan(66);
    expect(big.leq10).toBeLessThan(70);
    // Residensgatan: 4,800 ÅDT, 30 km/h, 7 % heavy.
    const small = emission({ adt: 4800, speed: 30, heavyPct: 7 });
    expect(small.leq10).toBeGreaterThan(54);
    expect(small.leq10).toBeLessThan(58);
    // 336 heavy vehicles a day: under 5 per night hour, so a car dimensions the maximum level
    // (as in the plan's footnote b); Sandviksgatan's 1,239 heavy vehicles are enough.
    expect(small.lmaxHeavy).toBe(false);
    expect(small.lmax10).toBeCloseTo(71 + 30 * Math.log10(0.6), 5);
    expect(big.lmaxHeavy).toBe(true);
    expect(big.lmax10).toBeCloseTo(80, 5);
    // Doubling the traffic adds 3 dB.
    expect(emission({ adt: 9600, speed: 30, heavyPct: 7 }).leq10 - small.leq10).toBeCloseTo(3.01, 1);
  });

  it('reproduces the 10 m level beside a long street and falls 3 dB per doubled distance', () => {
    const traffic = { s: { adt: 5000, speed: 50, heavyPct: 5 } };
    const [at10, at20, at40] = computeNoise({
      receivers: [receiver(-10, 0.5), receiver(-20, 0.5), receiver(-40, 0.5)].map((r) => ({ ...r, ny: 1 })),
      sources: [street()],
      traffic,
      screens: [],
    });
    expect(at10.leq).toBeCloseTo(emission(traffic.s).leq10, 0);
    expect(at10.leq - at20.leq).toBeCloseTo(3, 0);
    expect(at20.leq - at40.leq).toBeCloseTo(3, 0);
    // Lmax: one passage, a point source: 6 dB per doubled distance.
    expect(at10.lmax - at20.lmax).toBeCloseTo(6, 0);
  });

  it('is quieter behind a building and on the facade facing away', () => {
    const traffic = { s: { adt: 5000, speed: 50, heavyPct: 5 } };
    // A long block, so the street can't be seen past its ends from behind it.
    const building: [number, number][][] = [[[-300, -15], [300, -15], [300, -25], [-300, -25], [-300, -15]]];
    const [front, behind, back] = computeNoise({
      receivers: [
        { ...receiver(-14.5), ny: 1 }, // street side of the building
        { ...receiver(-40), ny: 1 }, // open ground behind it
        { ...receiver(-25.5), ny: -1 }, // the building's back facade
      ],
      sources: [street()],
      traffic,
      screens: [building],
    });
    expect(front.leq - behind.leq).toBeGreaterThan(SCREENING_DB - 8);
    expect(front.leq - back.leq).toBeGreaterThan(SCREENING_DB - 8);
    expect(front.loudest).toBe('s');
  });

  it('puts receivers on every facade and floor, facing out', () => {
    // 20 × 10 m, clockwise ring (as Esri delivers outer rings).
    const ring: [number, number][] = [[0, 0], [0, 10], [20, 10], [20, 0], [0, 0]];
    const rs = facadeReceivers([ring], 9.5, 5);
    expect(new Set(rs.map((r) => r.floor))).toEqual(new Set([0, 1, 2]));
    const north = rs.filter((r) => compass(r.nx, r.ny) === 'north');
    expect(north.length).toBe(4 * 3); // 20 m edge / 5 m × 3 floors
    expect(north.every((r) => r.y > 10)).toBe(true); // outside the wall
    expect(rs.filter((r) => compass(r.nx, r.ny) === 'west').every((r) => r.x < 0)).toBe(true);
  });
});
