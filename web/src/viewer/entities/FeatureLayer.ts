import { Color, SpriteMaterial, type Material } from 'three';
import GeoJSON from 'ol/format/GeoJSON.js';
import type Feature from 'ol/Feature.js';
import type Point from 'ol/geom/Point.js';
import { Fill, Stroke, Style } from 'ol/style.js';

import type Context from '@giro3d/giro3d/core/Context.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer.js';
import type { FeatureStyle } from '@giro3d/giro3d/core/FeatureTypes.js';
import DrapedFeatureCollection, { type MapLike } from '@giro3d/giro3d/entities/DrapedFeatureCollection.js';
import FileFeatureSource from '@giro3d/giro3d/sources/FileFeatureSource.js';
import StaticFeatureSource from '@giro3d/giro3d/sources/StaticFeatureSource.js';
import VectorSource from '@giro3d/giro3d/sources/VectorSource.js';

import { categoryOf, type Theme } from '@/features/layers/themes';
import { crs, extent as mapExtent } from '../crs';
import { nearBoundBelow } from './nearBound';
import { pinIcon } from './pinIcon';

const HIGHLIGHT_COLOR = new Color(0xff3b3b);
const EMPHASIS_STROKE = new Color('#111111');
const DEFAULT_HEIGHT = 6;
/** Pins float a little above the ground, so they don't sink into it. */
const PIN_LIFT = 4;
const PIN_SIZE = 34;

export interface FeatureLayerOptions {
  name: string;
  /** GeoJSON in the scene CRS (EPSG:3006): a URL, or a loader for data converted in memory. */
  url?: string;
  load?: () => Promise<object>;
  theme: Theme;
  /** Properties forming a stable ID across reloads; multi-part objects share it. */
  idProperties?: string[];
  labelProperty?: string;
  /** Extrude polygons by this property (LoD1 bodies), standing on the terrain. Flat when omitted. */
  extrusionProperty?: string;
  /** Show points as pins (badges) labelled with this property, e.g. a count. */
  pinLabelProperty?: string;
  /** Flat layers: stacking order on the terrain (higher is drawn on top). */
  elevation?: number;
  /** [xmin, xmax, ymin, ymax]. Lets the map skip tiles without data. */
  bounds?: [number, number, number, number];
}

/**
 * Features standing on the terrain: extruded bodies, each lifted to the terrain at its centre,
 * and pins.
 *
 * giro3d derives the camera's near plane from each entity's distance range, and
 * DrapedFeatureCollection reports none. The terrain alone would set it too far for bodies that
 * stick up from the ground, clipping their roofs; so report a bound below their tops.
 */
class BodyCollection extends DrapedFeatureCollection {
  /** Tallest extrusion or pin so far (features are placed on the terrain after it is measured). */
  maxHeight = 0;
  private attached = false;

  override attach(map: MapLike): this {
    this.attached = true;
    return super.attach(map);
  }

  /** The base class throws when detaching (e.g. on dispose) before it was attached. */
  override detach(): this {
    if (!this.attached) return this;
    this.attached = false;
    return super.detach();
  }

  /** Pin badges: drop the texture's transparent corners, which otherwise render as black squares. */
  override setupMaterial(material: Material): void {
    super.setupMaterial(material);
    if (material instanceof SpriteMaterial) material.alphaTest = 0.1;
  }

  override postUpdate(context?: Context): void {
    super.postUpdate();
    if (!context) return;
    let baseZ = -Infinity;
    for (const child of this.object3d.children) baseZ = Math.max(baseZ, child.position.z);
    if (!Number.isFinite(baseZ)) return;
    this._distance.min = Math.max(0.5, nearBoundBelow(context.view.camera, baseZ + this.maxHeight));
    this._distance.max = 0; // the terrain (Map) beneath sets the far plane
  }
}

/**
 * A GeoJSON layer coloured by a theme, sitting on the terrain:
 *  - flat areas (e.g. plans) are painted onto the terrain as a map layer, so they follow the
 *    ground exactly and can't z-fight with it;
 *  - extruded LoD1 bodies are an entity whose features stand on the terrain;
 *  - points can be pins: badges standing on the terrain, always drawn on top.
 */
