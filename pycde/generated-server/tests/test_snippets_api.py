# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictBytes, StrictStr  # noqa: F401
from typing import Any, Tuple, Union  # noqa: F401


def test_bcf_version_projects_project_id_topics_topic_id_snippet_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_snippet_get

    Get Snippet
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/snippet".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_snippet_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_snippet_put

    Update Snippet
    """
    body = '/path/to/file'

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/snippet".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=body,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

