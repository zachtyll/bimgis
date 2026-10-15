import os
from datetime import datetime, timezone
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
)

bucket = "bimgis-3d-tiles"
prefix = "DigitalHub_FM-ARC_v2/v1/ifc/"

# Test window
start = datetime(2026, 6, 2, 9, 32, 18, tzinfo=timezone.utc)
end = datetime(2026, 6, 2, 9, 32, 19, 500000, tzinfo=timezone.utc)

print(f"Start: {start}")
print(f"End:   {end}")
print()

paginator = s3.get_paginator("list_objects_v2")

total = 0
matches = 0

for page in paginator.paginate(
    Bucket=bucket,
    Prefix=prefix,
):
    for obj in page.get("Contents", []):
        total += 1

        modified = obj["LastModified"]

        if start <= modified < end:
            print(f"MATCH  {modified}  {obj['Key']}")
            matches += 1

print()
print(f"Total objects: {total}")
print(f"Matching objects: {matches}")