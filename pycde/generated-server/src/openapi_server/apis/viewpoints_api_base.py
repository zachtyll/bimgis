# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictBytes, StrictStr
from typing import Any, List, Tuple, Union
from openapi_server.models.coloring_get import ColoringGET
from openapi_server.models.selection_get import SelectionGET
from openapi_server.models.viewpoint_get import ViewpointGET
from openapi_server.models.viewpoint_post import ViewpointPOST
from openapi_server.models.visibility_get import VisibilityGET


class BaseViewpointsApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseViewpointsApi.subclasses = BaseViewpointsApi.subclasses + (cls,)
    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
    ) -> List[ViewpointGET]:
        """Retrieve a collection of all viewpoints related to a topic."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_post(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_post: ViewpointPOST,
    ) -> ViewpointGET:
        """Add a new viewpoint. Viewpoints are immutable, meaning that they should never change. Requirements for different visualizations should be handled by creating new viewpoint elements. This operation is only possible when the server returns the createViewpoint flag in the Topic authorization, see section 3.2.8 """
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
    ) -> ViewpointGET:
        """Retrieve a specific viewpoint."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_delete(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
    ) -> None:
        """Deletes a single viewpoint. This operation is only possible when the server returns the delete flag in the Viewpoint authorization, see section 3.5.10"""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_snapshot_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
    ) -> file:
        """Retrieve a viewpoints snapshot (png or jpg) as image file. A viewpoint contains a snapshot if viewpoint.snapshot !&#x3D; null."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_bitmaps_bitmap_id_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
        bitmap_id: StrictStr,
    ) -> file:
        """Retrieve a specific viewpoints bitmap image file (png or jpg)."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_selection_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
    ) -> SelectionGET:
        """Retrieve a collection of all selected components in a viewpoint."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_coloring_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
    ) -> ColoringGET:
        """Retrieve a collection of all colored components in a viewpoint."""
        ...


    async def bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_visibility_get(
        self,
        version: StrictStr,
        project_id: StrictStr,
        topic_id: StrictStr,
        viewpoint_id: StrictStr,
    ) -> VisibilityGET:
        """Retrieve visibility of components in a viewpoint."""
        ...
