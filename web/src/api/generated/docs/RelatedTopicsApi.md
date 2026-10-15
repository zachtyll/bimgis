# BcfApi.RelatedTopicsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsGet**](RelatedTopicsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/related_topics | Get Related Topics
[**bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsPut**](RelatedTopicsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsPut) | **PUT** /bcf/{version}/projects/{project_id}/topics/{topic_id}/related_topics | Update Related Topics



## bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsGet

> [RelatedTopicGET] bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsGet(version, projectId, topicId)

Get Related Topics

Retrieve a collection of all related topics to a topic.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.RelatedTopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsGet(version, projectId, topicId, (error, data, response) => {
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

[**[RelatedTopicGET]**](RelatedTopicGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsPut

> [RelatedTopicGET] bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsPut(version, projectId, topicId, relatedTopicPUT)

Update Related Topics

Add or update a collection of all related topics to a topic. This operation is only possible when the server returns the updateRelatedTopics flag in the Topic authorization, see section 3.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.RelatedTopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let relatedTopicPUT = [new BcfApi.RelatedTopicPUT()]; // [RelatedTopicPUT] | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdRelatedTopicsPut(version, projectId, topicId, relatedTopicPUT, (error, data, response) => {
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
 **relatedTopicPUT** | [**[RelatedTopicPUT]**](RelatedTopicPUT.md)|  | 

### Return type

[**[RelatedTopicGET]**](RelatedTopicGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

