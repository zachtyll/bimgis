/**
 * Single trees from two sources, merged: Luleå kommun's tree layer (surveyed, with heights and
 * often species) wins; OpenStreetMap fills in where Luleå has no tree nearby.
 */

export type TreeForm = 'conifer' | 'broadleaf';

export interface Tree {
  /** Stable id: "lulea-tree:<objectid>" or "osm-node:<id>". */
  id: string;
  /** EPSG:3006. */
  x: number;
  y: number;
  /** Surveyed ground height (RH 2000) when the source has it; used where no terrain is loaded. */
  groundZ: number | null;
  height: number;
  /** False when the height is a default for the tree's form. */
  heightKnown: boolean;
  form: TreeForm;
  /** Swedish name, e.g. "Vårtbjörk". */
  species: string | null;
  /** Scientific name, e.g. "Betula pendula". */
  latin: string | null;
  genus: string | null;
  source: 'lulea' | 'osm';
}

const CONIFER_GENERA = new Set(['Pinus', 'Picea', 'Abies', 'Larix', 'Juniperus', 'Thuja', 'Taxus', 'Pseudotsuga', 'Chamaecyparis']);

export const DEFAULT_HEIGHT: Record<TreeForm, number> = { conifer: 12, broadleaf: 9 };
const MIN_HEIGHT = 2;
const MAX_HEIGHT = 40;

/** Conifer or broadleaf, from the genus or OSM's leaf_type; broadleaf when unknown (most street trees here are birch). */
export function formOf(genus: string | null | undefined, leafType?: string | null): TreeForm {
  const g = genus?.trim().split(/\s+/)[0];
  if (g && CONIFER_GENERA.has(g)) return 'conifer';
  if (leafType === 'needleleaved') return 'conifer';
  return 'broadleaf';
}

/** A plausible height, or the form's default (laser-derived heights can be negative or tiny). */
export function heightOf(raw: number | null | undefined, form: TreeForm): { height: number; known: boolean } {
  if (raw != null && Number.isFinite(raw) && raw >= MIN_HEIGHT && raw <= MAX_HEIGHT) return { height: raw, known: true };
  return { height: DEFAULT_HEIGHT[form], known: false };
}

/** Blank-ish strings from the sources (" ", "-") as null. */
export function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t && t !== '-' ? t : null;
}

/** `primary` plus those of `secondary` with no primary tree within `radius` metres. */
export function mergeTrees(primary: Tree[], secondary: Tree[], radius = 4): Tree[] {
  const cell = radius;
  const grid = new Map<string, Tree[]>();
  const keyOf = (cx: number, cy: number) => `${cx}:${cy}`;
  for (const t of primary) {
    const k = keyOf(Math.floor(t.x / cell), Math.floor(t.y / cell));
    const list = grid.get(k);
    if (list) list.push(t);
    else grid.set(k, [t]);
  }
  const near = (t: Tree) => {
    const cx = Math.floor(t.x / cell);
    const cy = Math.floor(t.y / cell);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const p of grid.get(keyOf(cx + dx, cy + dy)) ?? []) {
          if (Math.hypot(p.x - t.x, p.y - t.y) <= radius) return true;
        }
      }
    }
    return false;
  };
  return [...primary, ...secondary.filter((t) => !near(t))];
}
