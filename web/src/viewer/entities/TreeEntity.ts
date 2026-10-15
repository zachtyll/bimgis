import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  Frustum,
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  Sphere,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type Context from '@giro3d/giro3d/core/Context.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';

import type { Tree, TreeForm } from '@/features/trees/trees';

export interface TreeEntityOptions {
  name: string;
  load: (signal: AbortSignal) => Promise<Tree[]>;
  /** Height of the rendered terrain, or null where none is loaded. */
  terrainAt: (x: number, y: number) => number | null;
}

const TRUNK = new Color('#6b4f3a');
const CROWN: Record<TreeForm, Color> = { broadleaf: new Color('#5d8c3a'), conifer: new Color('#365f3c') };
const HIGHLIGHT = new MeshBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0.6, depthWrite: false });

/**
 * Simple tree shapes, one unit high (scaled by each tree's height): a trunk and a round crown
 * for broadleaves, a narrow cone for conifers. Vertex colours, so one draw call per form.
 */
function unitTree(form: TreeForm): BufferGeometry {
  const parts =
    form === 'conifer'
      ? [
          paint(new CylinderGeometry(0.025, 0.035, 0.2, 6).translate(0, 0.1, 0), TRUNK),
          paint(new ConeGeometry(0.2, 0.85, 8).translate(0, 0.15 + 0.425, 0), CROWN.conifer),
        ]
      : [
          paint(new CylinderGeometry(0.03, 0.045, 0.4, 6).translate(0, 0.2, 0), TRUNK),
          paint(new IcosahedronGeometry(0.3, 1).scale(1, 1.15, 1).translate(0, 0.65, 0), CROWN.broadleaf),
        ];
  // three's primitives are Y-up; the scene is Z-up.
  const merged = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))!.rotateX(Math.PI / 2);
  for (const g of parts) g.dispose();
  return merged;
}

function paint(geometry: BufferGeometry, color: Color): BufferGeometry {
  const n = geometry.getAttribute('position').count;
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) color.toArray(colors, i * 3);
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

/** A little variation in shade and shape, stable per tree. */
function jitter(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000; // 0..1
}

/**
 * Single trees as instanced meshes, standing on the ground. Instance matrices are relative to a
 * local origin: float32 can't hold SWEREF coordinates (7 million metres) to better than ~0.5 m.
 */
export default class TreeEntity extends Entity3D {
  public override readonly type = 'TreeEntity' as const;

  private trees: Tree[] = [];
  private readonly meshes = new Map<TreeForm, { mesh: InstancedMesh; trees: Tree[] }>();
  private readonly origin = new Vector3();
  private readonly abort = new AbortController();
  private highlight: Mesh | null = null;
  /** Bounding spheres in scene coordinates, for near/far planes. */
  private spheres: Sphere[] = [];

  constructor(private readonly options: TreeEntityOptions) {
    super({ object3d: new Group(), name: options.name });
  }

  override async preprocess(): Promise<void> {
    try {
      this.trees = await this.options.load(this.abort.signal);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error('Trees failed to load', err);
      return;
    }
    if (!this.trees.length) return;
    this.origin.set(this.trees[0].x, this.trees[0].y, 0);
    this.object3d.position.copy(this.origin);
    this.object3d.updateMatrix(); // giro3d objects don't update their matrices automatically
    this.object3d.updateMatrixWorld(true);
    for (const form of ['broadleaf', 'conifer'] as const) {
      const trees = this.trees.filter((t) => t.form === form);
      if (!trees.length) continue;
      const mesh = new InstancedMesh(unitTree(form), new MeshLambertMaterial({ vertexColors: true }), trees.length);
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.name = `trees-${form}`;
      mesh.userData.trees = trees;
      for (let i = 0; i < trees.length; i++) {
        const shade = 0.85 + 0.3 * jitter(trees[i].id);
        mesh.setColorAt(i, new Color(shade, shade, shade));
      }
      this.meshes.set(form, { mesh, trees });
      this.object3d.add(mesh);
      this.onObjectCreated(mesh);
    }
    this.placeTrees();
  }

