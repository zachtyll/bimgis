/**
 * Reading Lantmäteriet Detaljplan 4.1 deliveries (application/vnd.lm.detaljplan.v4+json).
 * Only the subset the UI uses is typed here; see docs/inspo/lantmateriet/schema2.json for all of it.
 */

type Position = number[];
type MultiPolygonCoords = Position[][][];

interface LmGeometryDescription {
  geometri: {
    typ: string;
    koordinatsystemPlan: string;
    position:
      | { type: 'MultiPolygon'; coordinates: MultiPolygonCoords }
      | { type: 'Polygon'; coordinates: Position[][] }
      | { type: 'LineString'; coordinates: Position[] };
  };
}

interface LmDocumentRef {
  namn: string;
  datum?: { datum: string; handelse: string };
}

interface LmValue {
  datatyp: 'text' | 'decimaltal';
  variabelvarde: string;
  beskrivning: string;
  vardetyp?: 'min' | 'max' | 'exakt';
  enhet?: string;
}

interface LmQuality {
  digitaliseringsniva?: 'komplett' | 'ej komplett';
  beskrivningNiva?: string;
}

interface LmDetaljplan {
  'feature:typ': 'detaljplan';
  objektidentitet: string;
  kommun: string;
  beteckning?: string;
  namn: string;
  syfte: string;
  status: string;
  datumStatusforandring?: string;
  typ: string;
  kvalitetsbeskrivning?: LmQuality;
  anvandbarhet?: 'god' | 'medel' | 'låg';
  beskrivningAnvandbarhet?: string;
  plangeometri: LmGeometryDescription[];
  beslutsinformation: {
    diarienummerKommun?: string;
    genomforandetid?: number;
    foregaendePlansBeteckning?: string[];
    datumAntagande?: string;
    datumLagakraft?: string[];
  }[];
  planbeskrivning?: { planbeskrivning: LmDocumentRef };
  planeringsunderlag?: { huvudomrade: string; underlagstyp?: string; underlag: LmDocumentRef }[];
}

interface LmPlanbestammelse {
  'feature:typ': 'användningsbestämmelse' | 'egenskapsbestämmelse' | 'administrativ bestämmelse';
  objektidentitet: string;
  detaljplan: string;
  planbestammelsekatalogreferens: string;
  bestammelseformulering: string;
  bestammelsevarde?: LmValue[];
  bestammelsegeometri?: LmGeometryDescription[];
  beskrivningAnvandbarhet?: string;
  vertikalAvgransning?: 'uppåt' | 'nedåt';
  reglerarAnvandningsbestammelse?: string[];
  planbestammelsebeskrivning?: { motiv: string };
}

export interface LmFeatureCollection {
  type: 'FeatureCollection';
  'feature:mediatyp': 'application/vnd.lm.detaljplan.v4+json';
  features: { type: 'Feature'; id: string; properties: LmDetaljplan | LmPlanbestammelse }[];
}

// ---- View model ---------------------------------------------------------------------------

export interface PlanProvision {
  id: string;
  kind: LmPlanbestammelse['feature:typ'];
  /** Label on the plankarta (B1, h3…). Not an LM field; see parseCode. */
  code: string;
  wording: string;
  values: LmValue[];
  motive: string | null;
  catalogueRef: string;
  regulates: string[];
  verticalBound: 'uppåt' | 'nedåt' | null;
  /** Where it applies: areas (yta) and lines (linje, e.g. utfartsförbud). */
  areas: MultiPolygonCoords;
  lines: Position[][];
  /** Highest allowed height (m) when this is a height provision (h1…), else null. */
  maxHeight: number | null;
}

export interface DetailPlan {
  id: string;
  name: string;
  purpose: string;
  status: string;
  statusDate: string | null;
  municipality: string;
  caseNumber: string | null;
  designation: string | null;
  /** Genomförandetid in months (vägledning 2.3.10). */
  implementationMonths: number | null;
  previousPlans: string[];
  /** LM's own data-quality statement; shown so nobody mistakes approximations for the plan. */
  quality: { complete: boolean; usability: string | null; note: string | null };
  boundary: MultiPolygonCoords;
  provisions: PlanProvision[];
  planDescription: { name: string; date: string | null } | null;
  planningMaterial: { area: string; type: string | null; name: string; date: string | null }[];
  /** Highest allowed building height (m) among the height provisions, if any. */
  maxHeight: number | null;
}

