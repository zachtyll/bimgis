import os
from pathlib import Path
import boto3
import sys

tiles_dir = Path(sys.argv[1])
building = sys.argv[2]

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
)

bucket = "bimgis-3d-tiles"

for file in tiles_dir.rglob("*"):
    if file.is_file():
        rel = file.relative_to(tiles_dir).as_posix()

        key = f"{building}/v1/{rel}"

        s3.upload_file(
            str(file),
            bucket,
            key,
        )