"""Digitise the Katten 6 plan map (plankarta, PDF) into georeferenced provision geometry.

The plan map is vector graphics. This reads its fills and line work and turns them into
EPSG:3006 geometry for spec/examples/katten-6.yaml:

  - use areas from the fills: kvartersmark (brown), allmän plats (grey); (P) is the grey face
    labelled "(P)" between the användningsgränser;
  - property areas by cutting the block along the egenskapsgränser (dash-dot lines): the strip
    along Kattgränd (ö1 g1), the strip along Skomakargatan (h1, labelled outside, found by its
    leader line), and the h3 and h2 parts;
  - the exit ban (utfartsförbud) as the stretch of the block's boundary carrying the ring markers.

Georeferencing: Luleå kommun publishes the same sheet as a georeferenced image (kartportal.lulea.se,
MapServer DP_Katten_6_Plankarta). Its extent in SWEREF 99 21 45 is exactly the A1 sheet at 1:200,
north up, so the page maps linearly onto it. Only that extent is used; nothing is downloaded from
the map service. The result lies within about 0.3 m of the plan boundary in Luleå's open data.

Made for this plan map: the colours, line widths and labels below are its own. A one-off, kept for
lineage (where the example's geometry comes from) and for redoing it with the adopted plan map.

Usage:
  pip install -r scripts/requirements-data.txt
  python scripts/digitise_plankarta.py [plankarta.pdf] [--out katten-6-plankarta.json]
"""

import argparse
import json
import math
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import pymupdf
from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import polygonize, split, substring, unary_union
from shapely.validation import make_valid

PLANKARTA_URL = (
    "https://www.lulea.se/download/18.638043d919aa0a76f103060/1764076833253/"
    "Plankarta%20%5BG%5D%20KLF%202023-1459%20DP%20Katten%206.pdf"
)
# Extent of the published, georeferenced sheet (EPSG:3017): xmin, ymin, xmax, ymax.
SHEET_EXTENT = (168556.18923480832, 7276562.9560665805, 168724.42051272801, 7276681.64391327)
MAP_AREA = (0, 0, 1880, 1330)  # page points: left of the legend, above the title block
BROWN = (0.54, 0.44, 0.3)  # kvartersmark
GREY = (0.86, 0.86, 0.86)  # allmän plats
PROPERTY_LINE = 1.44  # egenskapsgräns (also leaders and the exit-ban rings)
USE_LINE = 2.04  # användningsgräns


# --- reading the PDF ------------------------------------------------------------------------

def subpaths(item):
    """A drawing's subpaths as point lists (a fill can hold several)."""
    paths, cur = [], []

    def add(p, start):
        nonlocal cur
        far = cur and (abs(cur[-1][0] - p.x) > 1e-3 or abs(cur[-1][1] - p.y) > 1e-3)
        if start and far:
            paths.append(cur)
            cur = []
        if not cur or far:
            cur.append([p.x, p.y])

    for op in item["items"]:
        if op[0] == "l":
            add(op[1], True)
            add(op[2], False)
        elif op[0] == "c":
            add(op[1], True)
            add(op[4], False)
        elif op[0] in ("re", "qu"):
            if cur:
                paths.append(cur)
                cur = []
            if op[0] == "re":
                r = op[1]
                paths.append([[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]])
            else:
                q = op[1]
                paths.append([[q.ul.x, q.ul.y], [q.ur.x, q.ur.y], [q.lr.x, q.lr.y], [q.ll.x, q.ll.y]])
    if cur:
        paths.append(cur)
    return paths


def read(pdf):
    page = pymupdf.open(pdf)[0]
    out = {"brown": [], "grey": [], "property": [], "use": [], "page": (page.rect.width, page.rect.height)}
    for x in page.get_drawings():
        r = x["rect"]
        if r.x1 > MAP_AREA[2] or r.y1 > MAP_AREA[3]:
            continue
        fill = tuple(round(c, 2) for c in (x.get("fill") or ()))
        stroke = tuple(round(c, 2) for c in (x.get("color") or ()))
        width = round(x.get("width") or 0, 2)
        if x["type"] == "fs" and fill == BROWN:
            out["brown"] += subpaths(x)
        elif x["type"] == "fs" and fill == GREY:
            out["grey"] += subpaths(x)
        elif x["type"] == "s" and stroke == (0.0, 0.0, 0.0) and width in (PROPERTY_LINE, USE_LINE):
            out["property" if width == PROPERTY_LINE else "use"] += subpaths(x)
    out["words"] = [w[:5] for w in page.get_text("words") if w[2] < MAP_AREA[2] and w[3] < MAP_AREA[3]]
    return out


