# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.snippets_api_base import BaseSnippetsApi
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
from typing import Any, Tuple, Union


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/snippet",
    responses={
        200: {"model": file, "description": "OK"},
    },
    tags=["Snippets"],
    summary="Get Snippet",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_snippet_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> file:
    """Retrieves a topics BIM-Snippet as binary file."""
    if not BaseSnippetsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseSnippetsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_snippet_get(version, project_id, topic_id)


@router.put(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/snippet",
    responses={
        200: {"description": "OK"},
    },
    tags=["Snippets"],
    summary="Update Snippet",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_snippet_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    body: Union[StrictBytes, StrictStr, Tuple[StrictStr, StrictBytes]] = Body(None, description=""),
) -> None:
    """Puts a new BIM Snippet binary file to a topic. If this is used, the parent topics BIM Snippet property is_external must be set to false and the reference must be the file name with extension. This operation is only possible when the server returns the updateBimSnippet flag in the Topic authorization, see section 3.2.8 """
    if not BaseSnippetsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseSnippetsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_snippet_put(version, project_id, topic_id, body)
