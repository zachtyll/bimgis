import { describe, expect, it } from 'vitest';

import { cellCentre, markEnclosed, simulate, type FloodGrid } from './simulation';

function grid(nx: number, ny: number, height: (c: number, r: number) => number, rainEverywhere = true): FloodGrid {
  const ground = new Float32Array(nx * ny);
  for (let r = 0; r < ny; r++) for (let c = 0; c < nx; c++) ground[r * nx + c] = height(c, r);
  return {
    nx, ny, cell: 2, west: 1000, north: 2000, ground,
    building: new Uint8Array(nx * ny),
    rain: new Uint8Array(nx * ny).fill(rainEverywhere ? 1 : 0),
    sink: new Uint8Array(nx * ny),
  };
}

const params = { rainMm: 50, rainSteps: 100, settleSteps: 200, snapshotEvery: 50 };

describe('flood simulation', () => {
  it('fills a bowl and keeps the water (nothing leaves over the rim)', () => {
    const g = grid(21, 21, (c, r) => Math.hypot(c - 10, r - 10) * 0.2);
    const { stats } = simulate(g, params, () => {});
    expect(stats.outflowVolume).toBeLessThan(stats.rainVolume * 0.02);
    expect(stats.storedVolume).toBeCloseTo(stats.rainVolume, 0);
    const centre = cellCentre(g, 10 * 21 + 10);
    expect(stats.deepest).toEqual(centre);
    expect(stats.maxDepth).toBeGreaterThan(0.05); // collected from the whole bowl
  });

  it('drains a slope downhill, flowing towards the low side', () => {
    // Rises to the east: water should run west and leave there.
    const g = grid(20, 10, (c) => c * 0.5);
    const snap = simulate(g, params, () => {});
    expect(snap.stats.outflowVolume).toBeGreaterThan(snap.stats.rainVolume * 0.8);
    const mid = 5 * 20 + 10;
    expect(snap.flowX[mid]).toBeLessThan(0); // westwards
    expect(Math.abs(snap.flowY[mid])).toBeLessThan(Math.abs(snap.flowX[mid]) * 0.1);
  });

  it('conserves water', () => {
    const g = grid(15, 15, (c, r) => Math.sin(c / 3) + Math.cos(r / 4));
    const { stats } = simulate(g, params, () => {});
    expect(stats.storedVolume + stats.outflowVolume + stats.drainedVolume).toBeCloseTo(stats.rainVolume, 1);
  });

  it('fills light wells and drains courtyards instead of flooding them', () => {
    const g = grid(30, 30, () => 0);
    // A block of buildings (rows/cols 5-24) with a 1-cell light well and a 10×10 courtyard.
    for (let r = 5; r < 25; r++) for (let c = 5; c < 25; c++) g.building[r * 30 + c] = 1;
    g.building[7 * 30 + 7] = 0; // light well: 4 m²
    for (let r = 12; r < 22; r++) for (let c = 12; c < 22; c++) g.building[r * 30 + c] = 0; // 400 m²
    markEnclosed(g);
    expect(g.building[7 * 30 + 7]).toBe(1);
    expect(g.sink[15 * 30 + 15]).toBe(1);
    expect(g.sink[2 * 30 + 2]).toBe(0); // open street outside the block
    const { stats } = simulate(g, params, () => {});
    expect(stats.maxDepth).toBeLessThan(0.2);
    expect(stats.drainedVolume).toBeGreaterThan(0);
  });

  it('routes water around buildings', () => {
    // A slope to the south with a building wall across it, open at the west end.
    const g = grid(20, 20, (_c, r) => -r * 0.1);
    for (let c = 4; c < 20; c++) g.building[10 * 20 + c] = 1;
    g.rain.fill(0);
    for (let c = 0; c < 20; c++) g.rain[2 * 20 + c] = 1; // a line of rain upslope
    const snap = simulate(g, params, () => {});
    // Water passes the wall only through the gap at columns 0-3.
    const behindWall = (c: number) => Math.abs(snap.flowY[12 * 20 + c]);
    expect(behindWall(1)).toBeGreaterThan(behindWall(15) * 10);
  });

  it('reports progress', () => {
    const steps: number[] = [];
    simulate(grid(5, 5, () => 0), params, (s) => steps.push(s.step));
    expect(steps).toEqual([50, 100, 150, 200, 250, 300]);
  });
});
