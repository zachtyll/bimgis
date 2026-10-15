/**
 * Live look-ups of building facts at a point, from Luleå kommun's public map services
 * (kartor1.lulea.se, layers used by their own map apps). Nothing is stored: each query runs when
 * a building is selected and the result lives only in the UI.
 *
 * No licence is stated for these services (unlike Luleå's open-data portal); see the attribution.
 * Only the fields below are requested. Staff signatures in the address register (REGSIGN,
 * MODIFICATIONSIGN) are deliberately never fetched.
 */

const BASE = 'https://kartor1.lulea.se/arcgis/rest/services/ext';

interface Source {
  path: string;
  fields: string[];
}

const SOURCES = {
  /** Footprints in Lantmäteriet's national building model, the whole municipality. */
  national: {
    path: 'adresskartan/MapServer/39',
    fields: ['objektidentitet', 'objekttyp', 'andamal1', 'andamal2', 'andamal3', 'andamal4', 'andamal5', 'huvudbyggnad', 'husnummer', 'insamlingslage'],
  },
  /** Building–address register (BAL). */
  register: {
    path: 'adresskartan/MapServer/38',
    fields: ['ADDRESS', 'PURPOSE', 'STYPE_TEXT', 'CONSTRUCTIONYEAR', 'EXTENSIONYEAR', 'ISMAINBUILDING'],
  },
  /** Heritage: buildings with a cultural-historical assessment. */
  heritage: {
    path: 'kulturmiljo_bebyggelseinventering/MapServer/0',
    fields: ['VARDERIN', 'EPOK', 'CABYGGAR', 'HUSTYP', 'ANT_VANI', 'FASAD', 'TAKFORM', 'UR_FUNKT', 'KM_OMR', 'OVRI_BYG'],
  },
} satisfies Record<string, Source>;

type Attributes = Record<string, string | number | null>;

export interface BuildingFacts {
  nationalId: string | null;
  type: string | null;
  purposes: string[];
  mainBuilding: boolean | null;
  address: string | null;
  registerPurpose: string | null;
  constructionYear: number | null;
  extensionYear: number | null;
  /** Decoded heritage assessment, label → value, if the building has one. */
  heritage: { label: string; value: string }[];
  heritageNote: string | null;
}

const domainCache = new Map<string, Promise<Map<string, { alias: string; codes: Map<string, string> }>>>();

/** Field aliases and coded-value domains of a layer, to decode values like VARDERIN = '1'. */
function fieldInfo(path: string) {
  let pending = domainCache.get(path);
  if (!pending) {
    pending = fetch(`${BASE}/${path}?f=json`)
      .then((r) => r.json())
      .then((layer: { fields: { name: string; alias: string; domain?: { codedValues?: { code: string | number; name: string }[] } }[] }) =>
        new Map(layer.fields.map((f) => [f.name, {
          alias: f.alias,
          codes: new Map((f.domain?.codedValues ?? []).map((c) => [String(c.code), c.name])),
        }])),
      );
    domainCache.set(path, pending);
  }
  return pending;
}

async function queryAt(source: Source, x: number, y: number, signal?: AbortSignal): Promise<Attributes | null> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x, y, spatialReference: { wkid: 3006 } }),
    geometryType: 'esriGeometryPoint',
    inSR: '3006',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: source.fields.join(','),
    returnGeometry: 'false',
    resultRecordCount: '1',
    f: 'json',
  });
  const res = await fetch(`${BASE}/${source.path}/query?${params}`, { signal });
  if (!res.ok) throw new Error(`${source.path}: ${res.status}`);
  const body = (await res.json()) as { features?: { attributes: Attributes }[]; error?: { message: string } };
  if (body.error) throw new Error(`${source.path}: ${body.error.message}`);
  return body.features?.[0]?.attributes ?? null;
}

/** "Bostad;Flerfamiljshus" → "Flerfamiljshus (Bostad)"; "Övrig byggnad;" → "Övrig byggnad". */
function formatPurpose(v: string | null): string | null {
  if (!v) return null;
  const [category, detail] = v.split(';').map((s) => s.trim());
  return detail ? `${detail} (${category})` : category || null;
}

const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const year = (v: unknown) => (typeof v === 'number' && v > 1000 ? v : null);

/** Facts about the building at (x, y) in EPSG:3006, or null if there is none. */
export async function buildingFactsAt(x: number, y: number, signal?: AbortSignal): Promise<BuildingFacts | null> {
  const [national, register, heritage] = await Promise.all([
    queryAt(SOURCES.national, x, y, signal),
    queryAt(SOURCES.register, x, y, signal).catch(() => null),
    queryAt(SOURCES.heritage, x, y, signal).catch(() => null),
  ]);
  if (!national && !register && !heritage) return null;

  const decoded: { label: string; value: string }[] = [];
  let heritageNote: string | null = null;
  if (heritage) {
    const info = await fieldInfo(SOURCES.heritage.path);
    for (const field of SOURCES.heritage.fields) {
      const raw = heritage[field];
      if (raw === null || raw === undefined || raw === '' || field === 'OVRI_BYG') continue;
      const f = info.get(field);
      decoded.push({ label: f?.alias ?? field, value: f?.codes.get(String(raw)) ?? String(raw) });
    }
    heritageNote = text(heritage.OVRI_BYG);
  }

  const purposes = national
    ? ['andamal1', 'andamal2', 'andamal3', 'andamal4', 'andamal5']
        .map((k) => formatPurpose(text(national[k])))
        .filter((v): v is string => !!v)
    : [];

  return {
    nationalId: text(national?.objektidentitet),
    type: text(national?.objekttyp),
    purposes,
    mainBuilding: national ? text(national.huvudbyggnad) === 'Ja' : null,
    address: text(register?.ADDRESS),
    registerPurpose: text(register?.PURPOSE) ?? text(register?.STYPE_TEXT),
    constructionYear: year(register?.CONSTRUCTIONYEAR),
    extensionYear: year(register?.EXTENSIONYEAR),
    heritage: decoded,
    heritageNote,
  };
}
