import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Frustum,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  SRGBColorSpace,
  Sphere,
  Texture,
  Vector3,
  type Intersection,
  type PerspectiveCamera,
} from 'three';
import proj4 from 'proj4';

import type Context from '@giro3d/giro3d/core/Context.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';

import { nearBoundBelow } from './nearBound';

/**
 * Streams an Esri I3S 1.7+ "3DObject" scene layer (mesh pyramids with node pages) straight from
 * the server, e.g. Luleå's 3D city model. Nothing is stored: tiles are fetched for the current view,
 * kept in memory up to a budget and evicted least-recently-used.
 *
 * - LOD: node switching with `maxScreenThresholdSQ` (projected area of the node's bounding sphere,
 *   in px²). A parent stays visible until all its visible children are loaded.
 * - Work off the main thread: geometry is fetched and converted in Web Workers (i3sWorker.ts),
 *   JPEGs are decoded with createImageBitmap. At most MAX_NEW_PER_FRAME tiles are added per frame,
 *   and downloads for tiles that are no longer wanted are cancelled.
 * - Coordinates: layer CRS -> scene CRS with a per-node linear map (proj4 at the centre +
 *   Jacobian), accurate to mm within a node. Heights are RH 2000, like the terrain; `zOffset` shifts them if needed.
 * - Features: each tile lists its buildings (feature id + triangle range); picking resolves the
 *   clicked building and only its triangles are highlighted, across levels of detail.
 */

interface I3SNode {
  index: number;
  lodThreshold?: number;
  obb: { center: [number, number, number]; halfSize: [number, number, number] };
  children?: number[];
  mesh?: {
    material: { definition: number; resource: number };
    geometry: { definition: number; resource: number; vertexCount: number };
  };
}

interface LayerInfo {
  nodePages: { nodesPerPage: number };
  geometryDefinitions: { geometryBuffers: Record<string, unknown>[] }[];
  materialDefinitions: { alphaMode?: string; pbrMetallicRoughness?: { baseColorTexture?: unknown } }[];
}

export interface I3SOptions {
  name: string;
  /** The layer URL, e.g. .../SceneServer/layers/0 */
  url: string;
  /** proj4 definition of the layer CRS, keyed by its EPSG code. */
  sourceCrs: { code: string; proj4: string };
  targetCrs: string;
  zOffset?: number;
  /**
   * Load the producer's photo textures. Without them every building gets one plain shaded
   * material: a cleaner look, and no texture requests.
   */
  textures?: boolean;
  /** Larger = more detail. 1 follows the producer's thresholds. */
  quality?: number;
  maxLoadedNodes?: number;
  maxConcurrentRequests?: number;
}

interface Converted {
  id: number;
  positions: Float32Array;
  normals: Float32Array;
  uv: Float32Array | null;
  colors: Uint8Array | null;
  featureIds: Float64Array;
  faceRanges: Uint32Array;
  minZ: number;
  maxZ: number;
}

interface Pending {
  jobId: number;
  worker: Worker;
  texture: AbortController;
}

interface Ready {
  index: number;
  geometry: Converted;
  texture: ImageBitmap | null;
  blend: boolean;
}

interface Loaded {
  mesh: Mesh;
  lastUsed: number;
  sphere: Sphere;
  top: number;
}

interface Placement {
  origin: Vector3;
  /** Columns of the 2×2 Jacobian: scene metres per layer metre along layer x and y. */
  ex: [number, number];
  ey: [number, number];
  /** Conservative bounds from the OBB, for culling before the geometry is known. */
  sphere: Sphere;
}

const SAMPLE = 100; // metres, for the Jacobian
const WORKERS = Math.min(4, Math.max(1, (navigator.hardwareConcurrency ?? 4) - 1));
const MAX_NEW_PER_FRAME = 2;
/** Shared by all untextured tiles (never disposed per mesh). */
const PLAIN = new MeshLambertMaterial({ color: 0xe4e2dd, side: DoubleSide });
const HIGHLIGHT = new MeshBasicMaterial({
  color: 0xff3b3b,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -4,
  side: DoubleSide,
});

export default class I3SEntity extends Entity3D {
  public override readonly type = 'I3SEntity' as const;

