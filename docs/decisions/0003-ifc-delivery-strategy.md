# 0003: IFC is delivered as pre-converted 3D Tiles; web-ifc only for previews

- **Status:** proposed
- **Date:** 2026-10-12

## Context
IFC files can be hundreds of MB. Parsing them in the browser is slow and blocks the UI. A DVC + py3dtiles pipeline already converts IFC to 3D Tiles in RustFS. Uploaded proposals still need a quick preview before the pipeline has run.

## Decision
- Default: IFC is converted by the pipeline into versioned 3D Tiles and loaded with giro3d `Tiles3D`.
- Previews: the in-browser `IfcEntity` (web-ifc, in a worker) is used only for uploads that have not yet been processed and for small files.
- Element identity (`GlobalId`, IFC class) must survive conversion so picking and comments work the same on both paths.

## Consequences
- We need to verify or extend the converter for metadata and georeferencing. This is an open question in [design/03](../design/03-3d-data-and-ifc.md).
- The frontend needs one "feature info" abstraction that works for both tiles and raw IFC picks.
