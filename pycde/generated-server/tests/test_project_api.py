# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictStr  # noqa: F401
from typing import List  # noqa: F401
from openapi_server.models.extensions_get import ExtensionsGET  # noqa: F401
from openapi_server.models.project_get import ProjectGET  # noqa: F401
from openapi_server.models.project_put import ProjectPUT  # noqa: F401


def test_bcf_version_projects_get(client: TestClient):
    """Test case for bcf_version_projects_get

    Get Projects
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects".format(version='3.0'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_get

    Get Project
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_put

    Update Project
    """
    project_put = openapi_server.ProjectPUT()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #    json=project_put,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_extensions_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_extensions_get

    Get Project Extensions
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/extensions".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

