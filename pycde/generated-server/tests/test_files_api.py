# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictStr  # noqa: F401
from typing import List  # noqa: F401
from openapi_server.models.file_get import FileGET  # noqa: F401
from openapi_server.models.file_put import FilePUT  # noqa: F401
from openapi_server.models.project_file_information import ProjectFileInformation  # noqa: F401


def test_bcf_version_projects_project_id_files_information_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_files_information_get

    Get Files Information
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/files_information".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_files_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_files_get

    Get Files
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/files".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_files_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_files_put

    Update File
    """
    file_put = [[{"ifc_project":"0J$yPqHBD12v72y4qF6XcD","filename":"OfficeBuilding_Architecture_0001.ifc","reference":"https://example.com/files/0J$yPqHBD12v72y4qF6XcD_0001.ifc"},{"ifc_project":"3hwBHP91jBRwPsmyf$3Hea","filename":"OfficeBuilding_Heating_0003.ifc","reference":"https://example.com/files/3hwBHP91jBRwPsmyf$3Hea_0003.ifc"}]]

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/files".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=file_put,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