export function parseDetailPlan(fc: LmFeatureCollection): DetailPlan {
  if (fc['feature:mediatyp'] !== 'application/vnd.lm.detaljplan.v4+json') {
    throw new Error(`Not a Detaljplan 4.1 delivery: ${fc['feature:mediatyp']}`);
  }
  const planFeature = fc.features.find((f) => f.properties['feature:typ'] === 'detaljplan');
  if (!planFeature) throw new Error('Delivery contains no detaljplan feature');
  const plan = planFeature.properties as LmDetaljplan;
  const decision = plan.beslutsinformation[0] ?? {};

  const provisions = fc.features
    .map((f) => f.properties)
    .filter((p): p is LmPlanbestammelse => p['feature:typ'] !== 'detaljplan' && p.detaljplan === plan.objektidentitet)
    .map(toProvision);

  return {
    id: plan.objektidentitet,
    name: plan.namn,
    purpose: plan.syfte,
    status: plan.status,
    statusDate: plan.datumStatusforandring ?? null,
    municipality: plan.kommun,
    caseNumber: decision.diarienummerKommun ?? null,
    designation: plan.beteckning ?? null,
    implementationMonths: decision.genomforandetid ?? null,
    previousPlans: decision.foregaendePlansBeteckning ?? [],
    quality: {
      complete: plan.kvalitetsbeskrivning?.digitaliseringsniva === 'komplett',
      usability: plan.anvandbarhet ?? null,
      note: plan.kvalitetsbeskrivning?.beskrivningNiva ?? plan.beskrivningAnvandbarhet ?? null,
    },
    boundary: plan.plangeometri.flatMap((g) => toMultiPolygon(g.geometri.position)),
    provisions,
    planDescription: plan.planbeskrivning
      ? { name: plan.planbeskrivning.planbeskrivning.namn, date: plan.planbeskrivning.planbeskrivning.datum?.datum ?? null }
      : null,
    planningMaterial: (plan.planeringsunderlag ?? []).map((u) => ({
      area: u.huvudomrade,
      type: u.underlagstyp ?? null,
      name: u.underlag.namn,
      date: u.underlag.datum?.datum ?? null,
    })),
    maxHeight: maxHeightOf(provisions),
  };
}

function toProvision(p: LmPlanbestammelse): PlanProvision {
  return {
    id: p.objektidentitet,
    kind: p['feature:typ'],
    code: parseCode(p),
    wording: p.bestammelseformulering,
    values: p.bestammelsevarde ?? [],
    motive: p.planbestammelsebeskrivning?.motiv ?? null,
    catalogueRef: p.planbestammelsekatalogreferens,
    regulates: p.reglerarAnvandningsbestammelse ?? [],
    verticalBound: p.vertikalAvgransning ?? null,
    areas: (p.bestammelsegeometri ?? []).flatMap((g) => toMultiPolygon(g.geometri.position)),
    lines: (p.bestammelsegeometri ?? []).flatMap((g) => (g.geometri.position.type === 'LineString' ? [g.geometri.position.coordinates] : [])),
    maxHeight: heightOf(p.bestammelsevarde ?? []),
  };
}

/**
 * LM 4.1 has no field for the plankarta's label (B1, h3…). Our exporter (scripts/export_lm.py)
 * writes it into beskrivningAnvandbarhet as "Plankartans beteckning: B1."; other producers won't.
 */
function parseCode(p: LmPlanbestammelse): string {
  return p.beskrivningAnvandbarhet?.match(/beteckning:\s*([^.\s]+)/)?.[1] ?? '';
}

function toMultiPolygon(position: LmGeometryDescription['geometri']['position']): MultiPolygonCoords {
  if (position.type === 'LineString') return [];
  return position.type === 'Polygon' ? [position.coordinates] : position.coordinates;
}

/** A maximum height in metres among a provision's values (nockhöjd, totalhöjd…), if any. */
function heightOf(values: LmValue[]): number | null {
  const heights = values
    .filter((v) => v.datatyp === 'decimaltal' && v.vardetyp === 'max' && v.enhet === 'meter' && v.beskrivning === 'höjd')
    .map((v) => Number(v.variabelvarde))
    .filter(Number.isFinite);
  return heights.length ? Math.max(...heights) : null;
}

function maxHeightOf(provisions: PlanProvision[]): number | null {
  const heights = provisions.map((p) => p.maxHeight).filter((h): h is number => h !== null);
  return heights.length ? Math.max(...heights) : null;
}

/** Whether a provision has geometry of its own (not just the plan boundary as a stand-in). */
function hasOwnGeometry(plan: DetailPlan, p: PlanProvision): boolean {
  return p.areas.length > 0 && JSON.stringify(p.areas) !== JSON.stringify(plan.boundary);
}

export type PlanView = 'boundary' | 'envelope';

/**
 * GeoJSON (EPSG:3006) for the viewer: the plan area, or the highest buildings it allows. The
 * envelope follows the plan's height areas (h1, h2…) when they have their own geometry; a plan
 * without digitised provisions gets one envelope at its highest height over the whole area.
 */
export function toGeoJson(plan: DetailPlan, view: PlanView): object {
  if (view === 'envelope' && plan.maxHeight === null) {
    return { type: 'FeatureCollection', features: [] };
  }
  const heightAreas = plan.provisions.filter((p) => p.maxHeight !== null && hasOwnGeometry(plan, p));
  if (view === 'envelope' && heightAreas.length) {
    return {
      type: 'FeatureCollection',
      features: heightAreas.map((p) => ({
        type: 'Feature',
        id: p.id,
        geometry: { type: 'MultiPolygon', coordinates: p.areas },
        // planId keeps comments and selection on the plan (the layer's id property).
        properties: { planId: plan.id, name: `${plan.name}: ${p.code} ${p.wording}`, status: plan.status, height: p.maxHeight, code: p.code },
      })),
    };
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: plan.id,
        geometry: { type: 'MultiPolygon', coordinates: plan.boundary },
        properties: {
          planId: plan.id,
          name: plan.name,
          status: plan.status,
          height: view === 'envelope' ? plan.maxHeight : undefined,
        },
      },
    ],
  };
}

const cache = new Map<string, Promise<DetailPlan>>();

/** Fetches and parses a delivery once per URL; shared by the store and the viewer. */
export function loadDetailPlan(url: string): Promise<DetailPlan> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load detaljplan ${url}: ${res.status}`);
        return res.json() as Promise<LmFeatureCollection>;
      })
      .then(parseDetailPlan);
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}
