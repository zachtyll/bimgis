# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictStr  # noqa: F401
from typing import List, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from openapi_server.models.comment_event_get import CommentEventGET  # noqa: F401
from openapi_server.models.topic_event_get import TopicEventGET  # noqa: F401


def test_bcf_version_projects_project_id_topics_events_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_events_get

    Get Topics Events
    """
    params = [("top", 'top_example'),     ("skip", 'skip_example'),     ("filter", 'author eq \'Architect@example.com\' and type eq \'status_updated\' and date gt 2015-12-05T00:00:00+01:00&'),     ("orderby", 'date asc')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/events".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_events_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_events_get

    Get Topic Events
    """
    params = [("top", 'top_example'),     ("skip", 'skip_example'),     ("filter", 'author eq \'Architect@example.com\' and type eq \'status_updated\' and date gt 2015-12-05T00:00:00+01:00&'),     ("orderby", 'date asc')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/events".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_comments_events_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_comments_events_get

    Get Comments Events
    """
    params = [("top", 'top_example'),     ("skip", 'skip_example'),     ("filter", 'author eq \'Architect@example.com\' and date gt 2015-12-05T00:00:00+01:00 and type eq \'comment_created\''),     ("orderby", 'date asc')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/comments/events".format(version='3.0', project_id='project_id_example'),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_comments_comment_id_events_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_comments_comment_id_events_get

    Get Comment Event
    """
    params = [("top", 'top_example'),     ("skip", 'skip_example'),     ("filter", 'author eq \'Architect@example.com\' and date gt 2015-12-05T00:00:00+01:00 and type eq \'comment_created\''),     ("orderby", 'date asc')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}/events".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', comment_id='comment_id_example'),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

