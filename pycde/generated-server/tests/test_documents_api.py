# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictBytes, StrictStr  # noqa: F401
from typing import List, Tuple, Union  # noqa: F401
from openapi_server.models.document_get import DocumentGET  # noqa: F401


def test_bcf_version_projects_project_id_topics_topic_id_documents_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_documents_get

    Get Documents
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/documents".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_documents_post(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_documents_post

    Create Document
    """
    body = '/path/to/file'

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/documents".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=body,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_documents_document_id_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_documents_document_id_get

    Get Document
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/documents/{document_id}".format(version='3.0', project_id='project_id_example', document_id='document_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

