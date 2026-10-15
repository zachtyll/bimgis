/**
 * Events from visitlulea.se, via our backend (/api/events): their listing endpoint has no CORS
 * headers. We show what's on and where, and link to their pages for everything else.
 */

export interface Occurrence {
  /** Local time (Europe/Stockholm), ISO without offset. Midnight usually means "no time given". */
  start: string | null;
  end: string | null;
}

export interface EventItem {
  id: number;
  title: string;
  category: string | null;
  location: string | null;
  /** Null when the location matches no known venue: listed, but not on the map. */
  venueId: string | null;
  /** The event's page on visitlulea.se. */
  url: string;
  dates: Occurrence[];
}

export interface Venue {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface EventsView {
  from: string;
  to: string;
  events: EventItem[];
  venues: Venue[];
  fetchedAt: string;
  /** The listing page on visitlulea.se. */
  source: string;
}

export const EVENT_WINDOWS = [7, 30, 90, 365] as const;

export function eventsUrl(days: number): string {
  return `/api/events?days=${days}`;
}

export function daysOf(url: string): number {
  return Number(new URL(url, window.location.origin).searchParams.get('days')) || 30;
}

let last: { url: string; at: number; result: Promise<EventsView> } | null = null;

/** The listing for a URL; the map layer and the panel share one request. */
export function loadEvents(url: string): Promise<EventsView> {
  if (!last || last.url !== url || Date.now() - last.at > 5 * 60_000) {
    const result = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`Events: HTTP ${res.status}`);
      return res.json() as Promise<EventsView>;
    });
    result.catch(() => {
      if (last?.result === result) last = null; // retry next time
    });
    last = { url, at: Date.now(), result };
  }
  return last.result;
}

/** One point per venue with its number of events, EPSG:3006 GeoJSON for the map layer. */
export function venuesGeoJson(view: EventsView): object {
  const counts = new Map<string, number>();
  for (const e of view.events) if (e.venueId) counts.set(e.venueId, (counts.get(e.venueId) ?? 0) + 1);
  return {
    type: 'FeatureCollection',
    features: view.venues.map((v) => ({
      type: 'Feature',
      id: v.id,
      geometry: { type: 'Point', coordinates: [v.x, v.y] },
      properties: { venueId: v.id, name: v.name, events: counts.get(v.id) ?? 0 },
    })),
  };
}

/** Events at a venue (or, with null, those without a place), soonest first. */
export function eventsAt(view: EventsView, venueId: string | null): EventItem[] {
  return view.events
    .filter((e) => e.venueId === venueId)
    .sort((a, b) => (a.dates[0]?.start ?? '').localeCompare(b.dates[0]?.start ?? ''));
}

const dateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });
const timeFormat = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit' });

/** "tis 13 okt", "tis 13 okt 18:00", or a range "1 okt – 25 okt" for exhibitions. */
export function formatOccurrence(o: Occurrence): string {
  if (!o.start) return '';
  const start = new Date(o.start);
  const end = o.end ? new Date(o.end) : null;
  const hasTime = start.getHours() !== 0 || start.getMinutes() !== 0;
  if (end && end.toDateString() !== start.toDateString()) {
    return `${dateFormat.format(start)} – ${dateFormat.format(end)}`;
  }
  return hasTime ? `${dateFormat.format(start)} ${timeFormat.format(start)}` : dateFormat.format(start);
}
