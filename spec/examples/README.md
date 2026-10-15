# Katten 6 as a Lantmäteriet Detaljplan 4.1 delivery

| File | What it is |
|---|---|
| [`katten-6.yaml`](katten-6.yaml) | **Input.** Katten 6 (Luleå, KLF2023/1459) entered in our model ([../planning-data.yaml](../planning-data.yaml)) from its planbeskrivning (antagandehandling 2026-01-20) |
| [`katten-6.lm-detaljplan-4.1.json`](katten-6.lm-detaljplan-4.1.json) | **Output.** The same plan as a Lantmäteriet Detaljplan 4.1 FeatureCollection (`application/vnd.lm.detaljplan.v4+json`): 1 `detaljplan` + 13 `planbestammelse` features. **Valid** against the schema |
| [`boverket-catalogue-extract.json`](boverket-catalogue-extract.json) | The 11 entries of Boverket's planbestämmelsekatalog (release 20251201) that the provisions reference |

Regenerate and validate:

```sh
pip install -r scripts/requirements-data.txt
python scripts/validate_spec.py                          # input matches our spec
python scripts/export_lm.py spec/examples/katten-6.yaml  # writes the output and validates it
```

Validation uses the local copies in [docs/inspo/lantmateriet/](../../docs/inspo/lantmateriet/README.md) (Detaljplan 4.1 + Geometri 2.0, Geometrimetadata 2.0.1, GeoJSON 1.1), so it works offline. Seven deliberately broken variants (bad status, missing purpose, wrong CRS, non-uuid catalogue reference, bad unit, unknown material type, bad date) are all rejected, so "valid" means something.

## Corrections after reading Lantmäteriet's vägledning

The first version of this export broke several rules that the national platform enforces:
- `kommun` is the municipality **name** ("Luleå"), not the code 2580 (vägledning 2.1.1).
- `genomforandetid` is in **months** (120), not years (2.3.10).
- One `yta` per polygon: `multiyta` stops the delivery (3.2.1, DP-0004).
- Geometry metadata (positioning method and time) is required for plans started after 2021-12-31 (DP-0010).
- Wording must equal the catalogue template with variables filled in (DP-0022). So B1 is just "Bostäder" ("from floor 7" is a vertical bound on the geometry), P1 is just "Parkering" (its levels make it a `kropp`), and f5 keeps only its one text variable.
- `vertikalAvgransning: uppåt` means "does not apply above the geometry's height". It's now only exported together with a height.
- No `datumStatusforandring` on a first delivery (2.1.6).

`scripts/export_lm.py` now also checks DP-0009 and DP-0022 against the catalogue.

## How our model maps

| Lantmäteriet | From our model |
|---|---|
| `detaljplan.objektidentitet` | `Plan.id` → uuid5 (stable across versions) |
| `kommun`, `namn`, `syfte`, `status`, `typ` | `Plan.municipality` (2580), `name`, `purpose`, `status`, `planType` |
| `plangeometri` | `Plan.area`, the real boundary from Luleå's open data, as `multiyta` in EPSG:3006 |
| `beslutsinformation` | `caseNumber`, `implementationYears` (10), `previousPlans` (A068, 1965), the provision ids |
| `planbeskrivning` | The latest `Document` of type planbeskrivning |
| `planeringsunderlag` | Every delivered (not superseded) `Investigation` + the planprogram, with LM `underlagstyp` |
| `planbestammelse.planbestammelsekatalogreferens` | `Provision.catalogueRef`: **real Boverket catalogue uuids** |
| `bestammelseformulering`, `bestammelsevarde` | `Provision.wording`, `values` (typed like the catalogue's `[höjd:decimaltal]`) |
| `planbestammelsebeskrivning.motiv` | `Provision.motive`, taken from the planbeskrivning's "Motiv till regleringar" |
| `reglerarAnvandningsbestammelse` | `Provision.regulates` (the block's property provisions regulate B1 and C) |
| `bestammelsegeometri` | `Provision.geometry`: one `yta` per polygon, one `linje` per line (the exit ban) |

## What is real and what isn't

**Real:** name, purpose, case number, previous plan, implementation time, investigations (titles, authors, dates), provision wordings, values and motives, catalogue references, and **the plan boundary and every provision's geometry**: digitised from the plan map (Plankarta [G], granskningshandling 2025-10-21) by `scripts/digitise_plankarta.py`. The use areas (GATA, (P), CB1) partition the plan area exactly; the property areas follow the egenskapsgränser (h1 along Skomakargatan, h3 and h2, ö1 g1 along Kattgränd); the exit ban is a line. Declared in the delivery as `digitaliseringsniva: komplett`, `anvandbarhet: medel`.

**Approximated or missing:**
- **Positional accuracy** about a metre: digitised from a PDF and georeferenced with the sheet's published extent (it lies within 0.3 m of the plan boundary in Luleå's open data, 4.9 m at one corner). The adopted plan map may differ from the granskning version.
- **Adoption date and body.** The planbeskrivning is the document *for* adoption, so `datumAntagande` and `instansInomKommunen` are omitted. The status date is the document date.
- **Positioning method:** `okänd` (unknown).
- **Document references** use `urn:bimgis:dokument` + uuid instead of real URLs, since we don't host the documents.
- **Wording vs the plan map:** the map writes "Högsta nockhöjd är 22 meter" without a full stop; LM's rule DP-0022 wants the catalogue template's wording ("… meter."). f4 and f7 use the free-text template for design ("[byggnadsverks form:text]"), s1 "Byggnadens [delar:text] får endast [användning:text]".

**Our interpretation, to be confirmed by a planner or Lantmäteriet's vägledning:**
- Matching f/p/ö codes to catalogue entries (e.g. f1 → "[byggnadsverks form:text]").
- **B1** "housing from floor 7": the catalogue has no floor-based use restriction, so it's a `B` surface at floor 7's height with `vertikalAvgransning: nedåt` (doesn't apply below it). Floor 7's RH 2000 height isn't in the documents, so the bound isn't exported yet.
- **P1** levels: the map bounds it from −1.2 m up to between +3.9 and +5.1 m (RH 2000), a solid whose top follows the street; recorded as levels, exported in 2D.

## What Lantmäteriet's format can't carry

The delivery is the **legal end product**. Most of what our model records has no place in it:

| In our model | In the LM delivery |
|---|---|
| Findings (63 dBA vs 60 dBA guideline) and their links to provisions (`motivatedBy`) | Only the motive *text* |
| Observations, datasets, norms | Nothing |
| Obligations (geotechnical survey, radon, soil handling) | Nothing; they must live in our platform (or the building-permit process) |
| Stage history and superseded investigation versions | Only via the separate **history object** in the update API (see `export.history` in the spec) |
| Contributions and responses | Nothing (samrådsredogörelse/granskningsutlåtande are documents) |

So the platform is the **system of record for the process and the evidence**, and the LM delivery is one output of it.

## In the viewer

The web app reads `katten-6.lm-detaljplan-4.1.json` directly (Vite asset import from `spec/examples/`, so there's no copy) through `web/src/features/plans/lmDetaljplan.ts`. It shows:
- the plan area, coloured by LM `status`, and the highest allowed building (max `höjd` among the provisions, 45 m) as a translucent 3D volume;
- a plan panel: status, case number, the data-quality warning from `kvalitetsbeskrivning`, purpose, provisions with values and motives ("Why?"), planning material, implementation time;
- comments on the whole plan or on a single provision, keyed by LM `objektidentitet` and shared across both layers (`commentScope: lm-detaljplan`).

