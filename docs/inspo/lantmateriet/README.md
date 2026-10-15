# Lantmäteriet: national detaljplan specifications (local copies)

These are reference copies, not edited here. Source: [Nationella geodataplattformen, Detaljplan](https://www.lantmateriet.se/sv/nationella-geodataplattformen/datamangder/detaljplan/).

| File | What it is | Original |
|---|---|---|
| `schema2.json` | **Detaljplan 4.1**: the exchange format for a plan and its provisions (JSON Schema draft-04). Used by `scripts/validate_spec.py` | https://namespace.lantmateriet.se/distribution/geodatakatalog/detaljplan/v4/detaljplan-4.1.json |
| `schema1.json` | **Detaljplan Referens 2.2**: the slimmed-down objects returned by the search API (Sökning v1) | https://namespace.lantmateriet.se/distribution/geodatakatalog/sokning/v1/detaljplan/v2/detaljplan-ref-2.2.json |
| `geometri-2.0.json`, `geometrimetadata-2.0.1.json`, `geojson-1.1.json` | Schemas referenced by Detaljplan 4.1, fetched from namespace.lantmateriet.se so validation works offline (`scripts/export_lm.py`) | https://namespace.lantmateriet.se/distribution/geodatakatalog/geometri/ and …/produkter/geojson/v1.1/ |
| `api-1.2.yaml` | **Uppdateringstjänst 1.2** (OpenAPI): how a municipality delivers, validates and publishes plans | https://namespace.lantmateriet.se/distribution/geodatakatalog/uppdatering/v1/uppdatering-api-1.2.yaml |

How we use them: [spec/planning-data.yaml](../../../spec/planning-data.yaml) maps to Detaljplan 4.1 field by field (`lm:`), and its `export` section follows the update API.
