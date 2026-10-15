# 05: Planning evidence: from observation to plan provision

What the platform must record so that planning can be done for real buildings, derived from actual Luleå planning documents. This expands capability **C3 (knowledge base)**, **C2 (plan content)** and **C7 (decisions)** in [04](04-capabilities-and-planning-process.md), and serves **KNO-1, KNO-2, GOV-1, GOV-5** in [00](00-participation-design-framework.md).

## Material studied

| Plan | Case | Stage (Oct 2026) | What the municipality publishes |
|---|---|---|---|
| [Bilen 23](https://www.lulea.se/detaljplan-bilen23) (car wash, remove prickmark) | KLF2026-206 | Early stage | Purpose, area map, contacts. **No documents** |
| [Hägern 14](https://www.lulea.se/detaljplan-hagern) (preschool expansion) | KLF 2024/1784 | Paused (vilande) | Decision (SBU 2024-11-18 § 102), ÖP compliance, purpose. **No documents** |
| [Hajen 7](https://www.lulea.se/detaljplan-hajen7) (grocery store) | KLF2024/1853 | Preparing samråd (planned autumn 2026) | Purpose, applicant, timeline. **No documents** |
| [Bävern 1](https://www.lulea.se/detaljplan-bavern) (housing/centre) | KLF 2023/1274 | Preparing samråd | Purpose, land allocation competition. **No documents** |
| [Mjölkuddens centrum](https://www.lulea.se/detaljplan-mjolkuddenscentrum) | KLF2023-1163 | Granskning done, before adoption | Full sets **per stage**: plan map, planbeskrivning, samrådsredogörelse, plus 6–7 investigations per stage |
| [Mjölkudden 3:13](https://www.lulea.se/detaljplan-mjolkudden3-13) | KLF2023/1747 | Adopted 2026-02-09, **appealed** | Documents per stage, one investigation (skyfall) |
| Katten 6 (planbeskrivning PDF in `data/example-planning-data/`) | KLF2023/1459 | Antagandehandling 2026-01-20 | 61-page planbeskrivning with 10 investigations from two stages |

## Five findings

1. **Early stages are a black box.** Four of six plans publish nothing but a purpose and a map. Yet this is exactly when citizens' input matters most (thesis: Phase 1–2, see [00](00-participation-design-framework.md) §2). Much of what an early stage needs to show already exists in national and municipal data (see §4). The platform can assemble it automatically.
2. **Investigations are versioned by stage.** Katten 6 has a *PM Dagvattenhantering* from 2023-04-18 (samråd) and another from 2024-06-28 (granskning). Mjölkudden lists the same noise study under both stages. "Which version was the decision based on?" is a real question.
3. **Every binding provision is justified, and the justification often points to an investigation.** In Katten 6, *B1: housing only from floor 7* exists *because* the noise study found 63 dBA (above the 60 dBA guideline) on floors 1–6, and because of the daylight study. That is the observation → provision chain, and Boverket requires the justification to be stored digitally.
4. **Many findings don't become provisions but obligations for later.** These include a geotechnical survey before design, radon measurement before construction, leaching tests for excavated soil, a §28 notification before groundwork, and a possible water-activity permit (vattenverksamhet). They are promises the plan passes on to the building stage and are easily lost.
5. **The open data drifts from reality.** The ArcGIS layer says Mjölkudden 3:13 is in "Granskning pågår", but it was adopted on 2026-02-09 and is under appeal. It also says Katten 6 is in "Samråd pågår", while its planbeskrivning is the adoption version (2026-01-20). Our viewer currently outlines it as "open for comments now", which is **wrong**. A platform that *runs* the process (C1) would make the stage authoritative instead of copied.

## The evidence chain

```
Observation          Dataset              Investigation            Finding                     Consequence
(raw, located)  ──▶  (processed, typed) ──▶ (report, author, ──▶  (assessed against a  ──▶  ├─ Plan provision + motive (binding)
 soil sample 24AF005  lab results table     stage, version)        norm/threshold)            ├─ Recommendation (non-binding)
 groundwater pipe     noise grid per        "Trafikbullerutr.,     "63 dBA at floors 1–6,     ├─ Obligation for a later stage
 rain simulation      façade/floor          Tyréns 2023-10-05"     > 60 dBA, SFS 2015:216"    └─ No action (assessed acceptable)
 citizen photo         ...                                          ...                         ...
```

Each arrow is a link the platform stores (`derivedFrom`, `assesses`, `motivates`, `defersTo`). This is the lineage that answers "why may they build 15 floors here?", "what is this based on?" and "what's still unresolved?".

### Worked example: Katten 6 (KLF2023/1459)

| Topic | Investigation (author, date, stage) | Observations / data | Finding (vs. norm) | Consequence in the plan |
|---|---|---|---|---|
| Traffic noise | Trafikbullerutredning (Tyréns, 2023-10-05, samråd) | Calculated Leq/Lmax per façade and floor; roof terrace grid | Up to 63 dBA Leq at floors 1–6 facing Skeppsbrogatan; guideline 60 dBA (SFS 2015:216). Reflections add ≤ 1 dBA to neighbours | **Provision B1**: housing only from floor 7 and up |
| Daylight | Dagsljusberäkning (Clarholm, 2023-10-02, samråd) | VSC per façade (Autodesk Forma) | Lower floors don't reach daylight guidelines | **Provision B1** (same motive) |
| Shadow | PM Skuggstudie (Tengbom, 2023-11-21, samråd) | Shadow at equinox, midsummer, Christmas, 08/12/16 | Some shadow on streets/properties to the north; not significant | Consequence assessed, no provision |
| Stormwater | PM Dagvattenhantering (Afry, 2023-04-18 samråd; **2024-06-28** granskning) | 20-year rain, 10 min, climate factor 1.25 | Flow increases; retention needed to current flow; infiltration risky (contamination) | Recommendation: sealed pipe storage of **14.5 m³**, connection in Skeppsbrogatan with Lumire. Not regulated |
| Cloudburst (skyfall) | Within the PM above | Flow paths, enclosed low points; courtyard Katten 12 overflows at ~90 mm (≈ 100-year, 3 h, CF 1.25) | Situation unchanged; flow path between Katten 6 and 13 must remain | Recommendation (roof terrace design). Not regulated |
| Geotechnics | Geotekniskt utlåtande (Afry, 2023-11-14, samråd) | Earlier surveys in the neighbouring block; levels +6.5 to +8.5 (RH2000); silt layer at ~20 m; not in the SGI landslide area | Basement foundation likely feasible, but loads are unknown | **Obligation**: overview geotechnical survey later |
| Soil contamination | Markmiljöutlåtande (Afry, 2023-11-13); Miljöteknisk undersökning (Afry, 2024-06-28) | 13 soil samples (e.g. 24AF005 at 2–2.5 m: Ba, Cu, Zn > MKM), groundwater pipe at 8 m, pore gas; dry-cleaner sites in the EBH map; 2012 survey | 1/13 > MKM, 2/13 > KM (metals, PAH-H, PFOS); groundwater mostly low | **Obligations**: classify soil as IFA, leaching test, sample construction-site water, §28 notification, duty to report contamination |
| Radon | None (SGU radon map 1987) | Local high-radon ground | Risk present | **Obligation**: radon measurement before construction (builder responsible under BBR) |
| Groundwater | None (old readings 1991; 2024 survey) | Groundwater at 4.8–7 m below ground | Draining it may need a permit (MB ch. 11) | **Obligation**: possible water-activity permit |
| Traffic, parking | Trafikutredning (RK Trafikkonsult, 2024-07-22); PM Parkering (Tengbom, 2023-11-21) | Delivery, construction logistics, street widths | No noticeable traffic increase; construction disruption | **Provision P1** (parking at levels +3.9 to +5.1 and down to −1.2, RH2000), **ö1**, exit ban; construction-time measures |
| National interest | Riksintresse totalförsvaret (Försvarsmakten) | Height limit zone | Max 45 m | **Provision h3**: max 45 m ridge height |
| Comprehensive plan | ÖP 2021 "tät struktur" (4–5 floors, max 10–12) + planprogram 2011 § 227 | n/a | Deviation (15 floors) justified by the programme and the densification strategy | Motive for **h3** |
| Flooding (sea/river) | National safe levels (+2.5 / +3.0 m RH2000) | Ground +6.5 to +8.5 | Not at risk | No action |

Note how **3D** the result is: P1 is bounded by elevations, h1/h2/h3 are height envelopes, f5–f7 set cantilevers with minimum clearances, and noise varies per floor. This is where BIM-GIS earns its place (FID-4): the provisions can be shown as volumes in the viewer and checked against a proposed building.

## Investigation catalogue

These are the types seen across the six plans and Katten 6. Each becomes an `InvestigationType` with typical inputs, the norms it assesses against, and the provisions it usually motivates.

| Type (sv) | Typical raw observations / data | Typical norms / references | Typical consequence |
|---|---|---|---|
| Bullerutredning (traffic/industry noise) | Traffic counts, calculated Leq/Lmax per façade/floor, grids | SFS 2015:216; Naturvårdsverket NFS 2004:15 (construction) | Use restricted by floor, façade/layout requirements, screens |
| Dagvattenutredning / PM dagvatten (stormwater) | Catchments, runoff coefficients, design rain, pipe capacity | Municipal stormwater plan, P110, climate factor | Retention volume, sealed vs. infiltrating systems, connection points |
| Skyfallsutredning (cloudburst) | Terrain model, flow paths, low points, rain simulations | 100-year rain, climate factor | Keep flow paths free, ground levels, building placement |
| Geoteknik (geotechnics) | Boreholes, soil layers, groundwater levels, SGI landslide/erosion maps | Eurocode, SGI guidance | Foundation feasibility, *survey later*, prohibited areas |
| Miljöteknisk undersökning / markmiljö (contamination) | Soil/groundwater/pore-gas samples with depth and lab values; EBH sites | Naturvårdsverket KM/MKM, SGU/SPI/SGI guidelines | Remediation, waste classification, obligations, notifications |
| Radon | SGU radon map, measurements | BBR limits | Obligation before construction |
| Dagsljus / skuggstudie (daylight/shadow) | 3D model, sun positions, VSC | Boverket, BBR | Use by floor, heights, placement |
| Trafikutredning / PM parkering | Counts, trip generation, parking norm | Municipal parking norm | Exits, parking provisions, logistics |
| Fördjupad riskanalys (hazmat routes, rail) | Distances, transported goods, probabilities | Länsstyrelsen guidance, RIKTSAM | Distances, building restrictions |
| Kulturmiljö / bebyggelseinventering (heritage) | Building inventory, sight lines | KML, PBL 8:13 | q/k provisions, sight-line analysis |
| Kvalitetsprogram / gestaltning (design quality) | Sketches, references | Policy för gestaltad livsmiljö | Design provisions f1–f8 |
| Undersökning av betydande miljöpåverkan (EIA screening) | Checklist of impacts | MB ch. 6 | Need for a strategic environmental assessment or not |
| Planprogram / ÖP alignment | Earlier decisions | ÖP, programme | Motive for deviations |
| **Local knowledge (citizens)** | Photos, place observations ("water pools here", "unsafe crossing") | n/a | Input to the investigations above; recorded as observations with provenance |

The last row closes the loop with the thesis: citizen contributions (KNO-3) are **observations** in the same chain, not a separate opinion box. A resident's photo of a flooded courtyard is evidence for the skyfall study.

## What the platform must record

*Now specified field by field, with Lantmäteriet Detaljplan 4.1 mappings and UI annotations, in [spec/planning-data.yaml](../../spec/planning-data.yaml) (see [spec/README.md](../../spec/README.md)). The table below is the summary.*

| Entity | Must record | Why |
|---|---|---|
| `Plan` | Case number (ärendenummer, the stable ID), name, purpose, area (geometry), applicant/landowners, procedure (standard/utökat), ÖP compliance, current stage | Identity; early-stage transparency (finding 1) |
| `StageEvent` | Stage (start → förstudie → samråd → granskning → antagande → överklagad → laga kraft / vilande / avbruten), dates, deciding body, protokoll § | The authoritative stage (finding 5); "open for comments now" must come from here |
| `Document` | Title, type (plankarta, planbeskrivning, samrådsredogörelse, granskningsutlåtande, …), stage, version, file, date, `supersedes` | Per-stage document sets (finding 2) |
| `Investigation` | Type (catalogue), author/consultant, date, stage, version, `supersedes`, scope geometry, report document | Versioned evidence (finding 2) |
| `Observation` | Location (point/area, **with depth/elevation**), time, method, value(s) with unit, source (consultant, national dataset, citizen), licence | Raw data, reusable across plans (the same borehole serves the neighbouring block) |
| `Dataset` | Derived grids/tables (noise per façade-floor, flow paths), method, inputs (`derivedFrom` observations), CRS incl. height system | Machine-readable results, not just PDFs |
| `Norm` | Reference (SFS 2015:216, NV KM/MKM, …), threshold values, valid period | Findings are only meaningful against a versioned norm |
| `Finding` | Statement, compared value vs. norm threshold, assessment (ok / exceeds / unknown), `basedOn` investigation(s) | The interpretation step, explicit and challengeable |
| `Provision` (planbestämmelse) | Code (B1, h3, P1, f5, …) per Boverket's catalogue, text, geometry **in 3D** where relevant (levels, heights), `motive` text, `motivatedBy` findings/decisions | Legally required digital motive; 3D envelopes for the viewer |
| `Obligation` | What, who (builder/landowner/municipality), when (before design / permit / construction), `arisesFrom` finding, status | Deferred work (finding 4) shouldn't vanish at adoption |
| `Contribution` (exists: comments) | Also typed as an *observation* when it reports facts about a place | Citizens as evidence providers (KNO-3) |

Standards to follow rather than invent:
- **Boverket's digital detaljplan**: provision catalogue and data format (BFS 2020:5, and planbeskrivning per BFS 2020:6, as cited in the Katten 6 planbeskrivning). Verify current versions, and the national detaljplan specification (Lantmäteriet/Boverket), before modelling `Provision`.
- **National raw-data sources** (open or licensed): SGU (soil types, radon, groundwater), SGI (landslide/erosion), Länsstyrelsen EBH (potentially contaminated sites), MSB/municipal flood levels, Försvarsmakten height zones (riksintresse), Riksantikvarieverket (heritage). Several can feed an automatic "known conditions" panel for early-stage plans (finding 1).

## Implications for what we build

1. **Make the stage authoritative (urgent, small).** Stop trusting ArcGIS `SKEDE` for "open for comments now". Until C1 exists, show the source and the data date, and label it "according to Luleå's open data".
2. **"Known conditions" panel for early-stage plans (Phase 1–2).** For a plan area, show automatically what national/municipal data says (landslide risk, radon, contamination, flood level, national interests), in plain language. That gives citizens something to react to before any documents exist.
3. **Evidence model in the backend:** the entities above, starting with `Plan`, `StageEvent`, `Document`, `Investigation`, `Finding`, `Provision`, `Obligation`. Seed it by hand with **Katten 6** (the table above) as the reference case.
4. **3D provisions in the viewer:** height envelopes (h1/h2/h3) and level-bounded uses (P1) as transparent volumes; noise per floor as façade colouring. Check a proposed IFC/LoD model against them.
5. **Comments can become observations:** a "this is a fact about the place" option on contributions, so local knowledge enters the chain with provenance.
6. **AI-assisted extraction (KNO-7)** from PDFs into the entities above (provisions and motives, investigation lists, findings with values), always reviewed by an official. The Katten 6 extraction above was done this way, by reading the PDF.

## Open questions

- Will Luleå deliver digital detaljplaner (per Boverket) for new plans, so `Provision` can be imported rather than extracted?
- Who owns consultant data (lab results, noise grids)? Usually it is only published as PDFs, which makes reuse a data-governance question (GOV-3).
- Retention: are observations and investigations allmänna handlingar once received by the municipality? Most likely yes, which affects storage and export.
