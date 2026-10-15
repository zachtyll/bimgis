# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictStr
from typing import List
from openapi_server.models.related_topic_get import RelatedTopicGET
from openapi_server.models.related_topic_put import RelatedTopicPUT


class BaseRelatedTopicsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseRelatedTopicsApi.subclasses = BaseRelatedTopicsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_topic_id_related_topics_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> List[RelatedTopicGET]:
        """Retrieve a collection of all related topics to a topic."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_related_topics_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        related_topic_put: List[RelatedTopicPUT],
    ) -> List[RelatedTopicGET]:
        """Add or update a collection of all related topics to a topic. This operation is only possible when the server returns the updateRelatedTopics flag in the Topic authorization, see section 3.2.8 """
        ...
