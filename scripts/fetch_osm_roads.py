"""Fetch drivable roads in central Luleå from OpenStreetMap, as GeoJSON in EPSG:3006.

The noise check uses them as noise sources: geometry, name, road class and speed limit. Traffic
volumes are not in OSM; the viewer starts from defaults by road class and lets the user enter
counts or forecasts (ÅDT, speed, heavy share) per street.

License: ODbL, (c) OpenStreetMap contributors.

Usage:
  pip install -r scripts/requirements-data.txt
  python scripts/fetch_osm_roads.py
"""

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

from pyproj import Transformer

# Central Luleå and surroundings (lon/lat): Gammelstad to Bergnäset, Porsön to Örnäset.
BBOX = (65.555, 21.95, 65.68, 22.30)  # south, west, north, east
OUT = Path(__file__).resolve().parent.parent / "web" / "public" / "data" / "lulea" / "roads-osm.geojson"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
HIGHWAYS = [
    "motorway", "motorway_link", "trunk", "trunk_link", "primary", "primary_link",
    "secondary", "secondary_link", "tertiary", "tertiary_link", "unclassified",
    "residential", "living_street", "service",
]
KEEP_TAGS = {"name": "name", "highway": "highway", "maxspeed": "maxspeed", "ref": "ref", "service": "service"}


def overpass(query: str, rounds: int = 3) -> dict:
    """Public Overpass servers are often overloaded: try each mirror, a few rounds."""
    last = None
    for url in [u for _ in range(rounds) for u in OVERPASS_URLS]:
        try:
            req = urllib.request.Request(
                url,
                data=urllib.parse.urlencode({"data": query}).encode(),
                headers={"User-Agent": "bimgis data script (scripts/fetch_osm_roads.py)"},
            )
            with urllib.request.urlopen(req, timeout=300) as res:
                return json.load(res)
        except Exception as err:  # noqa: BLE001 - try the next mirror
            print(f"{url}: {err}")
            last = err
            time.sleep(10)
    raise RuntimeError(f"all Overpass endpoints failed: {last}")


def main() -> None:
    s, w, n, e = BBOX
    pattern = "|".join(HIGHWAYS)
    data = overpass(f'[out:json][timeout:170];way["highway"~"^({pattern})$"]({s},{w},{n},{e});out tags geom;')
    to3006 = Transformer.from_crs(4326, 3006, always_xy=True)

    features = []
    for el in data["elements"]:
        tags = el.get("tags", {})
        # Parking aisles and drive-throughs are hardly noise sources; driveways and alleys stay.
        if tags.get("highway") == "service" and tags.get("service") in {"parking_aisle", "drive-through"}:
            continue
        if tags.get("access") in {"no", "private"} and tags.get("highway") == "service":
            continue
        coords = [to3006.transform(p["lon"], p["lat"]) for p in el.get("geometry", [])]
        if len(coords) < 2:
            continue
        props = {"osmId": el["id"]}
        for tag, prop in KEEP_TAGS.items():
            if tag in tags:
                props[prop] = tags[tag]
        features.append({
            "type": "Feature",
            "id": f"osm-way-{el['id']}",
            "geometry": {"type": "LineString", "coordinates": [[round(x, 1), round(y, 1)] for x, y in coords]},
            "properties": props,
        })

    features.sort(key=lambda f: f["properties"]["osmId"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "type": "FeatureCollection",
        "name": "roads-osm",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::3006"}},
        "attribution": "(c) OpenStreetMap contributors, ODbL",
        "features": features,
    }, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(features)} roads -> {OUT} ({OUT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
