import polygonClipping, { type MultiPolygon as PcMultiPolygon, type Polygon as PcPolygon } from 'polygon-clipping';

import type { PolygonCoords, Position } from './draft';

type XY = [number, number];

const xy = (p: Position): XY => [p[0], p[1]];
const toPc = (polygon: PolygonCoords): PcPolygon => polygon.map((ring) => ring.map(xy));

export function area(polygon: PolygonCoords | PcPolygon): number {
  const ringArea = (ring: Position[] | XY[]) => {
    let sum = 0;
    for (let i = 0; i < ring.length - 1; i++) sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    return Math.abs(sum) / 2;
  };
  const [outer, ...holes] = polygon;
  return outer ? ringArea(outer) - holes.reduce((s, h) => s + ringArea(h), 0) : 0;
}

export function multiArea(mp: PcMultiPolygon): number {
  return mp.reduce((s, p) => s + area(p), 0);
}

export function union(polygons: PolygonCoords[]): PcMultiPolygon {
  if (polygons.length === 0) return [];
  const [first, ...rest] = polygons.map(toPc);
  return polygonClipping.union(first, ...rest);
}

export function difference(subject: PcMultiPolygon, clip: PcMultiPolygon): PcMultiPolygon {
  if (subject.length === 0) return [];
  return clip.length ? polygonClipping.difference(subject, clip) : subject;
}

export function intersection(a: PcMultiPolygon, b: PcMultiPolygon): PcMultiPolygon {
  if (a.length === 0 || b.length === 0) return [];
  return polygonClipping.intersection(a, b);
}

function segmentDistance(p: XY, a: XY, b: XY): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function* segments(mp: PcMultiPolygon): Generator<[XY, XY]> {
  for (const polygon of mp) for (const ring of polygon) for (let i = 0; i < ring.length - 1; i++) yield [ring[i], ring[i + 1]];
}

/** Distance from a point to the nearest boundary segment of a multipolygon. */
export function distanceToBoundary(p: XY, mp: PcMultiPolygon): number {
  let best = Infinity;
  for (const [a, b] of segments(mp)) best = Math.min(best, segmentDistance(p, a, b));
  return best;
}

/**
 * How far the pieces of `pieces` reach from the boundary of `reference`: the max over all piece
 * vertices of their distance to that boundary. A sliver along the boundary gives ~0; a real gap
 * or protrusion gives its depth. Used for the 10 cm tolerance of DP-0002/DP-0003.
 */
export function maxDepth(pieces: PcMultiPolygon, reference: PcMultiPolygon): number {
  let max = 0;
  for (const polygon of pieces) for (const ring of polygon) for (const p of ring) max = Math.max(max, distanceToBoundary(p, reference));
  return max;
}

function segmentsIntersect(a: XY, b: XY, c: XY, d: XY): boolean {
  const cross = (o: XY, p: XY, q: XY) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** True if any ring's boundary crosses itself (DP-Krav-0018). */
export function selfIntersects(polygon: PolygonCoords): boolean {
  for (const ring of polygon) {
    const n = ring.length - 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // adjacent through the closing vertex
        if (segmentsIntersect(xy(ring[i]), xy(ring[i + 1]), xy(ring[j]), xy(ring[j + 1]))) return true;
      }
    }
  }
  return false;
}

/** Smallest distance between the boundaries of two multipolygons (0 if they touch or cross). */
export function boundaryDistance(a: PcMultiPolygon, b: PcMultiPolygon): number {
  let best = Infinity;
  for (const [p, q] of segments(a)) {
    for (const [r, s] of segments(b)) {
      if (segmentsIntersect(p, q, r, s)) return 0;
      best = Math.min(best, segmentDistance(p, r, s), segmentDistance(q, r, s), segmentDistance(r, p, q), segmentDistance(s, p, q));
    }
  }
  return best;
}

/** Closes a ring and drops consecutive duplicates. */
export function closeRing(points: Position[]): Position[] {
  const ring = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
  const [first, last] = [ring[0], ring[ring.length - 1]];
  if (ring.length > 0 && (first[0] !== last[0] || first[1] !== last[1])) ring.push([...first] as Position);
  return ring;
}
