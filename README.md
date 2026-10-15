# bimgis

A smart-city participation platform for Luleå: a 3D city (terrain, buildings, trees, BIM models)
combined with detailed plans, planning tools and citizen participation. It has two views:

- **Discover Luleå**: open to everyone. Explore buildings and their history, trees and what's on, and measure things.
- **Have your say**: for signed-in citizens. See and comment on plans, check them (flood, noise), and let officials draft plans in Lantmäteriet's Detaljplan 4.1 format.

The design is driven by a thesis on participation; start with [docs/README.md](docs/README.md).

## Layout

| Path | What |
|---|---|
| `web/` | Frontend: Vue 3, Pinia, giro3d (three.js), TypeScript |
| `code-with-quarkus/` | Backend: Quarkus (comments, plans, events proxy), Postgres via Dev Services |
| `infra/keycloak/` | Local identity provider (OIDC) with a dev realm and test users |
| `spec/` | Data specification for planning data, with a worked example (Katten 6) and its Lantmäteriet export |
| `scripts/` | Data scripts: OSM extracts, plan export and validation, plan-map digitising, IFC generation |
| `docs/` | Design notes, decisions (ADRs) and assessments |
| `bimgis-dagster/`, `pycde/`, `dvc.yaml` | Earlier data pipeline experiments (IFC → 3D Tiles) |

## Running it locally

```sh
# identity (Keycloak on :8180, dev users alice / olle / mona, password "dev")
docker compose -f infra/keycloak/docker-compose.yaml up -d

# backend (:8080; starts Postgres in Docker)
cd code-with-quarkus && ./mvnw quarkus:dev

# frontend (:5173)
cd web && npm install && npm run dev
```

Object-storage credentials (for the tile pipeline) go in a gitignored `.env`; see [.env.example](.env.example).

## Data

- `data/` stays local and is not in git: source models, plan documents and scratch files.
- Data in `web/public/data/` comes from OpenStreetMap (© OpenStreetMap contributors, ODbL), GlobalBuildingAtlas (CC BY-NC 4.0) and Boverket (open data).
- Luleå kommun's own map and 3D services state no licence. They are only read live in the browser, never stored or redistributed. Their open-data portal (CC BY 4.0) is used for plans.

See [docs/design/03-3d-data-and-ifc.md](docs/design/03-3d-data-and-ifc.md) for every source.
