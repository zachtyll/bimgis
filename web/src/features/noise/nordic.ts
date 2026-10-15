/**
 * Road traffic noise at building facades, after the Nordic prediction method for road traffic
 * noise (Vägtrafikbuller – Nordisk beräkningsmodell, reviderad 1996, Naturvårdsverket rapport
 * 4653), simplified for screening:
 *
 * - Emission per street, at 10 m: a sound exposure level per light and heavy vehicle depending on
 *   speed, summed over the day's traffic (ÅDT) to a 24-hour equivalent level (Leq), and the
 *   maximum level of one passage (Lmax, a heavy vehicle when there is heavy traffic).
 * - Propagation: each street is split into short pieces; every piece adds its energy at the
 *   receiver with line-source spreading (−3 dB per doubled distance for a long straight street),
 *   Lmax spreads from the nearest passage as a point source (−6 dB per doubled distance).
 * - Screening: a piece hidden behind a building (or behind the receiving facade itself) is
 *   reduced by a fixed amount, about what a building gives with reflections from around it.
 *
 * Free-field levels at the facade (no facade reflection), like noise investigations report.
 * Not modelled: ground effect (urban hard ground assumed), building heights of screens (all
 * screen fully), reflections, gradients, intersections, road surface. Good for comparing sides
 * and options, not as a substitute for a noise investigation.
 */

export interface Traffic {
  /** Vehicles per average day (ÅDT), both directions. */
  adt: number;
  /** Signposted speed, km/h. */
  speed: number;
  /** Share of heavy vehicles, percent. */
  heavyPct: number;
}

export interface Emission {
  /** 24-hour equivalent level at 10 m, dBA. */
  leq10: number;
  /** Maximum level of the dimensioning passage at 10 m, dBA. */
  lmax10: number;
  /** Whether a heavy vehicle dimensions the maximum level (else a car). */
  lmaxHeavy: boolean;
}

/** Share of the day's traffic between 22 and 06 (typical for urban streets). */
export const NIGHT_SHARE = 0.08;
/** A maximum level counts when it occurs at least this often per night hour (Förordning 2015:216). */
export const MAX_EVENTS_PER_HOUR = 5;

/** Reduction for a path through a building (screen plus what reflections bring back). */
export const SCREENING_DB = 20;
/** Sources farther away than this are left out. */
export const MAX_DISTANCE = 400;
const SOURCE_HEIGHT = 0.5;
/** Streets are split into pieces at most this long. */
const PIECE = 4;
const MIN_SPEED = 30;
const DAY_SECONDS = 86400;

/**
 * Emission of a street at 10 m (Nordic 1996 vehicle levels; speeds below 30 km/h count as 30).
 * The maximum level is a heavy vehicle's when heavy vehicles pass at least 5 times per night
 * hour, otherwise a car's: how noise investigations usually dimension it.
 */
export function emission(t: Traffic): Emission {
  const v = Math.max(MIN_SPEED, t.speed) / 50;
  const heavy = Math.max(0, Math.min(100, t.heavyPct)) / 100;
  const nHeavy = t.adt * heavy;
  const nLight = t.adt - nHeavy;
  const selLight = 73.5 + 25 * Math.log10(v);
  const selHeavy = 80.5 + 30 * Math.log10(v);
  const energy = nLight * 10 ** (selLight / 10) + nHeavy * 10 ** (selHeavy / 10);
  const leq10 = energy > 0 ? 10 * Math.log10(energy / DAY_SECONDS) : -Infinity;
  const lmaxLight = 71 + 30 * Math.log10(v);
  const lmaxHeavy = 80 + 30 * Math.log10(v);
  const heavyPerNightHour = (nHeavy * NIGHT_SHARE) / 8;
  const dimensionedByHeavy = heavyPerNightHour >= MAX_EVENTS_PER_HOUR;
  const lmax10 = t.adt <= 0 ? -Infinity : dimensionedByHeavy ? lmaxHeavy : lmaxLight;
  return { leq10, lmax10, lmaxHeavy: dimensionedByHeavy };
}

export interface Receiver {
  x: number;
  y: number;
  /** Height above the ground, metres. */
  h: number;
  /** Outward facade normal (unit, scene axes). Sources behind the facade are screened by it. */
  nx: number;
  ny: number;
  /** Which facade (footprint edge) the point is on. */
  facade: number;
  floor: number;
}

export interface SourceLine {
  /** Key of the street's traffic. */
  street: string;
  points: [number, number][];
}

