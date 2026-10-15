# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictStr
from typing import List
from openapi_server.models.file_get import FileGET
from openapi_server.models.file_put import FilePUT
from openapi_server.models.project_file_information import ProjectFileInformation


class BaseFilesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseFilesApi.subclasses = BaseFilesApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_files_information_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
    ) -> List[ProjectFileInformation]:
        """Retrieve a collection of project_file_informations to support allowing users to choose which Files (models) to reference in the header of topics created on the server. """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_files_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> List[FileGET]:
        """Retrieve a collection of file references as topic header.  Implementer Note: The reference property can either be an Uri or a server specific id. Uris are given as absolute paths to the model files while ids reference a custom id of the model file and require custom logic per server to retrieve it. This allows referencing of files on the server but requires clients to know how to retrieve files in a specific implementation. """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_files_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        file_put: List[FilePUT],
    ) -> List[FileGET]:
        """Update a collection of file references on the topic header. This operation is only possible when the server returns the updateFiles flag in the Topic authorization, see section 3.2.8 """
        ...
