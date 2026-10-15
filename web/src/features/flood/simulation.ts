/**
 * A simple rain-on-grid flood model, for a quick, indicative "where does the water go?" check.
 *
 * Rain falls on the cells inside a circle. Each step, every wet cell passes water to its lower
 * neighbours (8 directions), in proportion to how much lower their water surface is, moving at
 * most half the largest difference so neighbours level out instead of swapping water back and
 * forth. Hollows fill into pools; water reaching the grid edge leaves. Buildings are raised
 * blocks, so roofs shed water and streets carry it. Courtyards enclosed by buildings are
 * assumed to drain (through gateways or drains the footprints don't show): water reaching them
 * is removed rather than filling them metres deep.
 *
 * Not a hydraulic model: no drains, infiltration, friction or real time. Use it to see flow paths
 * and low spots, not to size anything.
 */

export interface FloodGrid {
  nx: number;
  ny: number;
  /** Cell size in metres. */
  cell: number;
  /** Scene coordinates (EPSG:3006) of the north-west corner. Row 0 is the northernmost. */
  west: number;
  north: number;
  /** Ground height per cell (RH 2000), row-major. */
  ground: Float32Array;
  /** 1 where a building stands. */
  building: Uint8Array;
  /** 1 where rain falls (inside the circle). */
  rain: Uint8Array;
  /** 1 in courtyards enclosed by buildings: water reaching them drains away. */
  sink: Uint8Array;
}

export interface FloodParams {
  /** Total rain in millimetres. */
  rainMm: number;
  /** Steps with rain, then steps letting the water settle. */
  rainSteps: number;
  settleSteps: number;
  /** How often to report progress, in steps. */
  snapshotEvery: number;
}

export interface FloodSnapshot {
  step: number;
  steps: number;
  raining: boolean;
  /** Water depth per cell, metres. */
  depth: Float32Array;
  /** Water moved through each cell so far, as a vector (east, north), in m³. */
  flowX: Float32Array;
  flowY: Float32Array;
  stats: FloodStats;
}

export interface FloodStats {
  /** Rain fallen so far, m³. */
  rainVolume: number;
  /** Water standing in the area, m³. */
  storedVolume: number;
  /** Water that has run out of the area, m³. */
  outflowVolume: number;
  /** Water drained in enclosed courtyards, m³. */
  drainedVolume: number;
  maxDepth: number;
  /** Scene coordinates of the deepest water. */
  deepest: [number, number] | null;
  /** Area with water deeper than 10 cm / 30 cm, m². */
  area10cm: number;
  area30cm: number;
}

/** Buildings are raised this much, so water runs around them (and off their roofs). */
export const BUILDING_RAISE = 6;
const DRY = 1e-6;

// 8 neighbours: (dRow, dCol), unit direction in scene axes (east, north), 1/distance.
const NEIGHBOURS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
].map(([dr, dc]) => {
  const len = Math.hypot(dr, dc);
  return { dr, dc, ex: dc / len, ey: -dr / len, w: 1 / len };
});

export const DEFAULT_PARAMS: FloodParams = { rainMm: 50, rainSteps: 500, settleSteps: 300, snapshotEvery: 20 };

