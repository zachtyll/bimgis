# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictStr
from typing import List
from openapi_server.models.extensions_get import ExtensionsGET
from openapi_server.models.project_get import ProjectGET
from openapi_server.models.project_put import ProjectPUT


class BaseProjectApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseProjectApi.subclasses = BaseProjectApi.subclasses + (cls,)
    async def bcf_version_projects_get(
        self,
        version: StrictStr,
    ) -> List[ProjectGET]:
        """Retrieve a collection of projects where the currently logged on user has access to."""
        ...


    async def bcf_version_projects_project_id_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
    ) -> ProjectGET:
        """Retrieve a specific project."""
        ...


    async def bcf_version_projects_project_id_put(
        self,
        version: StrictStr,
        project_id: StrictStr,
        project_put: ProjectPUT,
    ) -> ProjectGET:
        """Modify a specific project. This operation is only possible when the server returns the update flag in the Project authorization, see section 3.1.5"""
        ...


    async def bcf_version_projects_project_id_extensions_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
    ) -> ExtensionsGET:
        """Retrieve a specific projects extensions. Project extensions are used to define possible values that can be used in topics and comments, for example topic labels and priorities. They may change during the course of a project. The most recent extensions state which values are valid at a given moment for newly created topics and comments. """
        ...