export class FeatureLayer {
  /** Bodies or pins (null for flat layers). Attach it to the map once added to the instance. */
  readonly entity: BodyCollection | null = null;
  /** Flat areas (null for extruded layers). Add it to the map. */
  readonly colorLayer: ColorLayer | null = null;
  private readonly vectorSource: VectorSource | null = null;
  private highlightedKey: string | null = null;
  private readonly styles = new Map<string, Style>();

  constructor(private readonly options: FeatureLayerOptions) {
    const format = new GeoJSON({ dataProjection: crs.id, featureProjection: crs.id });
    const { extrusionProperty, pinLabelProperty, bounds } = options;

    if (pinLabelProperty) {
      const source = new StaticFeatureSource({ coordinateSystem: crs });
      this.entity = new BodyCollection({
        source,
        drapingMode: 'per-feature',
        style: (feature) => this.pinStyle(feature),
      });
      this.entity.name = options.name;
      this.entity.maxHeight = PIN_LIFT;
      loadInto(options, format, (features) => {
        // A z coordinate lifts the pin; draping adds the terrain height to it.
        for (const f of features) {
          const g = f.getGeometry();
          if (g?.getType() === 'Point') {
            const [x, y] = (g as Point).getCoordinates();
            (g as Point).setCoordinates([x, y, PIN_LIFT]);
          }
        }
        source.addFeatures(features);
      });
      return;
    }

    if (extrusionProperty) {
      const source = options.url
        ? new FileFeatureSource({ url: options.url, format, sourceCoordinateSystem: crs })
        : new StaticFeatureSource({ coordinateSystem: crs });
      this.entity = new BodyCollection({
        source,
        drapingMode: 'per-feature',
        extrusionOffset: (feature) => {
          const height = Number(feature.get(extrusionProperty)) || DEFAULT_HEIGHT;
          if (this.entity) this.entity.maxHeight = Math.max(this.entity.maxHeight, height);
          return height;
        },
        style: (feature) => this.bodyStyle(feature),
      });
      this.entity.name = options.name;
      if (source instanceof StaticFeatureSource) {
        loadInto(options, format, (features) => source.addFeatures(features));
      }
      return;
    }

    this.vectorSource = new VectorSource({
      data: options.url ? { url: options.url, format } : [],
      dataProjection: crs,
      style: (feature) => this.zoneStyle(feature as Feature),
    });
    if (!options.url) loadInto(options, format, (features) => this.vectorSource?.addFeatures(features));
    this.colorLayer = new ColorLayer({
      name: options.name,
      source: this.vectorSource,
      extent: bounds ? new Extent(crs, ...bounds) : mapExtent,
    });
  }

  dispose(): void {
    this.styles.clear();
  }

  /** Flat areas (e.g. plans), as opposed to extruded bodies or pins. */
  get isFlat(): boolean {
    return !this.options.extrusionProperty && !this.options.pinLabelProperty;
  }

  /** Stacking order among flat layers. */
  get order(): number {
    return this.options.elevation ?? 0;
  }

  /** Flat layers: the topmost area at a ground point (EPSG:3006), if any. */
  featureAt(x: number, y: number): Feature | null {
    if (!this.colorLayer?.visible) return null;
    const hits = this.colorLayer.getVectorFeaturesAtCoordinate(new Coordinates(crs, x, y));
    return hits[hits.length - 1] ?? null;
  }

  /** Stable ID of a feature (shared by all parts of a multi-part object). */
  keyOf(feature: Feature): string {
    const { idProperties } = this.options;
    if (idProperties?.length) {
      const values = idProperties.map((p) => feature.get(p));
      if (values.some((v) => v != null && v !== '')) return values.map((v) => v ?? '').join('|');
    }
    return String(feature.getId() ?? '');
  }

