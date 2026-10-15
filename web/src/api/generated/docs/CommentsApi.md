# BcfApi.CommentsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete**](CommentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete) | **DELETE** /bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id} | Delete Comment
[**bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet**](CommentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id} | Get Comment
[**bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut**](CommentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut) | **PUT** /bcf/{version}/projects/{project_id}/topics/{topic_id}/comments/{comment_id} | Update Comment
[**bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet**](CommentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/comments | Get Comments
[**bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost**](CommentsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost) | **POST** /bcf/{version}/projects/{project_id}/topics/{topic_id}/comments | Create Comment



## bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete

> bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete(version, projectId, topicId, commentId)

Delete Comment

Deletes a single comment. This operation is only possible when the server returns the delete flag in the Comment authorization, see section 3.4.6

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.CommentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let commentId = "commentId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete(version, projectId, topicId, commentId, (error, data, response) => {
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
 **commentId** | **String**|  | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet

> CommentGET bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet(version, projectId, topicId, commentId)

Get Comment

Get a single comment.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.CommentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let commentId = "commentId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet(version, projectId, topicId, commentId, (error, data, response) => {
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

### Return type

[**CommentGET**](CommentGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut

> CommentGET bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut(version, projectId, topicId, commentId, commentPUT)

Update Comment

Update a single comment, description similar to POST. This operation is only possible when the server returns the update flag in the Comment authorization, see section 3.4.6 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.CommentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let commentId = "commentId_example"; // String | 
let commentPUT = {"comment":"will rework the heating model and fix the ventilation"}; // CommentPUT | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut(version, projectId, topicId, commentId, commentPUT, (error, data, response) => {
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
 **commentPUT** | [**CommentPUT**](CommentPUT.md)|  | 

### Return type

[**CommentGET**](CommentGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet

> [CommentGET] bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet(version, projectId, topicId, opts)

Get Comments

Retrieve a collection of all comments related to a topic (default ordering is date).

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.CommentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let opts = {
  'filter': "assigned_to eq 'Architect@example.com' and topic_status eq 'Open' and creation_date gt 2015-12-05T00:00:00+01:00", // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|creation date of a comment| 
  'orderby': "modified_date desc" // String | Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|creation date of a comment| 
};
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet(version, projectId, topicId, opts, (error, data, response) => {
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
 **filter** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|type|description| |---------|----|-----------| |author|string|userId of the author (value from extensions)| |date|datetime|creation date of a comment|  | [optional] 
 **orderby** | **String**| Filter items by property values, see [OData Filtering](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter)  |parameter|description| |---------|-----------| |date|creation date of a comment|  | [optional] 

### Return type

[**[CommentGET]**](CommentGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost

> CommentGET bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost(version, projectId, topicId, commentPOST)

Create Comment

Add a new comment to a topic. This operation is only possible when the server returns the createComment flag in the Topic authorization, see section 3.2.8

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.CommentsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let commentPOST = {"comment":"will rework the heating model"}; // CommentPOST | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost(version, projectId, topicId, commentPOST, (error, data, response) => {
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
 **commentPOST** | [**CommentPOST**](CommentPOST.md)|  | 

### Return type

[**CommentGET**](CommentGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

