# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.document_references_api_base import BaseDocumentReferencesApi
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
from pydantic import StrictStr
from typing import List
from openapi_server.models.document_reference_get import DocumentReferenceGET
from openapi_server.models.document_reference_post import DocumentReferencePOST
from openapi_server.models.document_reference_put import DocumentReferencePUT


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references",
    responses={
        200: {"model": List[DocumentReferenceGET], "description": "OK"},
    },
    tags=["Document References"],
    summary="Get Document References",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_document_references_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> List[DocumentReferenceGET]:
    """Add a document reference to a topic. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 3.2.8 """
    if not BaseDocumentReferencesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseDocumentReferencesApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_document_references_get(version, project_id, topic_id)


@router.post(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references",
    responses={
        201: {"model": DocumentReferenceGET, "description": "Created"},
    },
    tags=["Document References"],
    summary="Create Document Reference",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_document_references_post(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    document_reference_post: DocumentReferencePOST = Body(None, description=""),
) -> DocumentReferenceGET:
    """Add a document reference to a topic. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 4.2.8  Should either reference an internal or an external document.  Internal document_guid must match an existing document in the project url must be null External document_guid must be null url must be the url to the external resource """
    if not BaseDocumentReferencesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseDocumentReferencesApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_document_references_post(version, project_id, topic_id, document_reference_post)


@router.put(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references/{document_reference_id}",
    responses={
        200: {"model": DocumentReferenceGET, "description": "OK"},
    },
    tags=["Document References"],
    summary="Update Document Reference",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_document_references_document_reference_id_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    document_reference_id: StrictStr = Path(..., description=""),
    document_reference_put: DocumentReferencePUT = Body(None, description=""),
) -> DocumentReferenceGET:
    """Update an existing document reference identified by guid. Uses the same rules as POST Document Reference Service. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 4.2.8 """
    if not BaseDocumentReferencesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseDocumentReferencesApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_document_references_document_reference_id_put(version, project_id, topic_id, document_reference_id, document_reference_put)
