"""Build an IFC model of the block at Mjölkuddsvägen 129–147, Luleå (detaljplan Mjölkudden 3:13 m.fl.).

A reconstruction for testing, not a survey: simple but recognisable buildings, georeferenced in
SWEREF 99 TM (EPSG:3006), written to data/ifc/mjolkudden-3-13.ifc (IFC4).

Sources
  - Existing houses: the 15 apartment buildings (lamellhus, 1960s, 2–3 storeys) from
    OpenStreetMap (footprints, address, levels; ODbL, (c) OpenStreetMap contributors). Where OSM
    has no level count, smaller houses (< 700 m2) get 2 storeys, larger 3, as in the area.
  - Planned houses A–D: "Planbeskrivning [A] KLF 2023/1747, Detaljplan för del av Mjölkudden,
    Mjölkudden 3:13 m.fl." (antagandehandling 2025-12-02, data/example-planning-data/): placed
    from its Bild 1 (georeferenced on the 15 houses, mean error 1.5 m), at most 370 m2 building
    area and 21 m ridge height (h1), six storeys and a gable roof (f1), no balconies on the short
    sides (ö1).
  - Appearance, from the planbeskrivning's photo (Bild 9) and text: brick facades, gable roofs
    (since the 1980s), balconies; ridge heights 9 m (2 storeys) and 12 m (3 storeys), h2/h3.

Heights are relative to the ground (the site is treated as flat, origin at height 0); the
viewer stands the model on its terrain.

Usage:
  pip install ifcopenshell shapely pyproj
  python scripts/build_mjolkudden_ifc.py
"""

import json
import math
import time
import urllib.parse
import urllib.request
from pathlib import Path

import ifcopenshell
import ifcopenshell.api as api
import ifcopenshell.api.aggregate
import ifcopenshell.api.context
import ifcopenshell.api.geometry
import ifcopenshell.api.georeference
import ifcopenshell.api.project
import ifcopenshell.api.pset
import ifcopenshell.api.root
import ifcopenshell.api.spatial
import ifcopenshell.api.style
import ifcopenshell.api.unit
import ifcopenshell.util.shape_builder as sb
from pyproj import Transformer
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "ifc" / "mjolkudden-3-13.ifc"
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"]

# The 15 existing houses (OSM way ids).
EXISTING = [312085106, 312085107, 1292475899, 1292475903, 157756748, 168720453, 1292475901, 157759776,
            1292475905, 312085102, 1292355304, 1292475907, 157756767, 157759757, 1292475909]
# Planned houses: centre (EPSG:3006) from Bild 1; orientation follows the nearest existing house.
PLANNED = {"A": (827933.8, 7294049.1), "B": (827860.7, 7293960.9), "C": (827845.2, 7293899.0), "D": (828022.3, 7294000.6)}
PLANNED_SIZE = (20.0, 18.5)  # 370 m2
STOREY = 2.9  # floor to floor, m
RIDGE = {2: 9.0, 3: 12.0, 6: 21.0}  # ridge height by storeys (h2, h3, h1)
WALL = 0.35

COLOURS = {
    "brick": (0.71, 0.33, 0.23),       # existing: red-orange brick
    "render": (0.86, 0.82, 0.75),      # planned: light facade, to tell them apart
    "roof": (0.23, 0.23, 0.24),
    "glass": (0.18, 0.29, 0.38),
    "door": (0.30, 0.20, 0.14),
    "concrete": (0.80, 0.78, 0.74),
    "railing": (0.93, 0.93, 0.92),
}


def overpass(query):
    last = None
    for url in OVERPASS * 2:
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": query}).encode(),
                                         headers={"User-Agent": "bimgis (scripts/build_mjolkudden_ifc.py)"})
            with urllib.request.urlopen(req, timeout=180) as res:
                return json.load(res)
        except Exception as err:  # noqa: BLE001 - try the next mirror
            print(f"{url}: {err}")
            last = err
            time.sleep(8)
    raise RuntimeError(f"Overpass failed: {last}")


