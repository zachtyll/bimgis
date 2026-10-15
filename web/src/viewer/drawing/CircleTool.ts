import { BufferAttribute, BufferGeometry, Group, Line, LineBasicMaterial, LineLoop, Points, PointsMaterial } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

import { groundUnderPointer } from './groundRay';

export interface CircleResult {
  /** EPSG:3006. */
  center: [number, number];
  radius: number;
}

export const MIN_RADIUS = 10;
export const MAX_RADIUS = 1000;
const SEGMENTS = 128;
const LIFT = 1; // above the terrain, against clipping into it
const CLICK_TOLERANCE_PX = 4;
const COLOR = 0x0284c7;

/** Points of a circle following the terrain, relative to its centre at height `originZ`. */
export function circleOnTerrain(
  cx: number,
  cy: number,
  radius: number,
  heightAt: (x: number, y: number) => number,
  originZ: number,
): Float32Array {
  const positions = new Float32Array(SEGMENTS * 3);
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    positions.set([x, y, heightAt(cx + x, cy + y) - originZ], i * 3);
  }
  return positions;
}

/**
 * Click the centre, move the pointer to size the circle (it grows from the centre), click again
 * to finish. Escape cancels. Camera drags still work (a click is a press without movement).
 */
export class CircleTool {
  private readonly group = new Group();
  private readonly outline: LineLoop;
  private readonly spoke: Line;
  private readonly centreMarker: Points;
  private center: [number, number, number] | null = null;
  private radius = 0;
  /** Direction from the centre to the pointer, radians. */
  private angle = 0;
  private down: { x: number; y: number } | null = null;

  constructor(
    private readonly instance: Instance,
    private readonly heightAt: (x: number, y: number) => number,
    private readonly onRadius: (radius: number | null) => void,
    private readonly done: (circle: CircleResult | null) => void,
  ) {
    const material = new LineBasicMaterial({ color: COLOR, depthTest: false, transparent: true });
    this.outline = new LineLoop(new BufferGeometry(), material);
    this.spoke = new Line(new BufferGeometry(), new LineBasicMaterial({ color: COLOR, depthTest: false, transparent: true, opacity: 0.6 }));
    this.centreMarker = new Points(
      new BufferGeometry(),
      new PointsMaterial({ color: COLOR, size: 9, sizeAttenuation: false, depthTest: false }),
    );
    for (const o of [this.outline, this.spoke, this.centreMarker]) {
      o.renderOrder = 1000;
      o.frustumCulled = false;
      this.group.add(o);
    }
    this.group.visible = false;
    void this.instance.add(this.group);

    const el = this.instance.domElement;
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointerup', this.onUp);
    window.addEventListener('keydown', this.onKey);
    el.style.cursor = 'crosshair';
  }

  dispose(): void {
    const el = this.instance.domElement;
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerdown', this.onDown);
    el.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('keydown', this.onKey);
    el.style.cursor = '';
    this.instance.remove(this.group);
    for (const o of [this.outline, this.spoke, this.centreMarker]) {
      o.geometry.dispose();
      (o.material as LineBasicMaterial).dispose();
    }
    this.instance.notifyChange();
  }

  private finish(cancelled = false): void {
    const result =
      !cancelled && this.center && this.radius >= MIN_RADIUS
        ? { center: [this.center[0], this.center[1]] as [number, number], radius: Math.round(this.radius) }
        : null;
    this.dispose();
    this.done(result);
  }

  private readonly onKey = (evt: KeyboardEvent) => {
    if (evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) return;
    if (evt.key !== 'Escape') return;
    evt.preventDefault();
    this.finish(true);
  };

  private readonly onDown = (evt: PointerEvent) => {
    if (evt.button === 0) this.down = { x: evt.clientX, y: evt.clientY };
  };

  private readonly onUp = (evt: PointerEvent) => {
    if (evt.button !== 0 || !this.down) return;
    const moved = Math.hypot(evt.clientX - this.down.x, evt.clientY - this.down.y);
    this.down = null;
    if (moved > CLICK_TOLERANCE_PX) return; // a camera drag
    const p = groundUnderPointer(this.instance, evt, this.heightAt);
    if (!p) return;
    if (!this.center) {
      this.center = [p.x, p.y, p.z];
      this.radius = 0;
      this.redraw();
      this.onRadius(0);
    } else if (this.radius >= MIN_RADIUS) {
      this.finish();
    }
  };

  private readonly onMove = (evt: PointerEvent) => {
    if (!this.center) return;
    const p = groundUnderPointer(this.instance, evt, this.heightAt);
    if (!p) return;
    this.radius = Math.min(MAX_RADIUS, Math.hypot(p.x - this.center[0], p.y - this.center[1]));
    this.angle = Math.atan2(p.y - this.center[1], p.x - this.center[0]);
    this.redraw();
    this.onRadius(Math.round(this.radius));
  };

  private redraw(): void {
    if (!this.center) return;
    const [cx, cy, cz] = this.center;
    this.group.position.set(cx, cy, cz + LIFT);
    this.group.visible = true;
    const ring = circleOnTerrain(cx, cy, Math.max(this.radius, 0.01), this.heightAt, cz);
    this.outline.geometry.setAttribute('position', new BufferAttribute(ring, 3));
    // A spoke from the centre to the pointer shows what is being sized.
    const ex = Math.cos(this.angle) * this.radius;
    const ey = Math.sin(this.angle) * this.radius;
    const edge = [ex, ey, this.heightAt(cx + ex, cy + ey) - cz];
    this.spoke.geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, ...edge]), 3));
    this.centreMarker.geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0]), 3));
    this.group.updateMatrixWorld(true);
    this.instance.notifyChange();
  }
}
