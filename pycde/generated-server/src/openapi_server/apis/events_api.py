# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.events_api_base import BaseEventsApi
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
from typing import List, Optional
from typing_extensions import Annotated
from openapi_server.models.comment_event_get import CommentEventGET
from openapi_server.models.topic_event_get import TopicEventGET


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/events",
    responses={
        200: {"model": List[TopicEventGET], "description": "OK"},
    },
    tags=["Events"],
    summary="Get Topics Events",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_events_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    top: Optional[StrictStr] = Query(None, description="", alias="$top"),
    skip: Optional[StrictStr] = Query(None, description="", alias="$skip"),
    filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     ", alias="$filter"),
    orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ", alias="$orderby"),
) -> List[TopicEventGET]:
    """Retrieves a document as binary file. """
    if not BaseEventsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEventsApi.subclasses[0]().bcf_version_projects_project_id_topics_events_get(version, project_id, top, skip, filter, orderby)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/events",
    responses={
        200: {"model": List[TopicEventGET], "description": "OK"},
    },
    tags=["Events"],
    summary="Get Topic Events",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_events_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    top: Optional[StrictStr] = Query(None, description="", alias="$top"),
    skip: Optional[StrictStr] = Query(None, description="", alias="$skip"),
    filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     ", alias="$filter"),
    orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ", alias="$orderby"),
) -> List[TopicEventGET]:
    """Retrieve a collection of topic events related to a project (default sort order is date). """
    if not BaseEventsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEventsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_events_get(version, project_id, topic_id, top, skip, filter, orderby)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/comments/events",
    responses={
        200: {"model": List[CommentEventGET], "description": "OK"},
    },
    tags=["Events"],
    summary="Get Comments Events",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_comments_events_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    top: Optional[StrictStr] = Query(None, description="", alias="$top"),
    skip: Optional[StrictStr] = Query(None, description="", alias="$skip"),
    filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |comment_guid|string|guid of the comment | |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |comment_guid|string|guid of the comment | |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| ", alias="$filter"),
    orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ", alias="$orderby"),
) -> List[CommentEventGET]:
    """Retrieve a collection of comment events related to a project (default sort order is date). """
    if not BaseEventsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEventsApi.subclasses[0]().bcf_version_projects_project_id_topics_comments_events_get(version, project_id, top, skip, filter, orderby)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}/events",
    responses={
        200: {"model": List[CommentEventGET], "description": "OK"},
    },
    tags=["Events"],
    summary="Get Comment Event",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_events_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    comment_id: StrictStr = Path(..., description=""),
    top: Optional[StrictStr] = Query(None, description="", alias="$top"),
    skip: Optional[StrictStr] = Query(None, description="", alias="$skip"),
    filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| ", alias="$filter"),
    orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")] = Query(None, description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ", alias="$orderby"),
) -> List[CommentEventGET]:
    """Retrieve a collection of comment events related to a comment (default sort order is date). """
    if not BaseEventsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEventsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_comments_comment_id_events_get(version, project_id, topic_id, comment_id, top, skip, filter, orderby)
