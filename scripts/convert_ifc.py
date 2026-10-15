# convert_ifc.py
from pathlib import Path
from py3dtiles.convert import Converter
from py3dtiles.tilers.ifc.ifc_tiler import IfcTiler
from multiprocessing import freeze_support
import sys


def main():
    ifc_file = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    tiler = IfcTiler(verbosity=0)

    converter = Converter([tiler])

    converter.convert(
        ifc_file,
        out_dir,
        overwrite=True,
    )

if __name__ == "__main__":
    freeze_support()
    main()