# 02: Frontend architecture

## Stack

- **Vue 3** (Composition API, `<script setup lang="ts">`)
- **Pinia** for application state
- **Vue Router** for URL routes. The URL also encodes the viewpoint (see below)
- **TypeScript**, with `strict: true` turned on from the start of the rewrite
- **Vite**
- **giro3d** (on three.js) for the map/3D view. See [ADR 0002](../decisions/0002-giro3d-as-renderer.md)
- **web-ifc** only for ad-hoc in-browser IFC, running in a Web Worker. See [03](03-3d-data-and-ifc.md)
- UI component library: **TBD**. Candidates: PrimeVue, Vuetify, Naive UI. Pick one with good a11y and data tables.

## The key rule: the scene is not reactive state

giro3d/three.js objects (Instance, entities, meshes, materials) must **never** be put into Pinia state or `ref()`/`reactive()`. Vue's deep proxies break three.js identity checks and make performance terrible.

Instead:

```
 Pinia stores (plain, serialisable data)            Viewer service (imperative, owns giro3d)
 ─────────────────────────────────────             ──────────────────────────────────────────
 layers:     [{id, kind, url, visible, opacity}] ─▶ diff → instance.add/remove, layer.visible=…
 selection:  {featureId, source}                  ─▶ highlight material, fly-to
 viewpoint:  {camera, target, layers, selection}  ◀▶ read/write camera
                                                  ◀─ pick events → selectionStore.select(id)
```

- **Stores hold descriptors and IDs**, never three objects. A selection is `{ source: 'ifc:DigitalHub_FM-ARC_v2', featureId: '<IfcGlobalId>' }`, not a `Mesh`.
- **One viewer service** (`viewer/ViewerService.ts`) owns the `Instance`. It is created in `onMounted` of `ViewerCanvas.vue`, held with `markRaw`/`shallowRef`, and provided through `provide/inject` or a small `useViewer()` composable.
- The service **subscribes to stores** (`store.$subscribe` / `watch`) and applies the differences to the scene. Scene events (picks, camera moves) call **store actions**. Data flows in one direction each way, so there is no two-way binding of three objects.
- Disposal is explicit. When an entity is removed, call `instance.remove()` + `dispose()`. When the component unmounts, `instance.dispose()`.

## Proposed folder structure

The frontend moves from the repo root into its own folder, so the root stops being a mix of Python, Java and JS.

```
web/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  public/
    wasm/                  # web-ifc wasm (copied at build)
  src/
    main.ts                # createApp, pinia, router
    App.vue
    app/
      router.ts
      layouts/             # shell: header, side panels, viewer slot
    viewer/                # everything that touches giro3d/three.js
      ViewerCanvas.vue     # the only component that mounts the canvas
      ViewerService.ts     # owns Instance; syncs stores ↔ scene
      useViewer.ts         # inject/provide helper
      crs.ts               # CRS registration (EPSG:3006 etc.)
      camera.ts            # controls, fly-to, viewpoint (de)serialisation
      picking.ts
      entities/
        IfcEntity.ts       # in-browser IFC entity (worker-backed)
      workers/
        ifc.worker.ts
    features/              # vertical slices; each owns its store + components
      layers/
        layersStore.ts
        LayerPanel.vue
      selection/
        selectionStore.ts
        FeatureInfoPanel.vue
      viewpoint/
        viewpointStore.ts  # sync with URL query
      participation/       # comments/BCF topics, anchored to viewpoints
      processes/           # cases, steps, decisions, lineage view
      scenarios/
    api/
      generated/           # OpenAPI-generated clients (BCF etc.), never hand-edited
      client.ts            # fetch wrapper: base URL, auth, errors
    shared/
      components/
      composables/
      utils/
```

Conventions:
- **Feature folders own their Pinia store.** Use setup-style stores (`defineStore('layers', () => {…})`). A feature may import another feature's store, but must not reach into its components.
- Only `viewer/` imports from `three` or `@giro3d/giro3d`. Features talk to the scene through store actions or the `useViewer()` API.
- Generated API code goes in `api/generated/` and is regenerated from the OpenAPI specs in the backend folders.

