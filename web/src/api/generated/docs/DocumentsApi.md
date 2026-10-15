# BcfApi.DocumentsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdDocumentsDocumentIdGet**](DocumentsApi.md#bcfVersionProjectsProjectIdDocumentsDocumentIdGet) | **GET** /bcf/{version}/projects/{project_id}/documents/{document_id} | Get Document
[**bcfVersionProjectsProjectIdTopicsTopicIdDocumentsGet**](DocumentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdDocumentsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/documents | Get Documents
[**bcfVersionProjectsProjectIdTopicsTopicIdDocumentsPost**](DocumentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdDocumentsPost) | **POST** /bcf/{version}/projects/{project_id}/topics/{topic_id}/documents | Create Document



## bcfVersionProjectsProjectIdDocumentsDocumentIdGet

> File bcfVersionProjectsProjectIdDocumentsDocumentIdGet(version, projectId, documentId)

Get Document

Retrieves a document as binary file. 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.DocumentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let documentId = "documentId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdDocumentsDocumentIdGet(version, projectId, documentId, (error, data, response) => {
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
 **documentId** | **String**|  | 

### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream


## bcfVersionProjectsProjectIdTopicsTopicIdDocumentsGet

> [DocumentGET] bcfVersionProjectsProjectIdTopicsTopicIdDocumentsGet(version, projectId, topicId)

Get Documents

Retrieve a collection of all documents uploaded to a project. 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.DocumentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdDocumentsGet(version, projectId, topicId, (error, data, response) => {
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

[**[DocumentGET]**](DocumentGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdDocumentsPost

> DocumentGET bcfVersionProjectsProjectIdTopicsTopicIdDocumentsPost(version, projectId, topicId, body)

Create Document

Upload a document (binary file) to a project. This operation is only possible when the server returns the createDocument flag in the Project authorization, see section 4.1.5 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.DocumentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let body = "/path/to/file"; // File | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdDocumentsPost(version, projectId, topicId, body, (error, data, response) => {
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
 **body** | **File**|  | 

### Return type

[**DocumentGET**](DocumentGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/octet-stream
- **Accept**: application/json

