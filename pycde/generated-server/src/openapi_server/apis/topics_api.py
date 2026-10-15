# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.topics_api_base import BaseTopicsApi
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
from pydantic import Field, StrictStr
from typing import Any, List, Optional
from typing_extensions import Annotated
from openapi_server.models.topic_get import TopicGET
from openapi_server.models.topic_post import TopicPOST
from openapi_server.models.topic_put import TopicPUT


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics",
    responses={
        200: {"model": List[TopicGET], "description": "OK"},
    },
    tags=["Topics"],
    summary="Get Topics",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |creation_author|string|userId of the creation author (value from extensions)| |modified_author|string|userId of the modified author (value from extensions)| |assigned_to|string|userId of the assigned person (value from extensions)| |stage|string|stage this topic is part of (value from extensions)| |topic_status|string|status of a topic (value from extensions)| |topic_type|string|type of a topic (value from extensions)| |creation_date|datetime|creation date of a topic| |modified_date|datetime|modification date of a topic| |labels|array (string)|labels of a topic (value from extensions)| |priority|string|priority of a topic (value from extensions)| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |creation_author|string|userId of the creation author (value from extensions)| |modified_author|string|userId of the modified author (value from extensions)| |assigned_to|string|userId of the assigned person (value from extensions)| |stage|string|stage this topic is part of (value from extensions)| |topic_status|string|status of a topic (value from extensions)| |topic_type|string|type of a topic (value from extensions)| |creation_date|datetime|creation date of a topic| |modified_date|datetime|modification date of a topic| |labels|array (string)|labels of a topic (value from extensions)| |priority|string|priority of a topic (value from extensions)| ", alias="$filter"),
    orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |creation_date|creation date of a topic| |modified_date|modification date of a topic| |server_assigned_id|the server_assigned_id of the topic| |index|index of a topic|    ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |creation_date|creation date of a topic| |modified_date|modification date of a topic| |server_assigned_id|the server_assigned_id of the topic| |index|index of a topic|    ", alias="$orderby"),
    top: Optional[StrictStr] = Query(None, description="", alias="$top"),
    skip: Optional[StrictStr] = Query(None, description="", alias="$skip"),
) -> List[TopicGET]:
    """Retrieve a collection of topics related to a project (default sort order is creation_date)."""
    if not BaseTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_get(version, project_id, filter, orderby, top, skip)


@router.post(
    "/bcf/{version}/projects/{project_id}/topics",
    responses={
        201: {"model": TopicGET, "description": "Created"},
    },
    tags=["Topics"],
    summary="Create Topic",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_post(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_post: TopicPOST = Body(None, description=""),
) -> TopicGET:
    """Add a new topic. This operation is only possible when the server returns the createTopic flag in the Project authorization, see section 3.1.5"""
    if not BaseTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_post(version, project_id, topic_post)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}",
    responses={
        200: {"model": TopicGET, "description": "OK"},
    },
    tags=["Topics"],
    summary="Get Topic",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> TopicGET:
    """Retrieve a specific topic."""
    if not BaseTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_get(version, project_id, topic_id)


@router.put(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}",
    responses={
        200: {"model": TopicGET, "description": "OK"},
    },
    tags=["Topics"],
    summary="Update Topic",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    topic_put: TopicPUT = Body(None, description=""),
) -> TopicGET:
    """Modify a specific topic, description similar to POST. This operation is only possible when the server returns the update flag in the Topic authorization, see section 3.2.8 """
    if not BaseTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_put(version, project_id, topic_id, topic_put)


@router.delete(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}",
    responses={
        200: {"description": "OK"},
    },
    tags=["Topics"],
    summary="Delete Topic",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_delete(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> None:
    """Deletes a single topic. This operation is only possible when the server returns the delete flag in the Topic authorization, see section 3.2.8"""
    if not BaseTopicsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseTopicsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_delete(version, project_id, topic_id)
