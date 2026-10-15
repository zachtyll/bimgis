# 03: 3D data and IFC

## The reality: IFC is scarce

IFC models are available for some new large projects and public buildings. They are almost never available for existing housing stock. The platform therefore plans for **tiers of building detail**. Each building shows the best data we have, and the UI makes the level of detail clear.

| Tier | Source | Coverage | What users get |
|---|---|---|---|
| 0 | Footprint + height (cadastre, extruded) | ~Everything | Massing, shadows, "which building" |
| 1 | LOD1/LOD2 city model (CityGML / CityJSON / 3CIM; in Sweden Lantmäteriet or municipal 3D data) | Most urban areas | Roof shapes, decent visuals |
| 2 | Photogrammetry mesh / point cloud as 3D Tiles | Where flown/scanned | Realistic look, no semantics |
| 3 | IFC (BIM) | Rare: new projects and proposals | Elements, properties, interior |

Implications:
- **Feature identity lives above the geometry.** A building has one platform ID, which maps to a cadastre ID, a city model ID and, where available, an IFC `IfcBuilding.GlobalId`. Comments attach to the platform ID, so they survive an upgrade from tier 1 to tier 3.
- **Proposals are where IFC matters most.** Developers submitting a proposal is the realistic path to getting IFC files. The upload flow for proposals should accept IFC and validate it (schema, georeferencing, size).
- Tier 1 (CityJSON → 3D Tiles) is probably the **highest-value next data source**. There is already a `test.city.json` in the repo.

## Example data: central Luleå

The dev setup shows central Luleå in SWEREF 99 TM (EPSG:3006). It uses tier 0 building bodies (LoD1 extrusions) from free sources. Run `scripts/fetch_lulea_buildings.py` to regenerate `web/public/data/lulea/*.geojson`.

