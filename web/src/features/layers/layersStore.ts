import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { inMode, useModeStore, type ModeId } from '@/app/modes';
import { daysOf, eventsUrl } from '@/features/events/eventsApi';
import type { PlanView } from '@/features/plans/lmDetaljplan';
import katten6Url from '../../../../spec/examples/katten-6.lm-detaljplan-4.1.json?url';
import type { ThemeId } from './themes';

export type LayerKind = 'tiles3d' | 'ifc' | 'features' | 'detaljplan' | 'i3s' | 'events' | 'trees';

/** Serialisable description of an overlay. The viewer turns these into giro3d entities. */
export interface LayerDescriptor {
  id: string;
  name: string;
  kind: LayerKind;
  url: string;
  /** Views the layer belongs to (see app/modes); both when absent. */
  modes?: ModeId[];
  visible: boolean;
  /** Placement in the scene CRS for data without georeferencing (e.g. raw IFC); without a height it stands on the terrain. */
  origin?: [number, number] | [number, number, number];
  /** Data bounds in the scene CRS: [xmin, xmax, ymin, ymax]. */
  bounds?: [number, number, number, number];
  /** Attribution/licence text shown while the layer is visible. */
  attribution?: string;
  /** `features` layers: colours, legend and info-panel fields. */
  themeId?: ThemeId;
  /** `features` layers: properties forming a stable ID (used by comments and highlighting). */
  idProperties?: string[];
  /** `features` layers: property used as the object's name. */
  labelProperty?: string;
  /** `features` layers: extrude polygons by this property (LoD1 bodies); flat otherwise. */
  extrusionProperty?: string;
  /** Flat `features`/`detaljplan` layers: stacking order on the terrain (higher is drawn on top). */
  elevation?: number;
  /** Layers showing the same objects share comments by using the same scope (default: layer id). */
  commentScope?: string;
  /** `i3s` layers: CRS of the scene layer (must be in viewer/crs SOURCE_CRS). */
  sourceCrs?: 'EPSG:3017';
  /** `i3s` layers: added to heights (both the source and our terrain are RH 2000). */
  zOffset?: number;
  /** `trees` layers: OpenStreetMap trees, drawn where the main source (url) has none nearby. */
  osmUrl?: string;
  /** `i3s` layers: show the producer's photo textures; plain shaded bodies otherwise. */
  textures?: boolean;
  /** Buildings: look up facts (address, purpose, heritage) from Luleå kommun's services on click. */
  buildingFacts?: boolean;
  /** `detaljplan` layers (url = Lantmäteriet Detaljplan 4.1 delivery): which part to draw. */
  planView?: PlanView;
}

// Bounds of web/public/data/lulea/*.geojson (scripts/fetch_lulea_buildings.py), EPSG:3006.
const LULEA_BUILDINGS_BOUNDS: [number, number, number, number] = [828100, 830500, 7291400, 7293300];

const LULEA_PLANS_ATTRIBUTION = 'Plans: Luleå kommun, geodataportalen (CC BY 4.0)';

/**
 * Live GeoJSON from Luleå kommun's open ArcGIS feature services, already in EPSG:3006.
 * Max 1000 features per request (gällande detaljplaner has ~800); add paging if that grows.
 */
function lulea(service: string): string {
  const query = new URLSearchParams({ where: '1=1', outFields: '*', outSR: '3006', f: 'geojson' });
  return `https://services.arcgis.com/f1FD2L08bel8cfME/arcgis/rest/services/${service}/FeatureServer/0/query?${query}`;
}

