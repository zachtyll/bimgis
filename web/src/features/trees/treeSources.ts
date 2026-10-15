import proj4 from 'proj4';

import { SOURCE_CRS } from '@/viewer/crs';
import { formOf, heightOf, mergeTrees, text, type Tree } from './trees';

/**
 * Luleå kommun's tree layer (TRAD_Z, an Esri I3S 1.6 point scene layer, SWEREF 99 21 45 / RH
 * 2000), read live: about 8,000 trees in ~30 small requests. No licence is stated, so nothing is
 * stored; the browser only caches it as their headers allow.
 *
 * Per tree: position (ground height as z), Swedish and Latin name, genus, height (`hojd`).
 */
export async function loadLuleaTrees(layerUrl: string, signal?: AbortSignal): Promise<Tree[]> {
  const get = async (path: string) => {
    const res = await fetch(`${layerUrl}${path}`, { signal });
    if (!res.ok) throw new Error(`Luleå trees ${path}: HTTP ${res.status}`);
    return res;
  };
  const layer = (await (await get('?f=json')).json()) as {
    store: { rootNode: string };
    attributeStorageInfo: AttributeInfo[];
  };
  const attr = (name: string) => layer.attributeStorageInfo.find((a) => a.name === name);
  const wanted = ['objectid', 'svenskt_na', 'latinskt_n', 'latinsk_sl', 'hojd']
    .map(attr)
    .filter((a): a is AttributeInfo => !!a);

  // Breadth-first over the node tree; leaves hold every tree exactly once.
  const leaves: string[] = [];
  let level = [layer.store.rootNode.replace(/^\.\/nodes\//, '')];
  while (level.length) {
    const nodes = await Promise.all(
      level.map(async (id) => (await (await get(`/nodes/${id}`)).json()) as { id: string; children?: { id: string }[] }),
    );
    level = [];
    for (const n of nodes) {
      if (n.children?.length) level.push(...n.children.map((c) => c.id));
      else leaves.push(n.id);
    }
  }

  const toScene = proj4(SOURCE_CRS['EPSG:3017'], 'EPSG:3006');
  const perLeaf = await Promise.all(
    leaves.map(async (id) => {
      const [features, ...columns] = await Promise.all([
        get(`/nodes/${id}/features/0`).then((r) => r.json() as Promise<{ featureData: { position: number[]; id: number }[] }>),
        ...wanted.map((a) => get(`/nodes/${id}/attributes/${a.key}/0`).then((r) => r.arrayBuffer()).then((b) => decode(b, a))),
      ]);
      const column = (name: string) => columns[wanted.findIndex((a) => a.name === name)] ?? [];
      const [ids, swedish, latin, genus, heights] = ['objectid', 'svenskt_na', 'latinskt_n', 'latinsk_sl', 'hojd'].map(column);
      return features.featureData.map((f, i): Tree => {
        const [sx, sy, z] = f.position;
        const [x, y] = toScene.forward([sx, sy]);
        const g = text(genus[i]);
        const form = formOf(g ?? text(latin[i]));
        const { height, known } = heightOf(Number(heights[i]), form);
        return {
          id: `lulea-tree:${ids[i] ?? f.id}`,
          x,
          y,
          groundZ: Number.isFinite(z) ? z : null,
          height,
          heightKnown: known,
          form,
          species: text(swedish[i]),
          latin: text(latin[i]),
          genus: g,
          source: 'lulea',
        };
      });
    }),
  );
  return perLeaf.flat();
}

/** OpenStreetMap trees (scripts/fetch_osm_trees.py), EPSG:3006 GeoJSON points. ODbL. */
export async function loadOsmTrees(url: string, signal?: AbortSignal): Promise<Tree[]> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSM trees: HTTP ${res.status}`);
  const geojson = (await res.json()) as {
    features: { geometry: { coordinates: number[] }; properties: Record<string, unknown> }[];
  };
  return geojson.features.map((f) => {
    const p = f.properties;
    const latin = text(p.species) ?? text(p.taxon);
    const genus = text(p.genus) ?? latin?.split(' ')[0] ?? null;
    const form = formOf(genus, text(p.leafType));
    const { height, known } = heightOf(typeof p.height === 'number' ? p.height : null, form);
    const [x, y] = f.geometry.coordinates;
    return {
      id: `osm-node:${p.osmId}`,
      x,
      y,
      groundZ: null,
      height,
      heightKnown: known,
      form,
      species: text(p.speciesSv),
      latin,
      genus,
      source: 'osm',
    };
  });
}

/** Both sources merged; either may fail on its own (the other is still shown). */
export async function loadTrees(luleaUrl: string | undefined, osmUrl: string | undefined, signal?: AbortSignal): Promise<Tree[]> {
  const settle = async (p: Promise<Tree[]> | null, what: string) => {
    if (!p) return [];
    try {
      return await p;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.warn(`Trees: ${what} failed`, err);
      return [];
    }
  };
  const [lulea, osm] = await Promise.all([
    settle(luleaUrl ? loadLuleaTrees(luleaUrl, signal) : null, "Luleå kommun's layer"),
    settle(osmUrl ? loadOsmTrees(osmUrl, signal) : null, 'OpenStreetMap'),
  ]);
  return mergeTrees(lulea, osm);
}

interface AttributeInfo {
  key: string;
  name: string;
  header: { property: string; valueType: string }[];
  ordering: string[];
  attributeValues?: { valueType: string };
  objectIds?: { valueType: string };
}

const SIZES: Record<string, number> = { Int8: 1, UInt8: 1, Int16: 2, UInt16: 2, Int32: 4, UInt32: 4, Float32: 4, Float64: 8 };

/** Decodes one I3S 1.x attribute buffer (numbers, object ids or strings). */
export function decode(buffer: ArrayBuffer, info: AttributeInfo): (string | number | null)[] {
  const view = new DataView(buffer);
  const count = view.getUint32(0, true);
  let o = 4 * info.header.length;

  const type = info.objectIds?.valueType ?? info.attributeValues?.valueType ?? 'UInt32';
  if (type === 'String') {
    const lengths: number[] = [];
    for (let i = 0; i < count; i++, o += 4) lengths.push(view.getUint32(o, true));
    const decoder = new TextDecoder('utf-8');
    return lengths.map((len) => {
      const s = decoder.decode(new Uint8Array(buffer, o, len)).replace(/\0+$/, '');
      o += len;
      return s;
    });
  }

  const size = SIZES[type] ?? 4;
  o = Math.ceil(o / size) * size; // values are aligned to their size
  const out: number[] = [];
  for (let i = 0; i < count; i++, o += size) {
    switch (type) {
      case 'Float64': out.push(view.getFloat64(o, true)); break;
      case 'Float32': out.push(view.getFloat32(o, true)); break;
      case 'Int32': out.push(view.getInt32(o, true)); break;
      case 'Int16': out.push(view.getInt16(o, true)); break;
      case 'UInt16': out.push(view.getUint16(o, true)); break;
      case 'Int8': out.push(view.getInt8(o)); break;
      case 'UInt8': out.push(view.getUint8(o)); break;
      default: out.push(view.getUint32(o, true));
    }
  }
  return out;
}
