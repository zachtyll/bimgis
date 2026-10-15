"""Export a plan from our data model to Lantmäteriet Detaljplan 4.1 and validate it.

Reads spec/planning-data.yaml (for the LM enum mappings) and an example such as
spec/examples/katten-6.yaml, writes a FeatureCollection with media type
application/vnd.lm.detaljplan.v4+json, and validates it against the local copies of
Lantmäteriet's schemas in docs/inspo/lantmateriet/.

Usage:
  pip install -r scripts/requirements-data.txt
  python scripts/export_lm.py spec/examples/katten-6.yaml
"""

import json
import re
import sys
import uuid
from pathlib import Path

import yaml
from jsonschema import Draft4Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT4

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "spec" / "planning-data.yaml"
LM_DIR = ROOT / "docs" / "inspo" / "lantmateriet"
LM_NS = "http://namespace.lantmateriet.se/distribution"
LM_SCHEMAS = {
    f"{LM_NS}/geodatakatalog/detaljplan/v4/detaljplan-4.1.json": "schema2.json",
    f"{LM_NS}/geodatakatalog/geometri/geometri-2.0.json": "geometri-2.0.json",
    f"{LM_NS}/geodatakatalog/geometri/geometrimetadata-2.0.1.json": "geometrimetadata-2.0.1.json",
    f"{LM_NS}/produkter/geojson/v1.1/geojson-1.1.json": "geojson-1.1.json",
}
MEDIA_TYPE = "application/vnd.lm.detaljplan.v4+json"

# Stable uuids derived from our readable example ids, so the export is reproducible.
ID_NAMESPACE = uuid.UUID("6f1c2b1e-6a51-4d0e-9a51-6b696d676973")
DOC_NAMESPACE = "urn:bimgis:dokument"

# Quality, in LM's own fields: provisions without geometry of their own fall back to the plan
# boundary ("ej komplett"); when all have one, they are digitised from the plan map ("komplett"),
# with a positional uncertainty of about a metre (anvandbarhet "medel").
APPROX_QUALITY = {
    "digitaliseringsniva": "ej komplett",
    "beskrivningNiva": "Bestämmelser utan egen geometri har planområdets gräns.",
    "korrigeradeGranser": False,
    "kontrolleratPlaneringsunderlag": False,
}
DIGITISED_QUALITY = {
    "digitaliseringsniva": "komplett",
    "beskrivningNiva": "Bestämmelsernas geometrier är digitaliserade från plankartan och georefererade; lägesosäkerhet omkring en meter.",
    "korrigeradeGranser": False,
    "kontrolleratPlaneringsunderlag": False,
}
CATALOGUE = ROOT / "spec" / "examples" / "boverket-catalogue-extract.json"


def uid(key: str) -> str:
    return str(uuid.uuid5(ID_NAMESPACE, key))


def lm_value(spec, enum_name, value):
    """Map one of our enum values to its LM value (spec `lm:`), defaulting to the value itself."""
    for v in spec["enums"][enum_name]["values"]:
        if isinstance(v, dict) and v["value"] == value:
            return v.get("lm", value)
        if v == value:
            return value
    raise ValueError(f"{value!r} not in enum {enum_name}")


def geometries(geometry, positioned_at):
    """One `yta` per polygon or one `linje` per line: multi-geometries stop the delivery
    (vägledning 3.2.1, DP-0004). Geometry metadata is required for plans started after 2021-12-31
    (DP-0010); the example's positioning method is unknown, so `okänd`."""
    kind = geometry["type"]
    if kind in ("MultiPolygon", "Polygon"):
        parts = geometry["coordinates"] if kind == "MultiPolygon" else [geometry["coordinates"]]
        typ, position_type = "yta", "Polygon"
    elif kind in ("MultiLineString", "LineString"):
        parts = geometry["coordinates"] if kind == "MultiLineString" else [geometry["coordinates"]]
        typ, position_type = "linje", "LineString"
    else:
        raise ValueError(f"unsupported provision geometry {kind}")
    return [
        {
            "geometri": {
                "typ": typ,
                "koordinatsystemPlan": "EPSG:3006",
                "dimension": 2,
                "position": {"type": position_type, "coordinates": part},
            },
            "geometrimetadata": {
                "tidpunktForLagesbestamning": positioned_at,
                "lagesbestamningsmetodIPlan": {"typ": "okänd", "variant": "okänd"},
            },
        }
        for part in parts
    ]


