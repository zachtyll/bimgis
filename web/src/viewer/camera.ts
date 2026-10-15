import type { Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import type Instance from '@giro3d/giro3d/core/Instance.js';

/** Camera position and look-at target in the scene CRS. Serialisable (comments, URLs, BCF). */
export interface Viewpoint {
  position: [number, number, number];
  target: [number, number, number];
}

/** Looks at `target` from the south-west, at an oblique angle. */
export function initializeCamera(instance: Instance, target: Vector3): MapControls {
  const camera = instance.view.camera;
  camera.position.set(target.x - 500, target.y - 900, target.z + 700);

  const controls = new MapControls(camera, instance.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  controls.maxPolarAngle = Math.PI / 2.3;
  // Scroll zooms towards what's under the pointer (the camera moves along the pointer's ray, so
  // that spot stays under the pointer), not towards the middle of the view.
  controls.zoomToCursor = true;
  controls.saveState();

  instance.view.setControls(controls);
  return controls;
}
