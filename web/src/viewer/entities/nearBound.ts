import type { Camera } from 'three';

/**
 * A safe lower bound on the distance (along the view axis) from the camera to anything lying at
 * or below `topZ`, for entities whose bounding volumes are too loose to give a useful near plane.
 *
 * Every visible point is at least (cameraZ - topZ) away, and its distance along the view
 * direction is at least that times cos(half the diagonal field of view). giro3d derives the near
 * plane from the smallest entity distance; with a near plane at 0.5 m and a far plane tens of km
 * away, depth precision is gone and surfaces flicker against each other.
 *
 * Returns 0 when the camera is at or below `topZ` (no bound) or isn't a perspective camera.
 */
export function nearBoundBelow(camera: Camera, topZ: number): number {
  const above = camera.position.z - topZ;
  if (!(above > 0) || !('fov' in camera) || !('aspect' in camera)) return 0;
  const halfV = ((camera.fov as number) * Math.PI) / 360;
  const halfDiagonal = Math.atan(Math.tan(halfV) * Math.hypot(1, camera.aspect as number));
  return above * Math.cos(halfDiagonal);
}
