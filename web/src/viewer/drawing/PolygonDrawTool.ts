import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

import { groundUnderPointer } from './groundRay';

export type XY = [number, number];

/** What the cursor may snap to: existing vertices first, then edges. */
export interface SnapTargets {
  vertices: XY[];
  segments: [XY, XY][];
}

const SNAP_PX = 12;
const DRAW_LIFT = 0.5; // above the terrain, against clipping into it
const CLICK_TOLERANCE_PX = 4;

/**
 * Click-to-draw a polygon on the terrain. Resolves with the closed outer ring, or null if
 * cancelled. Enter / double-click / clicking the first point finishes; Backspace removes the last
 * point; Escape cancels. Camera drags still work (a click is a press without movement).
 */
export class PolygonDrawTool {
  private readonly points: XY[] = [];
  private cursor: XY | null = null;
  private snapped = false;
  private readonly group = new Group();
  private readonly line: Line;
  private readonly vertices: Points;
  private readonly snapMarker: Points;
  private origin: XY | null = null;
  private down: { x: number; y: number } | null = null;
  private originZ = 0;

  constructor(
    private readonly instance: Instance,
    private readonly snap: SnapTargets,
    /** Terrain height at a point. */
    private readonly heightAt: (x: number, y: number) => number,
    private readonly done: (ring: XY[] | null) => void,
  ) {
    const lineMaterial = new LineBasicMaterial({ color: 0xe11d48, depthTest: false, transparent: true });
    this.line = new Line(new BufferGeometry(), lineMaterial);
    this.vertices = new Points(new BufferGeometry(), new PointsMaterial({ color: 0xe11d48, size: 8, sizeAttenuation: false, depthTest: false }));
    this.snapMarker = new Points(new BufferGeometry(), new PointsMaterial({ color: 0x2563eb, size: 14, sizeAttenuation: false, depthTest: false }));
    for (const o of [this.line, this.vertices, this.snapMarker]) {
      o.renderOrder = 1000;
      o.frustumCulled = false;
      this.group.add(o);
    }
    void this.instance.add(this.group);

    const el = this.instance.domElement;
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('dblclick', this.onDoubleClick);
    window.addEventListener('keydown', this.onKey);
    el.style.cursor = 'crosshair';
  }

  dispose(): void {
    const el = this.instance.domElement;
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerdown', this.onDown);
    el.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('dblclick', this.onDoubleClick);
    window.removeEventListener('keydown', this.onKey);
    el.style.cursor = '';
    this.instance.remove(this.group);
    for (const o of [this.line, this.vertices, this.snapMarker]) {
      o.geometry.dispose();
      (o.material as LineBasicMaterial).dispose();
    }
    this.instance.notifyChange();
  }

  private finish(cancelled = false): void {
    const ring = cancelled || this.points.length < 3 ? null : [...this.points, this.points[0]];
    this.dispose();
    this.done(ring);
  }

  private readonly onKey = (evt: KeyboardEvent) => {
    if (evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) return;
    if (evt.key === 'Escape') this.finish(true);
    else if (evt.key === 'Enter') this.finish();
    else if (evt.key === 'Backspace') {
      this.points.pop();
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
    const p = this.pointAt(evt);
    if (!p) return;
    const first = this.points[0];
    const closing = first && this.points.length >= 3 && p[0] === first[0] && p[1] === first[1];
    if (closing) {
      this.finish();
      return;
    }
    this.points.push(p);
    this.redraw();
  };

  /** Double-click finishes. Pointer events don't count clicks (their `detail` is always 0). */
  private readonly onDoubleClick = () => {
    // Both clicks of the double-click added the same point: keep one.
    const [a, b] = this.points.slice(-2);
    if (a && b && a[0] === b[0] && a[1] === b[1]) this.points.pop();
    if (this.points.length >= 3) this.finish();
  };

  private readonly onMove = (evt: PointerEvent) => {
    this.cursor = this.pointAt(evt);
    this.redraw();
  };

  /** Ground point under the pointer, snapped to vertices (incl. our own first point) or edges. */
  private pointAt(evt: PointerEvent): XY | null {
    const rect = this.instance.domElement.getBoundingClientRect();
    const hit = groundUnderPointer(this.instance, evt, this.heightAt);
    if (!hit) return null;
    const raw: XY = [hit.x, hit.y];

    const screen = (p: XY) => {
      const v = new Vector3(p[0], p[1], this.heightAt(p[0], p[1])).project(this.instance.view.camera);
      return [((v.x + 1) / 2) * rect.width, ((1 - v.y) / 2) * rect.height];
    };
    const [cx, cy] = [evt.clientX - rect.left, evt.clientY - rect.top];
    const pxDistance = (p: XY) => {
      const [sx, sy] = screen(p);
      return Math.hypot(sx - cx, sy - cy);
    };

    const candidates = [...this.snap.vertices, ...(this.points.length >= 3 ? [this.points[0]] : [])];
    let best: XY | null = null;
    let bestPx = SNAP_PX;
    for (const v of candidates) {
      const d = pxDistance(v);
      if (d < bestPx) [best, bestPx] = [v, d];
    }
    if (!best) {
      for (const [a, b] of this.snap.segments) {
        const q = closestOnSegment(raw, a, b);
        const d = pxDistance(q);
        if (d < bestPx) [best, bestPx] = [q, d];
      }
    }
    this.snapped = best !== null;
    return best ? [best[0], best[1]] : [round(raw[0]), round(raw[1])];
  }

  private redraw(): void {
    const pts = [...this.points, ...(this.cursor ? [this.cursor] : [])];
    if (!this.origin && pts[0]) {
      this.origin = pts[0];
      this.originZ = this.heightAt(...this.origin);
      this.group.position.set(this.origin[0], this.origin[1], this.originZ + DRAW_LIFT);
    }
    const local = (p: XY) => [
      p[0] - (this.origin?.[0] ?? 0),
      p[1] - (this.origin?.[1] ?? 0),
      this.heightAt(p[0], p[1]) - this.originZ,
    ];

    const loop = pts.length >= 3 ? [...pts, pts[0]] : pts;
    this.line.geometry.setAttribute('position', new BufferAttribute(new Float32Array(loop.flatMap(local)), 3));
    this.vertices.geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.points.flatMap(local)), 3));
    const marker = this.snapped && this.cursor ? local(this.cursor) : [];
    this.snapMarker.geometry.setAttribute('position', new BufferAttribute(new Float32Array(marker), 3));
    this.group.updateMatrixWorld(true);
    this.instance.notifyChange();
  }
}

function closestOnSegment(p: XY, a: XY, b: XY): XY {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return [a[0] + t * dx, a[1] + t * dy];
}

/** Free (unsnapped) points: centimetre precision is plenty and keeps the exchange clean. */
const round = (v: number) => Math.round(v * 100) / 100;
