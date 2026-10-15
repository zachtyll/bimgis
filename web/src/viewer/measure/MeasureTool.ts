import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Points,
  PointsMaterial,
  Raycaster,
  ShapeUtils,
  Vector2,
  Vector3,
} from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

import { Label } from './Label';
import {
  baseHeight,
  distance3d,
  formatArea,
  formatCoordinate,
  formatHeight,
  formatLength,
  formatVolume,
  horizontal,
  pathLength,
  perimeter,
  planArea,
  prismVolume,
  ringStep,
  surfaceArea,
  type P3,
} from './measureMath';

export type MeasureKind = 'distance' | 'height' | 'point' | 'radius' | 'volume';

/** A picked spot: where, and whether it is the ground (terrain) rather than a building, tree… */
export interface SurfacePoint {
  p: P3;
  ground: boolean;
}

export interface MeasureHost {
  instance: Instance;
  /** The nearest visible surface under the pointer (buildings, models, trees, terrain). */
  pick(evt: { clientX: number; clientY: number }): SurfacePoint | null;
  /** Terrain height, or null where no terrain is loaded. */
  terrainAt(x: number, y: number): number | null;
}

/** A finished measurement: its 3D graphics and its numbers as plain text. */
export interface Measurement {
  id: string;
  kind: MeasureKind;
  title: string;
  rows: { label: string; value: string }[];
  object: Group;
}

export interface MeasureCallbacks {
  /** Live numbers while measuring (null: nothing to show yet). */
  onPreview(rows: { label: string; value: string }[] | null, hint: string): void;
  onDone(m: Measurement): void;
}

const COLOR = { line: 0xf59e0b, guide: 0x0ea5e9, body: 0xf59e0b, beam: 0xfacc15, point: 0x111827 };
const CLICK_TOLERANCE_PX = 4;
const CLOSE_PX = 12;
const GROUND_EPS = 0.5;
const DRAPE_STEP = 2;

const HINTS: Record<MeasureKind, string> = {
  distance: 'Click points on anything to measure straight across. Double-click or Enter to finish; Backspace removes the last point.',
  height: 'Click a point, then another: the height difference between them.',
  point: 'Click any point for its coordinates and height.',
  radius: 'Click the centre, move out and click to set the radius. Then point anywhere to see how far it is.',
  volume: 'Click corners on the surface; click the first corner (or Enter) to close. Then move up for the height and click. Esc keeps just the area.',
};

let nextId = 1;

/** Interactive measuring: one tool active at a time; finished measurements are handed over. */
export class MeasureTool {
  private readonly preview = new Group();
  private pts: SurfacePoint[] = [];
  private hover: SurfacePoint | null = null;
  private phase: 'points' | 'height' | 'inspect' = 'points';
  private top = 0;
  private down: { x: number; y: number } | null = null;
  private pending: PointerEvent | null = null;
  private frame = 0;
  private origin: P3 | null = null;
  private inspectCentre: P3 | null = null;
  private readonly raycaster = new Raycaster();

  constructor(
    private readonly host: MeasureHost,
    readonly kind: MeasureKind,
    private readonly cb: MeasureCallbacks,
  ) {
    this.preview.renderOrder = 1500;
    void host.instance.add(this.preview);
    const el = host.instance.domElement;
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('dblclick', this.onDoubleClick);
    window.addEventListener('keydown', this.onKey);
    el.style.cursor = 'crosshair';
    this.cb.onPreview(null, HINTS[kind]);
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    const el = this.host.instance.domElement;
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerdown', this.onDown);
    el.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('dblclick', this.onDoubleClick);
    window.removeEventListener('keydown', this.onKey);
    el.style.cursor = '';
    disposeGroup(this.preview);
    this.host.instance.remove(this.preview);
    this.host.instance.notifyChange();
  }

  // ---- input ---------------------------------------------------------------------------------

  private readonly onKey = (evt: KeyboardEvent) => {
    if (evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) return;
    if (evt.key === 'Escape') {
      if (this.kind === 'volume' && this.phase === 'height') this.finish(false);
      else this.reset();
    } else if (evt.key === 'Enter') {
      this.complete();
    } else if (evt.key === 'Backspace' && this.phase === 'points') {
      this.pts.pop();
      this.redraw();
    } else return;
    evt.preventDefault();
  };

  private readonly onDown = (evt: PointerEvent) => {
    if (evt.button === 0) this.down = { x: evt.clientX, y: evt.clientY };
  };

