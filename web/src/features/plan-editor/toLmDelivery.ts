import type { LmFeatureCollection } from '@/features/plans/lmDetaljplan';
import { renderWording, type CatalogueEntry } from './catalogue';
import type { DraftGeometry, DraftProvision, PlanDraft } from './draft';

export const LM_MEDIA_TYPE = 'application/vnd.lm.detaljplan.v4+json';

/**
 * Positioning method for geometries drawn in the editor: placed on screen against a digital map,
 * without snapping to it (vägledning 3.3.1, table 3). Required for plans started after 2021-12-31.
 */
const POSITIONING = { typ: 'lägesplacering', variant: 'digital karta' } as const;

/** One `yta` per polygon; multi-geometries stop the delivery (DP-0004). */
function geometries(geoms: DraftGeometry[]) {
  return geoms.map((g) => ({
    geometri: {
      typ: 'yta',
      koordinatsystemPlan: 'EPSG:3006',
      dimension: 2,
      position: { type: 'Polygon', coordinates: g.polygon.map((ring) => ring.map((p) => [p[0], p[1]])) },
    },
    geometrimetadata: {
      tidpunktForLagesbestamning: g.positionedAt,
      lagesbestamningsmetodIPlan: POSITIONING,
    },
  }));
}

const text = (v: string) => v.trim();
const link = (name: string, url: string, innehall?: string) => ({
  ...(innehall ? { innehall: [innehall] } : {}),
  dokument: { namn: name, referens: [{ lank: url.trim() }] },
});

function quality(draft: PlanDraft) {
  return {
    digitaliseringsniva: draft.quality.complete ? 'komplett' : 'ej komplett',
    ...(text(draft.quality.levelNote) ? { beskrivningNiva: text(draft.quality.levelNote) } : {}),
    korrigeradeGranser: draft.quality.correctedBoundaries,
    kontrolleratPlaneringsunderlag: draft.quality.checkedBasemap,
  };
}

function provisionFeature(draft: PlanDraft, p: DraftProvision, entry: CatalogueEntry | undefined) {
  const used = p.values.filter((v) => text(v.value));
  const props: Record<string, unknown> = {
    'feature:typ': p.kind,
    detaljplan: draft.id,
    objektidentitet: p.id,
    planbestammelsekatalogreferens: p.catalogueId,
    bestammelseformulering: entry ? renderWording(entry.bestammelseformulering, p.values) : '',
    kvalitetsbeskrivning: quality(draft),
    anvandbarhet: draft.quality.usability,
    bestammelsegeometri: geometries(p.geometries),
  };
  // LM has no field for the plankarta label; our convention (read back by lmDetaljplan.ts).
  if (text(p.code)) props.beskrivningAnvandbarhet = `Plankartans beteckning: ${text(p.code)}.`;
  if (used.length) {
    props.bestammelsevarde = used.map((v) =>
      v.type === 'decimaltal'
        ? { datatyp: 'decimaltal', variabelvarde: text(v.value).replace(',', '.'), beskrivning: v.variable, vardetyp: v.kind, enhet: v.unit }
        : { datatyp: 'text', variabelvarde: text(v.value), beskrivning: v.variable },
    );
  }
  if (text(p.motive)) props.planbestammelsebeskrivning = { motiv: text(p.motive) };
  if (p.kind === 'egenskapsbestämmelse' && p.regulates.length) props.reglerarAnvandningsbestammelse = p.regulates;
  return { type: 'Feature', id: p.id, geometry: null, properties: props };
}

/** The draft as a Lantmäteriet Detaljplan 4.1 delivery (first delivery: no history, no status date). */
export function toLmDelivery(draft: PlanDraft, catalogue: Map<string, CatalogueEntry>): LmFeatureCollection {
  const decision: Record<string, unknown> = {
    planbestammelse: draft.provisions.map((p) => p.id),
  };
  const set = (key: string, value: unknown) => {
    if (value !== '' && value !== null && value !== undefined) decision[key] = value;
  };
  set('instansInomKommunen', draft.body);
  set('diarienummerKommun', text(draft.caseNumber));
  set('diarienummerFullmaktige', text(draft.councilCaseNumber));
  set('beslutstyp', draft.decisionType);
  set('datumPaborjat', draft.startedDate);
  set('datumAntagande', draft.adoptedDate);
  if (draft.legalForceDate) decision.datumLagakraft = [draft.legalForceDate];
  set('genomforandetid', draft.implementationMonths);
  set('genomforandetidStartar', draft.implementationStarts);
  const previous = draft.previousPlans.split(',').map((s) => s.trim()).filter(Boolean);
  if (previous.length) decision.foregaendePlansBeteckning = previous;
  const documents = [
    text(draft.plankartaUrl) && link('Plankarta', draft.plankartaUrl, 'plankarta'),
    text(draft.protocolUrl) && link('Beslutsprotokoll', draft.protocolUrl, 'beslutsprotokoll'),
  ].filter(Boolean);
  if (documents.length) decision.beslutshandling = documents;

  const plan: Record<string, unknown> = {
    'feature:typ': 'detaljplan',
    objektidentitet: draft.id,
    objektversion: 1,
    versionGiltigFran: new Date().toISOString(),
    kommun: draft.municipality,
    namn: text(draft.name),
    syfte: text(draft.purpose),
    status: draft.status,
    typ: 'detaljplan',
    kvalitetsbeskrivning: quality(draft),
    anvandbarhet: draft.quality.usability,
    plangeometri: geometries(draft.areas),
    beslutsinformation: [decision],
  };
  if (text(draft.designation)) plan.beteckning = text(draft.designation);
  if (text(draft.quality.usabilityNote)) plan.beskrivningAnvandbarhet = text(draft.quality.usabilityNote);
  if (text(draft.planDescriptionUrl)) {
    plan.planbeskrivning = { planbeskrivning: { namn: 'Planbeskrivning', referens: [{ lank: text(draft.planDescriptionUrl) }] } };
  }

  return {
    type: 'FeatureCollection',
    'feature:mediatyp': LM_MEDIA_TYPE,
    features: [
      { type: 'Feature', id: draft.id, geometry: null, properties: plan },
      ...draft.provisions.map((p) => provisionFeature(draft, p, catalogue.get(p.catalogueId))),
    ],
  } as unknown as LmFeatureCollection;
}
