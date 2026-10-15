# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictStr
from typing import List
from openapi_server.models.document_reference_get import DocumentReferenceGET
from openapi_server.models.document_reference_post import DocumentReferencePOST
from openapi_server.models.document_reference_put import DocumentReferencePUT


class BaseDocumentReferencesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseDocumentReferencesApi.subclasses = BaseDocumentReferencesApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_topic_id_document_references_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> List[DocumentReferenceGET]:
        """Add a document reference to a topic. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 3.2.8 """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_document_references_post(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        document_reference_post: DocumentReferencePOST,
    ) -> DocumentReferenceGET:
        """Add a document reference to a topic. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 4.2.8  Should either reference an internal or an external document.  Internal document_guid must match an existing document in the project url must be null External document_guid must be null url must be the url to the external resource """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_document_references_document_reference_id_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        document_reference_id: StrictStr,
        document_reference_put: DocumentReferencePUT,
    ) -> DocumentReferenceGET:
        """Update an existing document reference identified by guid. Uses the same rules as POST Document Reference Service. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 4.2.8 """
        ...
