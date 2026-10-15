# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.documents_api_base import BaseDocumentsApi
import openapi_server.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    HTTPException,
    Path,
    Query,
    Response,
    Security,
    status,
)

from openapi_server.models.extra_models import TokenModel  # noqa: F401
from pydantic import StrictBytes, StrictStr
from typing import List, Tuple, Union
from openapi_server.models.document_get import DocumentGET


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/documents",
    responses={
        200: {"model": List[DocumentGET], "description": "OK"},
    },
    tags=["Documents"],
    summary="Get Documents",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_documents_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> List[DocumentGET]:
    """Retrieve a collection of all documents uploaded to a project. """
    if not BaseDocumentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseDocumentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_documents_get(version, project_id, topic_id)


@router.post(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/documents",
    responses={
        200: {"model": DocumentGET, "description": "OK"},
    },
    tags=["Documents"],
    summary="Create Document",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_documents_post(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    body: Union[StrictBytes, StrictStr, Tuple[StrictStr, StrictBytes]] = Body(None, description=""),
) -> DocumentGET:
    """Upload a document (binary file) to a project. This operation is only possible when the server returns the createDocument flag in the Project authorization, see section 4.1.5 """
    if not BaseDocumentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseDocumentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_documents_post(version, project_id, topic_id, body)


@router.get(
    "/bcf/{version}/projects/{project_id}/documents/{document_id}",
    responses={
        200: {"model": file, "description": "OK"},
    },
    tags=["Documents"],
    summary="Get Document",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_documents_document_id_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    document_id: StrictStr = Path(..., description=""),
) -> file:
    """Retrieves a document as binary file. """
    if not BaseDocumentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseDocumentsApi.subclasses[0]().bcf_version_projects_project_id_documents_document_id_get(version, project_id, document_id)
