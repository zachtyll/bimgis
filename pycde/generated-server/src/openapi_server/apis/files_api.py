# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.files_api_base import BaseFilesApi
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
from pydantic import StrictStr
from typing import List
from openapi_server.models.file_get import FileGET
from openapi_server.models.file_put import FilePUT
from openapi_server.models.project_file_information import ProjectFileInformation


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/files_information",
    responses={
        200: {"model": List[ProjectFileInformation], "description": "OK"},
    },
    tags=["Files"],
    summary="Get Files Information",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_files_information_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
) -> List[ProjectFileInformation]:
    """Retrieve a collection of project_file_informations to support allowing users to choose which Files (models) to reference in the header of topics created on the server. """
    if not BaseFilesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseFilesApi.subclasses[0]().bcf_version_projects_project_id_files_information_get(version, project_id)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/files",
    responses={
        200: {"model": List[FileGET], "description": "OK"},
    },
    tags=["Files"],
    summary="Get Files",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_files_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> List[FileGET]:
    """Retrieve a collection of file references as topic header.  Implementer Note: The reference property can either be an Uri or a server specific id. Uris are given as absolute paths to the model files while ids reference a custom id of the model file and require custom logic per server to retrieve it. This allows referencing of files on the server but requires clients to know how to retrieve files in a specific implementation. """
    if not BaseFilesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseFilesApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_files_get(version, project_id, topic_id)


@router.put(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/files",
    responses={
        200: {"model": List[FileGET], "description": "OK"},
    },
    tags=["Files"],
    summary="Update File",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_files_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    file_put: List[FilePUT] = Body(None, description=""),
) -> List[FileGET]:
    """Update a collection of file references on the topic header. This operation is only possible when the server returns the updateFiles flag in the Topic authorization, see section 3.2.8 """
    if not BaseFilesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseFilesApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_files_put(version, project_id, topic_id, file_put)
