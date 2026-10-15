# BcfApi.FilesApi

All URIs are relative to *https://virtserver.swaggerhub.com/opencde/BCF-OpenAPI-3.0/3.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**bcfVersionProjectsProjectIdFilesInformationGet**](FilesApi.md#bcfVersionProjectsProjectIdFilesInformationGet) | **GET** /bcf/{version}/projects/{project_id}/files_information | Get Files Information
[**bcfVersionProjectsProjectIdTopicsTopicIdFilesGet**](FilesApi.md#bcfVersionProjectsProjectIdTopicsTopicIdFilesGet) | **GET** /bcf/{version}/projects/{project_id}/topics/{topic_id}/files | Get Files
[**bcfVersionProjectsProjectIdTopicsTopicIdFilesPut**](FilesApi.md#bcfVersionProjectsProjectIdTopicsTopicIdFilesPut) | **PUT** /bcf/{version}/projects/{project_id}/topics/{topic_id}/files | Update File



## bcfVersionProjectsProjectIdFilesInformationGet

> [ProjectFileInformation] bcfVersionProjectsProjectIdFilesInformationGet(version, projectId)

Get Files Information

Retrieve a collection of project_file_informations to support allowing users to choose which Files (models) to reference in the header of topics created on the server. 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.FilesApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdFilesInformationGet(version, projectId, (error, data, response) => {
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

[**[ProjectFileInformation]**](ProjectFileInformation.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdFilesGet

> [FileGET] bcfVersionProjectsProjectIdTopicsTopicIdFilesGet(version, projectId, topicId)

Get Files

Retrieve a collection of file references as topic header.  Implementer Note: The reference property can either be an Uri or a server specific id. Uris are given as absolute paths to the model files while ids reference a custom id of the model file and require custom logic per server to retrieve it. This allows referencing of files on the server but requires clients to know how to retrieve files in a specific implementation. 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.FilesApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdFilesGet(version, projectId, topicId, (error, data, response) => {
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

[**[FileGET]**](FileGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## bcfVersionProjectsProjectIdTopicsTopicIdFilesPut

> [FileGET] bcfVersionProjectsProjectIdTopicsTopicIdFilesPut(version, projectId, topicId, filePUT)

Update File

Update a collection of file references on the topic header. This operation is only possible when the server returns the updateFiles flag in the Topic authorization, see section 3.2.8 

### Example

```javascript
import BcfApi from 'bcf_api';

let apiInstance = new BcfApi.FilesApi();
let version = "'3.0'"; // String | 
let projectId = "projectId_example"; // String | 
let topicId = "topicId_example"; // String | 
let filePUT = [{"ifc_project":"0J$yPqHBD12v72y4qF6XcD","filename":"OfficeBuilding_Architecture_0001.ifc","reference":"https://example.com/files/0J$yPqHBD12v72y4qF6XcD_0001.ifc"},{"ifc_project":"3hwBHP91jBRwPsmyf$3Hea","filename":"OfficeBuilding_Heating_0003.ifc","reference":"https://example.com/files/3hwBHP91jBRwPsmyf$3Hea_0003.ifc"}]; // [FilePUT] | 
apiInstance.bcfVersionProjectsProjectIdTopicsTopicIdFilesPut(version, projectId, topicId, filePUT, (error, data, response) => {
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
 **filePUT** | [**[FilePUT]**](FilePUT.md)|  | 

### Return type

[**[FileGET]**](FileGET.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

