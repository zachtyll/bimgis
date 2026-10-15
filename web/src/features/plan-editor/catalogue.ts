import type { DraftValue, LmUnit, ProvisionKind } from './draft';

/** Snapshot of Boverket's planbestämmelsekatalog (scripts/fetch_boverket_catalogue.py). */
export interface CatalogueEntry {
  id: string;
  beteckning: string | null;
  bestammelsetyp: 'Användningsbestämmelse' | 'Egenskapsbestämmelse';
  anvandningsform: 'Kvartersmark' | 'Allmän plats' | 'Vattenområde' | string;
  kategori: string | null;
  underkategori: string | null;
  bestammelseformulering: string;
  geometrityp: string | null;
}

export interface Catalogue {
  release: { id: number; namn: string; publicerad: string };
  bestammelser: CatalogueEntry[];
}

const CATALOGUE_URL = '/data/boverket/planbestammelsekatalog.json';
let pending: Promise<Catalogue> | null = null;

export function loadCatalogue(): Promise<Catalogue> {
  pending ??= fetch(CATALOGUE_URL).then((res) => {
    if (!res.ok) throw new Error(`Could not load the planbestämmelsekatalog (${res.status})`);
    return res.json() as Promise<Catalogue>;
  });
  return pending;
}

export function kindOf(entry: CatalogueEntry): ProvisionKind {
  return entry.bestammelsetyp === 'Användningsbestämmelse' ? 'användningsbestämmelse' : 'egenskapsbestämmelse';
}

const VARIABLE = /\[([^\]:]+):([^\]]+)\]/g;

/** The [name:type] variables of a catalogue template, in order. */
export function templateVariables(template: string): { variable: string; type: 'text' | 'decimaltal' }[] {
  return [...template.matchAll(VARIABLE)].map((m) => ({
    variable: m[1],
    // heltal (integer) is exchanged as decimaltal: LM only knows text and decimaltal.
    type: m[2] === 'text' ? 'text' : 'decimaltal',
  }));
}

/**
 * The legally binding wording: the template with given values filled in and empty (omitted)
 * variables removed. Must match exactly or the delivery stops (DP-0022).
 */
export function renderWording(template: string, values: DraftValue[]): string {
  const byName = new Map(values.map((v) => [v.variable, v.value.trim()]));
  return template.replace(VARIABLE, (_, name: string) => byName.get(name) ?? '').replace(/\s+/g, ' ').trim();
}

/** Empty value slots for a template, with unit/kind guesses for decimal variables. */
export function initialValues(template: string): DraftValue[] {
  return templateVariables(template).map(({ variable, type }) =>
    type === 'text' ? { variable, type, value: '' } : { variable, type, value: '', ...guessUnit(variable) },
  );
}

function guessUnit(variable: string): { unit: LmUnit; kind: DraftValue['kind'] } {
  const v = variable.toLowerCase();
  if (/(höjd|avstånd|djup|bredd|längd|nivå|utkragning|meter)/.test(v)) return { unit: 'meter', kind: 'max' };
  if (/(area|yta|byggnadsarea|bruttoarea)/.test(v)) return { unit: 'kvadratmeter', kind: 'max' };
  if (/(vinkel|lutning|grader)/.test(v)) return { unit: 'grader', kind: 'max' };
  if (/(procent|andel)/.test(v)) return { unit: 'procent', kind: 'max' };
  if (/(år)/.test(v)) return { unit: 'år', kind: 'exakt' };
  return { unit: 'antal', kind: 'max' };
}

/** Free-text search over wording, designation and categories. */
export function searchCatalogue(entries: CatalogueEntry[], query: string, kind?: ProvisionKind): CatalogueEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((e) => {
    if (kind && kindOf(e) !== kind) return false;
    const haystack = [e.bestammelseformulering, e.beteckning, e.kategori, e.underkategori, e.anvandningsform]
      .join(' ')
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