export const useLayersStore = defineStore('layers', () => {
  const layers = ref<LayerDescriptor[]>([
    {
      id: 'detaljplan-katten-6',
      modes: ['participate'],
      name: 'Katten 6: plan area (LM Detaljplan 4.1)',
      kind: 'detaljplan',
      url: katten6Url,
      planView: 'boundary',
      // Plan and provision ids are LM objektidentitet uuids, globally unique.
      commentScope: 'lm-detaljplan',
      visible: true,
      themeId: 'detaljplan',
      elevation: 1.2,
      attribution: "Katten 6: example built from Luleå kommun's planbeskrivning and plankarta (KLF2023/1459)",
    },
    {
      id: 'detaljplan-katten-6-envelope',
      modes: ['participate'],
      name: 'Katten 6: highest allowed building',
      kind: 'detaljplan',
      url: katten6Url,
      planView: 'envelope',
      commentScope: 'lm-detaljplan',
      visible: true,
      themeId: 'detaljplan-envelope',
    },
    {
      id: 'lulea-detaljplaner-pagande',
      modes: ['participate'],
      name: 'Detaljplaner in progress',
      kind: 'features',
      url: lulea('GNG_detaljplaner_pagande'),
      visible: true,
      themeId: 'detaljplaner-pagaende',
      idProperties: ['ARENDENR'],
      labelProperty: 'DP_NAMN',
      elevation: 0.9,
      attribution: LULEA_PLANS_ATTRIBUTION,
    },
    {
      id: 'lulea-detaljplaneprogram',
      modes: ['participate'],
      name: 'Detaljplaneprogram',
      kind: 'features',
      url: lulea('GNG_detaljplaneprogram'),
      visible: false,
      themeId: 'detaljplaneprogram',
      // No unique field: two programmes share area and URL, but not adoption date.
      idProperties: ['OMRADE', 'ANTAGEN'],
      labelProperty: 'OMRADE',
      elevation: 0.6,
      attribution: LULEA_PLANS_ATTRIBUTION,
    },
    {
      id: 'lulea-detaljplaner-gallande',
      modes: ['participate'],
      name: 'Detaljplaner in force',
      kind: 'features',
      url: lulea('GNG_gallande_detaljplaner'),
      visible: false,
      themeId: 'detaljplaner-gallande',
      idProperties: ['PLANNUMMER'],
      labelProperty: 'PLANNAMN',
      elevation: 0.3,
      attribution: LULEA_PLANS_ATTRIBUTION,
    },
    {
      id: 'lulea-3d-buildings',
      name: '3D buildings (Luleå kommun)',
      kind: 'i3s',
      // Streamed live from Luleå's public 3D city model; nothing is stored. No licence is stated.
      url: 'https://kartportal.lulea.se/server/rest/services/Hosted/Alla_bef_byggnad_3D_20260630/SceneServer/layers/0',
      sourceCrs: 'EPSG:3017',
      textures: false,
      visible: true,
      buildingFacts: true,
      commentScope: 'lm-byggnad',
      attribution: '3D buildings: Luleå kommun, kartportal.lulea.se (live, no licence stated)',
    },
    {
      id: 'trees',
      name: 'Trees',
      kind: 'trees',
      // Luleå kommun's tree register (streamed live, ~8,000 trees with height and often species),
      // plus OpenStreetMap trees where Luleå has none within 4 m.
      url: 'https://kartportal.lulea.se/server/rest/services/Hosted/TRAD_Z_20260316/SceneServer/layers/0',
      osmUrl: '/data/lulea/trees-osm.geojson',
      themeId: 'trees',
      visible: true,
      commentScope: 'trees',
      attribution: 'Trees: Luleå kommun, kartportal.lulea.se (live, no licence stated) · © OpenStreetMap contributors (ODbL)',
    },
    {
      id: 'lulea-buildings-gba',
      name: 'Buildings LoD1 (GlobalBuildingAtlas)',
      kind: 'features',
      url: '/data/lulea/buildings-gba.geojson',
      visible: false,
      buildingFacts: true,
      bounds: LULEA_BUILDINGS_BOUNDS,
      themeId: 'buildings',
      extrusionProperty: 'height',
      attribution: 'Buildings: GlobalBuildingAtlas, Zhu et al. 2025 (CC BY-NC 4.0)',
    },
    {
      id: 'lulea-buildings-osm',
      name: 'Buildings LoD1 (OpenStreetMap)',
      kind: 'features',
      url: '/data/lulea/buildings-osm.geojson',
      visible: false,
      buildingFacts: true,
      bounds: LULEA_BUILDINGS_BOUNDS,
      themeId: 'buildings',
      extrusionProperty: 'height',
      attribution: 'Buildings: © OpenStreetMap contributors (ODbL)',
    },
    {
      id: 'visit-lulea-events',
      modes: ['discover'],
      name: "What's on (Visit Luleå)",
      kind: 'events',
      // Our backend reads the listing from visitlulea.se; each event links to its page there.
      url: eventsUrl(30),
      themeId: 'events',
      visible: true,
      attribution: 'Events: visitlulea.se (linked)',
    },
    {
      id: 'example-ifc',
      modes: ['participate'],
      name: 'Example IFC',
      kind: 'ifc',
      url: '/ifc/example.ifc',
      visible: true,
      // Not georeferenced; placed manually so the model sits on an open lot in central Luleå.
      origin: [829229, 7292329],
    },
  ]);

  const mode = useModeStore();
  /** Layers of the current view (the others stay loaded but hidden, so switching is instant). */
  const inView = computed(() => layers.value.filter((l) => inMode(l.modes, mode.current)));
  /** What the viewer should draw: every layer, shown only if switched on and in the current view. */
  const scene = computed(() => layers.value.map((l) => (l.visible && !inMode(l.modes, mode.current) ? { ...l, visible: false } : l)));

  const attributions = computed(() => [
    ...new Set(inView.value.filter((l) => l.visible && l.attribution).map((l) => l.attribution!)),
  ]);

  function add(layer: Omit<LayerDescriptor, 'id' | 'visible'>): LayerDescriptor {
    const descriptor = { ...layer, id: crypto.randomUUID(), visible: true };
    layers.value.push(descriptor);
    return descriptor;
  }

  /** Loads a local IFC file through a blob URL (revoked when the layer is removed). */
  function addIfcFile(file: File, origin?: LayerDescriptor['origin']): LayerDescriptor {
    return add({ name: file.name, kind: 'ifc', url: URL.createObjectURL(file), origin, modes: ['participate'] });
  }

  function remove(id: string): void {
    const layer = layers.value.find((l) => l.id === id);
    if (!layer) return;
    if (layer.url.startsWith('blob:')) URL.revokeObjectURL(layer.url);
    layers.value = layers.value.filter((l) => l.id !== id);
  }

  /**
   * Replaces the layers of plans saved in the platform (id prefix "plan:"), keeping each
   * layer's visibility. The url carries the version, so a new save reloads the layer.
   */
  function setSavedPlans(plans: { id: string; name: string; url: string }[]): void {
    const previous = new Map(layers.value.filter((l) => l.id.startsWith('plan:')).map((l) => [l.id, l]));
    const planLayers: LayerDescriptor[] = plans.map((p) => ({
      id: `plan:${p.id}`,
      modes: ['participate'],
      name: p.name,
      kind: 'detaljplan',
      url: p.url,
      planView: 'boundary',
      themeId: 'detaljplan',
      commentScope: 'lm-detaljplan',
      elevation: 1.2,
      visible: previous.get(`plan:${p.id}`)?.visible ?? true,
    }));
    layers.value = [...planLayers, ...layers.value.filter((l) => !l.id.startsWith('plan:'))];
  }

  function setTextures(id: string, textures: boolean): void {
    const layer = layers.value.find((l) => l.id === id);
    if (layer) layer.textures = textures;
  }

  /** `events` layers: how many days ahead to show. */
  function setEventWindow(id: string, days: number): void {
    const layer = layers.value.find((l) => l.id === id);
    if (layer && daysOf(layer.url) !== days) layer.url = eventsUrl(days);
  }

  function setVisible(id: string, visible: boolean): void {
    const layer = layers.value.find((l) => l.id === id);
    if (layer) layer.visible = visible;
  }

  return { layers, inView, scene, attributions, add, addIfcFile, remove, setVisible, setTextures, setEventWindow, setSavedPlans };
});
