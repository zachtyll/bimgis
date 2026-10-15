# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictStr
from typing import Any, List, Optional
from typing_extensions import Annotated
from openapi_server.models.comment_get import CommentGET
from openapi_server.models.comment_post import CommentPOST
from openapi_server.models.comment_put import CommentPUT


class BaseCommentsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseCommentsApi.subclasses = BaseCommentsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_topic_id_comments_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        filter: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|creation date of a comment| ")],
        orderby: Annotated[Optional[StrictStr], Field(description="Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|creation date of a comment| ")],
    ) -> List[CommentGET]:
        """Retrieve a collection of all comments related to a topic (default ordering is date)."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_comments_post(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        comment_post: CommentPOST,
    ) -> CommentGET:
        """Add a new comment to a topic. This operation is only possible when the server returns the createComment flag in the Topic authorization, see section 3.2.8"""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        comment_id: StrictStr,
    ) -> CommentGET:
        """Get a single comment."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        comment_id: StrictStr,
        comment_put: CommentPUT,
    ) -> CommentGET:
        """Update a single comment, description similar to POST. This operation is only possible when the server returns the update flag in the Comment authorization, see section 3.4.6 """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_comments_comment_id_delete(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        comment_id: StrictStr,
    ) -> None:
        """Deletes a single comment. This operation is only possible when the server returns the delete flag in the Comment authorization, see section 3.4.6"""
        ...
