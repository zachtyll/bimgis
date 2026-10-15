from pathlib import Path
import subprocess

ifcs = Path("data/ifc").rglob("*.ifc")

for f in ifcs:
    name = f.stem
    out = Path("tiles") / name / "v1"

    subprocess.run([
        "dvc", "stage", "add",
        "-f",  # important: overwrite if exists
        "-n", f"tiles_{name}",
        "-d", "scripts/convert_ifc.py",
        "-d", str(f),
        "-o", str(out),
        "python", "scripts/convert_ifc.py",
        str(f),
        str(out)
    ], check=True)