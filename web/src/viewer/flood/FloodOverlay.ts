import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineLoop,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  Quaternion,
  Shape,
  ShapeGeometry,
  Vector3,
} from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

import type { FloodGrid, FloodSnapshot } from '@/features/flood/simulation';
import { circleOnTerrain } from '../drawing/CircleTool';

/** Water surface lifted a little, against clipping into the rendered terrain. */
const WATER_LIFT = 0.3;
const ARROW_LIFT = 0.6;
/** Shallower than this counts as dry (just wet ground). */
const SHOW_DEPTH = 0.02;
const RAIN_DROPS = 1500;
const RAIN_HEIGHT = 120;
/** About this many arrows across the circle. */
const ARROWS_ACROSS = 20;
/** Height of the stem of the deepest-spot pin. */
const PIN_HEIGHT = 25;

const SHALLOW = new Color('#7dd3fc');
const DEEP = new Color('#1e3a8a');
const ARROW_WEAK = new Color('#38bdf8');
const ARROW_STRONG = new Color('#0b2a6f');

/** Flat arrow along +x, one unit long and one unit wide, tail at the origin. */
function arrowGeometry(): ShapeGeometry {
  const s = new Shape();
  s.moveTo(0, -0.15);
  s.lineTo(0.55, -0.15);
  s.lineTo(0.55, -0.5);
  s.lineTo(1, 0);
  s.lineTo(0.55, 0.5);
  s.lineTo(0.55, 0.15);
  s.lineTo(0, 0.15);
  s.closePath();
  return new ShapeGeometry(s);
}

/**
 * The flood check's temporary markers: the circle, falling rain while it rains, the water
 * surface (bluer and more opaque where deeper), arrows showing where water runs (longer-lived
 * and darker where more water passed) and a ring at the deepest spot. Coordinates are local to
 * the circle's centre (float32 precision).
 */
export class FloodOverlay {
  private readonly group = new Group();
  private readonly originZ: number;
  private water: Mesh | null = null;
  private arrows: InstancedMesh | null = null;
  private readonly rain: Points;
  private readonly deepestRing: LineLoop;
  private readonly deepestStem: Line;
  private raining = false;
  private frame = 0;

  constructor(
    private readonly instance: Instance,
    private readonly center: [number, number],
    private readonly radius: number,
    private readonly heightAt: (x: number, y: number) => number,
  ) {
    this.originZ = heightAt(center[0], center[1]);
    this.group.position.set(center[0], center[1], this.originZ);
    this.group.name = 'flood-check';

    const outline = new LineLoop(new BufferGeometry(), new LineBasicMaterial({ color: 0x0284c7, depthTest: false, transparent: true }));
    outline.geometry.setAttribute('position', new BufferAttribute(circleOnTerrain(center[0], center[1], radius, heightAt, this.originZ - 1), 3));
    outline.renderOrder = 1000;
    outline.frustumCulled = false;
    this.group.add(outline);

    const drops = new Float32Array(RAIN_DROPS * 3);
    for (let i = 0; i < RAIN_DROPS; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      drops.set([Math.cos(a) * r, Math.sin(a) * r, Math.random() * RAIN_HEIGHT], i * 3);
    }
    const rainGeometry = new BufferGeometry();
    rainGeometry.setAttribute('position', new BufferAttribute(drops, 3));
    this.rain = new Points(rainGeometry, new PointsMaterial({ color: 0x93c5fd, size: 2.5, sizeAttenuation: false, transparent: true, opacity: 0.8 }));
    this.rain.frustumCulled = false;
    this.rain.visible = false;
    this.group.add(this.rain);

    this.deepestRing = new LineLoop(new BufferGeometry(), new LineBasicMaterial({ color: 0xdc2626, depthTest: false, transparent: true }));
    this.deepestRing.renderOrder = 1001;
    this.deepestRing.frustumCulled = false;
    this.deepestRing.visible = false;
    this.group.add(this.deepestRing);
    // A stem up from the ring makes it read as "down there", not on whatever roof is in front.
    this.deepestStem = new Line(new BufferGeometry(), new LineBasicMaterial({ color: 0xdc2626, depthTest: false, transparent: true }));
    this.deepestStem.renderOrder = 1001;
    this.deepestStem.frustumCulled = false;
    this.deepestStem.visible = false;
    this.group.add(this.deepestStem);

    this.group.updateMatrixWorld(true);
    void this.instance.add(this.group);
  }