def footprints():
    to3006 = Transformer.from_crs(4326, 3006, always_xy=True)
    data = overpass(f"[out:json][timeout:120];way(id:{','.join(map(str, EXISTING))});out tags geom;")
    houses = []
    for el in data["elements"]:
        poly = Polygon([to3006.transform(p["lon"], p["lat"]) for p in el["geometry"]])
        tags = el.get("tags", {})
        levels = int(tags["building:levels"]) if tags.get("building:levels", "").isdigit() else (2 if poly.area < 700 else 3)
        street, numbers = tags.get("addr:street"), tags.get("addr:housenumber")
        name = f"{street} {numbers.replace(',', ', ')}" if street and numbers else f"Flerbostadshus (OSM {el['id']})"
        houses.append({
            "name": name, "poly": orient(poly.simplify(0.25), 1.0), "storeys": levels, "status": "Befintlig",
            "facade": "brick", "balcony_short_sides": True,
            "source": f"OpenStreetMap way {el['id']} (ODbL); levels {'from OSM' if 'building:levels' in tags else 'by size'}",
        })
    return houses


def axes(poly):
    """Long and short axis of the minimum rotated rectangle: (centre, u (long, unit), L, W)."""
    rect = list(poly.minimum_rotated_rectangle.exterior.coords)[:4]
    e1 = (rect[1][0] - rect[0][0], rect[1][1] - rect[0][1])
    e2 = (rect[2][0] - rect[1][0], rect[2][1] - rect[1][1])
    l1, l2 = math.hypot(*e1), math.hypot(*e2)
    (e, L), W = ((e1, l1), l2) if l1 >= l2 else ((e2, l2), l1)
    c = poly.minimum_rotated_rectangle.centroid
    return (c.x, c.y), (e[0] / L, e[1] / L), L, W


