# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictBytes, StrictStr
from typing import Any, Tuple, Union


class BaseSnippetsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseSnippetsApi.subclasses = BaseSnippetsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_topic_id_snippet_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> file:
        """Retrieves a topics BIM-Snippet as binary file."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_snippet_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        body: Union[StrictBytes, StrictStr, Tuple[StrictStr, StrictBytes]],
    ) -> None:
        """Puts a new BIM Snippet binary file to a topic. If this is used, the parent topics BIM Snippet property is_external must be set to false and the reference must be the file name with extension. This operation is only possible when the server returns the updateBimSnippet flag in the Topic authorization, see section 3.2.8 """
        ...
