# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.viewpoints_api_base import BaseViewpointsApi
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
from pydantic import StrictBytes, StrictStr
from typing import Any, List, Tuple, Union
from openapi_server.models.coloring_get import ColoringGET
from openapi_server.models.selection_get import SelectionGET
from openapi_server.models.viewpoint_get import ViewpointGET
from openapi_server.models.viewpoint_post import ViewpointPOST
from openapi_server.models.visibility_get import VisibilityGET


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints",
    responses={
        200: {"model": List[ViewpointGET], "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Viewpoints",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
) -> List[ViewpointGET]:
    """Retrieve a collection of all viewpoints related to a topic."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_get(version, project_id, topic_id)


@router.post(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints",
    responses={
        201: {"model": ViewpointGET, "description": "Created"},
    },
    tags=["Viewpoints"],
    summary="Create Viewpoint",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_post(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_post: ViewpointPOST = Body(None, description=""),
) -> ViewpointGET:
    """Add a new viewpoint. Viewpoints are immutable, meaning that they should never change. Requirements for different visualizations should be handled by creating new viewpoint elements. This operation is only possible when the server returns the createViewpoint flag in the Topic authorization, see section 3.2.8 """
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_post(version, project_id, topic_id, viewpoint_post)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}",
    responses={
        200: {"model": ViewpointGET, "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Viewpoint",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
) -> ViewpointGET:
    """Retrieve a specific viewpoint."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_get(version, project_id, topic_id, viewpoint_id)


@router.delete(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}",
    responses={
        200: {"description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Delete Viewpoint",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_delete(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
) -> None:
    """Deletes a single viewpoint. This operation is only possible when the server returns the delete flag in the Viewpoint authorization, see section 3.5.10"""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_delete(version, project_id, topic_id, viewpoint_id)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/snapshot",
    responses={
        200: {"model": file, "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Snapshot",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_snapshot_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
) -> file:
    """Retrieve a viewpoints snapshot (png or jpg) as image file. A viewpoint contains a snapshot if viewpoint.snapshot !&#x3D; null."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_snapshot_get(version, project_id, topic_id, viewpoint_id)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/bitmaps/{bitmap_id}",
    responses={
        200: {"model": file, "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Bitmap",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_bitmaps_bitmap_id_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
    bitmap_id: StrictStr = Path(..., description=""),
) -> file:
    """Retrieve a specific viewpoints bitmap image file (png or jpg)."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_bitmaps_bitmap_id_get(version, project_id, topic_id, viewpoint_id, bitmap_id)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/selection",
    responses={
        200: {"model": SelectionGET, "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Selection",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_selection_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
) -> SelectionGET:
    """Retrieve a collection of all selected components in a viewpoint."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_selection_get(version, project_id, topic_id, viewpoint_id)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/coloring",
    responses={
        200: {"model": ColoringGET, "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Coloring",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_coloring_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
) -> ColoringGET:
    """Retrieve a collection of all colored components in a viewpoint."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_coloring_get(version, project_id, topic_id, viewpoint_id)


@router.get(
    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/visibility",
    responses={
        200: {"model": VisibilityGET, "description": "OK"},
    },
    tags=["Viewpoints"],
    summary="Get Visibility",
    response_model_by_alias=True,
)
async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_visibility_get(
    version: StrictStr = Path('3.0', description=""),
    project_id: StrictStr = Path(..., description=""),
    topic_id: StrictStr = Path(..., description=""),
    viewpoint_id: StrictStr = Path(..., description=""),
) -> VisibilityGET:
    """Retrieve visibility of components in a viewpoint."""
    if not BaseViewpointsApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseViewpointsApi.subclasses[0]().bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_visibility_get(version, project_id, topic_id, viewpoint_id)
