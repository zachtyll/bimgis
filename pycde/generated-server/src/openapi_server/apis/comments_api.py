# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.comments_api_base import BaseCommentsApi
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
from openapi_server.models.comment_get import CommentGET
from openapi_server.models.comment_post import CommentPOST
from openapi_server.models.comment_put import CommentPUT


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments",
    responses={
        200: {"model": List[CommentGET], "description": "OK"},
    },
    tags=["Comments"],
    summary="Get Comments",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_comments_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|creation date of a comment| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|creation date of a comment| ", alias="$filter"),
    orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|creation date of a comment| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|creation date of a comment| ", alias="$orderby"),
) -> List[CommentGET]:
    """Retrieve a collection of all comments related to a topic (default ordering is date)."""
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_comments_get(version, project_id, topic_id, filter, orderby)


@router.post(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments",
    responses={
        201: {"model": CommentGET, "description": "Created"},
    },
    tags=["Comments"],
    summary="Create Comment",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_comments_post(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    comment_post: CommentPOST = Body(None, description=""),
) -> CommentGET:
    """Add a new comment to a topic. This operation is only possible when the server returns the createComment flag in the Topic authorization, see section 3.2.8"""
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_comments_post(version, project_id, topic_id, comment_post)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}",
    responses={
        200: {"model": CommentGET, "description": "OK"},
    },
    tags=["Comments"],
    summary="Get Comment",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    comment_id: StrictStr = Path(..., description=""),
) -> CommentGET:
    """Get a single comment."""
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_comments_comment_id_get(version, project_id, topic_id, comment_id)


@router.put(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}",
    responses={
        200: {"model": CommentGET, "description": "OK"},
    },
    tags=["Comments"],
    summary="Update Comment",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    comment_id: StrictStr = Path(..., description=""),
    comment_put: CommentPUT = Body(None, description=""),
) -> CommentGET:
    """Update a single comment, description similar to POST. This operation is only possible when the server returns the update flag in the Comment authorization, see section 3.4.6 """
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_comments_comment_id_put(version, project_id, topic_id, comment_id, comment_put)


@router.delete(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}",
    responses={
        200: {"description": "OK"},
    },
    tags=["Comments"],
    summary="Delete Comment",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_delete(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    comment_id: StrictStr = Path(..., description=""),
) -> None:
    """Deletes a single comment. This operation is only possible when the server returns the delete flag in the Comment authorization, see section 3.4.6"""
    if not BaseCommentsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCommentsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_comments_comment_id_delete(version, project_id, topic_id, comment_id)
