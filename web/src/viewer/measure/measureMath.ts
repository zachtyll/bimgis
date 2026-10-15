/**
 * Measuring: lengths, heights, areas and volumes in the scene (EPSG:3006 metres, heights RH 2000),
 * and how to write them. Plain numbers in, plain numbers out.
 */

export type P3 = [number, number, number];

export const distance3d = (a: P3, b: P3) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
export const horizontal = (a: P3, b: P3) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export function pathLength(points: P3[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance3d(points[i - 1], points[i]);
  return total;
}

/** Area of the polygon projected on the map (shoelace), m². */
export function planArea(points: P3[]): number {
  let a = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    a += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1]);
  }
  return Math.abs(a) / 2;
}

/**
 * Area of the polygon along its own plane (Newell's method), m². Larger than the plan area for a
 * sloping polygon, e.g. drawn on a roof; for a polygon that isn't flat, an approximation.
 */
export function surfaceArea(points: P3[]): number {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < points.length; i++) {
    const [x0, y0, z0] = points[i];
    const [x1, y1, z1] = points[(i + 1) % points.length];
    nx += (y0 - y1) * (z0 + z1);
    ny += (z0 - z1) * (x0 + x1);
    nz += (x0 - x1) * (y0 + y1);
  }
  return Math.hypot(nx, ny, nz) / 2;
}

export function perimeter(points: P3[]): number {
  return points.length < 2 ? 0 : pathLength([...points, points[0]]);
}

/** Mean height of the polygon's corners: the base of a body raised from it. */
export const baseHeight = (points: P3[]) => points.reduce((s, p) => s + p[2], 0) / Math.max(1, points.length);

/** A prism from the polygon (plan area) up to `top`: volume, m³. */
export const prismVolume = (points: P3[], top: number) => planArea(points) * Math.max(0, top - baseHeight(points));

/** Distance rings for a radius: a round step giving 2–5 rings. */
export function ringStep(radius: number): number {
  if (radius <= 0) return 0;
  const raw = radius / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) if (m * pow >= raw) return m * pow;
  return 10 * pow;
}

// ---- Formatting (Swedish number style: space as thousands separator, comma decimals) ----------

const nf = (digits: number) => new Intl.NumberFormat('sv-SE', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatLength(m: number): string {
  if (m >= 1000) return `${nf(2).format(m / 1000)} km`;
  if (m >= 100) return `${nf(0).format(m)} m`;
  return `${nf(m < 10 ? 2 : 1).format(m)} m`;
}

export function formatArea(m2: number): string {
  if (m2 >= 1_000_000) return `${nf(2).format(m2 / 1_000_000)} km²`;
  if (m2 >= 10_000) return `${nf(2).format(m2 / 10_000)} ha (${nf(0).format(m2)} m²)`;
  return `${nf(m2 < 100 ? 1 : 0).format(m2)} m²`;
}

export function formatVolume(m3: number): string {
  return `${nf(m3 < 100 ? 1 : 0).format(m3)} m³`;
}

/** Height in RH 2000, with sign. */
export function formatHeight(z: number): string {
  return `${nf(1).format(z)} m`;
}

export function formatCoordinate(v: number): string {
  return nf(1).format(v);
}
