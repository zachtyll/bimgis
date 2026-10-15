import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

const raycaster = new Raycaster();
const plane = new Plane(new Vector3(0, 0, 1), 0);

/**
 * Where the pointer's ray meets the terrain: intersect a level plane, move it to the terrain
 * height there, repeat. Converges in a few steps unless the ray grazes a steep slope. Cheap
 * enough for every pointer move (no GPU picking).
 */
export function groundUnderPointer(
  instance: Instance,
  evt: { clientX: number; clientY: number },
  heightAt: (x: number, y: number) => number,
): Vector3 | null {
  const rect = instance.domElement.getBoundingClientRect();
  const ndc = new Vector2(((evt.clientX - rect.left) / rect.width) * 2 - 1, -((evt.clientY - rect.top) / rect.height) * 2 + 1);
  const camera = instance.view.camera;
  raycaster.setFromCamera(ndc, camera);
  const hit = new Vector3();
  plane.constant = -heightAt(camera.position.x, camera.position.y);
  for (let i = 0; i < 4; i++) {
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    plane.constant = -heightAt(hit.x, hit.y);
  }
  hit.z = heightAt(hit.x, hit.y);
  return hit;
}
