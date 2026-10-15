import dagster as dg
import os
import boto3
from py3dtiles.convert import Converter
from py3dtiles.tilers.ifc.ifc_tiler import IfcTiler
from pathlib import Path


@dg.asset
def ifc_file():

    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
    )

    os.makedirs("work", exist_ok=True)

    local_path = "work/input.ifc"

    s3.download_file(
        Bucket="ifc",
        Key="DigitalHub.ifc",
        Filename=local_path,
    )

    return local_path

@dg.asset
def tiles(ifc_file):
    out_dir = Path("work/tiles")
    out_dir.mkdir(parents=True, exist_ok=True)

    tiler = IfcTiler(verbosity=0)
    converter = Converter([tiler])

    converter.convert(ifc_file, out_dir, overwrite=True)

    return str(out_dir)


@dg.asset
def upload_tiles(tiles):
    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
    )

    bucket = "bimgis-3d-tiles"

    for root, _, files in os.walk(tiles):
        for f in files:
            path = os.path.join(root, f)
            key = os.path.relpath(path, tiles).replace("\\", "/")

            s3.upload_file(path, bucket, key)

    return bucket