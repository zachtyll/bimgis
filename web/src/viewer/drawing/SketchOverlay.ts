import { BufferAttribute, BufferGeometry, Color, Group, LineBasicMaterial, LineLoop } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

export type SketchRole = 'plan' | 'use' | 'property' | 'selected';

export interface SketchItem {
  role: SketchRole;
  /** Polygon rings (outer first), EPSG:3006. */
  polygon: number[][][];
}

const COLORS: Record<SketchRole, string> = {
  plan: '#1d4ed8',
  use: '#15803d',
  property: '#c2410c',
  selected: '#e11d48',
};
const SKETCH_LIFT = 0.5; // above the terrain, against clipping into it

/**
 * Outlines of the plan being edited, following the terrain at their vertices. Coordinates are
 * local to an origin (float32 precision).
 */
export class SketchOverlay {
  private readonly group = new Group();
  private readonly materials = new Map<SketchRole, LineBasicMaterial>();
  private added = false;

  constructor(
    private readonly instance: Instance,
    /** Terrain height at a point. */
    private readonly heightAt: (x: number, y: number) => number,
  ) {
    this.group.renderOrder = 900;
  }

  update(items: SketchItem[]): void {
    this.clear();
    const first = items[0]?.polygon[0]?.[0];
    if (!first) {
      this.instance.notifyChange();
      return;
    }
    const [ox, oy] = first;
    const oz = this.heightAt(ox, oy);
    this.group.position.set(ox, oy, oz + SKETCH_LIFT);
    // Draw selected last so it's on top.
    const ordered = [...items].sort((a, b) => Number(a.role === 'selected') - Number(b.role === 'selected'));
    for (const item of ordered) {
      for (const ring of item.polygon) {
        const positions = new Float32Array(ring.slice(0, -1).flatMap((p) => [p[0] - ox, p[1] - oy, this.heightAt(p[0], p[1]) - oz]));
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        const line = new LineLoop(geometry, this.material(item.role));
        line.renderOrder = item.role === 'selected' ? 902 : 901;
        line.frustumCulled = false;
        this.group.add(line);
      }
    }
    if (!this.added) {
      void this.instance.add(this.group);
      this.added = true;
    }
    this.group.updateMatrixWorld(true);
    this.instance.notifyChange();
  }

  dispose(): void {
    this.clear();
    if (this.added) this.instance.remove(this.group);
    for (const m of this.materials.values()) m.dispose();
  }

  private clear(): void {
    for (const child of [...this.group.children]) {
      (child as LineLoop).geometry.dispose();
      this.group.remove(child);
    }
  }

  private material(role: SketchRole): LineBasicMaterial {
    let m = this.materials.get(role);
    if (!m) {
      m = new LineBasicMaterial({ color: new Color(COLORS[role]), depthTest: false, transparent: true });
      this.materials.set(role, m);
    }
    return m;
  }
}