## Two views: Discover and Have your say

The app has two views over one 3D city (`app/modes.ts`, routes `/discover` and `/participate`):

| | Discover Luleå | Have your say |
|---|---|---|
| Who | Everyone | Signed-in citizens (and officials); others see a sign-in card over the map |
| Layers | 3D buildings, trees, what's on | Plans (in progress, in force, programmes, saved, Katten 6), IFC, plus buildings and trees |
| Panels | Explore intro, layers, details (facts, species, events) | Saved plans, layers, details with comments, plan editor |
| Tools | – | Flood check, noise check |

- **One viewer, never remounted.** Both routes are children of `MainLayout`, so switching keeps the camera and everything loaded. Layers carry `modes`; layers outside the current view stay loaded but hidden (`layersStore.scene`), so switching is instant.
- **Selection carries over** when the object exists in both views. A building or tree selected while exploring gets a *Have your say about this* link that opens the other view with it still selected.
- **Leaving a view ends what belongs to it**: running flood or noise checks and drawing are stopped; a plan draft is kept.
- Each view has an accent colour (teal, indigo) on the top bar and switch, so it's always clear which one you're in.
- Access is checked in the UI only (role from the token). The backend enforces what matters: posting comments needs `citizen`, plans need `official`.

## Viewpoints and URLs

The viewpoint (camera position/target, visible layers, selected feature, active scenario) is serialised into the URL query. This gives us:
- shareable links ("look at this building")
- the payload for a BCF viewpoint when a user comments
- a reproducible context stored with every contribution (see [01](01-vision-and-domain.md))

Keep the format small and versioned (`?v=1&cam=…&sel=…`).

## Other considerations

- **Coordinate system.** The scene CRS is **SWEREF 99 TM (EPSG:3006)**, with heights in RH 2000. Reproject data into it beforehand, as the data scripts do, or let giro3d reproject imagery on the fly.
- **COOP/COEP headers.** These are needed only for multithreaded web-ifc (`SharedArrayBuffer`). They also block cross-origin resources that lack CORS/CORP headers, such as some WMS servers. Default to single-threaded web-ifc and drop the headers unless we need multithreading.
- **Big files.** Never ship large IFC files through `public/`. Serve them from object storage (RustFS) via the backend.
- **Accessibility.** Every selection or comment action that can be done in 3D must also be possible from a list or search.
- **Testing.** Use Vitest for stores and utils, which is easy because they hold plain data. Use Playwright for a smoke test of the viewer.

## Cleanup status

The initial cleanup (2026-10-12) moved the root-level prototype into `web/`:

| Was | Now |
|---|---|
| `main.ts` (setup + picking + `innerHTML`) | `viewer/ViewerService.ts`, `camera.ts`, `crs.ts`, `picking.ts`; `features/layers`, `features/selection` (Vue templates, no `innerHTML`) |
| `index.html` → deleted `/main.js` | `web/index.html` → `src/main.ts` |
| `IfcEntity.ts` | `viewer/entities/IfcEntity.ts`. Reads the file once and stores `expressID`/`GlobalId`/class/name in `userData`. Now reports its distance range, so giro3d's near/far planes no longer clip the model away (this was why IFC never showed up) |
| `IfcEntityInspector.js` | `viewer/debug/` via `DevInspector.vue`, dev builds only |
| `/ifc/other/example.ifc` (wrong path) | Layer descriptor `/ifc/example.ifc` in `layersStore` |
| `vite.config.js`, COOP/COEP headers | `web/vite.config.ts`, single-threaded web-ifc, no isolation headers |
| `src/api/` | `web/src/api/generated/` (excluded from typecheck; Babel/superagent client, not used yet) |
| `tsconfig.json` `strict: false` | `strict: true` |

Still open:
- IFC parsing in a Web Worker, mesh batching, georeferencing ([03](03-3d-data-and-ifc.md))
- Viewpoint ↔ URL sync (`features/viewpoint`)
- Pick a UI component library
- Regenerate `api/generated` as a TypeScript client (e.g. `typescript-fetch`)
