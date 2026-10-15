import { describe, expect, it } from 'vitest';

import { assess } from './assessment';
import type { Receiver } from './nordic';

const rcv = (ny: number, floor = 0): Receiver => ({ x: 0, y: 0, h: 1.5 + floor * 3, nx: 0, ny, facade: ny > 0 ? 0 : 1, floor });
const north = rcv(1);
const south = rcv(-1);

describe('noise assessment', () => {
  it('passes a quiet building', () => {
    const a = assess([north, south], [{ leq: 52, lmax: 66, loudest: 's' }, { leq: 44, lmax: 58, loudest: 's' }], 30);
    const ok = Object.fromEntries(a.checks.map((c) => [c.id, c.ok]));
    expect(ok).toEqual({ facade: true, protectedSide: null, smallFlat: true, patio: true, indoor: true });
    expect(a.requiredInsulation).toBe(22);
  });

  it('asks for a protected side when the facade value is exceeded, and finds it', () => {
    const a = assess([north, south], [{ leq: 63, lmax: 78, loudest: 's' }, { leq: 49, lmax: 64, loudest: 's' }], 30);
    const protectedSide = a.checks.find((c) => c.id === 'protectedSide')!;
    expect(a.checks.find((c) => c.id === 'facade')!.ok).toBe(false);
    expect(protectedSide.ok).toBe(true);
    expect(protectedSide.detail).toContain('south');
    expect(a.checks.find((c) => c.id === 'patio')!.detail).toContain('south');
    // Indoors: 63 − 30 = 33 > 30 and 78 − 30 = 48 > 45: a 33 dB facade is needed.
    expect(a.requiredInsulation).toBe(33);
    expect(a.checks.find((c) => c.id === 'indoor')!.ok).toBe(false);
  });

  it('rounds like a noise report (55.4 dBA meets 55)', () => {
    const a = assess([north, south], [{ leq: 61, lmax: 72, loudest: 's' }, { leq: 55.4, lmax: 70.3, loudest: 's' }], 30);
    expect(a.checks.find((c) => c.id === 'protectedSide')!.ok).toBe(true);
  });
});