def doc_ref(key, title, date, event):
    return {
        "namn": title,
        "datum": {"datum": str(date), "handelse": event},
        "referens": [{"namnrymd": DOC_NAMESPACE, "identitet": uid(key)}],
    }


def export(spec, data):
    plan = data["plan"]
    docs = {d["id"]: d for d in data.get("documents", [])}
    stages = sorted(data.get("stageEvents", []), key=lambda s: str(s["startDate"]))
    last_change = str(stages[-1]["startDate"]) if stages else None
    version_from = f"{last_change}T00:00:00Z"
    plan_uuid = uid(plan["id"])
    provisions = data.get("provisions", [])
    prov_uuid = {p["id"]: uid(p["id"]) for p in provisions}
    digitised = bool(provisions) and all(p["geometry"].get("coordinates") for p in provisions)

    # --- planeringsunderlag: current investigations + programme/ÖP documents -------------
    underlag = []
    for inv in data.get("investigations", []):
        if inv["status"] in ("superseded", "needed", "ordered"):
            continue  # superseded versions belong in the history object, not the current plan
        author = next((o["name"] for o in data.get("organisations", []) if o["id"] == inv.get("author")), None)
        title = f"{inv['title']}, {author}" if author else inv["title"]
        underlag.append({
            "huvudomrade": lm_value(spec, "PlanningMaterialArea", inv["area"]),
            "underlagstyp": lm_value(spec, "InvestigationType", inv["type"]),
            "underlag": doc_ref(inv.get("report", inv["id"]), title, inv["date"], "skapad"),
        })
    for d in docs.values():
        if d["documentType"] == "planprogram":
            underlag.append({
                "huvudomrade": "kommunala",
                "underlagstyp": "planprogram",
                "underlag": doc_ref(d["id"], d["title"], d["date"], "skapad"),
            })

    planbeskrivning = next(
        (d for d in sorted(docs.values(), key=lambda d: str(d["date"]), reverse=True)
         if d["documentType"] == "planbeskrivning"),
        None,
    )

    detaljplan = {
        "feature:typ": "detaljplan",
        "objektidentitet": plan_uuid,
        "objektversion": 1,
        "versionGiltigFran": version_from,
        "kommun": plan["municipality"],  # municipality NAME (vägledning 2.1.1)
        "namn": plan["name"],
        "syfte": " ".join(plan["purpose"].split()),
        "status": plan["status"],
        "typ": plan["planType"],
        "kvalitetsbeskrivning": DIGITISED_QUALITY if digitised else APPROX_QUALITY,
        "anvandbarhet": "medel" if digitised else "låg",
        "beskrivningAnvandbarhet": (
            "Exempel framtaget från planbeskrivningen och plankartan; geometrierna är digitaliserade från plankartan."
            if digitised else "Exempel framtaget från planbeskrivningen; bestämmelser utan egen geometri har planområdets gräns."
        ),
        "plangeometri": geometries(plan["area"], version_from),
        "beslutsinformation": [{
            "diarienummerKommun": plan["caseNumber"],
            "beslutstyp": "antagande av ny detaljplan",
            "genomforandetid": plan["implementationMonths"],  # months (vägledning 2.3.10)
            "foregaendePlansBeteckning": plan.get("previousPlans", []),
            "planbestammelse": list(prov_uuid.values()),
        }],
        "planeringsunderlag": underlag,
    }
    # datumStatusforandring is not given on the first delivery, only when the status changes (2.1.6).
    if plan.get("designation"):
        detaljplan["beteckning"] = plan["designation"]
    if planbeskrivning:
        detaljplan["planbeskrivning"] = {
            "planbeskrivning": doc_ref(planbeskrivning["id"], planbeskrivning["title"], planbeskrivning["date"], "publicerad")
        }

    features = [{"type": "Feature", "id": plan_uuid, "geometry": None, "properties": detaljplan}]

    for p in provisions:
        own = bool(p["geometry"].get("coordinates"))
        geom = p["geometry"] if own else plan["area"]
        props = {
            "feature:typ": p["kind"],
            "detaljplan": plan_uuid,
            "objektidentitet": prov_uuid[p["id"]],
            "planbestammelsekatalogreferens": p["catalogueRef"],
            "bestammelseformulering": " ".join(p["wording"].split()),
            "kvalitetsbeskrivning": DIGITISED_QUALITY if own else APPROX_QUALITY,
            "anvandbarhet": "medel" if own else "låg",
            "beskrivningAnvandbarhet": f"Plankartans beteckning: {p['code']}. "
            + ("Geometrin är digitaliserad från plankartan." if own else "Geometrin är planområdets gräns."),
            "bestammelsegeometri": geometries(geom, version_from),
            "planbestammelsebeskrivning": {"motiv": " ".join(p["motive"].split())},
        }
        if p.get("values"):
            props["bestammelsevarde"] = [
                {k: v for k, v in {
                    "datatyp": val["dataType"],
                    "variabelvarde": str(val["value"]),
                    "beskrivning": val["description"],
                    "vardetyp": val.get("kind"),
                    "enhet": lm_value(spec, "Unit", val["unit"]) if val.get("unit") else None,
                }.items() if v is not None}
                for val in p["values"]
            ]
        # A vertical bound only means something with a height on the geometry (vägledning 3.2.2);
        # until heights are modelled, it is reported instead of exported.
        if p.get("verticalBound") and p.get("levelFrom") is not None:
            props["vertikalAvgransning"] = p["verticalBound"]
        if p["kind"] == "egenskapsbestämmelse" and p.get("regulates"):
            props["reglerarAnvandningsbestammelse"] = [prov_uuid[r] for r in p["regulates"]]
        features.append({"type": "Feature", "id": prov_uuid[p["id"]], "geometry": None, "properties": props})

    return {"type": "FeatureCollection", "feature:mediatyp": MEDIA_TYPE, "features": features}


