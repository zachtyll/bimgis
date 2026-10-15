import { fromArrayBuffer } from 'geotiff';

import { footprintsIn, type Footprint } from '@/features/buildings/footprints';
import { TERRAIN_NODATA, terrainExportUrl } from '@/viewer/terrainSource';
import { markEnclosed, type FloodGrid } from './simulation';

export interface Circle {
  /** EPSG:3006. */
  center: [number, number];
  radius: number;
}

/** Cells per side are capped so the model stays fast (~200 × 200 cells). */
const MAX_CELLS = 220;
/** Finer than the 5 m source still helps: streets between buildings stay open. */
const MIN_CELL = 2;
/** The grid reaches past the circle, so water running out of it can be followed a little. */
const MARGIN = 1.3;

/** The model's input for a circle: ground heights, buildings and where rain falls. */
export async function floodGrid(circle: Circle, signal?: AbortSignal): Promise<FloodGrid> {
  const half = circle.radius * MARGIN;
  const cell = Math.max(MIN_CELL, (2 * half) / MAX_CELLS);
  const n = Math.ceil((2 * half) / cell);
  const west = circle.center[0] - (n * cell) / 2;
  const north = circle.center[1] + (n * cell) / 2;
  const east = west + n * cell;
  const south = north - n * cell;

  const [ground, footprints] = await Promise.all([
    groundGrid(west, south, east, north, n, signal),
    footprintsIn(west, south, east, north, signal).catch((err) => {
      if ((err as Error).name === 'AbortError') throw err;
      console.warn('Flood check: building footprints unavailable, running on bare ground', err);
      return [] as Footprint[];
    }),
  ]);

  const grid: FloodGrid = {
    nx: n,
    ny: n,
    cell,
    west,
    north,
    ground,
    building: new Uint8Array(n * n),
    rain: new Uint8Array(n * n),
    sink: new Uint8Array(n * n),
  };
  for (const rings of footprints) rasterise(grid, rings);
  markEnclosed(grid);
  const r2 = circle.radius ** 2;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = west + (c + 0.5) * cell - circle.center[0];
      const y = north - (r + 0.5) * cell - circle.center[1];
      if (x * x + y * y <= r2) grid.rain[r * n + c] = 1;
    }
  }
  return grid;
}

async function groundGrid(west: number, south: number, east: number, north: number, n: number, signal?: AbortSignal) {
  const res = await fetch(terrainExportUrl(west, south, east, north, n, n), { signal });
  if (!res.ok) throw new Error(`Ground model: HTTP ${res.status}`);
  const tiff = await fromArrayBuffer(await res.arrayBuffer());
  const image = await tiff.getImage();
  if (image.getWidth() !== n || image.getHeight() !== n) {
    throw new Error(`Ground model: expected ${n}×${n}, got ${image.getWidth()}×${image.getHeight()}`);
  }
  const [band] = (await image.readRasters({ signal })) as unknown as Float32Array[];
  const ground = Float32Array.from(band);
  // No data (outside the municipality, open sea): use the lowest valid height, i.e. a sink.
  let lowest = Infinity;
  for (const v of ground) if (v > TERRAIN_NODATA && v < lowest) lowest = v;
  if (!Number.isFinite(lowest)) throw new Error('No ground model here (outside Luleå kommun?)');
  for (let i = 0; i < ground.length; i++) if (!(ground[i] > TERRAIN_NODATA)) ground[i] = lowest;
  return ground;
}

/** Marks the cells whose centre is inside the polygon (even-odd rule, so holes stay open). */
export function rasterise(grid: Pick<FloodGrid, 'nx' | 'ny' | 'cell' | 'west' | 'north' | 'building'>, rings: number[][][]): void {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  const { nx, ny, cell, west, north } = grid;
  const c0 = Math.max(0, Math.floor((minX - west) / cell));
  const c1 = Math.min(nx - 1, Math.floor((maxX - west) / cell));
  const r0 = Math.max(0, Math.floor((north - maxY) / cell));
  const r1 = Math.min(ny - 1, Math.floor((north - minY) / cell));
  for (let r = r0; r <= r1; r++) {
    const y = north - (r + 0.5) * cell;
    for (let c = c0; c <= c1; c++) {
      const x = west + (c + 0.5) * cell;
      let inside = false;
      for (const ring of rings) {
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, yi] = ring[i];
          const [xj, yj] = ring[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
      }
      if (inside) grid.building[r * nx + c] = 1;
    }
  }
}