export interface NoiseInput {
  receivers: Receiver[];
  sources: SourceLine[];
  traffic: Record<string, Traffic>;
  /** Screening buildings: polygons as rings of [x, y]. The receiving building may be included. */
  screens: [number, number][][][];
}

export interface ReceiverLevel {
  leq: number;
  lmax: number;
  /** Street giving most of the Leq. */
  loudest: string | null;
}

export function computeNoise(input: NoiseInput): ReceiverLevel[] {
  const emissions = new Map<string, Emission>();
  for (const [key, t] of Object.entries(input.traffic)) emissions.set(key, emission(t));
  const pieces = splitSources(input.sources, emissions);
  const index = new EdgeIndex(input.screens);

  // Screening is the same for every floor at a facade spot: work it out once per spot.
  const screenedAt = new Map<string, Uint8Array>();
  const screening = (rcv: Receiver) => {
    const key = `${rcv.x}:${rcv.y}`;
    let flags = screenedAt.get(key);
    if (!flags) {
      flags = new Uint8Array(pieces.length);
      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];
        const dx = p.x - rcv.x;
        const dy = p.y - rcv.y;
        if (dx * dx + dy * dy > MAX_DISTANCE * MAX_DISTANCE) {
          flags[i] = 2; // out of range
          continue;
        }
        const behindFacade = dx * rcv.nx + dy * rcv.ny <= 0;
        flags[i] = behindFacade || index.blocks(rcv.x + rcv.nx * 0.5, rcv.y + rcv.ny * 0.5, p.x, p.y) ? 1 : 0;
      }
      screenedAt.set(key, flags);
    }
    return flags;
  };

  return input.receivers.map((rcv) => {
    const flags = screening(rcv);
    let total = 0;
    let lmax = -Infinity;
    const perStreet = new Map<string, number>();
    for (let i = 0; i < pieces.length; i++) {
      if (flags[i] === 2) continue;
      const p = pieces[i];
      const dx = p.x - rcv.x;
      const dy = p.y - rcv.y;
      const dz = rcv.h - SOURCE_HEIGHT;
      const r2 = Math.max(1, dx * dx + dy * dy + dz * dz);
      const att = flags[i] ? SCREENING_DB : 0;
      // Line source: a piece of length l at distance r adds (10 / π) · l / r² of the 10 m level.
      const e = p.energy10 * ((10 / Math.PI) * p.length) / r2 * 10 ** (-att / 10);
      total += e;
      perStreet.set(p.street, (perStreet.get(p.street) ?? 0) + e);
      const m = p.lmax10 - 10 * Math.log10(r2 / 100) - att;
      if (m > lmax) lmax = m;
    }
    let loudest: string | null = null;
    let best = 0;
    for (const [s, e] of perStreet) {
      if (e > best) [best, loudest] = [e, s];
    }
    return { leq: total > 0 ? 10 * Math.log10(total) : -Infinity, lmax, loudest };
  });
}

interface Piece {
  x: number;
  y: number;
  length: number;
  street: string;
  energy10: number;
  lmax10: number;
}

function splitSources(sources: SourceLine[], emissions: Map<string, Emission>): Piece[] {
  const pieces: Piece[] = [];
  for (const s of sources) {
    const em = emissions.get(s.street);
    if (!em || !Number.isFinite(em.leq10)) continue;
    const energy10 = 10 ** (em.leq10 / 10);
    for (let i = 1; i < s.points.length; i++) {
      const [x0, y0] = s.points[i - 1];
      const [x1, y1] = s.points[i];
      const len = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(1, Math.ceil(len / PIECE));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        pieces.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, length: len / n, street: s.street, energy10, lmax10: em.lmax10 });
      }
    }
  }
  return pieces;
}

/** Building edges in a uniform grid, for fast "does this path cross a building?" tests. */
class EdgeIndex {
  private readonly cell = 16;
  private readonly cells = new Map<string, number[]>();
  private readonly edges: number[] = []; // x0, y0, x1, y1 per edge

