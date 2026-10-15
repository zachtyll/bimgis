# BcfApi.SnippetsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsTopicIdSnippetGet**](SnippetsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdSnippetGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/snippet | Get Snippet
[**bcfVersionProjectsProjectIdTopicsTopicIdSnippetPut**](SnippetsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdSnippetPut) | **PUT** /bcf/{version}/projects/{project_id}/topics/{topic_id}/snippet | Update Snippet



## bcfVersionProjectsProjectIdTopicsTopicIdSnippetGet

> File bcfVersionProjectsProjectIdTopicsTopicIdSnippetGet(version, projectId, topicId)

Get Snippet

Retrieves a topics BIM-Snippet as binary file.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.SnippetsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdSnippetGet(version, projectId, topicId, (error, data, response) => {
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

**File**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream


## bcfVersionProjectsProjectIdTopicsTopicIdSnippetPut

> bcfVersionProjectsProjectIdTopicsTopicIdSnippetPut(version, projectId, topicId, body)

Update Snippet

Puts a new BIM Snippet binary file to a topic. If this is used, the parent topics BIM Snippet property is_external must be set to false and the reference must be the file name with extension. This operation is only possible when the server returns the updateBimSnippet flag in the Topic authorization, see section 3.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.SnippetsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let body = "/path/to/file"; // File | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdSnippetPut(version, projectId, topicId, body, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
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

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/octet-stream
- **Accept**: Not defined

