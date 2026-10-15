"""Fetch single trees (natural=tree) in Luleå kommun from OpenStreetMap, as GeoJSON in EPSG:3006.

The viewer draws these where Luleå kommun's own tree layer (streamed live, never stored; see
docs/design/03-3d-data-and-ifc.md) has no tree nearby. OSM rarely gives height or species, so
the viewer falls back to defaults by leaf type.

License: ODbL, (c) OpenStreetMap contributors.

Usage:
  pip install -r scripts/requirements-data.txt
  python scripts/fetch_osm_trees.py
"""

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

from pyproj import Transformer

# The viewer's basemap extent (EPSG:3006 790000–866000 × 7266000–7358000), as lat/lon with margin.
BBOX = (65.40, 21.30, 65.95, 22.90)  # south, west, north, east
OUT = Path(__file__).resolve().parent.parent / "web" / "public" / "data" / "lulea" / "trees-osm.geojson"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
KEEP_TAGS = {
    "leaf_type": "leafType",
    "leaf_cycle": "leafCycle",
    "genus": "genus",
    "species": "species",
    "species:sv": "speciesSv",
    "taxon": "taxon",
    "height": "height",
    "denotation": "denotation",
}


def overpass(query: str, rounds: int = 3) -> dict:
    """Public Overpass servers are often overloaded: try each mirror, a few rounds."""
    last = None
    for url in [u for _ in range(rounds) for u in OVERPASS_URLS]:
        try:
            req = urllib.request.Request(
                url,
                data=urllib.parse.urlencode({"data": query}).encode(),
                headers={"User-Agent": "bimgis data script (scripts/fetch_osm_trees.py)"},
            )
            with urllib.request.urlopen(req, timeout=300) as res:
                return json.load(res)
        except Exception as err:  # noqa: BLE001 - try the next mirror
            print(f"{url}: {err}")
            last = err
            time.sleep(10)
    raise RuntimeError(f"all Overpass endpoints failed: {last}")


def parse_height(value: str | None) -> float | None:
    if not value:
        return None
    try:
        h = float(value.replace("m", "").replace(",", ".").strip())
    except ValueError:
        return None
    return h if 1 <= h <= 60 else None


def main() -> None:
    s, w, n, e = BBOX
    data = overpass(f'[out:json][timeout:170];node["natural"="tree"]({s},{w},{n},{e});out;')
    to3006 = Transformer.from_crs(4326, 3006, always_xy=True)

    features = []
    for el in data["elements"]:
        x, y = to3006.transform(el["lon"], el["lat"])
        tags = el.get("tags", {})
        props = {"osmId": el["id"]}
        for tag, prop in KEEP_TAGS.items():
            if tag in tags:
                props[prop] = tags[tag]
        height = parse_height(tags.get("height"))
        if height is not None:
            props["height"] = height
        features.append({
            "type": "Feature",
            "id": f"osm-node-{el['id']}",
            "geometry": {"type": "Point", "coordinates": [round(x, 2), round(y, 2)]},
            "properties": props,
        })

    features.sort(key=lambda f: f["properties"]["osmId"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "type": "FeatureCollection",
        "name": "trees-osm",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::3006"}},
        "attribution": "(c) OpenStreetMap contributors, ODbL",
        "features": features,
    }, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(features)} trees -> {OUT}")


if __name__ == "__main__":
    main()