  private info: LayerInfo | null = null;
  private readonly nodes = new Map<number, I3SNode>();
  private readonly pages = new Map<number, Promise<void>>();
  private readonly loaded = new Map<number, Loaded>();
  private readonly pending = new Map<number, Pending>();
  private readonly readyQueue: Ready[] = [];
  private readonly failed = new Set<number>();
  private readonly placements = new Map<number, Placement>();
  private readonly project: proj4.Converter;
  private readonly shown = new Set<number>();
  private readonly workers: Worker[] = [];
  private readonly jobs = new Map<number, (r: Converted | { error: string }) => void>();
  private nextJob = 1;
  private frame = 0;
  private topZ = -Infinity;
  private highlighted: number | null = null;

  constructor(private readonly options: I3SOptions) {
    super({ object3d: new Group(), name: options.name });
    proj4.defs(options.sourceCrs.code, options.sourceCrs.proj4);
    this.project = proj4(options.sourceCrs.code, options.targetCrs);
    for (let i = 0; i < WORKERS; i++) {
      const worker = new Worker(new URL('./i3sWorker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e: MessageEvent<Converted | { id: number; error: string }>) => {
        this.jobs.get(e.data.id)?.(e.data);
        this.jobs.delete(e.data.id);
      };
      this.workers.push(worker);
    }
  }

  protected override async preprocess(): Promise<void> {
    const res = await fetch(`${this.options.url}?f=json`);
    if (!res.ok) throw new Error(`I3S layer ${this.options.url}: ${res.status}`);
    this.info = (await res.json()) as LayerInfo;
    await this.ensurePage(0);
  }

  // --- Selection --------------------------------------------------------------------------

  /** The building (feature id) under a pick result on this entity, or null. */
  featureAt(hit: Intersection): number | null {
    const data = hit.object.userData as { featureIds?: Float64Array; faceRanges?: Uint32Array };
    const face = hit.faceIndex;
    if (!data.featureIds || !data.faceRanges || face === undefined || face === null) return null;
    for (let i = 0; i < data.featureIds.length; i++) {
      if (face >= data.faceRanges[i * 2] && face <= data.faceRanges[i * 2 + 1]) return data.featureIds[i];
    }
    return null;
  }

  /**
   * Lowest and highest point (scene z) of one building, from the tiles on screen (a building can
   * be split over several), or from any loaded tile; null if it isn't loaded.
   */
  featureZRange(featureId: number): { min: number; max: number } | null {
    const ranges = { shown: { min: Infinity, max: -Infinity }, any: { min: Infinity, max: -Infinity } };
    for (const { mesh } of this.loaded.values()) {
      const ids = mesh.userData.featureIds as Float64Array | undefined;
      const i = ids ? ids.indexOf(featureId) : -1;
      if (i < 0) continue;
      const faces = mesh.userData.faceRanges as Uint32Array;
      const pos = mesh.geometry.getAttribute('position').array as Float32Array;
      for (let v = faces[i * 2] * 3; v < (faces[i * 2 + 1] + 1) * 3; v++) {
        const z = pos[v * 3 + 2] + mesh.position.z;
        for (const r of mesh.visible ? [ranges.shown, ranges.any] : [ranges.any]) {
          if (z < r.min) r.min = z;
          if (z > r.max) r.max = z;
        }
      }
    }
    const best = Number.isFinite(ranges.shown.min) ? ranges.shown : ranges.any;
    return Number.isFinite(best.min) ? best : null;
  }

  /** Highlights one building wherever it is currently drawn (it follows LOD switches). */
  setHighlightedFeature(featureId: number | null): void {
    if (featureId === this.highlighted) return;
    this.highlighted = featureId;
    for (const { mesh } of this.loaded.values()) this.removeHighlight(mesh);
    this.updateHighlights();
    this.notifyChange(this);
  }

  // --- giro3d update cycle ------------------------------------------------------------------

  override preUpdate(context: Context): unknown[] | null {
    if (!this.info || !this.object3d.visible) return null;
    this.frame++;
    this.addReady();

    const camera = context.view.camera as PerspectiveCamera;
    const frustum = new Frustum().setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
    );
    // Side planes only: the near and far planes are last frame's, which this entity helps compute.
    // Culling against them hid tiles that had just come closer than the old near plane.
    const sides = frustum.planes.slice(0, 4);
    const inView = (s: Sphere) => sides.every((p) => p.distanceToPoint(s.center) >= -s.radius);
    const screenHeight = context.view.height;
    const wanted = new Map<number, number>(); // index -> priority
    const show = new Set<number>();

    const sphereOf = (n: I3SNode) => this.loaded.get(n.index)?.sphere ?? this.placement(n).sphere;
    const area = (s: Sphere) => {
      const d = Math.max(1, s.center.distanceTo(camera.position) - s.radius);
      const px = (2 * s.radius * screenHeight) / (2 * d * Math.tan((camera.fov * Math.PI) / 360));
      return Math.PI * (px / 2) ** 2 * (this.options.quality ?? 1);
    };
    const ready = (i: number) => {
      const n = this.nodes.get(i);
      return n !== undefined && (!n.mesh || this.loaded.has(i) || this.failed.has(i));
    };
    const want = (i: number, priority: number) => wanted.set(i, Math.max(priority, wanted.get(i) ?? 0));

    const visit = (index: number) => {
      const node = this.nodes.get(index);
      if (!node) {
        void this.ensurePage(index);
        return;
      }
      if (!inView(this.placement(node).sphere)) return;
      const a = area(sphereOf(node));
      const refine = node.children?.length && (node.lodThreshold === undefined || a > node.lodThreshold);
      if (refine) {
        const visibleChildren = node.children!.filter((c) => {
          const child = this.nodes.get(c);
          if (!child) {
            void this.ensurePage(c);
            return true;
          }
          return inView(this.placement(child).sphere);
        });
        // Descend when every visible child can be drawn, or when this node can't stand in for
        // them (no mesh of its own, or not loaded): then draw the children that are ready and
        // load the rest. Waiting for all of them instead hid every loaded sibling whenever one
        // new tile came into view, so whole districts blinked while orbiting.
        if (visibleChildren.every(ready) || !this.loaded.has(index)) {
          for (const c of node.children!) visit(c);
          return;
        }
        for (const c of visibleChildren) {
          const child = this.nodes.get(c);
          if (child?.mesh && !ready(c)) want(c, area(sphereOf(child)));
        }
      }
      if (node.mesh) {
        if (this.loaded.has(index)) show.add(index);
        else if (!this.failed.has(index)) want(index, a * 2);
      }
    };
    visit(0);

    for (const [index, entry] of this.loaded) {
      entry.mesh.visible = show.has(index);
      if (entry.mesh.visible) entry.lastUsed = this.frame;
    }
    this.shown.clear();
    for (const i of show) this.shown.add(i);
    this.updateHighlights();

    // Cancel downloads the view no longer needs (fast orbiting), then fill free slots by priority.
    for (const index of [...this.pending.keys()]) if (!wanted.has(index)) this.cancel(index);
    const queue = [...wanted].filter(([i]) => !this.pending.has(i)).sort((x, y) => y[1] - x[1]);
    const slots = (this.options.maxConcurrentRequests ?? 6) - this.pending.size;
    for (const [index] of queue.slice(0, Math.max(0, slots))) this.load(index);
    this.evict();
    if (this.readyQueue.length) this.notifyChange(this); // keep adding queued tiles next frame
    return null;
  }

