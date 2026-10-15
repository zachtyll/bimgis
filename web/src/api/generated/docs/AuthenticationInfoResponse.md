# FoundationApi.AuthenticationInfoResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**oauth2AuthUrl** | **String** | URL to authorization page (used for Authorization Code Grant and Implicit Grant OAuth2 flows) | [optional] 
**oauth2TokenUrl** | **String** | URL for token requests | [optional] 
**oauth2DynamicClientRegUrl** | **String** | URL for automated client registration | [optional] 
**httpBasicSupported** | **Boolean** | Indicates if Http Basic Authentication is supported | [optional] 
**supportedOauth2Flows** | **[String]** | Indicates supported OAuth2 flows | 



## Enum: [SupportedOauth2FlowsEnum]


* `authorization_code_grant` (value: `"authorization_code_grant"`)

* `implicit_grant` (value: `"implicit_grant"`)

* `resource_owner_password_credentials_grant` (value: `"resource_owner_password_credentials_grant"`)




