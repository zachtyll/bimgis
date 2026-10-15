"""Snapshot Boverket's planbestämmelsekatalog for the plan editor.

Keeps only provisions usable in NEW plans: current (not replaced or ended), and not the
"äldre bestämmelse" / "inte tolkats" entries meant for digitising old plans.
Writes web/public/data/boverket/planbestammelsekatalog.json (stamped with the release).

Open data from Boverket; cite Boverket as the source.
API description: https://www.boverket.se/contentassets/ae0f088994ab44cd80b03e1d3f359b28/teknisk-beskrivning-for-oppna-data-om-planbestammelser.pdf

Usage:
  python scripts/fetch_boverket_catalogue.py
"""

import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://api.boverket.se/planbestammelsekatalogen"
OUT = Path(__file__).resolve().parent.parent / "web" / "public" / "data" / "boverket" / "planbestammelsekatalog.json"
FOR_DIGITISING_ONLY = ("äldre bestämmelse", "inte tolkats")


def get(path):
    with urllib.request.urlopen(f"{API}{path}", timeout=120) as resp:
        return json.load(resp)


def main():
    release = get("/release/full/platt/aktuell")
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    kept = []
    for b in release["bestammelser"]:
        text = b.get("bestammelseformulering") or ""
        if b.get("ersattsav") or b.get("slutargalla") or any(s in text for s in FOR_DIGITISING_ONLY):
            continue
        kept.append({
            "id": b["id"],
            "beteckning": b.get("beteckning"),
            "bestammelsetyp": b["bestammelsetyp"],
            "anvandningsform": b["anvandningsform"],
            "kategori": b.get("kategori"),
            "underkategori": b.get("underkategori"),
            "bestammelseformulering": text,
            "geometrityp": b.get("geometrityp"),
            "borjargalla": (b.get("borjargalla") or "")[:10] or None,
        })
    kept.sort(key=lambda b: (b["bestammelsetyp"], b["anvandningsform"], b["kategori"] or "", b["bestammelseformulering"]))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "source": f"Boverket planbestämmelsekatalog, {API}/release/full/platt/aktuell",
        "license": "Öppna data från Boverket; ange Boverket som källa",
        "release": {k: release[k] for k in ("id", "namn", "publicerad")},
        "fetched": now,
        "bestammelser": kept,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"release {release['namn']}: {len(kept)} of {len(release['bestammelser'])} provisions -> {OUT}")


if __name__ == "__main__":
    main()
