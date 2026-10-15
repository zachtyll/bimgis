# BcfApi.ProjectApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsGet**](ProjectApi.md#bcfVersionProjectsGet) | **GET** /bcf/{version}/projects | Get Projects
[**bcfVersionProjectsProjectIdExtensionsGet**](ProjectApi.md#bcfVersionProjectsProjectIdExtensionsGet) | **GET** /bcf/{version}/projects/{project_id}/extensions | Get Project Extensions
[**bcfVersionProjectsProjectIdGet**](ProjectApi.md#bcfVersionProjectsProjectIdGet) | **GET** /bcf/{version}/projects/{project_id} | Get Project
[**bcfVersionProjectsProjectIdPut**](ProjectApi.md#bcfVersionProjectsProjectIdPut) | **PUT** /bcf/{version}/projects/{project_id} | Update Project



## bcfVersionProjectsGet

> [ProjectGET] bcfVersionProjectsGet(version)

Get Projects

Retrieve a collection of projects where the currently logged on user has access to.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ProjectApi();
let version = "'3.0'"; // String | 
apiInstance.bcfVersionProjectsGet(version, (error, data, response) => {
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

### Return type

[**[ProjectGET]**](ProjectGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdExtensionsGet

> ExtensionsGET bcfVersionProjectsProjectIdExtensionsGet(version, projectId)

Get Project Extensions

Retrieve a specific projects extensions. Project extensions are used to define possible values that can be used in topics and comments, for example topic labels and priorities. They may change during the course of a project. The most recent extensions state which values are valid at a given moment for newly created topics and comments. 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ProjectApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdExtensionsGet(version, projectId, (error, data, response) => {
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

### Return type

[**ExtensionsGET**](ExtensionsGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdGet

> ProjectGET bcfVersionProjectsProjectIdGet(version, projectId)

Get Project

Retrieve a specific project.

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ProjectApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdGet(version, projectId, (error, data, response) => {
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

### Return type

[**ProjectGET**](ProjectGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdPut

> ProjectGET bcfVersionProjectsProjectIdPut(version, projectId, projectPUT)

Update Project

Modify a specific project. This operation is only possible when the server returns the update flag in the Project authorization, see section 3.1.5

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.ProjectApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let projectPUT = new BcfApi.ProjectPUT(); // ProjectPUT | 
apiInstance.bcfVersionProjectsProjectIdPut(version, projectId, projectPUT, (error, data, response) => {
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
 **projectPUT** | [**ProjectPUT**](ProjectPUT.md)|  | 

### Return type

[**ProjectGET**](ProjectGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