def validator():
    resources = []
    for url, filename in LM_SCHEMAS.items():
        contents = json.loads((LM_DIR / filename).read_text(encoding="utf-8"))
        resources.append((url, Resource.from_contents(contents, default_specification=DRAFT4)))
    registry = Registry().with_resources(resources)
    root_url = next(iter(LM_SCHEMAS))
    return Draft4Validator({"$ref": root_url}, registry=registry, format_checker=FormatChecker())


TEMPLATE_VAR = re.compile(r"\[([^\]:]+):([^\]]+)\]")


def render_template(template, values):
    """Wording = catalogue template with the given variables filled in, the rest removed (DP-0022).
    `values` is a list of (variable name, value) in template order."""
    given = dict(values)
    out = TEMPLATE_VAR.sub(lambda m: given.get(m.group(1), ""), template)
    return " ".join(out.split())


def check_rules(collection):
    """Delivery-stopping rules (vägledning ch. 7) the JSON schema can't express."""
    catalogue = {b["id"]: b for b in json.loads(CATALOGUE.read_text(encoding="utf-8"))["bestammelser"]}
    problems = []
    for f in collection["features"][1:]:
        p = f["properties"]
        label = p.get("beskrivningAnvandbarhet", p["objektidentitet"])
        values = p.get("bestammelsevarde", [])
        for v in values:
            if v["datatyp"] == "decimaltal" and not (v.get("vardetyp") and v.get("enhet")):
                problems.append(f"DP-0009 {label}: decimal value '{v['beskrivning']}' needs vardetyp and enhet")
        entry = catalogue.get(p["planbestammelsekatalogreferens"])
        if not entry:
            problems.append(f"DP-Krav-0006 {label}: catalogue reference not in the catalogue extract")
            continue
        template = entry["bestammelseformulering"]
        variables = [m.group(1) for m in TEMPLATE_VAR.finditer(template)]
        names = [v["beskrivning"] for v in values]
        if any(n not in variables for n in names) or names != [n for n in variables if n in names]:
            problems.append(f"DP-0022 {label}: values {names} don't match the template variables {variables} in order")
            continue
        expected = render_template(template, [(v["beskrivning"], v["variabelvarde"]) for v in values])
        if " ".join(p["bestammelseformulering"].split()) != expected:
            problems.append(f"DP-0022 {label}: wording '{p['bestammelseformulering']}' != template result '{expected}'")
    return problems


def main():
    src = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "spec" / "examples" / "katten-6.yaml").resolve()
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    data = yaml.safe_load(src.read_text(encoding="utf-8"))
    collection = export(spec, data)

    out = src.with_name(src.stem + ".lm-detaljplan-4.1.json")
    out.write_text(json.dumps(collection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for problem in check_rules(collection):
        print(f"STOPS DELIVERY {problem}")
    errors = sorted(validator().iter_errors(collection), key=lambda e: list(e.absolute_path))
    for e in errors[:30]:
        path = "/".join(str(p) for p in e.absolute_path)
        print(f"INVALID {path}: {e.message[:300]}")
    n_prov = len(collection["features"]) - 1
    print(f"{'INVALID' if errors else 'VALID'} against Detaljplan 4.1: 1 detaljplan, {n_prov} planbestämmelser -> {out.relative_to(ROOT)}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
