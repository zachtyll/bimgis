import os
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import boto3
import sys
import json
import logging

logger = logging.getLogger("uvicorn")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/tiles/{path:path}")
async def tiles(path: str):
    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
    )

    bucket = "bimgis-3d-tiles"
    # key = "ISSUE_098_R8_F1_MAB_AR_M3_XX_XXX_MO_7000/v1/tileset.json"
    key = path

    logger.info(f"Requested key: {key}")

    obj = s3.get_object(Bucket=bucket, Key=key)
    # j = json.loads(obj['Body'].read())
    body = obj['Body'].read()
    
    return Response(
        content=body,
        media_type=obj["ContentType"]
    )

    # response = s3.list_objects_v2(
    #     Bucket=bucket,
    #     Prefix="",  # or more specific like "ISSUE_"
    # )
    # for obj in response.get("Contents", []):
    #     print(obj["Key"])

@app.get("/ifc/{path:path}")
async def get_ifc(path: str):
    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:9000"),
    )

    key = path

    obj = s3.get_object(Bucket="ifcfiles", Key=key)
    body = obj["Body"].read()

    return Response(
        content=body,
        media_type="application/octet-stream"
    )