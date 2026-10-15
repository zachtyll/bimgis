import { MAX_DISTANCE, type SourceLine, type Traffic } from './nordic';

/**
 * Streets as noise sources: geometry, name and speed limit from OpenStreetMap
 * (scripts/fetch_osm_roads.py, ODbL). Traffic volumes are not open data, so each street starts
 * from a default for its road class and can be overridden with counts or forecasts, like the
 * traffic table of a noise investigation (ÅDT, speed, heavy share).
 */
export const ROADS_URL = '/data/lulea/roads-osm.geojson';

export interface StreetRow extends Traffic {
  /** Stable key: name and road class (a street can change class along its length). */
  key: string;
  label: string;
  highway: string;
  /** True once someone entered values (not just the road-class default). */
  entered: boolean;
}

/** Defaults by OSM road class: ÅDT, km/h, heavy %. Rough Swedish urban values. */
const DEFAULTS: Record<string, Traffic> = {
  motorway: { adt: 30000, speed: 110, heavyPct: 12 },
  trunk: { adt: 15000, speed: 70, heavyPct: 10 },
  primary: { adt: 12000, speed: 50, heavyPct: 8 },
  secondary: { adt: 6000, speed: 50, heavyPct: 6 },
  tertiary: { adt: 3000, speed: 50, heavyPct: 5 },
  unclassified: { adt: 1000, speed: 50, heavyPct: 4 },
  residential: { adt: 500, speed: 30, heavyPct: 3 },
  living_street: { adt: 150, speed: 30, heavyPct: 2 },
  service: { adt: 100, speed: 30, heavyPct: 2 },
};

const CLASS_LABEL: Record<string, string> = {
  motorway: 'motorway',
  trunk: 'trunk road',
  primary: 'main road',
  secondary: 'secondary road',
  tertiary: 'local main street',
  unclassified: 'minor road',
  residential: 'residential street',
  living_street: 'living street',
  service: 'service road',
};

interface RoadFeature {
  geometry: { coordinates: [number, number][] };
  properties: { name?: string; highway: string; maxspeed?: string; ref?: string };
}

let roads: Promise<RoadFeature[]> | null = null;

function loadRoads(): Promise<RoadFeature[]> {
  roads ??= fetch(ROADS_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Streets: HTTP ${res.status}`);
      return res.json() as Promise<{ features: RoadFeature[] }>;
    })
    .then((g) => g.features)
    .catch((err) => {
      roads = null; // try again next time
      throw err;
    });
  return roads;
}

const baseClass = (highway: string) => highway.replace(/_link$/, '');

/** Streets within reach of a point, as source lines and default traffic per street. */
export async function streetsNear(x: number, y: number, radius = MAX_DISTANCE): Promise<{ sources: SourceLine[]; rows: StreetRow[] }> {
  const all = await loadRoads();
  const sources: SourceLine[] = [];
  const speeds = new Map<string, Map<number, number>>(); // key -> speed -> metres
  const meta = new Map<string, { label: string; highway: string }>();
  for (const f of all) {
    const pts = f.geometry.coordinates;
    if (!pts.some(([px, py]) => Math.hypot(px - x, py - y) <= radius)) continue;
    const highway = baseClass(f.properties.highway);
    if (!DEFAULTS[highway]) continue;
    const name = f.properties.name?.trim();
    const key = `${name ?? ''}|${highway}`;
    const cls = CLASS_LABEL[highway] ?? highway;
    meta.set(key, { label: name ? `${name} (${cls})` : `Unnamed ${cls}s`, highway });
    sources.push({ street: key, points: pts });
    const speed = Number.parseInt(f.properties.maxspeed ?? '', 10);
    if (Number.isFinite(speed)) {
      const m = speeds.get(key) ?? new Map<number, number>();
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      m.set(speed, (m.get(speed) ?? 0) + len);
      speeds.set(key, m);
    }
  }
  const rows = [...meta].map(([key, { label, highway }]): StreetRow => {
    const d = DEFAULTS[highway];
    // The signposted speed along most of the street, if OSM has it.
    const signposted = [...(speeds.get(key) ?? new Map<number, number>())].sort((a, b) => b[1] - a[1])[0]?.[0];
    return { key, label, highway, adt: d.adt, speed: signposted ?? d.speed, heavyPct: d.heavyPct, entered: false };
  });
  rows.sort((a, b) => b.adt - a.adt || a.label.localeCompare(b.label, 'sv'));
  return { sources, rows };
}

const STORAGE_KEY = 'bimgis.noise.traffic';

/** Traffic someone entered earlier in this browser (a convenience; not shared or saved). */
export function rememberedTraffic(): Record<string, Traffic> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, Traffic>;
  } catch {
    return {};
  }
}

export function rememberTraffic(rows: StreetRow[]): void {
  try {
    const all = rememberedTraffic();
    for (const r of rows) {
      if (r.entered) all[r.key] = { adt: r.adt, speed: r.speed, heavyPct: r.heavyPct };
      else delete all[r.key];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable: values just aren't remembered
  }
}
