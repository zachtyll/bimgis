# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictBytes, StrictStr  # noqa: F401
from typing import Any, List, Tuple, Union  # noqa: F401
from openapi_server.models.coloring_get import ColoringGET  # noqa: F401
from openapi_server.models.selection_get import SelectionGET  # noqa: F401
from openapi_server.models.viewpoint_get import ViewpointGET  # noqa: F401
from openapi_server.models.viewpoint_post import ViewpointPOST  # noqa: F401
from openapi_server.models.visibility_get import VisibilityGET  # noqa: F401


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_get

    Get Viewpoints
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_post(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_post

    Create Viewpoint
    """
    viewpoint_post = {"index":10,"perspective_camera":{"camera_view_point":{"x":0.0,"y":0.0,"z":0.0},"camera_direction":{"x":1.0,"y":1.0,"z":2.0},"camera_up_vector":{"x":0.0,"y":0.0,"z":1.0},"field_of_view":90.0,"aspect_ratio":1.33},"lines":[{"start_point":{"x":1.0,"y":1.0,"z":1.0},"end_point":{"x":0.0,"y":0.0,"z":0.0}}],"clipping_planes":[{"location":{"x":0.5,"y":0.5,"z":0.5},"direction":{"x":1.0,"y":0.0,"z":0.0}}],"bitmaps":[{"bitmap_type":"jpg","bitmap_data":"SGVsbG8gV29ybGQh","location":{"x":10.0,"y":-10.0,"z":7.0},"normal":{"x":-1.0,"y":1.25,"z":0.0},"up":{"x":-5.4,"y":-4.3,"z":1.0},"height":1666}],"snapshot":{"snapshot_type":"png","snapshot_data":"SGVsbG8gV29ybGQh"},"components":{"selection":[{"ifc_guid":"2MF28NhmDBiRVyFakgdbCT","originating_system":"Example CAD Application","authoring_tool_id":"EXCAD/v1.0"}],"coloring":[{"color":"ff0000","components":[{"ifc_guid":"3$cshxZO9AJBebsni$z9Yk"}]}],"visibility":{"default_visibility":false,"exceptions":[{"ifc_guid":"4$cshxZO9AJBebsni$z9Yk"}],"view_setup_hints":{"spaces_visible":true,"space_boundaries_visible":false,"openings_visible":true}}}}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=viewpoint_post,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_get

    Get Viewpoint
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_delete(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_delete

    Delete Viewpoint
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_snapshot_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_snapshot_get

    Get Snapshot
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/snapshot".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_bitmaps_bitmap_id_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_bitmaps_bitmap_id_get

    Get Bitmap
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/bitmaps/{bitmap_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example', bitmap_id='bitmap_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_selection_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_selection_get

    Get Selection
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/selection".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_coloring_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_coloring_get

    Get Coloring
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/coloring".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_visibility_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_viewpoints_viewpoint_id_visibility_get

    Get Visibility
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/visibility".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', viewpoint_id='viewpoint_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

