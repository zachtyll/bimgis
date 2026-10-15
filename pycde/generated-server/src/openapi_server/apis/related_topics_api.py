# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.related_topics_api_base import BaseRelatedTopicsApi
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
from openapi_server.models.related_topic_get import RelatedTopicGET
from openapi_server.models.related_topic_put import RelatedTopicPUT


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/related_topics",
    responses={
        200: {"model": List[RelatedTopicGET], "description": "OK"},
    },
    tags=["Related Topics"],
    summary="Get Related Topics",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_related_topics_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> List[RelatedTopicGET]:
    """Retrieve a collection of all related topics to a topic."""
    if not BaseRelatedTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseRelatedTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_related_topics_get(version, project_id, topic_id)


@router.put(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/related_topics",
    responses={
        200: {"model": List[RelatedTopicGET], "description": "OK"},
    },
    tags=["Related Topics"],
    summary="Update Related Topics",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_related_topics_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    related_topic_put: List[RelatedTopicPUT] = Body(None, description=""),
) -> List[RelatedTopicGET]:
    """Add or update a collection of all related topics to a topic. This operation is only possible when the server returns the updateRelatedTopics flag in the Topic authorization, see section 3.2.8 """
    if not BaseRelatedTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseRelatedTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_related_topics_put(version, project_id, topic_id, related_topic_put)
