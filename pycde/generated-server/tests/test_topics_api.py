# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictStr  # noqa: F401
from typing import Any, List, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from openapi_server.models.topic_get import TopicGET  # noqa: F401
from openapi_server.models.topic_post import TopicPOST  # noqa: F401
from openapi_server.models.topic_put import TopicPUT  # noqa: F401


def test_bcf_version_projects_project_id_topics_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_get

    Get Topics
    """
    params = [("filter", 'assigned_to eq \'Architect@example.com\' and topic_status eq \'Open\' and creation_date gt 2015-12-05T00:00:00+01:00'),     ("orderby", 'modified_date desc'),     ("top", 'top_example'),     ("skip", 'skip_example')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_post(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_post

    Create Topic
    """
    topic_post = {"topic_type":"Clash","topic_status":"open","title":"Example topic 3","priority":"high","labels":["Architecture","Heating"],"assigned_to":"harry.muster@example.com","bim_snippet":{"snippet_type":"clash","is_external":true,"reference":"https://example.com/bcf/1.0/ADFE23AA11BCFF444122BB","reference_schema":"https://example.com/bcf/1.0/clash.xsd"}}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/bcf/{version}/projects/{project_id}/topics".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #    json=topic_post,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_get

    Get Topic
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_put

    Update Topic
    """
    topic_put = {"topic_type":"Clash","topic_status":"open","title":"Example topic 3 - Changed Title","priority":"high","labels":["Architecture","Heating"],"assigned_to":"harry.muster@example.com","bim_snippet":{"snippet_type":"clash","is_external":true,"reference":"https://example.com/bcf/1.0/ADFE23AA11BCFF444122BB","reference_schema":"https://example.com/bcf/1.0/clash.xsd"}}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=topic_put,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_delete(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_delete

    Delete Topic
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

