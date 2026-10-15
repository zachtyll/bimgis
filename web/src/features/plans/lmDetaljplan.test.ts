import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseDetailPlan, toGeoJson, type LmFeatureCollection } from './lmDetaljplan';

const delivery = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../spec/examples/katten-6.lm-detaljplan-4.1.json'), 'utf-8'),
) as LmFeatureCollection;

type Fc = { features: { geometry: { type: string; coordinates: unknown[] }; properties: Record<string, unknown> }[] };

describe('Katten 6 delivery (digitised from the plan map)', () => {
  const plan = parseDetailPlan(delivery);
  const byCode = Object.fromEntries(plan.provisions.map((p) => [p.code, p]));

  it('reads every provision with its own geometry', () => {
    expect(plan.quality.complete).toBe(true);
    for (const p of plan.provisions) expect(p.areas.length + p.lines.length).toBeGreaterThan(0);
    expect(byCode.utfartsförbud.lines).toHaveLength(1);
    expect(byCode.utfartsförbud.areas).toHaveLength(0);
    expect(byCode.GATA.areas.length).toBeGreaterThan(1); // Skeppsbrogatan, Skomakargatan, the south end
  });

  it('reads the heights the plan map gives', () => {
    expect(byCode.h1.maxHeight).toBe(22);
    expect(byCode.h2.maxHeight).toBe(26);
    expect(byCode.h3.maxHeight).toBe(45);
    expect(byCode.h3.wording).toBe('Högsta totalhöjd är 45 meter.');
    expect(plan.maxHeight).toBe(45);
  });

  it('builds the envelope from the height areas, not one block over the whole plan', () => {
    const envelope = toGeoJson(plan, 'envelope') as Fc;
    const heights = envelope.features.map((f) => f.properties.height).sort();
    expect(heights).toEqual([22, 26, 45]);
    expect(envelope.features.every((f) => f.properties.planId === plan.id)).toBe(true);
    const boundary = toGeoJson(plan, 'boundary') as Fc;
    expect(boundary.features).toHaveLength(1);
  });
});
