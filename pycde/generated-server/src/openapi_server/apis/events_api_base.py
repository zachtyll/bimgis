# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictStr
from typing import List, Optional
from typing_extensions import Annotated
from openapi_server.models.comment_event_get import CommentEventGET
from openapi_server.models.topic_event_get import TopicEventGET


class BaseEventsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseEventsApi.subclasses = BaseEventsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_events_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        top: Optional[StrictStr],
        skip: Optional[StrictStr],
        filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     ")],
        orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")],
    ) -> List[TopicEventGET]:
        """Retrieves a document as binary file. """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_events_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        top: Optional[StrictStr],
        skip: Optional[StrictStr],
        filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     ")],
        orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")],
    ) -> List[TopicEventGET]:
        """Retrieve a collection of topic events related to a project (default sort order is date). """
        ...


    async def bcf_version_projects_project_id_topics_comments_events_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        top: Optional[StrictStr],
        skip: Optional[StrictStr],
        filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |comment_guid|string|guid of the comment | |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| ")],
        orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")],
    ) -> List[CommentEventGET]:
        """Retrieve a collection of comment events related to a project (default sort order is date). """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_events_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        comment_id: StrictStr,
        top: Optional[StrictStr],
        skip: Optional[StrictStr],
        filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| ")],
        orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| ")],
    ) -> List[CommentEventGET]:
        """Retrieve a collection of comment events related to a comment (default sort order is date). """
        ...
