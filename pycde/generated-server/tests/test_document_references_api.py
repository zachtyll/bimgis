# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictStr  # noqa: F401
from typing import List  # noqa: F401
from openapi_server.models.document_reference_get import DocumentReferenceGET  # noqa: F401
from openapi_server.models.document_reference_post import DocumentReferencePOST  # noqa: F401
from openapi_server.models.document_reference_put import DocumentReferencePUT  # noqa: F401


def test_bcf_version_projects_project_id_topics_topic_id_document_references_get(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_document_references_get

    Get Document References
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_document_references_post(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_document_references_post

    Create Document Reference
    """
    document_reference_post = {"url":"http://example.com/files/LegalRequirements.pdf","description":"The legal requirements for buildings."}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example'),
    #    headers=headers,
    #    json=document_reference_post,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_bcf_version_projects_project_id_topics_topic_id_document_references_document_reference_id_put(client: TestClient):
    """Test case for bcf_version_projects_project_id_topics_topic_id_document_references_document_reference_id_put

    Update Document Reference
    """
    document_reference_put = {"url":"http://example.com/files/LegalRequirements_Update.pdf","description":"The legal requirements for buildings."}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references/{document_reference_id}".format(version='3.0', project_id='project_id_example', topic_id='topic_id_example', document_reference_id='document_reference_id_example'),
    #    headers=headers,
    #    json=document_reference_put,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

