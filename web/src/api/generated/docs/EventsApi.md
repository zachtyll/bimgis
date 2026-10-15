# BcfApi.EventsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsCommentsEventsGet**](EventsApi.md#bcfVersionProjectsProjectIdTopicsCommentsEventsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/comments/events | Get Comments Events
[**bcfVersionProjectsProjectIdTopicsEventsGet**](EventsApi.md#bcfVersionProjectsProjectIdTopicsEventsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/events | Get Topics Events
[**bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdEventsGet**](EventsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdEventsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id}/events | Get Comment Event
[**bcfVersionProjectsProjectIdTopicsTopicIdEventsGet**](EventsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdEventsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/events | Get Topic Events



## bcfVersionProjectsProjectIdTopicsCommentsEventsGet

> [CommentEventGET] bcfVersionProjectsProjectIdTopicsCommentsEventsGet(version, projectId, opts)

Get Comments Events

Retrieve a collection of comment events related to a project (default sort order is date). 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.EventsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let opts = {
  'top': "top_example", // String | 
  'skip': "skip_example", // String | 
  'filter': "author eq 'Architect@example.com' and date gt 2015-12-05T00:00:00+01:00 and type eq 'comment_created'", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |comment_guid|string|guid of the comment | |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| 
  'orderby': "date asc" // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| 
};
apiInstance.bcfVersionProjectsProjectIdTopicsCommentsEventsGet(version, projectId, opts, (error, data, response) => {
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
 **top** | **String**|  | [optional] 
 **skip** | **String**|  | [optional] 
 **filter** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |comment_guid|string|guid of the comment | |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)|  | [optional] 
 **orderby** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event|  | [optional] 

### Return type

[**[CommentEventGET]**](CommentEventGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsEventsGet

> [TopicEventGET] bcfVersionProjectsProjectIdTopicsEventsGet(version, projectId, opts)

Get Topics Events

Retrieves a document as binary file. 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.EventsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let opts = {
  'top': "top_example", // String | 
  'skip': "skip_example", // String | 
  'filter': "author eq 'Architect@example.com' and type eq 'status_updated' and date gt 2015-12-05T00:00:00+01:00&", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     
  'orderby': "date asc" // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| 
};
apiInstance.bcfVersionProjectsProjectIdTopicsEventsGet(version, projectId, opts, (error, data, response) => {
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
 **top** | **String**|  | [optional] 
 **skip** | **String**|  | [optional] 
 **filter** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |topic_guid|string|guid of the topic | |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|      | [optional] 
 **orderby** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event|  | [optional] 

### Return type

[**[TopicEventGET]**](TopicEventGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdEventsGet

> [CommentEventGET] bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdEventsGet(version, projectId, topicId, commentId, opts)

Get Comment Event

Retrieve a collection of comment events related to a comment (default sort order is date). 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.EventsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let commentId = "commentId_example"; // String | 
let opts = {
  'top': "top_example", // String | 
  'skip': "skip_example", // String | 
  'filter': "author eq 'Architect@example.com' and date gt 2015-12-05T00:00:00+01:00 and type eq 'comment_created'", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)| 
  'orderby': "date asc" // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| 
};
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdEventsGet(version, projectId, topicId, commentId, opts, (error, data, response) => {
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
 **commentId** | **String**|  | 
 **top** | **String**|  | [optional] 
 **skip** | **String**|  | [optional] 
 **filter** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|date of the event| |type|string|type of the event (value from Comment event types, table above)|  | [optional] 
 **orderby** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event|  | [optional] 

### Return type

[**[CommentEventGET]**](CommentEventGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdEventsGet

> [TopicEventGET] bcfVersionProjectsProjectIdTopicsTopicIdEventsGet(version, projectId, topicId, opts)

Get Topic Events

Retrieve a collection of topic events related to a project (default sort order is date). 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.EventsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let opts = {
  'top': "top_example", // String | 
  'skip': "skip_example", // String | 
  'filter': "author eq 'Architect@example.com' and type eq 'status_updated' and date gt 2015-12-05T00:00:00+01:00&", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|     
  'orderby': "date asc" // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event| 
};
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdEventsGet(version, projectId, topicId, opts, (error, data, response) => {
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
 **top** | **String**|  | [optional] 
 **skip** | **String**|  | [optional] 
 **filter** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |type|string|type of the event (value from Topic event types, table above)| |date|datetime|date of the event|      | [optional] 
 **orderby** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|date of the event|  | [optional] 

### Return type

[**[TopicEventGET]**](TopicEventGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

