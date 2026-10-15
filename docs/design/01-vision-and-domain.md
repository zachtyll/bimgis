# 01: Vision and domain

## Goal

*What the platform must do in order to enable participation is defined in [00: Participation design framework](00-participation-design-framework.md). This doc covers the domain those requirements live in.*

Build a smart city platform for **stakeholder engagement**. Citizens, officials, developers and other parties should be able to look at the city and at proposed changes, comment on them, take part in processes, and see how decisions were made.

## What a "smart city platform" actually is

Under the branding, it is three things:

1. **A spatial data platform.** It ingests, versions, serves and visualises geodata and building data: terrain, imagery, 2D vector data, 3D buildings, and IFC/BIM where it exists.
2. **A process engine (BPM-like).** Cases move through steps such as consultation → review → decision → appeal. Each step has roles, deadlines and required inputs.
3. **A record of participation and lineage.** Who said what, about which object, in which version of the data, during which process step. Which inputs fed into which decision.

Most of the product value is in (3). Points (1) and (2) are the infrastructure that makes (3) meaningful.

## Core domain concepts

| Concept | Meaning | Notes |
|---|---|---|
| **Feature / object** | Something in the city with a stable identity: a building, a parcel, a road, an IFC element | Needs a durable ID that survives re-imports (IFC `GlobalId`, cadastre ID, …) |
| **Dataset version** | A specific, immutable version of a dataset | DVC already versions IFC sources. Every rendered layer should know which version it is |
| **Scenario / proposal** | A set of changes on top of the baseline city ("what if this block is built") | Comments and decisions refer to a scenario, not "the map" |
| **Case / process instance** | One running workflow, e.g. a detailed development plan consultation | Holds state, deadlines, participants |
| **Contribution** | A comment, vote, upload, survey answer or objection | Always anchored to case + (optional) feature + viewpoint + dataset version |
| **Viewpoint** | A serialisable camera, visible layers, selection and clipping state | Modelled on BCF viewpoints so a comment can say "look at *this*" reproducibly |
| **Decision** | An outcome recorded at a process step | Links back to the contributions and data versions it considered |
| **Lineage event** | An append-only record of "X happened, caused by Y, using Z" | Think W3C PROV: entity / activity / agent |

## Design principles

- **Append-only by default.** Contributions and decisions are never edited in place. Corrections are new events. The UI may show "edited", but the history must remain.
- **Everything references a version.** A comment on a building only makes sense together with the model version the person was looking at.
- **Reproducible views.** Anything a user can point at, they can share as a link or viewpoint that restores the same view.
- **IFC is a bonus, not a requirement.** IFC models for ordinary houses are very hard to get. The platform must work well with LOD1/LOD2 city models, footprints + heights and point clouds, and get *better* when IFC exists. See [03-3d-data-and-ifc.md](03-3d-data-and-ifc.md).
- **Use open standards for the hard parts.** Use BCF for issues and viewpoints, OGC services (WMS/WMTS/3D Tiles/OGC API) for data, BPMN for processes, and CityGML/CityJSON (in Sweden, 3CIM) for city models.
- **Accessibility and plain language.** Citizens are the primary audience. The 3D viewer is an aid, not the only way to take part. Every feature must also be reachable through lists and text.

## Out of scope (for now)

- Authoring BIM. We consume models and never edit geometry.
- Real-time IoT dashboards. They could be added later as just another layer.
