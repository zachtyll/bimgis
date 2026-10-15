# BcfApi.DocumentReferencesApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesDocumentReferenceIdPut**](DocumentReferencesApi.md#bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesDocumentReferenceIdPut) | **PUT** /bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references/{document_reference_id} | Update Document Reference
[**bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesGet**](DocumentReferencesApi.md#bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references | Get Document References
[**bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesPost**](DocumentReferencesApi.md#bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesPost) | **POST** /bcf/{version}/projects/{project_id}/topics/{topic_id}/document_references | Create Document Reference



## bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesDocumentReferenceIdPut

> DocumentReferenceGET bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesDocumentReferenceIdPut(version, projectId, topicId, documentReferenceId, documentReferencePUT)

Update Document Reference

Update an existing document reference identified by guid. Uses the same rules as POST Document Reference Service. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 4.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.DocumentReferencesApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let documentReferenceId = "documentReferenceId_example"; // String | 
let documentReferencePUT = {"url":"http://example.com/files/LegalRequirements_Update.pdf","description":"The legal requirements for buildings."}; // DocumentReferencePUT | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesDocumentReferenceIdPut(version, projectId, topicId, documentReferenceId, documentReferencePUT, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **version** | **String**|  | [default to &#39;3.0&#39;]
 **projectId** | **String**|  | 
 **topicId** | **String**|  | 
 **documentReferenceId** | **String**|  | 
 **documentReferencePUT** | [**DocumentReferencePUT**](DocumentReferencePUT.md)|  | 

### Return type

[**DocumentReferenceGET**](DocumentReferenceGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesGet

> [DocumentReferenceGET] bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesGet(version, projectId, topicId)

Get Document References

Add a document reference to a topic. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 3.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.DocumentReferencesApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesGet(version, projectId, topicId, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **version** | **String**|  | [default to &#39;3.0&#39;]
 **projectId** | **String**|  | 
 **topicId** | **String**|  | 

### Return type

[**[DocumentReferenceGET]**](DocumentReferenceGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesPost

> DocumentReferenceGET bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesPost(version, projectId, topicId, documentReferencePOST)

Create Document Reference

Add a document reference to a topic. This operation is only possible when the server returns the updateDocumentReferences flag in the Topic authorization, see section 4.2.8  Should either reference an internal or an external document.  Internal document_guid must match an existing document in the project url must be null External document_guid must be null url must be the url to the external resource 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.DocumentReferencesApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let documentReferencePOST = {"url":"http://example.com/files/LegalRequirements.pdf","description":"The legal requirements for buildings."}; // DocumentReferencePOST | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdDocumentReferencesPost(version, projectId, topicId, documentReferencePOST, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **version** | **String**|  | [default to &#39;3.0&#39;]
 **projectId** | **String**|  | 
 **topicId** | **String**|  | 
 **documentReferencePOST** | [**DocumentReferencePOST**](DocumentReferencePOST.md)|  | 

### Return type

[**DocumentReferenceGET**](DocumentReferenceGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