# --- geometry in page space -----------------------------------------------------------------

def area(rings):
    """Union of fill tiles, closing the hairline gaps between them."""
    u = unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 3])
    return u.buffer(2.5, join_style=2).buffer(-2.5, join_style=2)


def dashes(paths, maxlen):
    return [(a, b) for p in paths for a, b in zip(p, p[1:]) if 1 < math.dist(a, b) < maxlen]


def fit_lines(segs, min_members, tol=1.5):
    """Straight dash-dot lines: clusters of short collinear dashes, one fitted line each."""
    lines, used = [], [False] * len(segs)
    for i, (a, b) in enumerate(segs):
        if used[i]:
            continue
        d = np.subtract(b, a) / math.dist(a, b)
        n = np.array([-d[1], d[0]])
        members = [
            j for j, (c, e) in enumerate(segs)
            if not used[j]
            and abs(np.dot(np.subtract(e, c) / math.dist(c, e), d)) > 0.995
            and abs(np.dot(np.subtract(c, a), n)) < tol and abs(np.dot(np.subtract(e, a), n)) < tol
        ]
        if len(members) >= min_members:
            for j in members:
                used[j] = True
            P = np.array([p for j in members for p in segs[j]])
            c = P.mean(0)
            d = np.linalg.svd(P - c)[2][0]
            t = (P - c) @ d
            lines.append([c + d * t.min(), c + d * t.max()])
    return merge_collinear(lines)


def merge_collinear(lines, ang=0.995, off=3.0):
    """Joins pieces of the same line (a dash-dot line often comes out in two)."""
    merged = []
    for a, b in lines:
        d = (b - a) / np.linalg.norm(b - a)
        n = np.array([-d[1], d[0]])
        for m in merged:
            dm = (m[1] - m[0]) / np.linalg.norm(m[1] - m[0])
            if abs(np.dot(d, dm)) > ang and abs(np.dot(a - m[0], n)) < off:
                t = (np.array([m[0], m[1], a, b]) - m[0]) @ dm
                m[0], m[1] = m[0] + dm * t.min(), m[0] + dm * t.max()
                break
        else:
            merged.append([np.array(a, float), np.array(b, float)])
    return merged


def extended(a, b, by):
    d = (b - a) / np.linalg.norm(b - a)
    return LineString([a - d * by, b + d * by])


def split_by(geom, line):
    return [p for p in split(geom, extended(*line, by=2000)).geoms if p.area > 50]


def faces(geom, lines):
    """Faces of `geom` bounded by its outline and lines that may end at each other."""
    edges = [g.exterior for g in getattr(geom, "geoms", [geom])] + [extended(a, b, by=8) for a, b in lines]
    return [f for f in polygonize(unary_union(edges)) if f.area > 50 and geom.buffer(1).contains(f.representative_point())]


def face_at(pieces, pt):
    hits = [p for p in pieces if p.buffer(1).contains(pt)]
    return min(hits, key=lambda p: p.area) if hits else None


def label(words, text):
    return [Point((w[0] + w[2]) / 2, (w[1] + w[3]) / 2) for w in words if w[4] == text]


