# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictStr  # noqa: F401
from typing import Any, List, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from openapi_server.models.comment_get import CommentGET  # noqa: F401
from openapi_server.models.comment_post import CommentPOST  # noqa: F401
from openapi_server.models.comment_put import CommentPUT  # noqa: F401


def test_bcf_version_projects_project_id_topics_topic_id_comments_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_comments_get

    Get Comments
    """
    params = [("filter", 'assigned_to eq \'Architect@example.com\' and topic_status eq \'Open\' and creation_date gt 2015-12-05T00:00:00+01:00'),     ("orderby", 'modified_date desc')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_comments_post(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_comments_post

    Create Comment
    """
    comment_post = {"comment":"will rework the heating model"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=comment_post,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_comments_comment_id_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_comments_comment_id_get

    Get Comment
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', comment_id='comment_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_comments_comment_id_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_comments_comment_id_put

    Update Comment
    """
    comment_put = {"comment":"will rework the heating model and fix the ventilation"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', comment_id='comment_id_example'),
    #    headers=headers,
    #    json=comment_put,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_comments_comment_id_delete(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_comments_comment_id_delete

    Delete Comment
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', comment_id='comment_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

