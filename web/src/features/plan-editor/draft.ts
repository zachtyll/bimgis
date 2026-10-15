/**
 * The plan editor's working model. It is turned into a Lantmäteriet Detaljplan 4.1 delivery by
 * toLmDelivery(); both are stored (see code-with-quarkus/.../V2__plans.sql). Field semantics
 * follow spec/planning-data.yaml and Lantmäteriet's vägledning.
 */

export type Position = [number, number] | [number, number, number];
/** One polygon: outer ring first, then holes. Rings are closed (first = last). */
export type PolygonCoords = Position[][];

export type PlanStatus =
  | 'påbörjad' | 'samråd' | 'granskning' | 'antagen' | 'överklagad' | 'tillsyn' | 'laga kraft' | 'upphävd' | 'avslutad';
export const PLAN_STATUSES: PlanStatus[] = [
  'påbörjad', 'samråd', 'granskning', 'antagen', 'överklagad', 'tillsyn', 'laga kraft', 'upphävd', 'avslutad',
];

export type ProvisionKind = 'användningsbestämmelse' | 'egenskapsbestämmelse';
export type ValueKind = 'min' | 'max' | 'exakt';
export const LM_UNITS = ['meter', 'kvadratmeter', 'kubikmeter', 'procent', 'grader', 'antal', 'år', 'dB(A)'] as const;
export type LmUnit = (typeof LM_UNITS)[number];

export type DecisionType =
  | 'antagande av ny detaljplan' | 'antagande om ändring' | 'antagande om upphävande' | 'beslut om avslut';
export type Body = 'byggnadsnämnd enligt PBL' | 'kommunstyrelse' | 'kommunfullmäktige';

/** A drawn polygon. `positionedAt` is LM's tidpunktForLagesbestamning (required, DP-0010). */
export interface DraftGeometry {
  id: string;
  polygon: PolygonCoords;
  positionedAt: string;
}

/** One template variable of a catalogue provision. An empty value omits it from the wording. */
export interface DraftValue {
  variable: string;
  type: 'text' | 'decimaltal';
  value: string;
  kind?: ValueKind;
  unit?: LmUnit;
}

export interface DraftProvision {
  id: string;
  catalogueId: string;
  kind: ProvisionKind;
  /** Label on the plankarta (B1, h3…). */
  code: string;
  values: DraftValue[];
  motive: string;
  geometries: DraftGeometry[];
  /** Egenskapsbestämmelser: the användningsbestämmelser they regulate. */
  regulates: string[];
}

export interface PlanDraft {
  id: string;
  name: string;
  purpose: string;
  status: PlanStatus;
  municipality: string;
  designation: string;
  caseNumber: string;
  councilCaseNumber: string;
  startedDate: string;
  decisionType: DecisionType | '';
  body: Body | '';
  adoptedDate: string;
  legalForceDate: string;
  implementationMonths: number | null;
  implementationStarts: string;
  previousPlans: string;
  planDescriptionUrl: string;
  plankartaUrl: string;
  protocolUrl: string;
  areas: DraftGeometry[];
  provisions: DraftProvision[];
  quality: {
    usability: 'god' | 'medel' | 'låg';
    usabilityNote: string;
    complete: boolean;
    levelNote: string;
    checkedBasemap: boolean;
    correctedBoundaries: boolean;
  };
}

/** Plans started after this date carry stricter requirements (motives, geometry metadata). */
export const STRICT_RULES_FROM = '2022-01-01';

export function newDraft(municipality: string): PlanDraft {
  return {
    id: crypto.randomUUID(),
    name: '',
    purpose: '',
    status: 'påbörjad',
    municipality,
    designation: '',
    caseNumber: '',
    councilCaseNumber: '',
    startedDate: new Date().toISOString().slice(0, 10),
    decisionType: '',
    body: '',
    adoptedDate: '',
    legalForceDate: '',
    implementationMonths: null,
    implementationStarts: '',
    previousPlans: '',
    planDescriptionUrl: '',
    plankartaUrl: '',
    protocolUrl: '',
    areas: [],
    provisions: [],
    quality: {
      usability: 'god',
      usabilityNote: '',
      complete: true,
      levelNote: '',
      checkedBasemap: false,
      correctedBoundaries: false,
    },
  };
}

export function newGeometry(polygon: PolygonCoords): DraftGeometry {
  return { id: crypto.randomUUID(), polygon, positionedAt: new Date().toISOString() };
}
