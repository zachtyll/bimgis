import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
} from 'three';
import type Instance from '@giro3d/giro3d/core/Instance.js';

import type { Receiver, ReceiverLevel, SourceLine } from '@/features/noise/nordic';
import { noiseColor, textColor, type NoiseMetric } from '@/features/noise/scale';

/** Badges stand a little further out than the receivers, clear of the 3D model's walls. */
const BADGE_OUT = 1.2;
const BADGE_W = 3;
const BADGE_H = 1.9;
const STREET_LIFT = 1;

const textures = new Map<string, CanvasTexture>();

/** A rounded badge with a number, coloured by band; shared per number and colour. */
function badge(value: number, color: string): CanvasTexture {
  const key = `${value}|${color}`;
  let t = textures.get(key);
  if (t) return t;
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 60;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(3, 3, 90, 54, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textColor(color);
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), 48, 32);
  t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  textures.set(key, t);
  return t;
}

/**
 * The noise check's temporary markers: a value badge per facade point and floor (like the
 * facade grids of a noise investigation) and the source streets, coloured by their emission.
 * Coordinates are local to the building (float32 precision).
 */
export class NoiseOverlay {
  private readonly group = new Group();
  private readonly badges = new Group();
  private streets: LineSegments | null = null;
  private readonly materials = new Map<string, SpriteMaterial>();

  constructor(
    private readonly instance: Instance,
    private readonly origin: [number, number, number],
    private readonly terrainAt: (x: number, y: number) => number | null,
  ) {
    this.group.position.set(...origin);
    this.group.name = 'noise-check';
    this.group.add(this.badges);
    this.group.updateMatrixWorld(true);
    void this.instance.add(this.group);
  }

  private local(x: number, y: number, z: number): [number, number, number] {
    return [x - this.origin[0], y - this.origin[1], z - this.origin[2]];
  }

  /** Facade values. `groundZ`: the building's ground height, floors are measured from it. */
  showLevels(receivers: Receiver[], levels: ReceiverLevel[], metric: NoiseMetric, groundZ: number): void {
    this.badges.clear();
    receivers.forEach((r, i) => {
      const raw = metric === 'leq' ? levels[i].leq : levels[i].lmax;
      if (!Number.isFinite(raw)) return;
      const value = Math.round(raw);
      const color = noiseColor(metric, value);
      const key = `${value}|${color}`;
      let material = this.materials.get(key);
      if (!material) {
        material = new SpriteMaterial({ map: badge(value, color), transparent: true, depthWrite: false });
        this.materials.set(key, material);
      }
      const sprite = new Sprite(material);
      sprite.position.set(...this.local(r.x + r.nx * BADGE_OUT, r.y + r.ny * BADGE_OUT, groundZ + r.h));
      sprite.scale.set(BADGE_W, BADGE_H, 1);
      sprite.renderOrder = 20;
      sprite.raycast = () => {}; // never steal picks from the building
      this.badges.add(sprite);
    });
    this.group.updateMatrixWorld(true);
    this.instance.notifyChange();
  }

  /** The streets used as sources, coloured by their equivalent level at 10 m. */
  showStreets(sources: SourceLine[], leq10: Map<string, number>): void {
    if (this.streets) {
      this.group.remove(this.streets);
      this.streets.geometry.dispose();
    }
    const positions: number[] = [];
    const colors: number[] = [];
    const c = new Color();
    for (const s of sources) {
      const level = leq10.get(s.street);
      if (level === undefined || !Number.isFinite(level)) continue;
      c.set(noiseColor('leq', level));
      for (let i = 1; i < s.points.length; i++) {
        for (const [x, y] of [s.points[i - 1], s.points[i]]) {
          positions.push(...this.local(x, y, (this.terrainAt(x, y) ?? this.origin[2]) + STREET_LIFT));
          colors.push(c.r, c.g, c.b);
        }
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    geometry.computeBoundingSphere();
    this.streets = new LineSegments(geometry, new LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: 0.9 }));
    this.streets.renderOrder = 15;
    this.streets.raycast = () => {};
    this.group.add(this.streets);
    this.group.updateMatrixWorld(true);
    this.instance.notifyChange();
  }

  dispose(): void {
    this.instance.remove(this.group);
    this.streets?.geometry.dispose();
    (this.streets?.material as LineBasicMaterial | undefined)?.dispose();
    for (const m of this.materials.values()) m.dispose();
    this.instance.notifyChange();
  }
}