  /** The tree under a pick result, if it hit one of ours. */
  treeAt(hit: { object: unknown; instanceId?: number }): Tree | null {
    for (const { mesh, trees } of this.meshes.values()) {
      if (hit.object === mesh && hit.instanceId != null) return trees[hit.instanceId] ?? null;
    }
    return null;
  }

  /**
   * Places trees on the rendered terrain, so they stand on the ground you see (it can differ by
   * metres from a surveyed ground height while coarse terrain is shown); the source's ground
   * height is the fallback. Call again when finer terrain has loaded.
   */
  placeTrees(): void {
    const m = new Matrix4();
    const q = new Quaternion();
    const s = new Vector3();
    const p = new Vector3();
    const spheres: Sphere[] = [];
    for (const { mesh, trees } of this.meshes.values()) {
      for (let i = 0; i < trees.length; i++) {
        const t = trees[i];
        const ground = this.options.terrainAt(t.x, t.y) ?? t.groundZ ?? 0;
        const j = jitter(t.id);
        const width = t.height * (0.9 + 0.25 * j);
        p.set(t.x - this.origin.x, t.y - this.origin.y, ground);
        q.setFromAxisAngle(new Vector3(0, 0, 1), j * Math.PI * 2);
        s.set(width, width, t.height);
        mesh.setMatrixAt(i, m.compose(p, q, s));
        spheres.push(new Sphere(new Vector3(t.x, t.y, ground + t.height / 2), t.height * 0.6));
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.computeBoundingBox();
      mesh.updateMatrixWorld(true);
    }
    this.spheres = spheres;
    this.notifyChange(this);
  }

  /** Outlines one tree (by id), or none. */
  setHighlighted(id: string | null): void {
    if (this.highlight) {
      this.object3d.remove(this.highlight);
      this.highlight = null;
    }
    if (!id) return this.notifyChange(this);
    for (const { mesh, trees } of this.meshes.values()) {
      const i = trees.findIndex((t) => t.id === id);
      if (i < 0) continue;
      const overlay = new Mesh(mesh.geometry, HIGHLIGHT);
      const matrix = new Matrix4();
      mesh.getMatrixAt(i, matrix);
      overlay.applyMatrix4(matrix);
      overlay.scale.multiplyScalar(1.04);
      overlay.renderOrder = 10;
      overlay.raycast = () => {}; // don't let the highlight steal picks
      this.object3d.add(overlay);
      overlay.updateMatrixWorld(true);
      this.highlight = overlay;
    }
    this.notifyChange(this);
  }

  /**
   * Near/far from the trees actually in view. Trees spread over hills, so one "highest tree"
   * bound would be far too loose. Only the frustum's side planes are tested: its near and far
   * planes are last frame's, which this computes.
   */
  override postUpdate(context: Context): void {
    const camera = context.view.camera;
    const frustum = new Frustum().setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
    );
    const sides = frustum.planes.slice(0, 4);
    const plane = context.distance.plane;
    let min = Infinity;
    let max = 0;
    for (const s of this.spheres) {
      if (sides.some((p) => p.distanceToPoint(s.center) < -s.radius)) continue;
      const d = plane.distanceToPoint(s.center);
      if (d + s.radius < 0) continue; // behind the camera
      min = Math.min(min, d - s.radius);
      max = Math.max(max, d + s.radius);
    }
    this._distance.min = Number.isFinite(min) ? Math.max(0.5, min) : Infinity;
    this._distance.max = max;
  }

  override dispose(): void {
    this.abort.abort();
    for (const { mesh } of this.meshes.values()) {
      mesh.geometry.dispose();
      (mesh.material as MeshLambertMaterial).dispose();
      mesh.dispose();
    }
    this.meshes.clear();
  }
}
