/**
 * How feature layers are coloured, explained (legend) and described (info panel). Plain data:
 * the viewer uses it for styling, and the UI uses it for legends and readable property labels.
 *
 * Plan colours loosely follow Swedish plan-map conventions (bostäder yellow, handel red,
 * industri violet). They are not Boverket's official palette. Colour is never the only
 * carrier of meaning: every colour has a text label in the legend and the info panel (INC-4).
 */

export interface ThemeCategory {
  value: string;
  label: string;
  color: string;
}

export type FieldFormat = 'text' | 'date' | 'link' | 'category';

export interface FieldSpec {
  property: string;
  label: string;
  format?: FieldFormat;
}

export interface Theme {
  /** Property whose value picks the category. Omit for single-colour layers. */
  property?: string;
  categories: ThemeCategory[];
  fallback: { label: string; color: string };
  fillOpacity: number;
  /** Features to outline heavily, e.g. plans open for comments right now. */
  emphasis?: { property: string; values: string[]; label: string };
  /** Properties shown in the info panel, in order. Omit to show all raw properties. */
  fields?: FieldSpec[];
}

export const themes = {
  buildings: {
    categories: [],
    fallback: { label: 'Building (LoD1)', color: '#e8e4dc' },
    fillOpacity: 1,
  },

  trees: {
    categories: [],
    fallback: { label: 'Tree', color: '#5d8c3a' },
    fillOpacity: 1,
    fields: [
      { property: 'species', label: 'Species' },
      { property: 'latin', label: 'Scientific name' },
      { property: 'form', label: 'Form' },
      { property: 'height', label: 'Height' },
      { property: 'source', label: 'Source' },
    ],
  },

  events: {
    categories: [],
    fallback: { label: 'Venue (number of events)', color: '#0e7490' },
    fillOpacity: 1,
  },

  'detaljplaner-pagaende': {
    property: 'SYFTE_1',
    categories: [
      { value: 'Bostäder', label: 'Housing', color: '#f2c94c' },
      { value: 'Centrum', label: 'Centre (mixed use)', color: '#e08a3c' },
      { value: 'Handel', label: 'Retail', color: '#d64545' },
      { value: 'Kontor', label: 'Offices', color: '#e58fb5' },
      { value: 'Verksamheter', label: 'Business', color: '#a77bd4' },
      { value: 'Industri', label: 'Industry', color: '#6a3fa0' },
      { value: 'Skola', label: 'School', color: '#3b82c4' },
      { value: 'Vård', label: 'Care', color: '#2a9d8f' },
      { value: 'Annat', label: 'Other', color: '#9e9e9e' },
    ],
    fallback: { label: 'Unspecified purpose', color: '#bdbdbd' },
    fillOpacity: 0.55,
    emphasis: {
      property: 'SKEDE',
      values: ['Samråd pågår', 'Granskning pågår'],
      label: 'Open for comments now (samråd or granskning)',
    },
    fields: [
      { property: 'DP_NAMN', label: 'Plan' },
      { property: 'SYFTE_1', label: 'Main purpose', format: 'category' },
      { property: 'SKEDE', label: 'Stage' },
      { property: 'DP_SKEDE', label: 'Status' },
      { property: 'OMRADE', label: 'Area' },
      { property: 'ARENDENR', label: 'Case number' },
      { property: 'URL', label: 'More information', format: 'link' },
    ],
  },

  'detaljplaner-gallande': {
    property: 'TYP_PLAN',
    categories: [
      { value: 'PLANDP', label: 'Detaljplan', color: '#4f86c6' },
      { value: 'PLANÄDP', label: 'Ändring av detaljplan', color: '#7fb3e6' },
      { value: 'PLANSPL', label: 'Stadsplan (older; applies as a detaljplan)', color: '#8d6e63' },
      { value: 'PLANBPL', label: 'Byggnadsplan (older; applies as a detaljplan)', color: '#c4a99a' },
      { value: 'PLANOB', label: 'Områdesbestämmelser', color: '#66bb6a' },
      { value: 'Upphävd DP', label: 'Upphävd detaljplan (revoked)', color: '#9e9e9e' },
    ],
    fallback: { label: 'Other', color: '#bdbdbd' },
    fillOpacity: 0.35,
    fields: [
      { property: 'PLANNAMN', label: 'Plan' },
      { property: 'TYP_PLAN', label: 'Type', format: 'category' },
      { property: 'PLANNUMMER', label: 'Plan number' },
      { property: 'LAGA_KRAFT', label: 'In force since' },
      { property: 'LM_AKT_NR', label: 'Lantmäteriet record' },
    ],
  },

  detaljplaneprogram: {
    property: 'PAGAENDE',
    categories: [
      { value: 'Ja', label: 'Programme in progress', color: '#ef6c00' },
      { value: 'Nej', label: 'Adopted programme', color: '#26a69a' },
    ],
    fallback: { label: 'Programme', color: '#26a69a' },
    fillOpacity: 0.3,
    fields: [
      { property: 'OMRADE', label: 'Area' },
      { property: 'PAGAENDE', label: 'Status', format: 'category' },
      { property: 'ANTAGEN', label: 'Adopted', format: 'date' },
      { property: 'URL', label: 'More information', format: 'link' },
    ],
  },

  /** Plans from Lantmäteriet Detaljplan 4.1 deliveries, by LM planstatus. */
  detaljplan: {
    property: 'status',
    categories: [
      { value: 'påbörjad', label: 'Started', color: '#9e9e9e' },
      { value: 'samråd', label: 'Samråd (consultation)', color: '#ffb300' },
      { value: 'granskning', label: 'Granskning (review)', color: '#fb8c00' },
      { value: 'antagen', label: 'Adopted, not yet in force', color: '#7e57c2' },
      { value: 'överklagad', label: 'Appealed', color: '#e53935' },
      { value: 'laga kraft', label: 'In force', color: '#1e88e5' },
      { value: 'upphävd', label: 'Revoked', color: '#757575' },
      { value: 'avslutad', label: 'Closed', color: '#bdbdbd' },
    ],
    fallback: { label: 'Other status', color: '#bdbdbd' },
    fillOpacity: 0.35,
    emphasis: {
      property: 'status',
      values: ['samråd', 'granskning'],
      label: 'Open for comments now (samråd or granskning)',
    },
  },

  'detaljplan-envelope': {
    categories: [],
    fallback: { label: 'Highest allowed building height (approximate area)', color: '#7e57c2' },
    fillOpacity: 0.3,
  },
} satisfies Record<string, Theme>;

export type ThemeId = keyof typeof themes;

export function getTheme(id: ThemeId): Theme {
  return themes[id];
}

/** The category for a property value, or the theme's fallback (with value ''). */
export function categoryOf(theme: Theme, value: unknown): ThemeCategory {
  return theme.categories.find((c) => c.value === value) ?? { value: '', ...theme.fallback };
}

/** Formats a raw property value for display; returns null when there's nothing meaningful. */
export function formatField(theme: Theme, field: FieldSpec, raw: string | undefined): string | null {
  if (raw == null || raw.trim() === '') return null;
  switch (field.format) {
    case 'date': {
      const ms = Number(raw);
      // ArcGIS uses 1900-01-01 as "no date"
      if (!Number.isFinite(ms) || ms <= -2208988800000) return null;
      return new Date(ms).toLocaleDateString('sv-SE');
    }
    case 'category':
      return theme.property === field.property ? categoryOf(theme, raw).label : raw;
    default:
      return raw.trim();
  }
}
