# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.project_api_base import BaseProjectApi
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
from openapi_server.models.extensions_get import ExtensionsGET
from openapi_server.models.project_get import ProjectGET
from openapi_server.models.project_put import ProjectPUT


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects",
    responses={
        200: {"model": List[ProjectGET], "description": "OK"},
    },
    tags=["Project"],
    summary="Get Projects",
    response_model_by_alias=True,
)
async def bcf_version_projects_get(
    version: StrictStr = Path('3.0', description=""),
) -> List[ProjectGET]:
    """Retrieve a collection of projects where the currently logged on user has access to."""
    if not BaseProjectApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseProjectApi.subclasses[0]().bcf_version_projects_get(version)


@router.get(
    "/bcf/{version}/projects/{project_id}",
    responses={
        200: {"model": ProjectGET, "description": "OK"},
    },
    tags=["Project"],
    summary="Get Project",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
) -> ProjectGET:
    """Retrieve a specific project."""
    if not BaseProjectApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseProjectApi.subclasses[0]().bcf_version_projects_project_id_get(version, project_id)


@router.put(
    "/bcf/{version}/projects/{project_id}",
    responses={
        200: {"model": ProjectGET, "description": "OK"},
    },
    tags=["Project"],
    summary="Update Project",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_put(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    project_put: ProjectPUT = Body(None, description=""),
) -> ProjectGET:
    """Modify a specific project. This operation is only possible when the server returns the update flag in the Project authorization, see section 3.1.5"""
    if not BaseProjectApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseProjectApi.subclasses[0]().bcf_version_projects_project_id_put(version, project_id, project_put)


@router.get(
    "/bcf/{version}/projects/{project_id}/extensions",
    responses={
        200: {"model": ExtensionsGET, "description": "OK"},
    },
    tags=["Project"],
    summary="Get Project Extensions",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_extensions_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
) -> ExtensionsGET:
    """Retrieve a specific projects extensions. Project extensions are used to define possible values that can be used in topics and comments, for example topic labels and priorities. They may change during the course of a project. The most recent extensions state which values are valid at a given moment for newly created topics and comments. """
    if not BaseProjectApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseProjectApi.subclasses[0]().bcf_version_projects_project_id_extensions_get(version, project_id)
