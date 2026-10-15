"""Fetch free LoD1 building bodies for central Luleå and write them as GeoJSON in EPSG:3006.

Sources (see docs/design/03-3d-data-and-ifc.md):
  gba  GlobalBuildingAtlas LoD1 (TUM). Footprints + ML-estimated heights for every building.
       License: CC BY-NC 4.0 (non-commercial). Cite Zhu et al., ESSD 17, 2025.
  osm  OpenStreetMap via Overpass. Footprints, heights from `height` / `building:levels` tags,
       otherwise a per-type default. License: ODbL, (c) OpenStreetMap contributors.

Usage:
  pip install -r scripts/requirements-data.txt
  python scripts/fetch_lulea_buildings.py [gba|osm|all]
"""

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from pyproj import Transformer

# Central Luleå (lon/lat, WGS84)
BBOX = (22.120, 65.575, 22.175, 65.592)
OUT_DIR = Path(__file__).resolve().parent.parent / "web" / "public" / "data" / "lulea"

GBA_TILE = "https://data.source.coop/tge-labs/globalbuildingatlas-lod1/e020_n70_e025_n65.parquet"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

FLOOR_HEIGHT = 3.0
ROOF_ALLOWANCE = 1.0
DEFAULT_HEIGHT_BY_TYPE = {
    "garage": 3.0, "garages": 3.0, "shed": 3.0, "carport": 3.0,
    "house": 6.0, "detached": 6.0, "semidetached_house": 6.0, "terrace": 7.0,
    "apartments": 13.0, "residential": 10.0, "commercial": 12.0, "retail": 8.0,
    "office": 15.0, "church": 15.0, "industrial": 8.0,
}
DEFAULT_HEIGHT = 7.0

to_sweref = Transformer.from_crs("EPSG:4326", "EPSG:3006", always_xy=True)


def project_ring(ring):
    return [[round(c, 2) for c in to_sweref.transform(lon, lat)] for lon, lat in ring]


def project_geometry(geom):
    if geom["type"] == "Polygon":
        return {"type": "Polygon", "coordinates": [project_ring(r) for r in geom["coordinates"]]}
    if geom["type"] == "MultiPolygon":
        return {
            "type": "MultiPolygon",
            "coordinates": [[project_ring(r) for r in poly] for poly in geom["coordinates"]],
        }
    raise ValueError(f"Unsupported geometry {geom['type']}")


def write_collection(name, features, attribution):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"buildings-{name}.geojson"
    collection = {
        "type": "FeatureCollection",
        "name": f"lulea-buildings-{name}",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::3006"}},
        "attribution": attribution,
        "features": features,
    }
    path.write_text(json.dumps(collection, separators=(",", ":")), encoding="utf-8")
    print(f"{name}: {len(features)} buildings -> {path}")


def fetch_gba():
    import duckdb

    con = duckdb.connect()
    con.sql("INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;")
    xmin, ymin, xmax, ymax = BBOX
    rows = con.execute(
        f"""
        SELECT id, source, height, ST_AsGeoJSON(geometry)
        FROM read_parquet('{GBA_TILE}')
        WHERE bbox.xmin > ? AND bbox.xmax < ? AND bbox.ymin > ? AND bbox.ymax < ?
        """,
        [xmin, xmax, ymin, ymax],
    ).fetchall()

    features = [
        {
            "type": "Feature",
            "id": f"gba:{gid}",
            "properties": {
                "id": f"gba:{gid}",
                "height": round(height, 1),
                "height_source": "gba-estimate",
                "footprint_source": source,
            },
            "geometry": project_geometry(json.loads(geom)),
        }
        for gid, source, height, geom in rows
        if height is not None
    ]
    write_collection(
        "gba", features,
        "GlobalBuildingAtlas LoD1, Zhu et al. (2025), CC BY-NC 4.0",
    )


def osm_height(tags):
    try:
        return float(tags["height"].split()[0]), "osm-height"
    except (KeyError, ValueError):
        pass
    try:
        return float(tags["building:levels"]) * FLOOR_HEIGHT + ROOF_ALLOWANCE, "osm-levels"
    except (KeyError, ValueError):
        pass
    return DEFAULT_HEIGHT_BY_TYPE.get(tags.get("building"), DEFAULT_HEIGHT), "default-by-type"


def fetch_osm():
    xmin, ymin, xmax, ymax = BBOX
    query = f'[out:json][timeout:120];way["building"]({ymin},{xmin},{ymax},{xmax});out tags geom;'
    body = urllib.parse.urlencode({"data": query}).encode()

    last_error = None
    for url in OVERPASS_URLS:
        try:
            req = urllib.request.Request(url, data=body, headers={"User-Agent": "bimgis-data-prep"})
            with urllib.request.urlopen(req, timeout=180) as resp:
                elements = json.load(resp)["elements"]
            break
        except Exception as err:  # busy server returns HTML; try the next mirror
            last_error = err
    else:
        raise RuntimeError(f"All Overpass endpoints failed: {last_error}")

    features = []
    for el in elements:
        ring = [(p["lon"], p["lat"]) for p in el.get("geometry", [])]
        if len(ring) < 4:
            continue
        tags = el.get("tags", {})
        height, height_source = osm_height(tags)
        props = {
            "id": f"osm:way/{el['id']}",
            "height": round(height, 1),
            "height_source": height_source,
            "building": tags.get("building"),
        }
        for key in ("name", "building:levels", "addr:street", "addr:housenumber"):
            if key in tags:
                props[key] = tags[key]
        features.append({
            "type": "Feature",
            "id": props["id"],
            "properties": props,
            "geometry": {"type": "Polygon", "coordinates": [project_ring(ring)]},
        })
    write_collection("osm", features, "(c) OpenStreetMap contributors, ODbL")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("gba", "all"):
        fetch_gba()
    if which in ("osm", "all"):
        fetch_osm()
