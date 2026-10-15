"""Validate spec/planning-data.yaml and its examples.

Checks that
  - every field type is well-formed and its enum/ref/object targets exist,
  - `required` is `true` or a known stage/status value,
  - stages reference existing entities, document types and LM statuses,
  - enum values mapped to Lantmäteriet (`lm:`) exist in the Detaljplan 4.1 schema (when given),
  - examples only use known fields and valid enum values, resolve their references and set
    every `required: true` field.

Usage:
  pip install -r scripts/requirements-data.txt
  python scripts/validate_spec.py [--lm-schema path-or-url-to-detaljplan-4.1.json]

By default the local copy docs/inspo/lantmateriet/schema2.json (Detaljplan 4.1) is used.
"""

import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "spec" / "planning-data.yaml"
LM_SCHEMA_DEFAULT = ROOT / "docs" / "inspo" / "lantmateriet" / "schema2.json"
EXAMPLES = ROOT / "spec" / "examples"
SCALARS = {"string", "text", "integer", "decimal", "boolean", "date", "datetime", "uuid", "url", "file"}
GEOMETRIES = {"Point", "Polygon", "MultiPolygon", "Any"}

# Enum name in our spec -> definition name in LM Detaljplan 4.1
LM_ENUMS = {
    "PlanStatus": "planstatus",
    "PlanType": "plantyp",
    "DecisionKind": "beslutstyp",
    "Body": "kommuninstans",
    "InvestigationType": "underlagstyp",
    "PlanningMaterialArea": "huvudomrade",
    "Unit": "enhet",
    "ValueKind": "vardetyp",
    "VerticalBound": "avgransning",
}

# LM definitions whose required properties our entities must be able to fill on export
LM_REQUIRED = {"detaljplan": "Plan", "planbestammelse": "Provision"}
LM_EXPORT_CONSTANTS = {"feature:typ"}  # set by the exporter, not stored

# Example collection key -> entity
COLLECTIONS = {
    "organisations": "Organisation", "plan": "Plan", "stageEvents": "StageEvent", "decisions": "Decision",
    "documents": "Document", "investigations": "Investigation", "observations": "Observation",
    "datasets": "Dataset", "norms": "Norm", "findings": "Finding", "provisions": "Provision",
    "obligations": "Obligation", "contributions": "Contribution", "responses": "Response",
}


class Errors(list):
    def add(self, where, msg):
        self.append(f"{where}: {msg}")


def enum_values(spec, name):
    values = spec["enums"][name]["values"]
    return [v["value"] if isinstance(v, dict) else v for v in values]


def parse_type(t):
    """Returns (is_list, kind, target) for e.g. 'list<ref:Plan>' -> (True, 'ref', 'Plan')."""
    is_list = False
    m = re.fullmatch(r"list<(.+)>", t)
    if m:
        is_list, t = True, m.group(1)
    if ":" in t:
        kind, target = t.split(":", 1)
        return is_list, kind, target
    return is_list, t, None


def check_spec(spec, errors):
    entities, objects, enums = spec["entities"], spec["objects"], spec["enums"]
    stage_like = set(enum_values(spec, "StageKind")) | set(enum_values(spec, "PlanStatus")) \
        | set(enum_values(spec, "InvestigationStatus"))

    def check_field(where, field):
        t = field.get("type")
        if not t:
            return errors.add(where, "missing type")
        _, kind, target = parse_type(t)
        if kind in SCALARS and target is None:
            pass
        elif kind == "geometry" and target in GEOMETRIES:
            pass
        elif kind == "enum" and target in enums:
            pass
        elif kind == "ref" and target in entities:
            pass
        elif kind == "object" and target in objects:
            pass
        else:
            errors.add(where, f"unknown type '{t}'")
        req = field.get("required")
        if req not in (None, True, False) and req not in stage_like:
            errors.add(where, f"required '{req}' is neither true nor a stage/status")

    for kind_name, group in (("entity", entities), ("object", objects)):
        for name, ent in group.items():
            for fname, field in ent.get("fields", {}).items():
                check_field(f"{kind_name} {name}.{fname}", field)
    for fname, field in spec.get("common_fields", {}).items():
        check_field(f"common_fields.{fname}", field)

    statuses = set(enum_values(spec, "PlanStatus"))
    doc_types = set(enum_values(spec, "DocumentType"))
    for stage_name in enum_values(spec, "StageKind"):
        if stage_name not in spec["stages"]:
            errors.add("stages", f"StageKind '{stage_name}' has no stage description")
    for name, stage in spec["stages"].items():
        if stage.get("lm_status") not in statuses | {None}:
            errors.add(f"stages.{name}", f"lm_status '{stage.get('lm_status')}' not in PlanStatus")
        for p in stage.get("produces", []):
            if p["entity"] not in entities:
                errors.add(f"stages.{name}", f"produces unknown entity {p['entity']}")
            dts = p.get("documentType", [])
            for dt in dts if isinstance(dts, list) else [dts]:
                if dt not in doc_types:
                    errors.add(f"stages.{name}", f"unknown documentType {dt}")


