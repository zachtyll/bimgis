# FoundationApi.DefaultApi

All URIs are relative to *https://virtserver.swaggerhub.com/buildingSMART/Foundation/1.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAuthenticationInfo**](DefaultApi.md#getAuthenticationInfo) | **GET** /foundation/1.0/auth | An unauthenticated OAUTH discovery endpoint.
[**getCurrentUser**](DefaultApi.md#getCurrentUser) | **GET** /foundation/1.0/current-user | Get the current user information
[**getVersions**](DefaultApi.md#getVersions) | **GET** /foundation/versions | An unauthenticated API discovery endpoint
[**registerClient**](DefaultApi.md#registerClient) | **POST** /{registerClientPath} | Dynamic OAUTH2 Client Registration Request



## getAuthenticationInfo

> AuthenticationInfoResponse getAuthenticationInfo()

An unauthenticated OAUTH discovery endpoint.

### Example

```javascript
import FoundationApi from 'foundation_api';

let apiInstance = new FoundationApi.DefaultApi();
apiInstance.getAuthenticationInfo((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**AuthenticationInfoResponse**](AuthenticationInfoResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getCurrentUser

> UserResponse getCurrentUser()

Get the current user information

### Example

```javascript
import FoundationApi from 'foundation_api';

let apiInstance = new FoundationApi.DefaultApi();
apiInstance.getCurrentUser((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**UserResponse**](UserResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getVersions

> VersionsResponse getVersions()

An unauthenticated API discovery endpoint

Returns a list of all supported APIs and their versions on this server. 

### Example

```javascript
import FoundationApi from 'foundation_api';

let apiInstance = new FoundationApi.DefaultApi();
apiInstance.getVersions((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**VersionsResponse**](VersionsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, */*


## registerClient

> DynamicClientRegistrationResponse registerClient(registerClientPath, opts)

Dynamic OAUTH2 Client Registration Request

An optional, authenticated endpoint for dynamic OAUTH2 client authentication. If the server supports this API then the URL will be provided in the response to &#39;/foundation/1.0/auth&#39; request 

### Example

```javascript
import FoundationApi from 'foundation_api';

let apiInstance = new FoundationApi.DefaultApi();
let registerClientPath = "registerClientPath_example"; // String | as provided in get-authentication-info
let opts = {
  'dynamicClientRegistrationRequest': new FoundationApi.DynamicClientRegistrationRequest() // DynamicClientRegistrationRequest | 
};
apiInstance.registerClient(registerClientPath, opts, (error, data, response) => {
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
 **registerClientPath** | **String**| as provided in get-authentication-info | 
 **dynamicClientRegistrationRequest** | [**DynamicClientRegistrationRequest**](DynamicClientRegistrationRequest.md)|  | [optional] 

### Return type

[**DynamicClientRegistrationResponse**](DynamicClientRegistrationResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