  private readonly onUp = (evt: PointerEvent) => {
    if (evt.button !== 0 || !this.down) return;
    const moved = Math.hypot(evt.clientX - this.down.x, evt.clientY - this.down.y);
    this.down = null;
    if (moved > CLICK_TOLERANCE_PX) return; // a camera drag
    this.click(evt);
  };

  /** Pointer moves are handled once per frame: picking the scene is not free. */
  private readonly onMove = (evt: PointerEvent) => {
    this.pending = evt;
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const e = this.pending;
      this.pending = null;
      if (!e) return;
      if (this.kind === 'volume' && this.phase === 'height') this.top = this.heightUnder(e);
      else this.hover = this.host.pick(e);
      this.redraw();
    });
  };

  private click(evt: PointerEvent): void {
    if (this.kind === 'volume' && this.phase === 'height') {
      this.top = this.heightUnder(evt);
      this.finish(true);
      return;
    }
    const hit = this.host.pick(evt);
    if (!hit) return;
    if (this.phase === 'inspect') {
      // A click after a finished circle starts a new one.
      this.phase = 'points';
      this.inspectCentre = null;
      this.pts = [];
    }
    if (this.kind === 'volume' && this.pts.length >= 3 && this.nearFirst(evt)) {
      this.complete();
      return;
    }
    this.origin ??= hit.p;
    this.pts.push(hit);
    if (this.kind === 'point') return this.finish(true);
    if ((this.kind === 'height' || this.kind === 'radius') && this.pts.length === 2) return this.finish(true);
    this.redraw();
  }

  /** Double-click finishes a line or closes a polygon. Pointer events don't count clicks. */
  private readonly onDoubleClick = () => {
    if (this.phase !== 'points') return;
    // Both clicks of the double-click added a point at the same spot: keep one.
    const [a, b] = this.pts.slice(-2);
    if (a && b && distance3d(a.p, b.p) < 0.5) this.pts.pop();
    this.complete();
  };

  /** Enter / closing the polygon: finish what can be finished. */
  private complete(): void {
    if (this.kind === 'distance' && this.pts.length >= 2) this.finish(true);
    else if (this.kind === 'volume' && this.phase === 'points' && this.pts.length >= 3) {
      this.phase = 'height';
      this.top = baseHeight(this.pts.map((s) => s.p));
      this.redraw();
    }
  }

  private nearFirst(evt: PointerEvent): boolean {
    const first = this.pts[0];
    if (!first) return false;
    const rect = this.host.instance.domElement.getBoundingClientRect();
    const s = new Vector3(...first.p).project(this.host.instance.view.camera);
    const sx = rect.left + ((s.x + 1) / 2) * rect.width;
    const sy = rect.top + ((1 - s.y) / 2) * rect.height;
    return Math.hypot(sx - evt.clientX, sy - evt.clientY) <= CLOSE_PX;
  }

  /** Height under the pointer on a vertical plane through the polygon, facing the camera. */
  private heightUnder(evt: { clientX: number; clientY: number }): number {
    const pts = this.pts.map((s) => s.p);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const camera = this.host.instance.view.camera;
    const normal = new Vector3(camera.position.x - cx, camera.position.y - cy, 0);
    if (normal.lengthSq() < 1e-6) normal.set(1, 0, 0);
    normal.normalize();
    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, new Vector3(cx, cy, 0));
    const rect = this.host.instance.domElement.getBoundingClientRect();
    const ndc = new Vector2(((evt.clientX - rect.left) / rect.width) * 2 - 1, -((evt.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, camera);
    const hit = this.raycaster.ray.intersectPlane(plane, new Vector3());
    const base = baseHeight(pts);
    return hit ? Math.max(base, hit.z) : base;
  }

  private reset(): void {
    this.pts = [];
    this.phase = 'points';
    this.origin = null;
    this.inspectCentre = null;
    this.redraw();
    this.cb.onPreview(null, HINTS[this.kind]);
  }

  // ---- drawing -------------------------------------------------------------------------------

  private redraw(): void {
    disposeGroup(this.preview);
    const working = this.phase === 'inspect' ? [] : this.pts.map((s) => s.p);
    const hover = this.hover?.p;
    const origin = this.origin ?? hover ?? this.inspectCentre;
    if (!origin) return this.host.instance.notifyChange();
    this.preview.position.set(...origin);

    let rows: { label: string; value: string }[] | null = null;
    if (this.phase === 'inspect' && this.inspectCentre && hover) {
      const d = horizontal(this.inspectCentre, hover);
      const g = new Graphics(origin);
      g.line([this.inspectCentre, hover], COLOR.guide, true);
      g.label(hover, [`${formatLength(d)} from the centre`]);
      this.preview.add(g.group);
      rows = [{ label: 'From the centre', value: formatLength(d) }];
    } else if (working.length || hover) {
      // In height mode the pointer sets the height; it isn't another corner.
      const draft = this.build(working, this.phase === 'points' ? hover : undefined, true);
      this.preview.add(draft.object);
      rows = draft.rows.length ? draft.rows : null;
    }
    this.preview.updateMatrixWorld(true);
    this.host.instance.notifyChange();
    this.cb.onPreview(rows, HINTS[this.kind]);
  }

  private finish(complete: boolean): void {
    const pts = this.pts.map((s) => s.p);
    if (!pts.length) return;
    const origin = this.origin ?? pts[0];
    const built = this.build(pts, undefined, false, complete);
    built.object.position.set(...origin);
    built.object.updateMatrixWorld(true);
    this.cb.onDone({ id: `m${nextId++}`, kind: this.kind, title: built.title, rows: built.rows, object: built.object });
    if (this.kind === 'radius') {
      this.inspectCentre = pts[0];
      this.phase = 'inspect';
      this.redraw();
      return;
    }
    this.reset();
  }

  /** Graphics and numbers for the current points (plus the hovered one while drafting). */
  private build(pts: P3[], hover: P3 | undefined, draft: boolean, withBody = true) {
    const origin = this.origin ?? pts[0] ?? hover!;
    const g = new Graphics(origin);
    const all = hover && draft ? [...pts, hover] : pts;
    const rows: { label: string; value: string }[] = [];
    let title = '';

    switch (this.kind) {
      case 'distance': {
        title = 'Distance';
        g.markers(all);
        if (all.length >= 2) {
          g.line(all, COLOR.line);
          for (let i = 1; i < all.length; i++) {
            const a = all[i - 1];
            const b = all[i];
            g.label(mid(a, b), [formatLength(distance3d(a, b))]);
          }
          const a = all[0];
          const b = all[all.length - 1];
          rows.push({ label: 'Straight line (3D)', value: formatLength(pathLength(all)) });
          if (all.length === 2) {
            rows.push({ label: 'Along the ground', value: formatLength(horizontal(a, b)) });
            rows.push({ label: 'Height difference', value: formatLength(Math.abs(b[2] - a[2])) });
          } else {
            rows.push({ label: 'Segments', value: String(all.length - 1) });
          }
          g.label(b, [`Total ${formatLength(pathLength(all))}`], true);
        }
        break;
      }
      case 'height': {
        title = 'Height';
        g.markers(all);
        if (all.length >= 2) {
          const [a, b] = all;
          const [low, high] = a[2] <= b[2] ? [a, b] : [b, a];
          const corner: P3 = [low[0], low[1], high[2]];
          g.line([low, corner], COLOR.line);
          g.line([corner, high], COLOR.guide, true);
          g.line([low, high], COLOR.guide, true);
          const dz = high[2] - low[2];
          g.label(mid(low, corner), [`↕ ${formatLength(dz)}`], true);
          rows.push({ label: 'Height difference', value: formatLength(dz) });
          rows.push({ label: 'Horizontal distance', value: formatLength(horizontal(a, b)) });
          rows.push({ label: 'Straight line', value: formatLength(distance3d(a, b)) });
        }
        break;
      }
      case 'point': {
        title = 'Point';
        const p = all[all.length - 1];
        if (p) {
          const ground = this.host.terrainAt(p[0], p[1]);
          const above = ground === null ? null : p[2] - ground;
          const beam = Math.max(40, (distance3d(p, this.host.instance.view.camera.position.toArray() as P3) || 0) * 0.25);
          g.line([p, [p[0], p[1], p[2] + beam]], COLOR.beam);
          if (above !== null && above > GROUND_EPS) g.line([p, [p[0], p[1], ground!]], COLOR.guide, true);
          g.markers([p]);
          rows.push({ label: 'E (SWEREF 99 TM)', value: formatCoordinate(p[0]) });
          rows.push({ label: 'N', value: formatCoordinate(p[1]) });
          rows.push({ label: 'Height (RH 2000)', value: formatHeight(p[2]) });
          if (above !== null) rows.push({ label: 'Above the ground', value: formatLength(Math.max(0, above)) });
          g.label([p[0], p[1], p[2] + beam * 0.15], [`${formatHeight(p[2])} (RH 2000)`, ...(above !== null && above > GROUND_EPS ? [`${formatLength(above)} above ground`] : [])], true);
        }
        break;
      }
      case 'radius': {
        title = 'Radius';
        const c = all[0];
        const edge = all[1];
        if (c) g.markers([c]);
        if (c && edge) {
          const r = horizontal(c, edge);
          if (r > 0.01) {
            const ground = (x: number, y: number) => this.host.terrainAt(x, y) ?? c[2];
            g.ring(c, r, ground, COLOR.line);
            const step = ringStep(r);
            for (let d = step; d < r - step * 0.2; d += step) {
              g.ring(c, d, ground, COLOR.guide, true);
              g.label([c[0] + d, c[1], ground(c[0] + d, c[1])], [formatLength(d)]);
            }
            g.line([c, [edge[0], edge[1], ground(edge[0], edge[1])]], COLOR.line);
            const area = Math.PI * r * r;
            g.label(mid(c, edge), [`r ${formatLength(r)}`, formatArea(area)], true);
            rows.push({ label: 'Radius', value: formatLength(r) });
            rows.push({ label: 'Area', value: formatArea(area) });
            rows.push({ label: 'Circumference', value: formatLength(2 * Math.PI * r) });
          }
        }
        break;
      }
      case 'volume': {
        title = this.phase === 'height' && withBody ? 'Volume' : 'Area';
        const ring = all;
        const drapedRing = this.drape(ring, draft && this.phase === 'points' && !!hover);
        g.markers(ring);
        if (ring.length >= 2) g.line(this.phase === 'points' && draft ? drapedRing.open : drapedRing.closed, COLOR.line);
        if (ring.length >= 3) {
          const area = planArea(ring);
          const along = surfaceArea(ring);
          rows.push({ label: 'Area (on the map)', value: formatArea(area) });
          if (along > area * 1.02) rows.push({ label: 'Area along the surface', value: formatArea(along) });
          rows.push({ label: 'Perimeter', value: formatLength(perimeter(ring)) });
          const base = baseHeight(ring);
          if (this.phase === 'height' && withBody) {
            const h = this.top - base;
            g.prism(ring, this.top);
            rows.push({ label: 'Height', value: formatLength(h) });
            rows.push({ label: 'Volume', value: formatVolume(prismVolume(ring, this.top)) });
            g.label([centroid(ring)[0], centroid(ring)[1], this.top], [`${formatArea(area)} × ${formatLength(h)}`, formatVolume(prismVolume(ring, this.top))], true);
          } else {
            g.fill(drapedRing.closed);
            g.label(centroid(ring), [formatArea(area)], true);
          }
        }
        break;
      }
    }
    return { object: g.group, rows, title };
  }

  /** The polygon's edges, laid along the terrain between corners that are on the ground. */
  private drape(ring: P3[], withHover: boolean): { open: P3[]; closed: P3[] } {
    const onGround = [...this.pts.map((s) => s.ground), ...(withHover ? [this.hover?.ground ?? false] : [])];
    const edge = (i: number, j: number): P3[] => {
      const a = ring[i];
      const b = ring[j];
      if (!onGround[i] || !onGround[j]) return [a];
      const n = Math.max(1, Math.ceil(horizontal(a, b) / DRAPE_STEP));
      const out: P3[] = [];
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        out.push([x, y, this.host.terrainAt(x, y) ?? a[2] + (b[2] - a[2]) * t]);
      }
      return out;
    };
    const open: P3[] = [];
    for (let i = 0; i < ring.length - 1; i++) open.push(...edge(i, i + 1));
    if (ring.length) open.push(ring[ring.length - 1]);
    const closed = ring.length >= 3 ? [...open.slice(0, -1), ...edge(ring.length - 1, 0), ring[0]] : open;
    return { open, closed };
  }
}

