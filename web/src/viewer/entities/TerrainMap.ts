import type Context from '@giro3d/giro3d/core/Context.js';
import GiroMap from '@giro3d/giro3d/entities/Map.js';

import { nearBoundBelow } from './nearBound';

/**
 * The basemap with terrain. With elevation, the Map measures its near distance to tile bounding
 * boxes that span the terrain's whole height range, which comes out at its 0.5 m minimum even
 * from hundreds of metres up and costs all depth precision. Nothing on the ground is closer than
 * the bound below the highest visible terrain.
 */
export class TerrainMap extends GiroMap {
  override postUpdate(context: Context): void {
    super.postUpdate(context);
    const top = this.getElevationMinMaxForVisibleTiles()?.max;
    if (top === undefined) return;
    this._distance.min = Math.max(this._distance.min, nearBoundBelow(context.view.camera, top));
  }
}