| Layer | Source | Heights | Licence |
|---|---|---|---|
| Basemap | OpenStreetMap tiles (Web Mercator, reprojected by giro3d) | n/a | ODbL, © OSM contributors |
| **Terrain** | Luleå kommun's ground model `Markmodell` (ImageServer, 5 m grid, RH 2000, the whole municipality), streamed live as float32 GeoTIFF via `exportImage` (reprojected to EPSG:3006 by their server; the native tiles are LERC, which giro3d can't read) | Real (−2 to +310 m) | **No licence stated.** Consumed live only; nothing stored |
| Buildings (default) | [GlobalBuildingAtlas](https://github.com/zhu-xlab/GlobalBuildingAtlas) LoD1 via Source Cooperative | ML-estimated for every building | **CC BY-NC 4.0, non-commercial only** |
| Buildings (alt.) | OpenStreetMap via Overpass | `height` tag (~1.5%), `building:levels` × 3 m + 1 m (~43%), otherwise a per-type default (~55%) | ODbL |
| **3D buildings (default)** | Luleå kommun's 3D city model, `Alla_bef_byggnad_3D_20260630` (Esri I3S 1.9 mesh, textured, ~17 × 16 km around the centre, SWEREF 99 21 45 / RH 2000), streamed live by `viewer/entities/I3SEntity.ts` | Real (mesh) | **No licence stated.** Consumed live only; nothing stored |
| Building facts on click | Luleå kommun's map services (`kartor1.lulea.se/.../ext`): national building footprints with Lantmäteriet building id and purpose (79,852), address register (address, construction year; 4,681), heritage inventory (assessment, era, materials; 306 assessed). Queried at the clicked point, coded values decoded from the services' domains | n/a | **No licence stated.** Live only; staff signatures never requested |
| Detaljplaner in progress / in force, detaljplaneprogram | [Luleå kommun geodataportalen](https://geodataportalen-luleakommun.opendata.arcgis.com/) (ArcGIS feature services `GNG_detaljplaner_pagande`, `GNG_gallande_detaljplaner`, `GNG_detaljplaneprogram`), loaded live as GeoJSON in EPSG:3006 | n/a (flat areas, coloured by purpose / plan type / status) | CC BY 4.0, Luleå kommun |
| **Trees** | Luleå kommun's tree register `TRAD_Z_20260316` (I3S 1.6 point scene layer on kartportal.lulea.se; ~8,100 trees with ground and top height and, for about a third, Swedish/Latin species), streamed live by `features/trees/treeSources.ts`; plus OpenStreetMap `natural=tree` (`scripts/fetch_osm_trees.py` → `web/public/data/lulea/trees-osm.geojson`, ~4,800 trees, rarely with height or species) where Luleå has no tree within 4 m (adds ~3,100). Drawn as simple instanced trees (crown and trunk, cone for conifers), rooted on the rendered terrain | Luleå: surveyed (`hojd`); OSM: default by leaf type (broadleaf 9 m, conifer 12 m), shown as "estimated" | Luleå: **no licence stated**, live only. OSM: ODbL |
| Streets (noise sources) | OpenStreetMap drivable roads in central Luleå (`scripts/fetch_osm_roads.py` → `web/public/data/lulea/roads-osm.geojson`, ~4,200 ways with name, class and speed limit) | n/a | ODbL. Traffic volumes are not open data: defaults by road class, edited per street in the noise check |
| What's on (events) | [visitlulea.se/evenemang](https://visitlulea.se/evenemang/) (Visit Luleå, Luleå kommun): the JSON listing their own page uses (`/umbraco/api/eventsapi/filter`), read by our backend (`/api/events`) because it sends no CORS headers. One pin per venue; each event links to its page on visitlulea.se. Venues are placed from `code-with-quarkus/src/main/resources/events/venues.json` (coordinates from OpenStreetMap, by name or by the address visitlulea.se lists); unknown locations are listed but not pinned | n/a (pins on the terrain) | **No licence stated.** Only titles, dates, category and place are shown, and everything else is linked. The backend keeps the listing in memory for 10 minutes; nothing is stored |

What we looked at and why we didn't use it:
- **Lantmäteriet** buildings and orthophotos need an account or licence, and the building data is paid. Their open WMS endpoint returns 401 without credentials. `minkarta.lantmateriet.se` responds, but it's the backend of their own map app, not a documented API.
- **Luleå kommun** has no public 3D city model that we could find.
- **GBA is non-commercial.** Before any commercial use, switch to the OSM layer or to licensed Lantmäteriet/municipal data.

**Luleå's own data (3D model, terrain, building facts)** is consumed live from their public services and never stored or committed: no licence is published for it (unlike the open-data portal). Ask Luleå kommun before storing or redistributing it. The 3D mesh and the terrain both have absolute RH 2000 heights, so they line up without offsets. The mesh is shown **without its photo textures** by default (one plain shaded material; a "Photo textures" toggle under the layer brings them back); untextured mode makes no texture requests. **Caching:** Luleå's servers send `Cache-Control: public` (24 h for the 3D model, 12 h for terrain), so the browser's normal HTTP cache already serves repeat tiles from disk within that window; we add no cache of our own. A longer-lived browser cache or a shared server-side cache would mean storing their unlicensed data, so it needs Luleå's permission first. The national building id from the facts look-up becomes the comment target for mesh buildings.

Plan layers are loaded **live** from the municipality, so stages such as "Samråd pågår" stay current. Comments on plans are keyed by case number (`ARENDENR`) or plan number (`PLANNUMMER`), not ArcGIS `OBJECTID`, which can change when the service is republished. For lineage (GOV-5) we will eventually need to snapshot the plan record that a comment or decision refers to.

The example IFC has no georeferencing. It's placed manually through the layer's `origin` field, so the placement is stored as data. An origin without a height stands on the terrain.

**Everything sits on the terrain.** Flat areas (plans, plan boundaries) are painted onto the terrain as map layers (giro3d `ColorLayer` + `VectorSource`), so they follow the ground exactly and can't z-fight with it; they're picked by looking up the polygon under the clicked ground point. Extruded LoD1 bodies and plan envelopes are a `DrapedFeatureCollection`, each body lifted to the terrain height at its centre. The plan editor's drawing and sketch lines follow the terrain too. Entities whose bounding volumes are loose (the terrain map, the I3S mesh, draped bodies) report a near-plane bound below their highest point (`viewer/entities/nearBound.ts`); without it the near plane collapses to 0.5 m and surfaces flicker.

## Two paths for rendering IFC

### A. Pre-converted 3D Tiles (default)

`IFC (DVC) → pipeline (py3dtiles) → 3D Tiles in RustFS → backend /tiles → giro3d Tiles3D`

This path already exists (`dvc.yaml`, `.forgejo/workflows/ifc-3d-tiles.yaml`).
- ✅ Streams, has LOD, works for large files, and does the heavy work once.
- ✅ Output is versioned per dataset version, which fits the lineage requirement.
- ⚠️ The conversion must keep the **element `GlobalId` and IFC class** in the tile's feature metadata (batch table / `EXT_structural_metadata`). Otherwise picking cannot resolve to an IFC element. We need to verify what py3dtiles outputs.
- ⚠️ The conversion must apply **georeferencing** (`IfcMapConversion` / `IfcProjectedCRS` in IFC4, or the site lat/long + true north in IFC2x3). We also need to check how py3dtiles handles this. A model without georeferencing needs a manual placement step in the UI, which is then stored as data.

### B. In-browser web-ifc (ad-hoc preview)

The current `IfcEntity` already does this, and it works. Use it for:
- previewing an uploaded proposal **before** it goes through the pipeline
- small models

Improvements needed:
- Parse in a **Web Worker** and transfer geometry buffers back. Parsing currently blocks the UI.
- Merge meshes per material (or use `BatchedMesh`). Today it creates one `Mesh` per placed geometry, so draw calls grow with the element count.
- Store `expressID`/`GlobalId` per element so picking can show properties (`GetLine`, property sets).
- Read georeferencing and place the model in the scene CRS. Today it is placed at the origin with only a Y-up→Z-up rotation.
- `web-ifc` is pinned at `0.0.44`. Check whether a newer version is compatible.

### Alternative considered: That Open Engine (`@thatopen/components` / Fragments)

It has a stronger IFC feature set (fragments format, property queries, clipping). However, it brings its own scene/world abstraction that competes with giro3d's `Instance`. We could revisit it if we need BIM-heavy features (clipping planes, storey isolation, property search) that would be costly to build ourselves. Their Fragments format could also be used just as a conversion target.

## Open questions

- Does py3dtiles preserve `GlobalId` + class in the output metadata? If not: use a custom IfcOpenShell → glTF (with `EXT_mesh_features`) step, or a different converter.
- Should the pipeline also produce a property index (`GlobalId → psets` JSON/DB), so the frontend never needs the IFC file for the info panel?
- Which scene CRS and height system should we use? EPSG:3006 + RH 2000 is the likely answer.
- Which city model source should we use for tier 1 in the pilot area?
