# BcfApi.TopicsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsGet**](TopicsApi.md#bcfVersionProjectsProjectIdTopicsGet) | **GET** /bcf/{version}/projects/{project_id}/topics | Get Topics
[**bcfVersionProjectsProjectIdTopicsPost**](TopicsApi.md#bcfVersionProjectsProjectIdTopicsPost) | **POST** /bcf/{version}/projects/{project_id}/topics | Create Topic
[**bcfVersionProjectsProjectIdTopicsTopicIdDelete**](TopicsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdDelete) | **DELETE** /bcf/{version}/projects/{project_id}/topics/{topic_id} | Delete Topic
[**bcfVersionProjectsProjectIdTopicsTopicIdGet**](TopicsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id} | Get Topic
[**bcfVersionProjectsProjectIdTopicsTopicIdPut**](TopicsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdPut) | **PUT** /bcf/{version}/projects/{project_id}/topics/{topic_id} | Update Topic



## bcfVersionProjectsProjectIdTopicsGet

> [TopicGET] bcfVersionProjectsProjectIdTopicsGet(version, projectId, opts)

Get Topics

Retrieve a collection of topics related to a project (default sort order is creation_date).

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.TopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let opts = {
  'filter': "assigned_to eq 'Architect@example.com' and topic_status eq 'Open' and creation_date gt 2015-12-05T00:00:00+01:00", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |creation_author|string|userId of the creation author (value from extensions)| |modified_author|string|userId of the modified author (value from extensions)| |assigned_to|string|userId of the assigned person (value from extensions)| |stage|string|stage this topic is part of (value from extensions)| |topic_status|string|status of a topic (value from extensions)| |topic_type|string|type of a topic (value from extensions)| |creation_date|datetime|creation date of a topic| |modified_date|datetime|modification date of a topic| |labels|array (string)|labels of a topic (value from extensions)| |priority|string|priority of a topic (value from extensions)| 
  'orderby': "modified_date desc", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |creation_date|creation date of a topic| |modified_date|modification date of a topic| |server_assigned_id|the server_assigned_id of the topic| |index|index of a topic|    
  'top': "top_example", // String | 
  'skip': "skip_example" // String | 
};
apiInstance.bcfVersionProjectsProjectIdTopicsGet(version, projectId, opts, (error, data, response) => {
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
 **filter** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |creation_author|string|userId of the creation author (value from extensions)| |modified_author|string|userId of the modified author (value from extensions)| |assigned_to|string|userId of the assigned person (value from extensions)| |stage|string|stage this topic is part of (value from extensions)| |topic_status|string|status of a topic (value from extensions)| |topic_type|string|type of a topic (value from extensions)| |creation_date|datetime|creation date of a topic| |modified_date|datetime|modification date of a topic| |labels|array (string)|labels of a topic (value from extensions)| |priority|string|priority of a topic (value from extensions)|  | [optional] 
 **orderby** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |creation_date|creation date of a topic| |modified_date|modification date of a topic| |server_assigned_id|the server_assigned_id of the topic| |index|index of a topic|     | [optional] 
 **top** | **String**|  | [optional] 
 **skip** | **String**|  | [optional] 

### Return type

[**[TopicGET]**](TopicGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsPost

> TopicGET bcfVersionProjectsProjectIdTopicsPost(version, projectId, topicPOST)

Create Topic

Add a new topic. This operation is only possible when the server returns the createTopic flag in the Project authorization, see section 3.1.5

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.TopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicPOST = {"topic_type":"Clash","topic_status":"open","title":"Example topic 3","priority":"high","labels":["Architecture","Heating"],"assigned_to":"harry.muster@example.com","bim_snippet":{"snippet_type":"clash","is_external":true,"reference":"https://example.com/bcf/1.0/ADFE23AA11BCFF444122BB","reference_schema":"https://example.com/bcf/1.0/clash.xsd"}}; // TopicPOST | 
apiInstance.bcfVersionProjectsProjectIdTopicsPost(version, projectId, topicPOST, (error, data, response) => {
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
 **topicPOST** | [**TopicPOST**](TopicPOST.md)|  | 

### Return type

[**TopicGET**](TopicGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdDelete

> bcfVersionProjectsProjectIdTopicsTopicIdDelete(version, projectId, topicId)

Delete Topic

Deletes a single topic. This operation is only possible when the server returns the delete flag in the Topic authorization, see section 3.2.8

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.TopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdDelete(version, projectId, topicId, (error, data, response) => {
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

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## bcfVersionProjectsProjectIdTopicsTopicIdGet

> TopicGET bcfVersionProjectsProjectIdTopicsTopicIdGet(version, projectId, topicId)

Get Topic

Retrieve a specific topic.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.TopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdGet(version, projectId, topicId, (error, data, response) => {
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

[**TopicGET**](TopicGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdPut

> TopicGET bcfVersionProjectsProjectIdTopicsTopicIdPut(version, projectId, topicId, topicPUT)

Update Topic

Modify a specific topic, description similar to POST. This operation is only possible when the server returns the update flag in the Topic authorization, see section 3.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.TopicsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let topicPUT = {"topic_type":"Clash","topic_status":"open","title":"Example topic 3 - Changed Title","priority":"high","labels":["Architecture","Heating"],"assigned_to":"harry.muster@example.com","bim_snippet":{"snippet_type":"clash","is_external":true,"reference":"https://example.com/bcf/1.0/ADFE23AA11BCFF444122BB","reference_schema":"https://example.com/bcf/1.0/clash.xsd"}}; // TopicPUT | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdPut(version, projectId, topicId, topicPUT, (error, data, response) => {
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
 **topicPUT** | [**TopicPUT**](TopicPUT.md)|  | 

### Return type

[**TopicGET**](TopicGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

