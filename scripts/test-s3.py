import os
from pathlib import Path
import boto3
import sys
import json

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
)

bucket = "bimgis-3d-tiles"
key = "ISSUE_098_R8_F1_MAB_AR_M3_XX_XXX_MO_7000/v1/tileset.json"

# obj = s3.get_object(Bucket=bucket, Key=key)
# j = json.loads(obj['Body'].read())
# print(j)

response = s3.list_objects_v2(
    Bucket=bucket,
    Prefix="",  # or more specific like "ISSUE_"
)
for obj in response.get("Contents", []):
    print(obj["Key"])