def check_lm(spec, lm_schema, errors):
    defs = lm_schema["definitions"]
    for ours, theirs in LM_ENUMS.items():
        allowed = set(defs[theirs]["enum"])
        for v in spec["enums"][ours]["values"]:
            if isinstance(v, dict):
                mapped = v.get("lm", v["value"])
            else:
                mapped = v
            if mapped is None:
                continue
            # Units and InvestigationType may extend LM; extensions must say so (lm: annat / ext)
            if mapped not in allowed and not (ours == "Unit" and mapped not in allowed):
                errors.add(f"enum {ours}", f"'{mapped}' is not in LM {theirs} {sorted(allowed)}")


def lm_required(defn):
    """Required property names of an LM definition, following allOf."""
    req = set(defn.get("required", []))
    for part in defn.get("allOf", []):
        req |= set(part.get("required", []))
    return req


def check_lm_coverage(spec, lm_schema, errors):
    """Every property LM requires must be mapped by some field of the corresponding entity."""
    defs = lm_schema["definitions"]
    common = spec.get("common_fields", {})
    for lm_name, entity in LM_REQUIRED.items():
        fields = {**common, **spec["entities"][entity].get("fields", {})}
        mapped = set()
        for f in fields.values():
            path = str(f.get("lm", ""))
            for alias in path.replace("utbytesobjekt.", "").split(" / "):
                mapped.add(re.split(r"[.\[ (]", alias.strip(), maxsplit=1)[0])
        for prop in sorted(lm_required(defs[lm_name]) - LM_EXPORT_CONSTANTS - mapped):
            errors.add(f"entity {entity}", f"LM {lm_name}.{prop} is required but no field maps to it")


def check_example(spec, path, errors):
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    entities, objects = spec["entities"], spec["objects"]
    common = set(spec.get("common_fields", {}))

    records = []  # (entity, record)
    for key, value in data.items():
        entity = COLLECTIONS.get(key)
        if not entity:
            errors.add(path.name, f"unknown collection '{key}'")
            continue
        for rec in value if isinstance(value, list) else [value]:
            records.append((entity, rec))
    ids = {rec.get("id"): entity for entity, rec in records}
    norm_codes = {rec["code"]: "Norm" for entity, rec in records if entity == "Norm"}

    def check_value(where, field, value):
        is_list, kind, target = parse_type(field["type"])
        items = value if is_list else [value]
        if is_list and not isinstance(value, list):
            return errors.add(where, "expected a list")
        for item in items:
            if kind == "enum" and item not in enum_values(spec, target):
                errors.add(where, f"'{item}' not in enum {target}")
            elif kind == "ref":
                if ids.get(item, norm_codes.get(item)) != target:
                    errors.add(where, f"reference '{item}' does not resolve to a {target}")
            elif kind == "object":
                check_record(where, objects[target].get("fields", {}), item, set())

    def check_record(where, fields, rec, extra_allowed):
        if not isinstance(rec, dict):
            return errors.add(where, "expected an object")
        for k, v in rec.items():
            if k in fields:
                check_value(f"{where}.{k}", fields[k], v)
            elif k not in extra_allowed:
                errors.add(where, f"unknown field '{k}'")
        for k, f in fields.items():
            if f.get("required") is True and k not in rec:
                errors.add(where, f"missing required field '{k}'")

    for entity, rec in records:
        where = f"{path.name} {entity} {rec.get('id', rec.get('code', '?'))}"
        check_record(where, entities[entity].get("fields", {}), rec, common)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lm-schema", help="path or URL to detaljplan-4.1.json (default: local copy)")
    args = ap.parse_args()

    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    errors = Errors()
    check_spec(spec, errors)
    src = args.lm_schema or str(LM_SCHEMA_DEFAULT)
    raw = urllib.request.urlopen(src).read() if src.startswith("http") else Path(src).read_bytes()
    lm_schema = json.loads(raw)
    check_lm(spec, lm_schema, errors)
    check_lm_coverage(spec, lm_schema, errors)
    for example in sorted(EXAMPLES.glob("*.yaml")):
        check_example(spec, example, errors)

    for e in errors:
        print("ERROR", e)
    counts = f"{len(spec['entities'])} entities, {len(spec['enums'])} enums, {len(spec['stages'])} stages"
    print(f"{'FAILED' if errors else 'OK'}: {counts}, {len(list(EXAMPLES.glob('*.yaml')))} example(s), {len(errors)} error(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
