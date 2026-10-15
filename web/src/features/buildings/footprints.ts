/**
 * Building footprints from Luleå kommun's map service (Lantmäteriet's national building model,
 * the whole municipality; the same layer the building facts come from). Only geometry and the
 * national building id are requested. Read live for each check, never stored.
 */
const QUERY = 'https://kartor1.lulea.se/arcgis/rest/services/ext/adresskartan/MapServer/39/query';

/** Rings of [x, y] in EPSG:3006; the first is the outline, any others are holes. */
export type Footprint = [number, number][][];

interface QueryResult {
  features?: { attributes?: { objektidentitet?: string }; geometry?: { rings?: [number, number][][] } }[];
  exceededTransferLimit?: boolean;
  error?: { message: string };
}

async function query(params: Record<string, string>, signal?: AbortSignal): Promise<QueryResult> {
  const search = new URLSearchParams({
    inSR: '3006',
    outSR: '3006',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'true',
    geometryPrecision: '1',
    f: 'json',
    ...params,
  });
  const res = await fetch(`${QUERY}?${search}`, { signal });
  if (!res.ok) throw new Error(`Footprints: HTTP ${res.status}`);
  const body = (await res.json()) as QueryResult;
  if (body.error) throw new Error(`Footprints: ${body.error.message}`);
  return body;
}

/** Footprints intersecting a box (west, south, east, north), paged through. */
export async function footprintsIn(west: number, south: number, east: number, north: number, signal?: AbortSignal): Promise<Footprint[]> {
  const polygons: Footprint[] = [];
  for (let offset = 0, page = 0; page < 10; page++) {
    const body = await query(
      {
        geometry: JSON.stringify({ xmin: west, ymin: south, xmax: east, ymax: north, spatialReference: { wkid: 3006 } }),
        geometryType: 'esriGeometryEnvelope',
        outFields: 'objectid',
        resultOffset: String(offset),
        resultRecordCount: '1000',
      },
      signal,
    );
    for (const f of body.features ?? []) if (f.geometry?.rings?.length) polygons.push(f.geometry.rings);
    if (!body.exceededTransferLimit) break;
    offset += body.features?.length ?? 0;
  }
  return polygons;
}

/** The footprint at a point, with its national building id, or null if no building is there. */
export async function footprintAt(
  x: number,
  y: number,
  signal?: AbortSignal,
): Promise<{ rings: Footprint; nationalId: string | null } | null> {
  const body = await query(
    {
      geometry: JSON.stringify({ x, y, spatialReference: { wkid: 3006 } }),
      geometryType: 'esriGeometryPoint',
      outFields: 'objektidentitet',
      resultRecordCount: '1',
    },
    signal,
  );
  const f = body.features?.[0];
  if (!f?.geometry?.rings?.length) return null;
  return { rings: f.geometry.rings, nationalId: f.attributes?.objektidentitet ?? null };
}