  override postUpdate(context: Context): void {
    let min = Infinity;
    let max = 0;
    const plane = context.distance.plane;
    for (const i of this.shown) {
      const s = this.loaded.get(i)?.sphere;
      if (!s) continue;
      const d = plane.distanceToPoint(s.center);
      min = Math.min(min, d - s.radius);
      max = Math.max(max, d + s.radius);
    }
    // Safe lower bound from the real top of the loaded geometry (not the rotated OBBs, whose
    // half-sizes can be kilometres): nothing visible is closer than this along the view axis.
    const bound = Number.isFinite(this.topZ) ? nearBoundBelow(context.view.camera, this.topZ) : 0;
    this._distance.min = Math.max(bound, min);
    this._distance.max = max;
  }

  override dispose(): void {
    for (const index of [...this.pending.keys()]) this.cancel(index);
    for (const w of this.workers) w.terminate();
    for (const { mesh } of this.loaded.values()) this.disposeMesh(mesh);
    for (const r of this.readyQueue) r.texture?.close();
    this.loaded.clear();
    this.readyQueue.length = 0;
    super.dispose();
  }

  // --- Loading -------------------------------------------------------------------------------

  private ensurePage(nodeIndex: number): Promise<void> {
    const page = Math.floor(nodeIndex / (this.info?.nodePages.nodesPerPage ?? 64));
    let p = this.pages.get(page);
    if (!p) {
      p = fetch(`${this.options.url}/nodepages/${page}?f=json`)
        .then((r) => r.json() as Promise<{ nodes: I3SNode[] }>)
        .then(({ nodes }) => {
          for (const n of nodes) this.nodes.set(n.index, n);
          this.notifyChange(this);
        })
        .catch((err) => console.error(`I3S node page ${page}`, err));
      this.pages.set(page, p);
    }
    return p;
  }

