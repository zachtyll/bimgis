/**
 * Checks a draft against Lantmäteriet's Detaljplan 4.1 schema and the delivery rules in the
 * vägledning, chapter 7. "stop" = the national platform rejects the delivery; "warning" = it
 * accepts it but flags it.
 */
import Ajv from 'ajv-draft-04';
import addFormats from 'ajv-formats';

import detaljplanSchema from '../../../../docs/inspo/lantmateriet/schema2.json';
import geometriSchema from '../../../../docs/inspo/lantmateriet/geometri-2.0.json';
import geometrimetadataSchema from '../../../../docs/inspo/lantmateriet/geometrimetadata-2.0.1.json';
import geojsonSchema from '../../../../docs/inspo/lantmateriet/geojson-1.1.json';

import { renderWording, templateVariables, type CatalogueEntry } from './catalogue';
import { STRICT_RULES_FROM, type PlanDraft } from './draft';
import { area, boundaryDistance, difference, intersection, maxDepth, multiArea, selfIntersects, union } from './geometry';

export interface Issue {
  severity: 'stop' | 'warning';
  rule: string;
  message: string;
  /** Provision id, 'plan' for plan-level fields, 'area' for the plan area. */
  target: string;
}

const NS = 'http://namespace.lantmateriet.se/distribution';
const TOLERANCE = 0.1; // 10 cm, DP-0002/DP-0003
const MIN_GAP = 0.5; // DP-Krav-0011
const MIN_OVERLAP = 5; // m², DP-Krav-0013

/** draft-04 `id`s are fragment-only ("#geometri-2.0.json"); register the schemas under their real URLs. */
function withoutId<T extends object>(schema: T): T {
  const { id: _id, ...rest } = schema as T & { id?: string };
  return rest as T;
}

let compiled: ReturnType<Ajv['compile']> | null = null;
function schemaValidator() {
  if (!compiled) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    ajv.addSchema(withoutId(geojsonSchema), `${NS}/produkter/geojson/v1.1/geojson-1.1.json`);
    ajv.addSchema(withoutId(geometriSchema), `${NS}/geodatakatalog/geometri/geometri-2.0.json`);
    ajv.addSchema(withoutId(geometrimetadataSchema), `${NS}/geodatakatalog/geometri/geometrimetadata-2.0.1.json`);
    compiled = ajv.compile(withoutId(detaljplanSchema));
  }
  return compiled;
}

