/**
 * Luleå kommun's ground model (5 m grid, RH 2000), read live from their ImageServer and
 * reprojected by their server to EPSG:3006. Uncompressed float32 GeoTIFF: its native tiles are
 * LERC, which giro3d can't read. No licence is stated, so nothing is stored; areas outside the
 * municipality come back as no-data.
 */
const EXPORT = 'https://kartportal.lulea.se/server/rest/services/Markmodell/ImageServer/exportImage';
const OPTIONS = 'bboxSR=3006&imageSR=3006&format=tiff&pixelType=F32&noData=-9999&interpolation=RSP_BilinearInterpolation&f=image';

export const TERRAIN_NODATA = -9999;

/** URL template for giro3d's UrlImageSource (map tiles). */
export const TERRAIN_URL_TEMPLATE = `${EXPORT}?bbox={minx},{miny},{maxx},{maxy}&size={width},{height}&${OPTIONS}`;

/** URL for one grid: west, south, east, north in EPSG:3006 and a size in pixels. */
export function terrainExportUrl(west: number, south: number, east: number, north: number, width: number, height: number): string {
  return `${EXPORT}?bbox=${west},${south},${east},${north}&size=${width},${height}&${OPTIONS}`;
}