  labelOf(feature: Feature): string | null {
    const { labelProperty } = this.options;
    const value = labelProperty ? feature.get(labelProperty) : feature.get('name');
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  /** Highlighting goes through the style callbacks; only the affected features are restyled. */
  setHighlighted(key: string | null): void {
    if (key === this.highlightedKey) return;
    const affected = new Set([this.highlightedKey, key]);
    this.highlightedKey = key;

    if (this.vectorSource) {
      const features = this.vectorSource.getFeatures().filter((f) => affected.has(this.keyOf(f)));
      this.vectorSource.updateFeature(...features);
      return;
    }
    if (this.entity) {
      const meshes: Parameters<DrapedFeatureCollection['updateStyles']>[0] = [];
      this.entity.traverseGeometries((mesh) => {
        const feature = mesh.userData.feature;
        if (feature && affected.has(this.keyOf(feature))) meshes.push(mesh);
      });
      this.entity.updateStyles(meshes);
    }
  }

  private isHighlighted(feature: Feature): boolean {
    return this.highlightedKey !== null && this.keyOf(feature) === this.highlightedKey;
  }

  private colorOf(feature: Feature): Color {
    const { theme } = this.options;
    return this.isHighlighted(feature)
      ? HIGHLIGHT_COLOR
      : new Color(categoryOf(theme, theme.property ? feature.get(theme.property) : undefined).color);
  }

  private pinStyle(feature: Feature): FeatureStyle {
    const label = String(feature.get(this.options.pinLabelProperty!) ?? '');
    const color = `#${this.colorOf(feature).getHexString()}`;
    return {
      point: {
        image: pinIcon(color, label),
        color: '#ffffff',
        pointSize: PIN_SIZE,
        sizeAttenuation: false,
        // Over buildings and the terrain: a pin is a pointer, not part of the scene.
        depthTest: false,
        renderOrder: this.isHighlighted(feature) ? 1001 : 1000,
      },
    };
  }

  private bodyStyle(feature: Feature): FeatureStyle {
    const { theme } = this.options;
    const opacity = this.isHighlighted(feature) ? Math.max(theme.fillOpacity, 0.8) : theme.fillOpacity;
    return { fill: { color: this.colorOf(feature), shading: true, opacity } };
  }

  /** OpenLayers style for the rasterised zones. Styles are shared between equal-looking zones. */
  private zoneStyle(feature: Feature): Style {
    const { theme } = this.options;
    const highlighted = this.isHighlighted(feature);
    const color = this.colorOf(feature);
    const emphasised = theme.emphasis?.values.includes(feature.get(theme.emphasis.property)) ?? false;
    const fillOpacity = highlighted ? 0.8 : theme.fillOpacity;
    const strokeColor = emphasised || highlighted ? EMPHASIS_STROKE : color.clone().multiplyScalar(0.6);
    const strokeWidth = emphasised ? 4 : 1.5;

    const key = `${color.getHexString()}|${fillOpacity}|${strokeColor.getHexString()}|${strokeWidth}`;
    let style = this.styles.get(key);
    if (!style) {
      style = new Style({
        fill: new Fill({ color: rgba(color, fillOpacity) }),
        stroke: new Stroke({ color: rgba(strokeColor, 1), width: strokeWidth }),
      });
      this.styles.set(key, style);
    }
    return style;
  }
}

/** CSS colour (sRGB) for OpenLayers; three.js keeps Color components linear. */
function rgba(color: Color, alpha: number): string {
  const hex = color.getHex();
  return `rgba(${(hex >> 16) & 255}, ${(hex >> 8) & 255}, ${hex & 255}, ${alpha})`;
}

/** Runs the layer's loader and hands the parsed features over. */
function loadInto(options: FeatureLayerOptions, format: GeoJSON, add: (features: Feature[]) => void): void {
  const { load } = options;
  if (!load) throw new Error(`Feature layer "${options.name}" needs a url or a loader`);
  load()
    .then((geojson) => add(format.readFeatures(geojson) as Feature[]))
    .catch((err) => console.error(`Failed to load "${options.name}"`, err));
}