  /** Starts or stops the falling rain. */
  setRaining(raining: boolean): void {
    if (raining === this.raining) return;
    this.raining = raining;
    this.rain.visible = raining;
    if (raining) this.animateRain();
    else cancelAnimationFrame(this.frame);
    this.instance.notifyChange();
  }

  private animateRain(): void {
    const attr = this.rain.geometry.getAttribute('position') as BufferAttribute;
    const fall = Math.max(2, this.radius / 60); // metres per frame: faster looking for big circles
    const tick = () => {
      const a = attr.array as Float32Array;
      for (let i = 0; i < RAIN_DROPS; i++) {
        a[i * 3 + 2] -= fall * (0.8 + ((i * 7919) % 100) / 250);
        if (a[i * 3 + 2] < -5) a[i * 3 + 2] += RAIN_HEIGHT;
      }
      attr.needsUpdate = true;
      this.instance.notifyChange();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  /** Shows the state of the water from a model snapshot. */
  update(grid: FloodGrid, snapshot: FloodSnapshot): void {
    this.updateWater(grid, snapshot);
    this.updateArrows(grid, snapshot);
    this.updateDeepest(snapshot);
    this.setRaining(snapshot.raining);
    this.group.updateMatrixWorld(true);
    this.instance.notifyChange();
  }

  private local(x: number, y: number, z: number): [number, number, number] {
    return [x - this.center[0], y - this.center[1], z - this.originZ];
  }

  private updateWater(grid: FloodGrid, snapshot: FloodSnapshot): void {
    const { nx, ny, cell, west, north } = grid;
    if (!this.water) {
      const geometry = new BufferGeometry();
      const positions = new Float32Array(nx * ny * 3);
      for (let r = 0; r < ny; r++) {
        for (let c = 0; c < nx; c++) {
          const i = r * nx + c;
          positions.set(this.local(west + (c + 0.5) * cell, north - (r + 0.5) * cell, grid.ground[i]), i * 3);
        }
      }
      const index: number[] = [];
      for (let r = 0; r < ny - 1; r++) {
        for (let c = 0; c < nx - 1; c++) {
          const i = r * nx + c;
          index.push(i, i + nx, i + 1, i + 1, i + nx, i + nx + 1);
        }
      }
      geometry.setAttribute('position', new BufferAttribute(positions, 3));
      geometry.setAttribute('color', new BufferAttribute(new Float32Array(nx * ny * 4), 4));
      geometry.setIndex(index);
      geometry.computeBoundingSphere();
      const material = new MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
      });
      this.water = new Mesh(geometry, material);
      this.water.renderOrder = 5;
      this.group.add(this.water);
    }

    const positions = this.water.geometry.getAttribute('position') as BufferAttribute;
    const colors = this.water.geometry.getAttribute('color') as BufferAttribute;
    const p = positions.array as Float32Array;
    const col = colors.array as Float32Array;
    const color = new Color();
    for (let i = 0; i < nx * ny; i++) {
      const d = grid.building[i] ? 0 : snapshot.depth[i];
      p[i * 3 + 2] = grid.ground[i] + d + WATER_LIFT - this.originZ;
      const wet = d >= SHOW_DEPTH;
      color.copy(SHALLOW).lerp(DEEP, Math.min(1, d / 0.5));
      col.set([color.r, color.g, color.b, wet ? Math.min(0.85, 0.35 + d * 1.2) : 0], i * 4);
    }
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

  private updateArrows(grid: FloodGrid, snapshot: FloodSnapshot): void {
    const { nx, ny, cell, west, north } = grid;
    const stride = Math.max(3, Math.round((2 * this.radius) / cell / ARROWS_ACROSS));
    const blocks: { x: number; y: number; z: number; fx: number; fy: number; m: number }[] = [];
    let max = 0;
    for (let r0 = 0; r0 + stride <= ny; r0 += stride) {
      for (let c0 = 0; c0 + stride <= nx; c0 += stride) {
        const cr = r0 + (stride >> 1);
        const cc = c0 + (stride >> 1);
        const ci = cr * nx + cc;
        if (grid.building[ci]) continue;
        let fx = 0;
        let fy = 0;
        for (let r = r0; r < r0 + stride; r++) {
          for (let c = c0; c < c0 + stride; c++) {
            fx += snapshot.flowX[r * nx + c];
            fy += snapshot.flowY[r * nx + c];
          }
        }
        const m = Math.hypot(fx, fy);
        if (m <= 0) continue;
        max = Math.max(max, m);
        blocks.push({
          x: west + (cc + 0.5) * cell,
          y: north - (cr + 0.5) * cell,
          z: grid.ground[ci] + snapshot.depth[ci],
          fx,
          fy,
          m,
        });
      }
    }

    const shown = blocks.filter((b) => b.m > max * 0.03);
    const capacity = Math.ceil(nx / stride) * Math.ceil(ny / stride);
    if (!this.arrows) {
      // One slot per block: the grid (and so the most arrows) is fixed for an overlay.
      const material = new MeshBasicMaterial({ side: DoubleSide, transparent: true, opacity: 0.9, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
      this.arrows = new InstancedMesh(arrowGeometry(), material, capacity);
      this.arrows.renderOrder = 6;
      this.arrows.frustumCulled = false;
      this.group.add(this.arrows);
    }

    const length = stride * cell * 0.85;
    const m = new Matrix4();
    const q = new Quaternion();
    const s = new Vector3();
    const pos = new Vector3();
    const up = new Vector3(0, 0, 1);
    const color = new Color();
    shown.forEach((b, i) => {
      const strength = Math.sqrt(b.m / max);
      const dirX = b.fx / b.m;
      const dirY = b.fy / b.m;
      // Centre the arrow on its block.
      const [lx, ly, lz] = this.local(b.x - (dirX * length) / 2, b.y - (dirY * length) / 2, b.z + ARROW_LIFT);
      pos.set(lx, ly, lz);
      q.setFromAxisAngle(up, Math.atan2(dirY, dirX));
      s.set(length, length * (0.25 + 0.35 * strength), 1);
      this.arrows!.setMatrixAt(i, m.compose(pos, q, s));
      this.arrows!.setColorAt(i, color.copy(ARROW_WEAK).lerp(ARROW_STRONG, strength));
    });
    this.arrows.count = shown.length;
    this.arrows.instanceMatrix.needsUpdate = true;
    if (this.arrows.instanceColor) this.arrows.instanceColor.needsUpdate = true;
  }

  private updateDeepest(snapshot: FloodSnapshot): void {
    const deepest = snapshot.stats.deepest;
    if (!deepest || snapshot.stats.maxDepth < 0.05) {
      this.deepestRing.visible = false;
      this.deepestStem.visible = false;
      return;
    }
    const ring = circleOnTerrain(deepest[0], deepest[1], Math.max(3, this.radius / 25), this.heightAt, this.heightAt(deepest[0], deepest[1]));
    const [lx, ly, lz] = this.local(deepest[0], deepest[1], this.heightAt(deepest[0], deepest[1]) + 1);
    for (let i = 0; i < ring.length; i += 3) {
      ring[i] += lx;
      ring[i + 1] += ly;
      ring[i + 2] += lz;
    }
    this.deepestRing.geometry.setAttribute('position', new BufferAttribute(ring, 3));
    this.deepestRing.visible = true;
    this.deepestStem.geometry.setAttribute('position', new BufferAttribute(new Float32Array([lx, ly, lz, lx, ly, lz + PIN_HEIGHT]), 3));
    this.deepestStem.visible = true;
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.instance.remove(this.group);
    this.group.traverse((o) => {
      const mesh = o as Mesh;
      mesh.geometry?.dispose();
      (mesh.material as MeshBasicMaterial | undefined)?.dispose?.();
    });
    this.arrows?.dispose();
    this.instance.notifyChange();
  }
}
