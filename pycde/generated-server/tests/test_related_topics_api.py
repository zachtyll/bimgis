# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictStr  # noqa: F401
from typing import List  # noqa: F401
from openapi_server.models.related_topic_get import RelatedTopicGET  # noqa: F401
from openapi_server.models.related_topic_put import RelatedTopicPUT  # noqa: F401


def test_bcf_version_projects_project_id_topics_topic_id_related_topics_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_related_topics_get

    Get Related Topics
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/related_topics".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_related_topics_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_related_topics_put

    Update Related Topics
    """
    related_topic_put = [[openapi_server.RelatedTopicPUT()]]

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/related_topics".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=related_topic_put,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

