# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictBytes, StrictStr
from typing import List, Tuple, Union
from openapi_server.models.document_get import DocumentGET


class BaseDocumentsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseDocumentsApi.subclasses = BaseDocumentsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_topic_id_documents_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> List[DocumentGET]:
        """Retrieve a collection of all documents uploaded to a project. """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_documents_post(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        body: Union[StrictBytes, StrictStr, Tuple[StrictStr, StrictBytes]],
    ) -> DocumentGET:
        """Upload a document (binary file) to a project. This operation is only possible when the server returns the createDocument flag in the Project authorization, see section 4.1.5 """
        ...


    async def bcf_version_projects_project_id_documents_document_id_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        document_id: StrictStr,
    ) -> file:
        """Retrieves a document as binary file. """
        ...
