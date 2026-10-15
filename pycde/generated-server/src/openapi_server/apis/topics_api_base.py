# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictStr
from typing import Any, List, Optional
from typing_extensions import Annotated
from openapi_server.models.topic_get import TopicGET
from openapi_server.models.topic_post import TopicPOST
from openapi_server.models.topic_put import TopicPUT


class BaseTopicsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseTopicsApi.subclasses = BaseTopicsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |creation_author|string|userId of the creation author (value from extensions)| |modified_author|string|userId of the modified author (value from extensions)| |assigned_to|string|userId of the assigned person (value from extensions)| |stage|string|stage this topic is part of (value from extensions)| |topic_status|string|status of a topic (value from extensions)| |topic_type|string|type of a topic (value from extensions)| |creation_date|datetime|creation date of a topic| |modified_date|datetime|modification date of a topic| |labels|array (string)|labels of a topic (value from extensions)| |priority|string|priority of a topic (value from extensions)| ")],
        orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |creation_date|creation date of a topic| |modified_date|modification date of a topic| |server_assigned_id|the server_assigned_id of the topic| |index|index of a topic|    ")],
        top: Optional[StrictStr],
        skip: Optional[StrictStr],
    ) -> List[TopicGET]:
        """Retrieve a collection of topics related to a project (default sort order is creation_date)."""
        ...


    async def bcf_version_projects_project_id_topics_post(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_post: TopicPOST,
    ) -> TopicGET:
        """Add a new topic. This operation is only possible when the server returns the createTopic flag in the Project authorization, see section 3.1.5"""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> TopicGET:
        """Retrieve a specific topic."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        topic_put: TopicPUT,
    ) -> TopicGET:
        """Modify a specific topic, description similar to POST. This operation is only possible when the server returns the update flag in the Topic authorization, see section 3.2.8 """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_delete(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> None:
        """Deletes a single topic. This operation is only possible when the server returns the delete flag in the Topic authorization, see section 3.2.8"""
        ...
