import { AmbientLight, Color, DirectionalLight, Mesh, Vector3, type Material } from 'three';
import type { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import type Feature from 'ol/Feature.js';
import OSM from 'ol/source/OSM.js';

import Instance from '@giro3d/giro3d/core/Instance.js';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer.js';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer.js';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import type GiroMap from '@giro3d/giro3d/entities/Map.js';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D.js';
import GeoTIFFFormat from '@giro3d/giro3d/formats/GeoTIFFFormat.js';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js';
import UrlImageSource from '@giro3d/giro3d/sources/UrlImageSource.js';

import type { LayerDescriptor } from '@/features/layers/layersStore';
import type { SelectedFeature } from '@/features/selection/selectionStore';
import { initializeCamera, type Viewpoint } from './camera';
import { crs, extent, home, SOURCE_CRS } from './crs';
import { FeatureLayer } from './entities/FeatureLayer';
import { getTheme } from '@/features/layers/themes';
import { loadDetailPlan, toGeoJson } from '@/features/plans/lmDetaljplan';
import { loadEvents, venuesGeoJson } from '@/features/events/eventsApi';
import IfcEntity from './entities/IfcEntity';
import I3SEntity from './entities/I3SEntity';
import TreeEntity from './entities/TreeEntity';
import { loadTrees } from '@/features/trees/treeSources';
import type { Tree } from '@/features/trees/trees';
import { TerrainMap } from './entities/TerrainMap';
import { TERRAIN_NODATA, TERRAIN_URL_TEMPLATE } from './terrainSource';
import { onCanvasClick } from './picking';
import { PolygonDrawTool, type SnapTargets, type XY } from './drawing/PolygonDrawTool';
import { SketchOverlay, type SketchItem } from './drawing/SketchOverlay';
import { CircleTool, type CircleResult } from './drawing/CircleTool';
import { FloodOverlay } from './flood/FloodOverlay';
import { NoiseOverlay } from './noise/NoiseOverlay';
import { MeasureTool, disposeGroup, type MeasureCallbacks, type MeasureKind, type SurfacePoint } from './measure/MeasureTool';
import { groundUnderPointer } from './drawing/groundRay';
import type { Group } from 'three';

const HIGHLIGHT_COLOR = new Color(0xff7171);

export const BASEMAP_ATTRIBUTION =
  'Basemap: © OpenStreetMap contributors · Terrain: Luleå kommun Markmodell, kartportal.lulea.se (live, no licence stated)';


export interface ViewerCallbacks {
  onPick(feature: SelectedFeature | null): void;
}

interface Overlay {
  /** Descriptor fields that require recreating the entity when they change. */
  key: string;
  /** Scene entity; flat areas are instead a layer painted onto the terrain. */
  entity?: Entity3D;
  mapLayer?: ColorLayer;
  features?: FeatureLayer;
  i3s?: I3SEntity;
  trees?: TreeEntity;
  /** `ifc` layers standing on the terrain: (x, y) of the origin. */
  groundAt?: [number, number];
  /** Undoes subscriptions made for this overlay. */
  release?: () => void;
}

type ColoredMaterial = Material & { color: Color };

/**
 * Owns the giro3d Instance. Stores describe *what* should be shown; this service makes
 * the scene match. Never put this object (or anything it holds) in reactive state.
 */
export class ViewerService {
  readonly instance: Instance;

  private readonly controls: MapControls;
  private readonly map: GiroMap;
  private readonly overlays = new Map<string, Overlay>();
  private highlighted: { material: ColoredMaterial; originalColor: Color } | null = null;
  private highlightedFeatures: FeatureLayer | null = null;
  private highlightedI3S: I3SEntity | null = null;
  private highlightedTrees: TreeEntity | null = null;
  private readonly detachClick: () => void;
  private drawTool: PolygonDrawTool | null = null;
  private circleTool: CircleTool | null = null;
  /** The click that finishes a drawing tool arrives after it; it mustn't select something. */
  private toolEndedAt = -Infinity;
  private flood: FloodOverlay | null = null;
  private noise: NoiseOverlay | null = null;
  private measureTool: MeasureTool | null = null;
  private readonly measurements = new Map<string, Group>();
  private sketch: SketchOverlay | null = null;

  constructor(target: HTMLDivElement, private readonly callbacks: ViewerCallbacks) {
    this.instance = new Instance({ target, crs, backgroundColor: 0xcccccc });
    this.instance.view.minNearPlane = 0.5;

    this.map = this.addBasemap();
    this.addLights();
    this.controls = initializeCamera(this.instance, home);

    this.detachClick = onCanvasClick(this.instance.domElement, (evt) => this.pick(evt));
  }

  /** Adds, removes and toggles overlay entities so the scene matches `layers`. */
  syncLayers(layers: readonly LayerDescriptor[]): void {
    const wanted = new Map(layers.map((l) => [l.id, l]));

    for (const [id, overlay] of this.overlays) {
      const layer = wanted.get(id);
      if (!layer || overlayKey(layer) !== overlay.key) {
        this.removeOverlay(id);
      }
    }

    for (const layer of layers) {
      let overlay = this.overlays.get(layer.id);
      if (!overlay) {
        overlay = createOverlay(layer, this.terrainAt);
        this.overlays.set(layer.id, overlay);
        this.addToScene(layer, overlay);
      }
      const target = overlay.entity ?? overlay.mapLayer;
      if (target && target.visible !== layer.visible) {
        target.visible = layer.visible;
        // A bare notifyChange() doesn't update entities that were hidden when added.
        this.instance.notifyChange(overlay.entity ?? this.map);
      }
    }

    this.instance.notifyChange();
  }

  /** Highlights the selected object, restoring the previous one. */
  highlight(feature: SelectedFeature | null): void {
    if (this.highlighted) {
      this.highlighted.material.color.copy(this.highlighted.originalColor);
      this.highlighted = null;
    }
    this.highlightedFeatures?.setHighlighted(null);
    this.highlightedFeatures = null;
    this.highlightedI3S?.setHighlightedFeature(null);
    this.highlightedI3S = null;
    this.highlightedTrees?.setHighlighted(null);
    this.highlightedTrees = null;

    const overlay = feature ? this.overlays.get(feature.layerId) : undefined;
    if (feature && overlay?.i3s) {
      const id = Number(feature.objectId.replace(/^feature:/, ''));
      if (feature.objectId.startsWith('feature:') && Number.isFinite(id)) {
        overlay.i3s.setHighlightedFeature(id);
        this.highlightedI3S = overlay.i3s;
      }
    } else if (feature && overlay?.trees) {
      overlay.trees.setHighlighted(feature.objectId);
      this.highlightedTrees = overlay.trees;
    } else if (feature && overlay?.features) {
      overlay.features.setHighlighted(feature.objectId);
      this.highlightedFeatures = overlay.features;
    } else if (feature && overlay) {
      const object = overlay.entity?.object3d.getObjectByProperty('uuid', feature.objectId);
      const material = object instanceof Mesh ? object.material : null;
      if (isColoredMaterial(material)) {
        this.highlighted = { material, originalColor: material.color.clone() };
        material.color.copy(HIGHLIGHT_COLOR);
      }
    }

    this.instance.notifyChange();
  }

  /**
   * Lets the user draw a polygon on the ground (plan editor). Picking is paused meanwhile.
   * Resolves with the closed outer ring in EPSG:3006, or null if cancelled.
   */
  drawPolygon(snap: SnapTargets): Promise<XY[] | null> {
    this.drawTool?.dispose();
    return new Promise((resolve) => {
      this.drawTool = new PolygonDrawTool(this.instance, snap, this.heightAt, (ring) => {
        this.drawTool = null;
        this.toolEndedAt = performance.now();
        resolve(ring);
      });
    });
  }

  cancelDrawing(): void {
    this.drawTool?.dispose();
    this.drawTool = null;
  }

  /**
   * Lets the user place a circle on the terrain: click the centre, move to size it, click again.
   * Picking is paused meanwhile. `onRadius` reports the radius while sizing (null before the
   * centre is set). Resolves with the circle, or null if cancelled.
   */
  pickCircle(onRadius: (radius: number | null) => void): Promise<CircleResult | null> {
    this.cancelCircle();
    onRadius(null);
    return new Promise((resolve) => {
      this.circleTool = new CircleTool(this.instance, this.heightAt, onRadius, (circle) => {
        this.circleTool = null;
        this.toolEndedAt = performance.now();
        resolve(circle);
      });
    });
  }

  cancelCircle(): void {
    this.circleTool?.dispose();
    this.circleTool = null;
  }

  /** Temporary markers for a flood check in this circle (replacing any previous ones). */
  showFlood(circle: CircleResult): FloodOverlay {
    this.clearFlood();
    this.flood = new FloodOverlay(this.instance, circle.center, circle.radius, this.heightAt);
    return this.flood;
  }

  clearFlood(): void {
    this.flood?.dispose();
    this.flood = null;
  }

  /**
   * Starts a measuring tool (replacing any running one). Finished measurements stay in the
   * scene until removed; `onDone` hands their numbers over.
   */
  startMeasure(kind: MeasureKind, callbacks: MeasureCallbacks): void {
    this.stopMeasure();
    this.cancelDrawing();
    this.cancelCircle();
    this.measureTool = new MeasureTool(
      { instance: this.instance, pick: (evt) => this.pickSurface(evt), terrainAt: this.terrainAt },
      kind,
      {
        onPreview: callbacks.onPreview,
        onDone: (m) => {
          void this.instance.add(m.object);
          this.measurements.set(m.id, m.object);
          this.instance.notifyChange();
          callbacks.onDone(m);
        },
      },
    );
  }

  stopMeasure(): void {
    this.measureTool?.dispose();
    this.measureTool = null;
  }

  removeMeasurement(id: string): void {
    const group = this.measurements.get(id);
    if (!group) return;
    disposeGroup(group);
    this.instance.remove(group);
    this.measurements.delete(id);
    this.instance.notifyChange();
  }

  clearMeasurements(): void {
    for (const id of [...this.measurements.keys()]) this.removeMeasurement(id);
  }

  /** The nearest visible surface under the pointer: buildings, models, trees or the terrain. */
  private pickSurface(evt: { clientX: number; clientY: number }): SurfacePoint | null {
    const entities = [this.map, ...[...this.overlays.values()].flatMap((o) => (o.entity?.visible ? [o.entity] : []))];
    const [hit] = this.instance.pickObjectsAt(evt as MouseEvent, {
      limit: 1,
      sortByDistance: true,
      where: entities,
      // Pins and badges are pointers, not surfaces.
      filter: (p) => p.object.visible && !(p.object as { isPointMesh?: boolean }).isPointMesh && !(p.object as { isSprite?: boolean }).isSprite,
    });
    if (hit) return { p: [hit.point.x, hit.point.y, hit.point.z], ground: hit.entity === this.map };
    const ground = groundUnderPointer(this.instance, evt, this.heightAt);
    return ground ? { p: [ground.x, ground.y, ground.z], ground: true } : null;
  }

  /** Temporary markers for a noise check around `origin` (replacing any previous ones). */
  showNoise(origin: [number, number, number]): NoiseOverlay {
    this.clearNoise();
    this.noise = new NoiseOverlay(this.instance, origin, this.terrainAt);
    return this.noise;
  }

  clearNoise(): void {
    this.noise?.dispose();
    this.noise = null;
  }

  /**
   * Bottom and top (scene z) of a selected building, from the 3D model or an extruded layer's
   * height; null when unknown (e.g. the mesh tile isn't loaded).
   */
  buildingZRange(feature: SelectedFeature): { min: number; max: number } | null {
    const overlay = this.overlays.get(feature.layerId);
    const id = Number(feature.objectId.replace(/^feature:/, ''));
    if (overlay?.i3s && feature.objectId.startsWith('feature:') && Number.isFinite(id)) {
      return overlay.i3s.featureZRange(id);
    }
    const height = Number(feature.properties.height);
    if (feature.point && Number.isFinite(height) && height > 0) {
      const ground = this.terrainAt(feature.point[0], feature.point[1]) ?? 0;
      return { min: ground, max: ground + height };
    }
    return null;
  }

  /** Outlines of the plan being edited. */
  setSketch(items: SketchItem[]): void {
    this.sketch ??= new SketchOverlay(this.instance, this.heightAt);
    this.sketch.update(items);
  }

  /** Terrain height (RH 2000) at a point, from the terrain loaded so far; 0 where there is none. */
  readonly heightAt = (x: number, y: number): number => this.terrainAt(x, y) ?? 0;

  /** Like heightAt, but null where no terrain is loaded (or the model has no data). */
  readonly terrainAt = (x: number, y: number): number | null => {
    const sample = this.map.getElevationFast(x, y);
    return sample && sample.elevation > TERRAIN_NODATA ? sample.elevation : null;
  };

  /** Current camera as plain data, e.g. to store with a comment. */
  getViewpoint(): Viewpoint {
    return {
      position: this.instance.view.camera.position.toArray(),
      target: this.controls.target.toArray(),
    };
  }

  /** Moves the camera to a stored viewpoint. */
  showViewpoint(viewpoint: Viewpoint): void {
    this.instance.view.camera.position.set(...viewpoint.position);
    this.controls.target.set(...viewpoint.target);
    this.controls.update();
    this.instance.notifyChange(this.instance.view.camera);
  }

  dispose(): void {
    this.detachClick();
    this.drawTool?.dispose();
    this.circleTool?.dispose();
    this.flood?.dispose();
    this.noise?.dispose();
    this.measureTool?.dispose();
    this.clearMeasurements();
    this.sketch?.dispose();
    for (const id of [...this.overlays.keys()]) this.removeOverlay(id);
    this.controls.dispose();
    this.instance.dispose();
  }

  private pick(evt: MouseEvent): void {
    if (this.drawTool || this.circleTool || this.measureTool) return; // clicks belong to the tool
    if (performance.now() - this.toolEndedAt < 400) return; // ...including the one that ended it
    const entities = [...this.overlays.values()].flatMap((o) => (o.entity ? [o.entity] : []));
    const hits = this.instance.pickObjectsAt(evt, {
      radius: 5,
      limit: 10,
      sortByDistance: true,
      where: entities,
      filter: (p) => p.object.visible,
    });
    // Pins are drawn on top of everything, so they win over the (nearer) building behind them.
    const hit = hits.find((h) => (h.object as { isPointMesh?: boolean }).isPointMesh) ?? hits[0];
    // Solid objects (buildings, IFC) win over flat areas (plans) painted on the ground under
    // them; click open ground inside an area to select the area itself.
    if (!hit) {
      this.pickArea(evt);
      return;
    }

    const layerId = [...this.overlays].find(([, o]) => o.entity === hit.entity)?.[0];
    if (!layerId) {
      this.callbacks.onPick(null);
      return;
    }

    const userData = hit.object.userData as Record<string, unknown>;
    const olFeature = userData.feature as Feature | undefined;
    const featureLayer = this.overlays.get(layerId)?.features;

    if (olFeature && featureLayer) {
      const { geometry: _geometry, ...props } = olFeature.getProperties();
      const key = featureLayer.keyOf(olFeature);
      this.callbacks.onPick({
        layerId,
        objectId: key || hit.object.uuid,
        stableId: key || null,
        point: [hit.point.x, hit.point.y, hit.point.z],
        name: featureLayer.labelOf(olFeature),
        ifcClass: null,
        globalId: null,
        properties: primitiveProperties(props),
      });
      return;
    }

    const tree = this.overlays.get(layerId)?.trees?.treeAt(hit);
    if (tree) {
      this.callbacks.onPick({
        layerId,
        objectId: tree.id,
        stableId: tree.id,
        point: [hit.point.x, hit.point.y, hit.point.z],
        name: tree.species ?? tree.latin ?? (tree.form === 'conifer' ? 'Conifer' : 'Broadleaf tree'),
        ifcClass: null,
        globalId: null,
        properties: treeProperties(tree),
      });
      return;
    }

    const i3s = this.overlays.get(layerId)?.i3s;
    if (i3s) {
      // One mesh tile holds many buildings: resolve the clicked one from the triangle.
      const featureId = i3s.featureAt(hit);
      this.callbacks.onPick({
        layerId,
        objectId: featureId !== null ? `feature:${featureId}` : hit.object.uuid,
        stableId: null, // filled with the national building id by the facts look-up
        point: [hit.point.x, hit.point.y, hit.point.z],
        name: null,
        ifcClass: null,
        globalId: null,
        properties: {},
      });
      return;
    }

    const globalId = typeof userData.globalId === 'string' ? userData.globalId : null;
    this.callbacks.onPick({
      layerId,
      objectId: hit.object.uuid,
      stableId: globalId,
      point: [hit.point.x, hit.point.y, hit.point.z],
      name: hit.object.name || null,
      ifcClass: typeof userData.ifcClass === 'string' ? userData.ifcClass : null,
      globalId,
      properties: primitiveProperties(userData),
    });
  }

  /** Selects the topmost flat area (painted on the terrain) under the pointer. */
  private pickArea(evt: MouseEvent): void {
    const [ground] = this.instance.pickObjectsAt(evt, { limit: 1, where: [this.map] });
    const zones = [...this.overlays]
      .flatMap(([layerId, o]) => (o.mapLayer?.visible && o.features ? [{ layerId, layer: o.features }] : []))
      .sort((a, b) => b.layer.order - a.layer.order);
    for (const { layerId, layer } of ground ? zones : []) {
      const feature = layer.featureAt(ground.point.x, ground.point.y);
      if (!feature) continue;
      const { geometry: _geometry, ...props } = feature.getProperties();
      const key = layer.keyOf(feature);
      this.callbacks.onPick({
        layerId,
        objectId: key || String(feature.getId() ?? ''),
        stableId: key || null,
        point: [ground.point.x, ground.point.y, ground.point.z],
        name: layer.labelOf(feature),
        ifcClass: null,
        globalId: null,
        properties: primitiveProperties(props),
      });
      return;
    }
    this.callbacks.onPick(null);
  }

  private addToScene(layer: LayerDescriptor, overlay: Overlay): void {
    const fail = (err: unknown) => console.error(`Failed to load layer "${layer.name}"`, err);
    if (overlay.mapLayer) {
      this.map
        .addLayer(overlay.mapLayer)
        .then(() => this.sortMapLayers())
        .catch(fail);
      return;
    }
    const entity = overlay.entity;
    if (!entity) return;
    this.instance
      .add(entity)
      .then(() => {
        if (this.overlays.get(layer.id) !== overlay) return; // removed meanwhile
        // Draped bodies need the instance (added above) before they can follow the terrain.
        overlay.features?.entity?.attach(this.map);
        if (overlay.groundAt) overlay.release = this.keepOnGround(entity, ...overlay.groundAt);
        if (overlay.trees) overlay.release = this.followTerrain(overlay.trees);
      })
      .catch(fail);
  }

  /** Re-places trees on the terrain as finer terrain loads (once per frame at most). */
  private followTerrain(trees: TreeEntity): () => void {
    let scheduled = 0;
    const onElevation = () => {
      scheduled ||= requestAnimationFrame(() => {
        scheduled = 0;
        trees.placeTrees();
      });
    };
    trees.placeTrees();
    this.map.addEventListener('elevation-loaded', onElevation);
    return () => {
      cancelAnimationFrame(scheduled);
      this.map.removeEventListener('elevation-loaded', onElevation);
    };
  }

  /** Lifts an entity onto the terrain at (x, y), again whenever finer terrain arrives there. */
  private keepOnGround(entity: Entity3D, x: number, y: number): () => void {
    const place = () => {
      entity.object3d.position.z = this.heightAt(x, y);
      entity.object3d.updateMatrixWorld(true);
      this.instance.notifyChange(entity);
    };
    const onElevation = ({ tile }: { tile: { extent: { isXYInside(x: number, y: number): boolean } } }) => {
      if (tile.extent.isXYInside(x, y)) place();
    };
    place();
    this.map.addEventListener('elevation-loaded', onElevation);
    return () => this.map.removeEventListener('elevation-loaded', onElevation);
  }

  /** Basemap at the bottom, then flat layers by their stacking order. */
  private sortMapLayers(): void {
    const order = new Map<unknown, number>();
    for (const o of this.overlays.values()) {
      if (o.mapLayer && o.features) order.set(o.mapLayer, o.features.order);
    }
    this.map.sortColorLayers((a, b) => (order.get(a) ?? -Infinity) - (order.get(b) ?? -Infinity));
  }

  private removeOverlay(id: string): void {
    const overlay = this.overlays.get(id);
    if (!overlay) return;
    if (this.highlightedFeatures === overlay.features) this.highlightedFeatures = null;
    if (this.highlightedI3S === overlay.i3s) this.highlightedI3S = null;
    if (this.highlightedTrees === overlay.trees) this.highlightedTrees = null;
    overlay.release?.();
    if (overlay.mapLayer) this.map.removeLayer(overlay.mapLayer, { disposeLayer: true });
    if (overlay.entity) {
      this.instance.remove(overlay.entity);
      overlay.entity.dispose();
    }
    overlay.features?.dispose();
    this.overlays.delete(id);
  }

  private addBasemap(): GiroMap {
    const map = new TerrainMap({ extent });
    this.instance.add(map);
    map.addLayer(
      new ElevationLayer({
        name: 'terrain',
        extent: map.extent,
        // Luleå's ground model spans about -2 to +310 m; saves giro3d estimating it from samples.
        minmax: { min: -2, max: 310 },
        source: new UrlImageSource({
          urlTemplate: TERRAIN_URL_TEMPLATE,
          crs,
          format: new GeoTIFFFormat(),
          noDataValue: TERRAIN_NODATA,
          // Requests queue behind basemap tiles; giro3d's 5 s default counts the wait.
          httpTimeout: 20000,
        }),
      }),
    );
    // OSM tiles are Web Mercator; giro3d reprojects them into SWEREF 99 TM.
    map.addLayer(
      new ColorLayer({
        name: 'osm',
        extent: map.extent,
        source: new TiledImageSource({ source: new OSM() }),
      }),
    );
    return map;
  }

  private addLights(): void {
    const scene = this.instance.scene;

    const sun = new DirectionalLight('#ffffff', 1.4);
    sun.position.set(1, 0, 1).normalize();
    sun.updateMatrixWorld(true);
    scene.add(sun);

    const fill = new DirectionalLight('#ffffff', 0.5);
    fill.position.set(0, -1, 1);
    fill.updateMatrixWorld(true);
    scene.add(fill);

    scene.add(new AmbientLight(0xffffff, 1));
  }
}

function overlayKey(layer: LayerDescriptor): string {
  const { visible: _visible, name: _name, attribution: _attribution, id: _id, ...rest } = layer;
  return JSON.stringify(rest);
}

function createOverlay(layer: LayerDescriptor, terrainAt: (x: number, y: number) => number | null): Overlay {
  const key = overlayKey(layer);
  switch (layer.kind) {
    case 'tiles3d':
      return { key, entity: new Tiles3D({ url: layer.url, name: layer.name }) };
    case 'ifc': {
      // An origin without a height stands on the terrain.
      const [x, y, z] = layer.origin ?? [];
      const position = x !== undefined && y !== undefined ? new Vector3(x, y, z ?? 0) : undefined;
      const groundAt: [number, number] | undefined = position && z === undefined ? [position.x, position.y] : undefined;
      return { key, entity: new IfcEntity({ name: layer.name, url: layer.url, position }), groundAt };
    }
    case 'i3s': {
      const code = layer.sourceCrs ?? 'EPSG:3017';
      const entity = new I3SEntity({
        name: layer.name,
        url: layer.url,
        sourceCrs: { code, proj4: SOURCE_CRS[code] },
        targetCrs: crs.id,
        zOffset: layer.zOffset,
        textures: layer.textures ?? false,
      });
      return { key, entity, i3s: entity };
    }
    case 'detaljplan': {
      const view = layer.planView ?? 'boundary';
      const features = new FeatureLayer({
        name: layer.name,
        load: () => loadDetailPlan(layer.url).then((plan) => toGeoJson(plan, view)),
        theme: getTheme(layer.themeId ?? (view === 'envelope' ? 'detaljplan-envelope' : 'detaljplan')),
        idProperties: ['planId'],
        labelProperty: 'name',
        extrusionProperty: view === 'envelope' ? 'height' : undefined,
        elevation: layer.elevation,
      });
      return featureOverlay(key, features);
    }
    case 'trees': {
      const entity = new TreeEntity({
        name: layer.name,
        load: (signal) => loadTrees(layer.url || undefined, layer.osmUrl, signal),
        terrainAt,
      });
      return { key, entity, trees: entity };
    }
    case 'events': {
      // One pin per venue, labelled with its number of events; the panel lists them.
      const features = new FeatureLayer({
        name: layer.name,
        load: () => loadEvents(layer.url).then(venuesGeoJson),
        theme: getTheme(layer.themeId ?? 'events'),
        idProperties: ['venueId'],
        labelProperty: 'name',
        pinLabelProperty: 'events',
      });
      return featureOverlay(key, features);
    }
    case 'features': {
      const features = new FeatureLayer({
        name: layer.name,
        url: layer.url,
        theme: getTheme(layer.themeId ?? 'buildings'),
        idProperties: layer.idProperties,
        labelProperty: layer.labelProperty,
        extrusionProperty: layer.extrusionProperty,
        elevation: layer.elevation,
        bounds: layer.bounds,
      });
      return featureOverlay(key, features);
    }
  }
}

function featureOverlay(key: string, features: FeatureLayer): Overlay {
  return { key, entity: features.entity ?? undefined, mapLayer: features.colorLayer ?? undefined, features };
}

function treeProperties(tree: Tree): Record<string, string> {
  const props: Record<string, string> = {
    form: tree.form === 'conifer' ? 'Conifer' : 'Broadleaf',
    height: `${tree.height.toFixed(1)} m${tree.heightKnown ? '' : ' (estimated)'}`,
    source: tree.source === 'lulea' ? "Luleå kommun's tree register (live)" : 'OpenStreetMap',
  };
  if (tree.species) props.species = tree.species;
  if (tree.latin) props.latin = tree.latin;
  else if (tree.genus) props.latin = tree.genus;
  return props;
}

function isColoredMaterial(material: unknown): material is ColoredMaterial {
  return material != null && (material as { color?: unknown }).color instanceof Color;
}

function primitiveProperties(source: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith('_')) continue; // giro3d/three internals
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = String(value);
    }
  }
  return result;
}