  constructor(polygons: [number, number][][][]) {
    for (const rings of polygons) {
      for (const ring of rings) {
        for (let i = 0; i < ring.length; i++) {
          const [x0, y0] = ring[i];
          const [x1, y1] = ring[(i + 1) % ring.length];
          if (x0 === x1 && y0 === y1) continue;
          const id = this.edges.length / 4;
          this.edges.push(x0, y0, x1, y1);
          const c0 = Math.floor(Math.min(x0, x1) / this.cell);
          const c1 = Math.floor(Math.max(x0, x1) / this.cell);
          const r0 = Math.floor(Math.min(y0, y1) / this.cell);
          const r1 = Math.floor(Math.max(y0, y1) / this.cell);
          for (let c = c0; c <= c1; c++) {
            for (let r = r0; r <= r1; r++) {
              const k = `${c}:${r}`;
              const list = this.cells.get(k);
              if (list) list.push(id);
              else this.cells.set(k, [id]);
            }
          }
        }
      }
    }
  }

  /** True if the segment crosses any building edge. */
  blocks(ax: number, ay: number, bx: number, by: number): boolean {
    const seen = new Set<number>();
    // Walk the grid cells along the segment (Amanatides–Woo).
    let c = Math.floor(ax / this.cell);
    let r = Math.floor(ay / this.cell);
    const cEnd = Math.floor(bx / this.cell);
    const rEnd = Math.floor(by / this.cell);
    const dx = bx - ax;
    const dy = by - ay;
    const stepC = Math.sign(dx);
    const stepR = Math.sign(dy);
    const tDeltaC = stepC ? Math.abs(this.cell / dx) : Infinity;
    const tDeltaR = stepR ? Math.abs(this.cell / dy) : Infinity;
    let tMaxC = stepC ? ((stepC > 0 ? (c + 1) * this.cell : c * this.cell) - ax) / dx : Infinity;
    let tMaxR = stepR ? ((stepR > 0 ? (r + 1) * this.cell : r * this.cell) - ay) / dy : Infinity;
    for (let guard = 0; guard < 10000; guard++) {
      const list = this.cells.get(`${c}:${r}`);
      if (list) {
        for (const id of list) {
          if (seen.has(id)) continue;
          seen.add(id);
          const e = id * 4;
          if (segmentsCross(ax, ay, bx, by, this.edges[e], this.edges[e + 1], this.edges[e + 2], this.edges[e + 3])) return true;
        }
      }
      if ((c === cEnd && r === rEnd) || (tMaxC > 1 && tMaxR > 1)) break;
      if (tMaxC < tMaxR) {
        tMaxC += tDeltaC;
        c += stepC;
      } else {
        tMaxR += tDeltaR;
        r += stepR;
      }
    }
    return false;
  }
}

function segmentsCross(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): boolean {
  const d1 = cross(cx, cy, dx, dy, ax, ay);
  const d2 = cross(cx, cy, dx, dy, bx, by);
  const d3 = cross(ax, ay, bx, by, cx, cy);
  const d4 = cross(ax, ay, bx, by, dx, dy);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function cross(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

/**
 * Receiver points on a building's facades: along each footprint edge (about every `spacing`
 * metres, at least one per edge), one per floor, half a metre outside the wall.
 */
export function facadeReceivers(rings: [number, number][][], height: number, spacing = 4, floorHeight = 3): Receiver[] {
  const outer = rings[0];
  if (!outer || outer.length < 3) return [];
  const ccw = signedArea(outer) > 0;
  const floors = Math.max(1, Math.floor(height / floorHeight));
  const out: Receiver[] = [];
  const n = outer.length - (samePoint(outer[0], outer[outer.length - 1]) ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const [x0, y0] = outer[i];
    const [x1, y1] = outer[(i + 1) % n];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len < 1) continue;
    // Outward normal: to the right of the edge for a counter-clockwise ring.
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    const nx = ccw ? uy : -uy;
    const ny = ccw ? -ux : ux;
    const count = Math.max(1, Math.round(len / spacing));
    for (let k = 0; k < count; k++) {
      const t = (k + 0.5) / count;
      for (let f = 0; f < floors; f++) {
        out.push({
          x: x0 + (x1 - x0) * t + nx * 0.5,
          y: y0 + (y1 - y0) * t + ny * 0.5,
          h: 1.5 + f * floorHeight,
          nx,
          ny,
          facade: i,
          floor: f,
        });
      }
    }
  }
  return out;
}

function signedArea(ring: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return a / 2;
}

function samePoint(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/** Compass name of a facade's outward direction, e.g. "north-east". */
export function compass(nx: number, ny: number): string {
  const names = ['east', 'north-east', 'north', 'north-west', 'west', 'south-west', 'south', 'south-east'];
  const a = Math.atan2(ny, nx);
  return names[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
}
