import { compass, type Receiver, type ReceiverLevel } from './nordic';

/**
 * Guideline values for road traffic noise at homes:
 *  - Förordning (2015:216) om trafikbuller vid bostadsbyggnader: outdoors, at the facade and at
 *    a patio (uteplats);
 *  - Folkhälsomyndighetens allmänna råd om buller inomhus (FoHMFS 2014:13): indoors, in rooms
 *    people sleep and live in.
 */
export const LIMITS = {
  facadeLeq: 60,
  smallFlatLeq: 65,
  protectedLeq: 55,
  protectedLmax: 70,
  patioLeq: 50,
  patioLmax: 70,
  indoorLeq: 30,
  indoorLmax: 45,
} as const;

export interface Side {
  /** Compass direction the facade faces, e.g. "north-east". */
  name: string;
  maxLeq: number;
  maxLmax: number;
  /** Ground floor only, for patios. */
  groundLeq: number;
  groundLmax: number;
}

export interface Check {
  id: 'facade' | 'smallFlat' | 'protectedSide' | 'patio' | 'indoor';
  title: string;
  rule: string;
  /** null: not needed (e.g. no protected side needed when the facade value is met). */
  ok: boolean | null;
  detail: string;
}

export interface Assessment {
  maxLeq: number;
  maxLmax: number;
  sides: Side[];
  /** Facade sound insulation needed to meet the indoor values, dB. */
  requiredInsulation: number;
  checks: Check[];
}

const r = (v: number) => Math.round(v);
const list = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]);

/**
 * Assesses facade levels. `insulation`: the facade's assumed sound reduction (dB), for the
 * indoor estimate. Levels are compared rounded to whole decibels, as reports do.
 */
export function assess(receivers: Receiver[], levels: ReceiverLevel[], insulation: number): Assessment {
  const bySide = new Map<string, Side>();
  let maxLeq = -Infinity;
  let maxLmax = -Infinity;
  receivers.forEach((rcv, i) => {
    const { leq, lmax } = levels[i];
    maxLeq = Math.max(maxLeq, leq);
    maxLmax = Math.max(maxLmax, lmax);
    const name = compass(rcv.nx, rcv.ny);
    const side = bySide.get(name) ?? { name, maxLeq: -Infinity, maxLmax: -Infinity, groundLeq: -Infinity, groundLmax: -Infinity };
    side.maxLeq = Math.max(side.maxLeq, leq);
    side.maxLmax = Math.max(side.maxLmax, lmax);
    if (rcv.floor === 0) {
      side.groundLeq = Math.max(side.groundLeq, leq);
      side.groundLmax = Math.max(side.groundLmax, lmax);
    }
    bySide.set(name, side);
  });
  const order = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  const sides = [...bySide.values()].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

  const protectedSides = sides.filter((s) => r(s.maxLeq) <= LIMITS.protectedLeq && r(s.maxLmax) <= LIMITS.protectedLmax);
  const patioSides = sides.filter((s) => r(s.groundLeq) <= LIMITS.patioLeq && r(s.groundLmax) <= LIMITS.patioLmax);
  const requiredInsulation = Math.max(0, r(maxLeq) - LIMITS.indoorLeq, r(maxLmax) - LIMITS.indoorLmax);
  const facadeOk = r(maxLeq) <= LIMITS.facadeLeq;

  const checks: Check[] = [
    {
      id: 'facade',
      title: 'Facade',
      rule: `At most ${LIMITS.facadeLeq} dBA equivalent level at the facade (Förordning 2015:216, 3 §)`,
      ok: facadeOk,
      detail: `Highest: ${r(maxLeq)} dBA`,
    },
    {
      id: 'protectedSide',
      title: 'Protected side',
      rule: `Where the facade value is exceeded: a side with at most ${LIMITS.protectedLeq} dBA equivalent and ${LIMITS.protectedLmax} dBA maximum level (22–06), which at least half of the living rooms face (4 §)`,
      ok: facadeOk ? null : protectedSides.length > 0,
      detail: facadeOk
        ? 'Not needed: the facade value is met.'
        : protectedSides.length
          ? `Possible towards the ${list(protectedSides.map((s) => s.name))}. Plan at least half of each flat's rooms that way.`
          : 'No side meets it.',
    },
    {
      id: 'smallFlat',
      title: 'Small flats (≤ 35 m²)',
      rule: `At most ${LIMITS.smallFlatLeq} dBA equivalent level at the facade (3 §)`,
      ok: r(maxLeq) <= LIMITS.smallFlatLeq,
      detail: `Highest: ${r(maxLeq)} dBA`,
    },
    {
      id: 'patio',
      title: 'Patio',
      rule: `At most ${LIMITS.patioLeq} dBA equivalent and ${LIMITS.patioLmax} dBA maximum level at a patio by the building (5 §)`,
      ok: patioSides.length > 0,
      detail: patioSides.length
        ? `Possible on the ${list(patioSides.map((s) => s.name))} side (ground floor values).`
        : 'No side meets it at ground level; a shared patio elsewhere or screening is needed.',
    },
    {
      id: 'indoor',
      title: 'Indoors',
      rule: `At most ${LIMITS.indoorLeq} dBA equivalent and ${LIMITS.indoorLmax} dBA maximum level in living rooms and bedrooms (FoHMFS 2014:13)`,
      ok: requiredInsulation <= insulation,
      detail:
        `The facade (walls, windows, vents) must reduce sound by at least ${requiredInsulation} dB` +
        ` on the noisiest side; with ${insulation} dB the worst room gets about` +
        ` ${r(maxLeq - insulation)} dBA equivalent and ${r(maxLmax - insulation)} dBA maximum.`,
    },
  ];
  return { maxLeq, maxLmax, sides, requiredInsulation, checks };
}