def planned(existing):
    houses = []
    for label, (x, y) in PLANNED.items():
        nearest = min(existing, key=lambda h: h["poly"].centroid.distance(Polygon([(x, y), (x + 1, y), (x, y + 1)]).centroid))
        _, (ux, uy), _, _ = axes(nearest["poly"])
        a, b = PLANNED_SIZE[0] / 2, PLANNED_SIZE[1] / 2
        vx, vy = -uy, ux
        corners = [(x + sx * a * ux + sy * b * vx, y + sx * a * uy + sy * b * vy) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        houses.append({
            "name": f"Hus {label} (tillkommande)", "poly": orient(Polygon(corners), 1.0), "storeys": 6, "status": "Tillkommande",
            "facade": "render", "balcony_short_sides": False,
            "source": "Planbeskrivning KLF 2023/1747 (antagandehandling 2025-12-02): placering enligt bild 1, "
                      "största byggnadsarea 370 m2, högsta nockhöjd 21 m (h1), sadeltak (f1), inga balkonger på kortsidorna (ö1)",
        })
    return houses


class Model:
    def __init__(self, origin):
        self.f = api.project.create_file(version="IFC4")
        f = self.f
        self.project = api.root.create_entity(f, ifc_class="IfcProject", name="Mjölkudden 3:13 m.fl., Luleå")
        # Metres throughout (IfcOpenShell's default is millimetres, which would shrink the model 1000x).
        metre = api.unit.add_si_unit(f, unit_type="LENGTHUNIT")
        api.unit.assign_unit(f, units=[metre, api.unit.add_si_unit(f, unit_type="AREAUNIT"), api.unit.add_si_unit(f, unit_type="VOLUMEUNIT")])
        ctx = api.context.add_context(f, context_type="Model")
        self.body = api.context.add_context(f, context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=ctx)
        api.georeference.add_georeferencing(f)
        api.georeference.edit_georeferencing(
            f,
            projected_crs={"Name": "EPSG:3006", "Description": "SWEREF 99 TM", "GeodeticDatum": "SWEREF 99",
                           "VerticalDatum": "RH 2000 (heights here are relative to the ground)", "MapUnit": metre},
            coordinate_operation={"Eastings": origin[0], "Northings": origin[1], "OrthogonalHeight": 0.0,
                                  "XAxisAbscissa": 1.0, "XAxisOrdinate": 0.0, "Scale": 1.0},
        )
        self.site = api.root.create_entity(f, ifc_class="IfcSite", name="Mjölkudden 3:12 och 3:13")
        api.geometry.edit_object_placement(f, product=self.site)
        api.aggregate.assign_object(f, products=[self.site], relating_object=self.project)
        self.origin = origin
        self.builder = sb.ShapeBuilder(f)
        self.styles = {}
        for key, rgb in COLOURS.items():
            style = api.style.add_style(f, name=key)
            api.style.add_surface_style(f, style=style, ifc_class="IfcSurfaceStyleShading", attributes={
                "SurfaceColour": {"Name": None, "Red": rgb[0], "Green": rgb[1], "Blue": rgb[2]},
                "Transparency": 0.3 if key == "glass" else 0.0,
            })
            self.styles[key] = style

    def local(self, x, y):
        return (x - self.origin[0], y - self.origin[1])

    def place(self, el):
        # Every product needs an explicit placement: some readers (web-ifc) collapse geometry without.
        api.geometry.edit_object_placement(self.f, product=el)
        return el

    def product(self, ifc_class, name, items, style, container, predefined=None):
        el = self.place(api.root.create_entity(self.f, ifc_class=ifc_class, name=name, predefined_type=predefined))
        rep = self.builder.get_representation(self.body, items)
        api.geometry.assign_representation(self.f, product=el, representation=rep)
        api.style.assign_representation_styles(self.f, shape_representation=rep, styles=[self.styles[style]])
        api.spatial.assign_container(self.f, products=[el], relating_structure=container)
        return el

    def box(self, centre, u, size, z, height):
        """A box: centre (x, y) local, long axis u, size (along u, across u), from z up."""
        (cx, cy), (ux, uy) = centre, u
        a, b = size[0] / 2, size[1] / 2
        vx, vy = -uy, ux
        pts = [(cx + sx * a * ux + sy * b * vx, cy + sx * a * uy + sy * b * vy) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        return self.builder.extrude(self.builder.profile(self.builder.polyline(pts, closed=True)), magnitude=height, position=(0, 0, z))

    def building(self, h):
        f = self.f
        bld = self.place(api.root.create_entity(f, ifc_class="IfcBuilding", name=h["name"]))
        api.aggregate.assign_object(f, products=[bld], relating_object=self.site)
        api.pset.edit_pset(f, pset=api.pset.add_pset(f, product=bld, name="Pset_BuildingCommon"),
                           properties={"NumberOfStoreys": h["storeys"]})
        api.pset.edit_pset(f, pset=api.pset.add_pset(f, product=bld, name="Bimgis_Source"),
                           properties={"Status": h["status"], "Source": h["source"], "PlanReference": "KLF 2023/1747",
                                       "RidgeHeight": RIDGE[h["storeys"]]})
        poly = Polygon([self.local(*p) for p in h["poly"].exterior.coords])
        inner = poly.buffer(-WALL, join_style=2)
        outer_pts = list(poly.exterior.coords)[:-1]
        inner_pts = list(inner.exterior.coords)[:-1] if inner.geom_type == "Polygon" else []
        facade = h["facade"]
        n = h["storeys"]
        eaves = n * STOREY
        (cx, cy), (ux, uy), L, W = axes(poly)
        # The long side facing most to the south gets balconies (and the door goes on the other).
        vx, vy = -uy, ux
        south = (vx, vy) if vy < 0 else (-vx, -vy)
        for s in range(n):
            storey = self.place(api.root.create_entity(f, ifc_class="IfcBuildingStorey", name=f"Plan {s + 1}"))
            api.aggregate.assign_object(f, products=[storey], relating_object=bld)
            storey.Elevation = s * STOREY
            z = s * STOREY
            wall = self.builder.extrude(
                self.builder.profile(self.builder.polyline(outer_pts, closed=True),
                                     inner_curves=[self.builder.polyline(inner_pts, closed=True)] if inner_pts else []),
                magnitude=STOREY, position=(0, 0, z))
            self.product("IfcWall", f"Yttervägg plan {s + 1}", [wall], facade, storey, "SOLIDWALL")
            slab = self.builder.extrude(self.builder.profile(self.builder.polyline(outer_pts, closed=True)), magnitude=0.25, position=(0, 0, z))
            self.product("IfcSlab", f"Bjälklag plan {s + 1}", [slab], "concrete", storey, "FLOOR")
            self.openings(h, storey, poly, s, z, south)
        roof_storey = storey
        top = self.builder.extrude(self.builder.profile(self.builder.polyline(outer_pts, closed=True)), magnitude=0.25, position=(0, 0, eaves))
        self.product("IfcSlab", "Vindsbjälklag", [top], "concrete", roof_storey, "ROOF")
        # Gable roof along the long axis, up to the ridge height.
        over, rise = 0.5, RIDGE[n] - eaves
        tri = self.builder.polyline([(-W / 2 - over, 0), (W / 2 + over, 0), (0, rise)], closed=True)
        start = (cx - ux * (L / 2 + 0.3), cy - uy * (L / 2 + 0.3), eaves)
        roof = self.builder.extrude(self.builder.profile(tri), magnitude=L + 0.6, position=start,
                                    position_z_axis=(ux, uy, 0.0), position_x_axis=(vx, vy, 0.0))
        self.product("IfcRoof", "Sadeltak", [roof], "roof", roof_storey, "GABLE_ROOF")

    def openings(self, h, storey, poly, s, z, south):
        """Windows along the facades, a door on the ground floor, balconies on the southern long side."""
        pts = list(poly.exterior.coords)
        edges = sorted(((pts[i], pts[i + 1]) for i in range(len(pts) - 1)), key=lambda e: -math.dist(*e))
        long_len = math.dist(*edges[0])
        door_done = False
        for (x0, y0), (x1, y1) in edges:
            length = math.hypot(x1 - x0, y1 - y0)
            if length < 5:
                continue
            ux, uy = (x1 - x0) / length, (y1 - y0) / length
            nx, ny = uy, -ux  # outward for a counter-clockwise ring
            is_long = length > 0.6 * long_len
            faces_south = nx * south[0] + ny * south[1] > 0.7
            bays = max(1, int(length // 3.4))
            for k in range(bays):
                t = (k + 0.5) / bays * length
                px, py = x0 + ux * t, y0 + uy * t
                centre = (px + nx * 0.02, py + ny * 0.02)
                if s == 0 and not door_done and is_long and not faces_south and k == bays // 2:
                    self.product("IfcDoor", "Entré", [self.box(centre, (ux, uy), (1.4, 0.12), z, 2.2)], "door", storey, "DOOR")
                    door_done = True
                    continue
                self.product("IfcWindow", f"Fönster plan {s + 1}", [self.box(centre, (ux, uy), (1.3, 0.12), z + 0.9, 1.4)], "glass", storey, "WINDOW")
                balcony_here = s > 0 and faces_south and k % 2 == 1 and (is_long or h["balcony_short_sides"])
                if balcony_here:
                    bc = (px + nx * 0.75, py + ny * 0.75)
                    self.product("IfcSlab", f"Balkong plan {s + 1}", [self.box(bc, (ux, uy), (2.8, 1.5), z, 0.18)], "concrete", storey, "NOTDEFINED")
                    rc = (px + nx * 1.47, py + ny * 1.47)
                    self.product("IfcRailing", f"Balkongräcke plan {s + 1}", [self.box(rc, (ux, uy), (2.8, 0.06), z + 0.18, 1.0)], "railing", storey, "BALUSTRADE")


def main():
    existing = footprints()
    houses = existing + planned(existing)
    cx = sum(h["poly"].centroid.x for h in houses) / len(houses)
    cy = sum(h["poly"].centroid.y for h in houses) / len(houses)
    origin = (round(cx), round(cy))
    model = Model(origin)
    for h in houses:
        model.building(h)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    model.f.write(str(OUT))
    print(f"{len(existing)} existing + {len(houses) - len(existing)} planned buildings, origin {origin} (EPSG:3006)")
    print(f"written {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