  private placement(node: I3SNode): Placement {
    let p = this.placements.get(node.index);
    if (!p) {
      const [cx, cy, cz] = node.obb.center;
      const [ox, oy] = this.project.forward([cx, cy]);
      const [ax, ay] = this.project.forward([cx + SAMPLE, cy]);
      const [bx, by] = this.project.forward([cx, cy + SAMPLE]);
      const z = cz + (this.options.zOffset ?? 0);
      p = {
        origin: new Vector3(ox, oy, z),
        ex: [(ax - ox) / SAMPLE, (ay - oy) / SAMPLE],
        ey: [(bx - ox) / SAMPLE, (by - oy) / SAMPLE],
        sphere: new Sphere(new Vector3(ox, oy, z), Math.hypot(...node.obb.halfSize)),
      };
      this.placements.set(node.index, p);
    }
    return p;
  }

  private load(index: number): void {
    const node = this.nodes.get(index);
    if (!node?.mesh || !this.info || this.pending.has(index) || this.loaded.has(index)) return;
    const { geometry: g, material: m } = node.mesh;
    const buffers = this.info.geometryDefinitions[g.definition].geometryBuffers[0];
    const matDef = this.info.materialDefinitions[m.definition];
    const textured = (this.options.textures ?? true) && !!matDef?.pbrMetallicRoughness?.baseColorTexture;
    const { ex, ey } = this.placement(node);

    const jobId = this.nextJob++;
    const worker = this.workers[jobId % this.workers.length];
    const textureAbort = new AbortController();
    this.pending.set(index, { jobId, worker, texture: textureAbort });

    const geometry = new Promise<Converted>((resolve, reject) => {
      this.jobs.set(jobId, (r) => ('error' in r ? reject(new Error(r.error)) : resolve(r)));
      worker.postMessage({
        id: jobId,
        url: `${this.options.url}/nodes/${g.resource}/geometries/0`,
        hasRegion: 'uvRegion' in buffers,
        textured,
        // Plain tiles need neither uv nor the producer's vertex colours.
        colors: this.options.textures ?? true,
        ex,
        ey,
      });
    });
    // createImageBitmap decodes off the main thread; flipY is not needed (I3S uv origin is top-left).
    const texture = textured
      ? fetch(`${this.options.url}/nodes/${m.resource}/textures/0`, { signal: textureAbort.signal })
          .then((r) => {
            if (!r.ok) throw new Error(`texture: HTTP ${r.status}`);
            return r.blob();
          })
          .then((blob) => createImageBitmap(blob, { imageOrientation: 'none', premultiplyAlpha: 'none' }))
      : Promise.resolve(null);

    Promise.all([geometry, texture])
      .then(([geom, bitmap]) => {
        if (this.pending.get(index)?.jobId !== jobId) {
          bitmap?.close(); // cancelled meanwhile
          return;
        }
        this.readyQueue.push({ index, geometry: geom, texture: bitmap, blend: matDef?.alphaMode === 'blend' });
      })
      .catch((err: Error) => {
        if (this.pending.get(index)?.jobId === jobId && err.message !== 'aborted' && err.name !== 'AbortError') {
          this.failed.add(index);
          console.warn(`I3S node ${index}`, err);
        }
      })
      .finally(() => {
        if (this.pending.get(index)?.jobId === jobId) this.pending.delete(index);
        this.notifyChange(this);
      });
  }

