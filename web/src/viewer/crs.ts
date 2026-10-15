import { Vector3 } from 'three';
import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem.js';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';

/** SWEREF 99 TM, the Swedish national projected CRS. Heights are RH 2000. */
export const crs = CoordinateSystem.register(
  'EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);

/** Basemap extent: Luleå kommun's plan areas (Råneå to Ersnäs), with a margin. */
export const extent = new Extent(crs, 790000, 866000, 7266000, 7358000);

/** Initial camera target: central Luleå (Stadsparken / Storgatan). */
export const home = new Vector3(829400, 7292400, 0);

/** proj4 definitions of other CRSs that sources may use. */
export const SOURCE_CRS = {
  /** SWEREF 99 21 45: Luleå kommun's local projection (its map and scene services). */
  'EPSG:3017': '+proj=tmerc +lat_0=0 +lon_0=21.75 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
} as const;