/** Runs the model; `onSnapshot` gets progress (arrays are copies, safe to transfer). */
export function simulate(grid: FloodGrid, params: FloodParams, onSnapshot: (s: FloodSnapshot) => void): FloodSnapshot {
  const { nx, ny, cell } = grid;
  const n = nx * ny;
  const cellArea = cell * cell;
  const surface = new Float32Array(n); // ground + buildings
  for (let i = 0; i < n; i++) surface[i] = grid.ground[i] + (grid.building[i] ? BUILDING_RAISE : 0);

  const depth = new Float32Array(n);
  const delta = new Float32Array(n);
  const flowX = new Float32Array(n);
  const flowY = new Float32Array(n);
  const weights = new Float32Array(8);
  const rainPerStep = params.rainMm / 1000 / Math.max(1, params.rainSteps);
  const steps = params.rainSteps + params.settleSteps;
  let rainVolume = 0;
  let outflowVolume = 0;
  let drainedVolume = 0;

  const snapshot = (step: number): FloodSnapshot => ({
    step,
    steps,
    raining: step < params.rainSteps,
    depth: depth.slice(),
    flowX: flowX.slice(),
    flowY: flowY.slice(),
    stats: statsOf(grid, depth, rainVolume, outflowVolume, drainedVolume),
  });

  for (let step = 0; step < steps; step++) {
    if (step < params.rainSteps) {
      for (let i = 0; i < n; i++) {
        if (grid.rain[i]) {
          depth[i] += rainPerStep;
          rainVolume += rainPerStep * cellArea;
        }
      }
    }

    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const i = r * nx + c;
        const d = depth[i];
        if (d <= DRY) continue;
        const h = surface[i] + d;
        let total = 0;
        let maxDiff = 0;
        for (let k = 0; k < 8; k++) {
          const { dr, dc, w } = NEIGHBOURS[k];
          const rr = r + dr;
          const cc = c + dc;
          // Beyond the edge: open ground at this cell's level, so water can leave.
          const hj = rr < 0 || rr >= ny || cc < 0 || cc >= nx ? surface[i] : surface[rr * nx + cc] + depth[rr * nx + cc];
          const diff = h - hj;
          if (diff > 0) {
            weights[k] = diff * w;
            total += weights[k];
            if (diff > maxDiff) maxDiff = diff;
          } else {
            weights[k] = 0;
          }
        }
        if (total <= 0) continue;
        const move = Math.min(d, maxDiff * 0.5);
        delta[i] -= move;
        for (let k = 0; k < 8; k++) {
          if (weights[k] <= 0) continue;
          const q = (move * weights[k]) / total;
          const { dr, dc, ex, ey } = NEIGHBOURS[k];
          const rr = r + dr;
          const cc = c + dc;
          if (rr < 0 || rr >= ny || cc < 0 || cc >= nx) outflowVolume += q * cellArea;
          else delta[rr * nx + cc] += q;
          flowX[i] += q * cellArea * ex;
          flowY[i] += q * cellArea * ey;
        }
      }
    }
    for (let i = 0; i < n; i++) {
      depth[i] = Math.max(0, depth[i] + delta[i]);
      delta[i] = 0;
      if (grid.sink[i] && depth[i] > 0) {
        drainedVolume += depth[i] * cellArea;
        depth[i] = 0;
      }
    }

    if ((step + 1) % params.snapshotEvery === 0 && step + 1 < steps) onSnapshot(snapshot(step + 1));
  }

  const last = snapshot(steps);
  onSnapshot(last);
  return last;
}

function statsOf(grid: FloodGrid, depth: Float32Array, rainVolume: number, outflowVolume: number, drainedVolume: number): FloodStats {
  const cellArea = grid.cell * grid.cell;
  let stored = 0;
  let maxDepth = 0;
  let deepest = -1;
  let a10 = 0;
  let a30 = 0;
  for (let i = 0; i < depth.length; i++) {
    const d = depth[i];
    stored += d * cellArea;
    if (grid.building[i]) continue; // water on roofs is in transit, not flooding
    if (d > maxDepth) {
      maxDepth = d;
      deepest = i;
    }
    if (d > 0.1) a10 += cellArea;
    if (d > 0.3) a30 += cellArea;
  }
  return {
    rainVolume,
    storedVolume: stored,
    outflowVolume,
    drainedVolume,
    maxDepth,
    deepest: deepest < 0 ? null : cellCentre(grid, deepest),
    area10cm: a10,
    area30cm: a30,
  };
}

/**
 * Finds open areas enclosed by buildings (not connected to the grid edge through open cells).
 * Small ones (light wells, slivers between footprints) become building; larger ones, courtyards,
 * become sinks. Without this, roof water would fill them metres deep.
 */
export function markEnclosed(grid: FloodGrid, maxPocketArea = 200): void {
  const { nx, ny, cell } = grid;
  const label = new Int32Array(nx * ny).fill(-1);
  const stack: number[] = [];
  let next = 0;
  for (let start = 0; start < nx * ny; start++) {
    if (grid.building[start] || label[start] >= 0) continue;
    const members: number[] = [];
    let touchesEdge = false;
    label[start] = next;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop()!;
      members.push(i);
      const r = Math.floor(i / nx);
      const c = i % nx;
      if (r === 0 || c === 0 || r === ny - 1 || c === nx - 1) touchesEdge = true;
      for (const { dr, dc } of NEIGHBOURS) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= ny || cc < 0 || cc >= nx) continue;
        const j = rr * nx + cc;
        if (grid.building[j] || label[j] >= 0) continue;
        label[j] = next;
        stack.push(j);
      }
    }
    next++;
    if (touchesEdge) continue;
    const small = members.length * cell * cell < maxPocketArea;
    for (const i of members) {
      if (small) grid.building[i] = 1;
      else grid.sink[i] = 1;
    }
  }
}

/** Scene coordinates of a cell's centre. */
export function cellCentre(grid: Pick<FloodGrid, 'nx' | 'cell' | 'west' | 'north'>, index: number): [number, number] {
  const r = Math.floor(index / grid.nx);
  const c = index % grid.nx;
  return [grid.west + (c + 0.5) * grid.cell, grid.north - (r + 0.5) * grid.cell];
}
