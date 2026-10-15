import type GUI from 'lil-gui';
import type Instance from '@giro3d/giro3d/core/Instance.js';
import EntityInspector from '@giro3d/giro3d/gui/EntityInspector.js';

import type IfcEntity from '../entities/IfcEntity';

/** Debug inspector panel for IfcEntity (dev builds only). */
export default class IfcEntityInspector extends EntityInspector<IfcEntity> {
  constructor(parentGui: GUI, instance: Instance, entity: IfcEntity) {
    super(parentGui, instance, entity, { visibility: true });
  }
}
