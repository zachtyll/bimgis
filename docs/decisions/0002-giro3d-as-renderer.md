# 0002: giro3d as the map/3D renderer

- **Status:** accepted
- **Date:** 2026-10-12

## Context
We need terrain, imagery (WMS/WMTS), vector data, 3D Tiles and point clouds in a projected CRS, all in one scene. The candidates were CesiumJS, giro3d, iTowns, and three.js plus our own code.

## Decision
Keep giro3d (already in use, v2). It is three.js-based, handles projected CRSs natively (no globe/ECEF needed for city-scale work), supports 3D Tiles, and is extensible with custom `Entity3D`s, as `IfcEntity` already shows.

## Consequences
- Direct access to three.js for custom rendering (highlighting, IFC).
- A smaller ecosystem than Cesium, so some features (e.g. advanced 3D Tiles styling) may need our own code.
- BIM-specific tooling (That Open) does not plug in directly. See [design/03](../design/03-3d-data-and-ifc.md).