export function validateDraft(draft: PlanDraft, delivery: unknown, catalogue: Map<string, CatalogueEntry>): Issue[] {
  const issues: Issue[] = [];
  const stop = (rule: string, target: string, message: string) => issues.push({ severity: 'stop', rule, target, message });
  const warn = (rule: string, target: string, message: string) => issues.push({ severity: 'warning', rule, target, message });
  const label = (id: string) => {
    const p = draft.provisions.find((x) => x.id === id);
    return p ? p.code || catalogue.get(p.catalogueId)?.beteckning || 'provision' : id;
  };

  // --- Required content ---------------------------------------------------------------------
  if (!draft.name.trim()) stop('BAS-006', 'plan', 'The plan needs a name.');
  if (!draft.purpose.trim()) stop('BAS-006', 'plan', 'The plan needs a purpose (syfte).');
  if (draft.areas.length === 0) stop('DP-Krav-0002', 'area', 'Draw the plan area.');

  const strict = draft.startedDate >= STRICT_RULES_FROM;
  const inForce = draft.status === 'laga kraft';
  if (inForce) {
    const required: [string, unknown, string][] = [
      ['DP-0005', draft.designation.trim(), 'designation (beteckning)'],
      ['DP-0005', draft.planDescriptionUrl.trim(), 'a link to the planbeskrivning'],
      ['DP-0014', draft.plankartaUrl.trim(), 'a decision document with the plankarta'],
      ['DP-0017', draft.caseNumber.trim(), 'municipal case number (diarienummer)'],
      ['DP-0017', draft.decisionType, 'decision type'],
      ['DP-0017', draft.adoptedDate, 'adoption date'],
      ['DP-0017', draft.legalForceDate, 'laga kraft date'],
      ['DP-0017', draft.implementationMonths, 'implementation time'],
      ['DP-0017', draft.implementationStarts, 'implementation start date'],
    ];
    for (const [rule, value, what] of required) if (!value) stop(rule, 'plan', `A plan in force needs ${what}.`);
    if (strict && !draft.startedDate) stop('DP-Krav-0002', 'plan', 'A plan in force needs the date it was started.');
    if (!draft.provisions.some((p) => p.kind === 'användningsbestämmelse')) {
      stop('DP-0002', 'plan', 'A plan in force needs at least one användningsbestämmelse.');
    }
  }

  // --- Provisions: catalogue wording, values, motive, geometry ------------------------------
  for (const p of draft.provisions) {
    const entry = catalogue.get(p.catalogueId);
    if (!entry) {
      stop('DP-Krav-0006', p.id, `${label(p.id)}: not in the planbestämmelsekatalog release used by the editor.`);
      continue;
    }
    const variables = templateVariables(entry.bestammelseformulering).map((v) => v.variable);
    const used = p.values.filter((v) => v.value.trim());
    if (variables.length && used.length === 0) {
      warn('DP-0022', p.id, `${label(p.id)}: no values given; the wording will be "${renderWording(entry.bestammelseformulering, p.values)}".`);
    }
    for (const v of used) {
      if (v.type === 'decimaltal') {
        if (!/^-?\d+([.,]\d+)?$/.test(v.value.trim())) stop('DP-Krav-0006', p.id, `${label(p.id)}: "${v.variable}" must be a number.`);
        if (!v.kind || !v.unit) stop('DP-0009', p.id, `${label(p.id)}: "${v.variable}" needs a value type and a unit.`);
      }
    }
    if (strict && inForce && !p.motive.trim()) {
      stop('DP-0012', p.id, `${label(p.id)}: plans started after 2021-12-31 need a motive for every provision.`);
    } else if (!p.motive.trim()) {
      warn('DP-0012', p.id, `${label(p.id)}: no motive yet (required once the plan is in force).`);
    }
    if (p.geometries.length === 0) stop('DP-Krav-0003', p.id, `${label(p.id)}: draw where it applies.`);
    for (const g of p.geometries) {
      if (selfIntersects(g.polygon)) stop('DP-Krav-0018', p.id, `${label(p.id)}: a boundary crosses itself.`);
    }
  }
  for (const g of draft.areas) if (selfIntersects(g.polygon)) stop('DP-Krav-0018', 'area', 'The plan boundary crosses itself.');

  // --- Geometry relations: within the plan, coverage, gaps, overlaps -------------------------
  const planArea = union(draft.areas.map((g) => g.polygon));
  if (planArea.length) {
    for (const p of draft.provisions) {
      const outside = difference(union(p.geometries.map((g) => g.polygon)), planArea);
      const depth = maxDepth(outside, planArea);
      if (depth > TOLERANCE) stop('DP-0003', p.id, `${label(p.id)}: reaches ${depth.toFixed(2)} m outside the plan area (max 0.10 m).`);
    }

    const uses = draft.provisions.filter((p) => p.kind === 'användningsbestämmelse');
    const covered = union(uses.flatMap((p) => p.geometries.map((g) => g.polygon)));
    const uncovered = difference(planArea, covered);
    const gap = maxDepth(uncovered, covered.length ? covered : planArea);
    if (uncovered.length && (covered.length === 0 || gap > TOLERANCE)) {
      stop('DP-0002', 'area', `${multiArea(uncovered).toFixed(0)} m² of the plan area has no användningsbestämmelse.`);
    }

    for (let i = 0; i < uses.length; i++) {
      for (let j = i + 1; j < uses.length; j++) {
        const a = union(uses[i].geometries.map((g) => g.polygon));
        const b = union(uses[j].geometries.map((g) => g.polygon));
        const overlap = multiArea(intersection(a, b));
        if (overlap > 0.01 && overlap < MIN_OVERLAP) {
          warn('DP-Krav-0013', uses[i].id, `${label(uses[i].id)} and ${label(uses[j].id)} overlap by only ${overlap.toFixed(1)} m²; probably a digitising error.`);
        } else if (overlap <= 0.01) {
          const d = boundaryDistance(a, b);
          if (d > 0.001 && d < MIN_GAP) {
            warn('DP-Krav-0011', uses[i].id, `${label(uses[i].id)} and ${label(uses[j].id)} are ${d.toFixed(2)} m apart: share the border (snap) or keep ≥ 0.5 m.`);
          }
        }
      }
    }
  }
  for (const g of [...draft.areas, ...draft.provisions.flatMap((p) => p.geometries)]) {
    if (area(g.polygon) < 1) warn('DP-Krav-0018', 'area', 'A geometry is smaller than 1 m²; is it intended?');
  }

  // --- Lantmäteriet's JSON schema (structure and value lists) -------------------------------
  const validate = schemaValidator();
  if (!validate(delivery)) {
    const seen = new Set<string>();
    for (const e of validate.errors ?? []) {
      // oneOf/anyOf produce a cascade; report the leaf messages once.
      if (['oneOf', 'anyOf', 'allOf', 'if'].includes(e.keyword)) continue;
      const msg = `${e.instancePath || '/'} ${e.message ?? ''}`.trim();
      if (seen.has(msg)) continue;
      seen.add(msg);
      stop('DP-Krav-0004', 'plan', `Schema: ${msg}`);
    }
  }

  return issues;
}
