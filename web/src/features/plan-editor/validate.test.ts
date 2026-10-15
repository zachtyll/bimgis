import { describe, expect, it } from 'vitest';

import catalogueJson from '../../../public/data/boverket/planbestammelsekatalog.json';
import { initialValues, renderWording, type Catalogue, type CatalogueEntry } from './catalogue';
import { newDraft, newGeometry, type DraftProvision, type PlanDraft, type PolygonCoords } from './draft';
import { toLmDelivery } from './toLmDelivery';
import { validateDraft } from './validate';

const catalogue = new Map((catalogueJson as Catalogue).bestammelser.map((b): [string, CatalogueEntry] => [b.id, b]));
const BOSTADER = 'f9e056a6-cda8-4b92-a15d-dc70d61dfa36'; // B, användningsbestämmelse
const CENTRUM = '5df5c910-50b0-4b57-80a4-d139115c3b73'; // C
const NOCKHOJD = '2ecd7d4e-1c26-494b-9f4e-5f33c753a715'; // "Högsta nockhöjd på [byggnadsverk:text] är [höjd:decimaltal] meter[text:text]"

/** Axis-aligned rectangle in EPSG:3006 near central Luleå. */
function rect(x0: number, y0: number, x1: number, y1: number): PolygonCoords {
  const [ox, oy] = [829300, 7292300];
  return [[[ox + x0, oy + y0], [ox + x1, oy + y0], [ox + x1, oy + y1], [ox + x0, oy + y1], [ox + x0, oy + y0]]];
}

function provision(catalogueId: string, code: string, polygon: PolygonCoords): DraftProvision {
  const entry = catalogue.get(catalogueId)!;
  return {
    id: crypto.randomUUID(),
    catalogueId,
    kind: entry.bestammelsetyp === 'Användningsbestämmelse' ? 'användningsbestämmelse' : 'egenskapsbestämmelse',
    code,
    values: initialValues(entry.bestammelseformulering),
    motive: `Motiv för ${code}.`,
    geometries: [newGeometry(polygon)],
    regulates: [],
  };
}

function validPlan(): PlanDraft {
  const draft = newDraft('Luleå');
  Object.assign(draft, { name: 'Testplan', purpose: 'Bostäder och centrum.' });
  draft.areas = [newGeometry(rect(0, 0, 100, 60))];
  const b = provision(BOSTADER, 'B', rect(0, 0, 50, 60));
  const c = provision(CENTRUM, 'C', rect(50, 0, 100, 60));
  const h = provision(NOCKHOJD, 'h1', rect(0, 0, 100, 60));
  h.values[0].value = 'byggnad';
  h.values[1].value = '22';
  h.regulates = [b.id, c.id];
  draft.provisions = [b, c, h];
  return draft;
}

const check = (draft: PlanDraft) => validateDraft(draft, toLmDelivery(draft, catalogue), catalogue);
const stops = (draft: PlanDraft) => check(draft).filter((i) => i.severity === 'stop');
const rules = (draft: PlanDraft) => check(draft).map((i) => i.rule);

describe('catalogue templates', () => {
  it('fills used variables and drops omitted ones (DP-0022)', () => {
    const entry = catalogue.get(NOCKHOJD)!;
    const values = initialValues(entry.bestammelseformulering);
    values[0].value = 'byggnad';
    values[1].value = '22';
    expect(renderWording(entry.bestammelseformulering, values)).toBe('Högsta nockhöjd på byggnad är 22 meter');
    expect(values[1]).toMatchObject({ type: 'decimaltal', unit: 'meter', kind: 'max' });
  });
});

describe('a valid plan', () => {
  it('has no delivery-stopping issues and passes Lantmäteriet’s schema', () => {
    expect(stops(validPlan())).toEqual([]);
  });

  it('exports one yta per polygon with geometry metadata, municipality name and values', () => {
    const draft = validPlan();
    draft.areas.push(newGeometry(rect(200, 0, 220, 20)));
    draft.provisions[0].geometries.push(newGeometry(rect(200, 0, 220, 20)));
    const plan = toLmDelivery(draft, catalogue).features[0].properties as unknown as Record<string, any>;
    expect(plan.kommun).toBe('Luleå');
    expect(plan.plangeometri).toHaveLength(2);
    expect(plan.plangeometri[0].geometri.typ).toBe('yta');
    expect(plan.plangeometri[0].geometrimetadata.lagesbestamningsmetodIPlan).toEqual({ typ: 'lägesplacering', variant: 'digital karta' });
    const h = toLmDelivery(draft, catalogue).features[3].properties as unknown as Record<string, any>;
    expect(h.bestammelseformulering).toBe('Högsta nockhöjd på byggnad är 22 meter');
    expect(h.bestammelsevarde).toEqual([
      { datatyp: 'text', variabelvarde: 'byggnad', beskrivning: 'byggnadsverk' },
      { datatyp: 'decimaltal', variabelvarde: '22', beskrivning: 'höjd', vardetyp: 'max', enhet: 'meter' },
    ]);
  });
});

describe('delivery-stopping rules', () => {
  it('DP-0002: the plan area must be covered by användningsbestämmelser', () => {
    const draft = validPlan();
    draft.provisions[1].geometries = [newGeometry(rect(50, 0, 80, 60))];
    expect(rules(draft)).toContain('DP-0002');
  });

  it('DP-0002 tolerates gaps up to 10 cm', () => {
    const draft = validPlan();
    draft.provisions[1].geometries = [newGeometry(rect(50, 0, 99.95, 60))];
    expect(rules(draft)).not.toContain('DP-0002');
  });

  it('DP-0003: provisions may not reach outside the plan', () => {
    const draft = validPlan();
    draft.provisions[2].geometries = [newGeometry(rect(0, 0, 101, 60))];
    expect(rules(draft)).toContain('DP-0003');
  });

  it('DP-0009: decimal values need a value type and unit', () => {
    const draft = validPlan();
    draft.provisions[2].values[1].unit = undefined;
    expect(rules(draft)).toContain('DP-0009');
  });

  it('DP-Krav-0018: boundaries may not cross themselves', () => {
    const draft = validPlan();
    const [ox, oy] = [829300, 7292300];
    draft.provisions[2].geometries = [newGeometry([[[ox, oy], [ox + 50, oy + 50], [ox + 50, oy], [ox, oy + 50], [ox, oy]]])];
    expect(rules(draft)).toContain('DP-Krav-0018');
  });

  it('DP-0005/0014/0017: a plan in force needs designation, documents and dates', () => {
    const draft = validPlan();
    draft.status = 'laga kraft';
    const found = rules(draft);
    expect(found).toEqual(expect.arrayContaining(['DP-0005', 'DP-0014', 'DP-0017']));
  });

  it('schema: an invalid status value is rejected by Lantmäteriet’s schema', () => {
    const draft = validPlan();
    (draft as { status: string }).status = 'beslutad';
    expect(stops(draft).some((i) => i.message.startsWith('Schema:'))).toBe(true);
  });
});

describe('warnings', () => {
  it('DP-Krav-0011: neighbouring uses closer than 0.5 m without sharing a border', () => {
    const draft = validPlan();
    draft.provisions[1].geometries = [newGeometry(rect(50.3, 0, 100, 60))];
    const issue = check(draft).find((i) => i.rule === 'DP-Krav-0011');
    expect(issue?.severity).toBe('warning');
  });

  it('DP-Krav-0013: tiny overlaps between uses', () => {
    const draft = validPlan();
    draft.provisions[1].geometries = [newGeometry(rect(49.95, 0, 100, 60))];
    expect(rules(draft)).toContain('DP-Krav-0013');
  });
});