  private cancel(index: number): void {
    const p = this.pending.get(index);
    if (!p) return;
    this.pending.delete(index);
    p.worker.postMessage({ cancel: p.jobId });
    p.texture.abort();
  }

  /** Adds a few converted tiles per frame, so GPU uploads don't pile up in one frame. */
  private addReady(): void {
    for (const r of this.readyQueue.splice(0, MAX_NEW_PER_FRAME)) {
      const node = this.nodes.get(r.index);
      if (!node || this.loaded.has(r.index)) {
        r.texture?.close();
        continue;
      }
      const g = r.geometry;
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(g.positions, 3));
      geometry.setAttribute('normal', new BufferAttribute(g.normals, 3));
      let map: Texture | null = null;
      if (g.uv && r.texture) {
        geometry.setAttribute('uv', new BufferAttribute(g.uv, 2));
        map = new Texture(r.texture);
        map.flipY = false;
        map.colorSpace = SRGBColorSpace;
        map.needsUpdate = true;
      } else if (g.colors) {
        geometry.setAttribute('color', new BufferAttribute(g.colors, 4, true));
      }
      geometry.computeBoundingSphere();

      const material = this.options.textures === false
        ? PLAIN
        : new MeshLambertMaterial({ map, vertexColors: !map, transparent: r.blend, side: DoubleSide });
      const mesh = new Mesh(geometry, material);
      const { origin } = this.placement(node);
      mesh.position.copy(origin);
      mesh.updateMatrixWorld(true);
      mesh.visible = false; // the next selection pass decides
      mesh.userData = { i3sNode: r.index, featureIds: g.featureIds, faceRanges: g.faceRanges };
      this.object3d.add(mesh);
      this.onObjectCreated(mesh);

      const sphere = geometry.boundingSphere!.clone().translate(origin);
      const top = origin.z + g.maxZ;
      this.topZ = Math.max(this.topZ, top);
      this.loaded.set(r.index, { mesh, lastUsed: this.frame, sphere, top });
    }
  }

  // --- Highlight -----------------------------------------------------------------------------

  private updateHighlights(): void {
    if (this.highlighted === null) return;
    for (const { mesh } of this.loaded.values()) {
      if (!mesh.visible || mesh.userData.highlight) continue;
      const ids = mesh.userData.featureIds as Float64Array;
      const i = ids.indexOf(this.highlighted);
      if (i < 0) continue;
      const ranges = mesh.userData.faceRanges as Uint32Array;
      const [first, last] = [ranges[i * 2], ranges[i * 2 + 1]];
      // Copy just this building's triangles (non-indexed: 3 vertices per face).
      const src = mesh.geometry.getAttribute('position').array as Float32Array;
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(src.slice(first * 9, (last + 1) * 9), 3));
      const overlay = new Mesh(geometry, HIGHLIGHT);
      overlay.renderOrder = 10;
      overlay.raycast = () => {}; // don't let the highlight steal picks
      mesh.add(overlay);
      overlay.updateMatrixWorld(true);
      mesh.userData.highlight = overlay;
    }
  }

  private removeHighlight(mesh: Mesh): void {
    const overlay = mesh.userData.highlight as Mesh | undefined;
    if (!overlay) return;
    mesh.remove(overlay);
    overlay.geometry.dispose();
    delete mesh.userData.highlight;
  }

  // --- Memory --------------------------------------------------------------------------------

  private evict(): void {
    const budget = this.options.maxLoadedNodes ?? 300;
    if (this.loaded.size <= budget) return;
    const candidates = [...this.loaded].filter(([, e]) => !e.mesh.visible).sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [index, { mesh }] of candidates.slice(0, this.loaded.size - budget)) {
      this.object3d.remove(mesh);
      this.disposeMesh(mesh);
      this.loaded.delete(index);
    }
  }

  private disposeMesh(mesh: Mesh): void {
    this.removeHighlight(mesh);
    mesh.geometry.dispose();
    const material = mesh.material as MeshLambertMaterial;
    if (material === PLAIN) return;
    const bitmap = material.map?.source.data as ImageBitmap | undefined;
    material.map?.dispose();
    bitmap?.close();
    material.dispose();
  }
}
