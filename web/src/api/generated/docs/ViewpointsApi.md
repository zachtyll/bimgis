# BcfApi.ViewpointsApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints | Get Viewpoints
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsPost**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsPost) | **POST** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints | Create Viewpoint
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdBitmapsBitmapIdGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdBitmapsBitmapIdGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/bitmaps/{bitmap_id} | Get Bitmap
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdColoringGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdColoringGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/coloring | Get Coloring
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdDelete**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdDelete) | **DELETE** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id} | Delete Viewpoint
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id} | Get Viewpoint
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSelectionGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSelectionGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/selection | Get Selection
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSnapshotGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSnapshotGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/snapshot | Get Snapshot
[**bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdVisibilityGet**](ViewpointsApi.md#bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdVisibilityGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/viewpoints/{viewpoint_id}/visibility | Get Visibility



## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsGet

> [ViewpointGET] bcfVersionProjectsProjectIdTopicsTopicIdViewpointsGet(version, projectId, topicId)

Get Viewpoints

Retrieve a collection of all viewpoints related to a topic.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsGet(version, projectId, topicId, (error, data, response) => {
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

[**[ViewpointGET]**](ViewpointGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsPost

> ViewpointGET bcfVersionProjectsProjectIdTopicsTopicIdViewpointsPost(version, projectId, topicId, viewpointPOST)

Create Viewpoint

Add a new viewpoint. Viewpoints are immutable, meaning that they should never change. Requirements for different visualizations should be handled by creating new viewpoint elements. This operation is only possible when the server returns the createViewpoint flag in the Topic authorization, see section 3.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointPOST = {"index":10,"perspective_camera":{"camera_view_point":{"x":0.0,"y":0.0,"z":0.0},"camera_direction":{"x":1.0,"y":1.0,"z":2.0},"camera_up_vector":{"x":0.0,"y":0.0,"z":1.0},"field_of_view":90.0,"aspect_ratio":1.33},"lines":[{"start_point":{"x":1.0,"y":1.0,"z":1.0},"end_point":{"x":0.0,"y":0.0,"z":0.0}}],"clipping_planes":[{"location":{"x":0.5,"y":0.5,"z":0.5},"direction":{"x":1.0,"y":0.0,"z":0.0}}],"bitmaps":[{"bitmap_type":"jpg","bitmap_data":"SGVsbG8gV29ybGQh","location":{"x":10.0,"y":-10.0,"z":7.0},"normal":{"x":-1.0,"y":1.25,"z":0.0},"up":{"x":-5.4,"y":-4.3,"z":1.0},"height":1666}],"snapshot":{"snapshot_type":"png","snapshot_data":"SGVsbG8gV29ybGQh"},"components":{"selection":[{"ifc_guid":"2MF28NhmDBiRVyFakgdbCT","originating_system":"Example CAD Application","authoring_tool_id":"EXCAD/v1.0"}],"coloring":[{"color":"ff0000","components":[{"ifc_guid":"3$cshxZO9AJBebsni$z9Yk"}]}],"visibility":{"default_visibility":false,"exceptions":[{"ifc_guid":"4$cshxZO9AJBebsni$z9Yk"}],"view_setup_hints":{"spaces_visible":true,"space_boundaries_visible":false,"openings_visible":true}}}}; // ViewpointPOST | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsPost(version, projectId, topicId, viewpointPOST, (error, data, response) => {
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
 **viewpointPOST** | [**ViewpointPOST**](ViewpointPOST.md)|  | 

### Return type

[**ViewpointGET**](ViewpointGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdBitmapsBitmapIdGet

> File bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdBitmapsBitmapIdGet(version, projectId, topicId, viewpointId, bitmapId)

Get Bitmap

Retrieve a specific viewpoints bitmap image file (png or jpg).

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
let bitmapId = "bitmapId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdBitmapsBitmapIdGet(version, projectId, topicId, viewpointId, bitmapId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 
 **bitmapId** | **String**|  | 

### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdColoringGet

> ColoringGET bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdColoringGet(version, projectId, topicId, viewpointId)

Get Coloring

Retrieve a collection of all colored components in a viewpoint.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdColoringGet(version, projectId, topicId, viewpointId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 

### Return type

[**ColoringGET**](ColoringGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdDelete

> bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdDelete(version, projectId, topicId, viewpointId)

Delete Viewpoint

Deletes a single viewpoint. This operation is only possible when the server returns the delete flag in the Viewpoint authorization, see section 3.5.10

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdDelete(version, projectId, topicId, viewpointId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdGet

> ViewpointGET bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdGet(version, projectId, topicId, viewpointId)

Get Viewpoint

Retrieve a specific viewpoint.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdGet(version, projectId, topicId, viewpointId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 

### Return type

[**ViewpointGET**](ViewpointGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSelectionGet

> SelectionGET bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSelectionGet(version, projectId, topicId, viewpointId)

Get Selection

Retrieve a collection of all selected components in a viewpoint.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSelectionGet(version, projectId, topicId, viewpointId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 

### Return type

[**SelectionGET**](SelectionGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSnapshotGet

> File bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSnapshotGet(version, projectId, topicId, viewpointId)

Get Snapshot

Retrieve a viewpoints snapshot (png or jpg) as image file. A viewpoint contains a snapshot if viewpoint.snapshot !&#x3D; null.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdSnapshotGet(version, projectId, topicId, viewpointId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 

### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream


## bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdVisibilityGet

> VisibilityGET bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdVisibilityGet(version, projectId, topicId, viewpointId)

Get Visibility

Retrieve visibility of components in a viewpoint.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ViewpointsApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let viewpointId = "viewpointId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdViewpointsViewpointIdVisibilityGet(version, projectId, topicId, viewpointId, (error, data, response) => {
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
 **viewpointId** | **String**|  | 

### Return type

[**VisibilityGET**](VisibilityGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