// ---- graphics ----------------------------------------------------------------------------------

/** Lines, markers, labels and bodies around a local origin (float32 can't hold SWEREF metres). */
class Graphics {
  readonly group = new Group();

  constructor(private readonly origin: P3) {}

  private local(p: P3): [number, number, number] {
    return [p[0] - this.origin[0], p[1] - this.origin[1], p[2] - this.origin[2]];
  }

  line(points: P3[], color: number, dashed = false): void {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points.flatMap((p) => this.local(p))), 3));
    const material = dashed
      ? new LineDashedMaterial({ color, dashSize: 1, gapSize: 0.6, depthTest: false, transparent: true })
      : new LineBasicMaterial({ color, depthTest: false, transparent: true });
    const line = new Line(geometry, material);
    if (dashed) line.computeLineDistances();
    line.renderOrder = 1600;
    line.frustumCulled = false;
    line.raycast = () => {};
    this.group.add(line);
  }

  markers(points: P3[]): void {
    if (!points.length) return;
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points.flatMap((p) => this.local(p))), 3));
    const pts = new Points(geometry, new PointsMaterial({ color: COLOR.point, size: 8, sizeAttenuation: false, depthTest: false }));
    pts.renderOrder = 1700;
    pts.frustumCulled = false;
    pts.raycast = () => {};
    this.group.add(pts);
  }

  label(at: P3, lines: string[], strong = false): void {
    const l = new Label(lines, strong ? '#f59e0b' : '#64748b');
    l.position.set(...this.local(at));
    this.group.add(l);
  }

  ring(c: P3, r: number, ground: (x: number, y: number) => number, color: number, dashed = false): void {
    const n = Math.max(48, Math.min(256, Math.round(r)));
    const pts: P3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = c[0] + Math.cos(a) * r;
      const y = c[1] + Math.sin(a) * r;
      pts.push([x, y, ground(x, y) + 0.3]);
    }
    this.line(pts, color, dashed);
  }

  /** A translucent flat fill (triangulated in plan). */
  fill(ring: P3[]): void {
    const pts = ring.length > 1 && same(ring[0], ring[ring.length - 1]) ? ring.slice(0, -1) : ring;
    if (pts.length < 3) return;
    const local = pts.map((p) => this.local(p));
    const tris = ShapeUtils.triangulateShape(local.map(([x, y]) => new Vector2(x, y)), []);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(local.flat()), 3));
    geometry.setIndex(tris.flat());
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: COLOR.body, transparent: true, opacity: 0.25, side: DoubleSide, depthWrite: false }));
    mesh.renderOrder = 1550;
    mesh.raycast = () => {};
    this.group.add(mesh);
  }

  /** A body from the polygon (its corners as drawn) up to a flat top. */
  prism(ring: P3[], top: number): void {
    const bottom = ring.map((p) => this.local(p));
    const zTop = top - this.origin[2];
    const n = bottom.length;
    const positions: number[] = [];
    const index: number[] = [];
    for (const [x, y, z] of bottom) positions.push(x, y, z);
    for (const [x, y] of bottom) positions.push(x, y, zTop);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      index.push(i, j, n + j, i, n + j, n + i);
    }
    const tris = ShapeUtils.triangulateShape(bottom.map(([x, y]) => new Vector2(x, y)), []);
    for (const [a, b, c] of tris) index.push(n + a, n + b, n + c, a, c, b);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(index);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: COLOR.body, transparent: true, opacity: 0.3, side: DoubleSide, depthWrite: false }));
    mesh.renderOrder = 1550;
    mesh.raycast = () => {};
    this.group.add(mesh);
    // Edges: bottom ring, top ring and the corners.
    this.line([...ring, ring[0]], COLOR.line);
    const topRing: P3[] = ring.map((p) => [p[0], p[1], top]);
    this.line([...topRing, topRing[0]], COLOR.line);
    for (const p of ring) this.line([p, [p[0], p[1], top]], COLOR.line);
  }
}

function mid(a: P3, b: P3): P3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

function centroid(pts: P3[]): P3 {
  const n = pts.length || 1;
  return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n, pts.reduce((s, p) => s + p[2], 0) / n];
}

function same(a: P3, b: P3): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/** Frees everything in a group (measurement graphics own their geometry and materials). */
export function disposeGroup(group: Group): void {
  for (const child of [...group.children]) {
    child.traverse((o) => {
      const any = o as Mesh & { dispose?: () => void };
      if (o instanceof Label) o.dispose();
      else {
        any.geometry?.dispose();
        (any.material as { dispose?: () => void } | undefined)?.dispose?.();
      }
    });
    group.remove(child);
  }
}