def digitise(m):
    K = area(m["brown"])
    G = area(m["grey"])

    # The block: cut off the Kattgränd strip (the property line along the short side), then cut
    # the rest along the long-side lines (h1 strip, h3 | h2).
    lines = fit_lines(dashes(m["property"], 30), min_members=4)
    is_across = [abs((l[1] - l[0])[0]) > abs((l[1] - l[0])[1]) for l in lines]
    across = [l for l, x in zip(lines, is_across) if x]
    along = [l for l, x in zip(lines, is_across) if not x]
    strip_line = max(across, key=lambda l: np.linalg.norm(l[1] - l[0]))
    parts = split_by(K, strip_line)
    strip = min(parts, key=lambda p: p.area)
    pieces = [unary_union([p for p in parts if not p.equals(strip)])]
    for line in along:
        pieces = [q for p in pieces for q in split_by(p, line)]
    block = [strip] + pieces

    # h1 is labelled outside the block; its leader line ends inside the strip it refers to.
    leaders = [p for p in m["property"] if len(p) == 2 and math.dist(*p) > 60]
    box = label(m["words"], "h1")[0]
    leader = min(leaders, key=lambda s: min(box.distance(Point(s[0])), box.distance(Point(s[1]))))
    h1 = face_at(block, next(Point(p) for p in leader if K.contains(Point(p))))

    out = {
        "h1": h1,
        "h3": face_at(block, label(m["words"], "h3")[0]),
        "h2": face_at(block, label(m["words"], "h2")[0]),
        "o1_g1": face_at(block, label(m["words"], "g1")[0]),
    }
    # s1 p1 f1-f4 f6-f8: the label box's leaders point into h1, h3 and h2 (not the Kattgränd strip).
    out["block_upper"] = unary_union([out["h1"], out["h3"], out["h2"]])
    out["f5"] = unary_union([out["h3"], out["h2"]])
    out["kvartersmark"] = K

    # Use areas partition the plan area exactly (LM DP-0002/0003): street land is everything that
    # isn't kvartersmark, without hairline spikes; (P) is cut out of it.
    plan = unary_union([K, G]).buffer(2.5, join_style=2).buffer(-2.5, join_style=2)
    street = plan.difference(K).buffer(-0.3, join_style=2).buffer(0.3, join_style=2)
    street_faces = faces(G, fit_lines(dashes(m["use"], 40), min_members=3))
    out["P1"] = face_at(street_faces, label(m["words"], "(P)")[0]).intersection(street)
    out["GATA"] = street.difference(out["P1"])
    out["plan"] = plan

    # Exit ban: the stretch of the block's boundary from the first ring marker to the last.
    rings = [p for p in m["property"] if len(p) > 6 and math.dist(p[0], p[-1]) < 3]
    centres = []
    for c in (np.mean(r, 0) for r in rings):
        if all(math.dist(c, d) > 3 for d in centres):
            centres.append(c)
    edge = K.exterior
    pos = sorted(edge.project(Point(c)) for c in centres)
    gaps = [(pos[(i + 1) % len(pos)] - pos[i]) % edge.length for i in range(len(pos))]
    start = (int(np.argmax(gaps)) + 1) % len(pos)
    a, b = pos[start], pos[start - 1]
    out["utfartsforbud"] = substring(edge, a, b) if a < b else LineString(
        list(substring(edge, a, edge.length).coords) + list(substring(edge, 0, b).coords)[1:]
    )
    return out


# --- to EPSG:3006 ---------------------------------------------------------------------------

def georeferencer(page_size):
    w, h = page_size
    sx = (SHEET_EXTENT[2] - SHEET_EXTENT[0]) / w
    sy = (SHEET_EXTENT[3] - SHEET_EXTENT[1]) / h
    print(f"metres per point: {sx:.6f} x {sy:.6f} (1:200 is {0.0254 / 72 * 200:.6f})")
    t = Transformer.from_crs(3017, 3006, always_xy=True)

    def coords(cs):
        return [[round(v, 2) for v in t.transform(SHEET_EXTENT[0] + x * sx, SHEET_EXTENT[3] - y * sy)] for x, y in cs]

    def polygon_parts(poly):
        rings = [coords(poly.exterior.coords)] + [coords(i.coords) for i in poly.interiors]
        p = Polygon(rings[0], rings[1:])
        if p.is_valid:
            return [rings]
        # Rounding to centimetres can fold a sliver over itself: repair, keep the polygons.
        fixed = make_valid(p)
        return [
            [[[round(v, 2) for v in c] for c in x.exterior.coords]] + [[[round(v, 2) for v in c] for c in i.coords] for i in x.interiors]
            for x in getattr(fixed, "geoms", [fixed]) if x.geom_type == "Polygon" and x.area > 0.05
        ]

    def convert(geom):
        if geom.geom_type in ("LineString", "MultiLineString"):
            lines = getattr(geom, "geoms", [geom])
            return {"type": "MultiLineString", "coordinates": [coords(l.simplify(0.3).coords) for l in lines]}
        polys = [g for g in getattr(geom, "geoms", [geom]) if g.geom_type == "Polygon" and g.area > 5]
        return {"type": "MultiPolygon", "coordinates": [part for g in polys for part in polygon_parts(g.simplify(0.3))]}

    return convert


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("pdf", nargs="?", help="plan map PDF (default: download the granskning version from lulea.se)")
    ap.add_argument("--out", default="katten-6-plankarta.json")
    args = ap.parse_args()
    pdf = args.pdf
    if not pdf:
        pdf = str(Path(tempfile.mkdtemp()) / "plankarta.pdf")
        urllib.request.urlretrieve(PLANKARTA_URL, pdf)
    m = read(pdf)
    geoms = digitise(m)
    convert = georeferencer(m["page"])
    result = {k: convert(v) for k, v in geoms.items() if v is not None}
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    for k, v in geoms.items():
        size = f"{v.length * 0.0705:.1f} m" if v.geom_type.endswith("LineString") else f"{v.area * 0.0705 ** 2:.0f} m2"
        print(f"  {k:14s} {size}")
    print(f"written {args.out}")


if __name__ == "__main__":
    main()
