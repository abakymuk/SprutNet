servers

https://api.maersk.com/reference-data
https://api-stage.maersk.com/reference-data
https://api-cdt.maersk.com/reference-data


GET /locations
GET /carrier-locations/{carrierGeoID}

curl https://api-cdt.maersk.com/reference-data/locations \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

Search locations

Search Locations based on filters

Query Parameters
locationType
Type:string
enum
Example
Type of Location

CITY
COUNTRY
TERMINAL
BARGE TERMINAL
RAIL TERMINAL
CONTAINER FREIGHT STATION
CUSTOMER LOCATION
DEPOT
countryCode
Type:string
Pattern:[a-zA-Z]{2}
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

countryName
Type:string
Pattern:^([a-zA-Z\[\]\(\)ɏ-€]+(?:. |-| |'|’|\|))*[a-zA-Z\[\]\(\)ɏ-€]*$
Example
Name of the Country or partial Name containing at least 1 alpha character defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
Pattern:^([a-zA-Z\[\]\(\)ɏ-€]+(?:. |-| |'|’|\|))*[a-zA-Z\[\]\(\)ɏ-€]*$
Example
Name of the City or partial City Name containing at least 2 alpha characters. City Name searches permitted are:

Dur - City names starting with 'Dur' are returned such as Durban, Durango, Duras
Charleston|exact - City names that are exact match for 'Charleston' are returned
ton|endsWith - City names ending with 'ton' are returned such as Houston, Charleston, Kingston, Southampton
Charleston|contains - City names containing 'Charleston' are returned such as South Charleston, Charleston, Charleston North
UNRegionCode
Type:string
Pattern:[a-zA-Z0-9]{1,3}
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

UNLocationCode
Type:string
Pattern:[a-zA-Z]{2}[a-zA-Z0-9]{3}
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE https://www.unece.org/cefact/locode/welcome.html

vesselOperatorCarrierCode
Type:string
enum
default: 
MAEU
National Motor Freight Traffic Association (NMFTA) - Standard Carrier Alpha Codes (SCAC) 2019:
http://www.nmfta.org/pages/scac

MAEU - Maersk A/S
SEAU - Maersk A/S* trading as Sealand Americas
SEJJ - Sealand Europe A/S
MCPU - Sealand Maersk Asia Pte. Ltd.
MAEI - Maersk Line Limited
MAEU
SEAU
SEJJ
MCPU
MAEI
sort
Type:array string[] 1…3
unique!
Example
Sort order for the data set returned in the response, e.g. countryName:asc, cityName:desc
'asc' means ascending, 'desc' means descending
if ':asc' or ':desc' is not specified then the default sorting asc (ascending) will be applied e.g countryName is equal to countryName:asc

limit
Type:integer
min: 
10
max: 
100
default: 
25
Specifies the number of data sets to be sent in the response.

page
Type:string
Example
This can be number/link/token/any reference of the current page/next page/first page/previous page/last page/any specific intermediate page

Responses

200
Returns a list of Locations as defined by A.P. Moller-Maersk A/S

Show Headers
Type:array Location[]
countryCode
Type:string
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

countryName
Type:string
Example
Name of the Country or partial Name containing at least 1 alpha character defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE https://www.unece.org/cefact/locode/welcome.html

cityName
Type:string
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

UNRegionName
Type:string
Example
The Name of the State or Country Subdivision for the Port of Load as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

carrierGeoID
Type:string
Example
Geo Location ID as defined by A.P. Moller-Maersk A/S

Selected Content Type:
application/json

400
Bad request; the request is unacceptable often due to a missing or invalid parameter.

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

401
Unauthorized

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

404
The requested resource cannot be found

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

405
Method not allowed on resource

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

500
Internal server error

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

curl 'https://api-cdt.maersk.com/reference-data/carrier-locations/{carrierGeoID}' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

Retrieves Location by Maersk Geo ID

Retrieves Location properties by Geo Location ID as defined by A.P. Moller-Maersk A/S

Path Parameters
carrierGeoID
Type:string
Pattern:^[0-9a-zA-Z]{13}$
required
Example
Geo Location ID as defined by A.P. Moller-Maersk A/S

Query Parameters
isRequiredAlias
Type:boolean
default: 
false
True if require to contain the alternate Aliases of the location in the response

Responses

200
Returns a list of Locations

countryCode
Type:string
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

countryName
Type:string
Example
Name of the Country or partial Name containing at least 1 alpha character defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE https://www.unece.org/cefact/locode/welcome.html

cityName
Type:string
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

UNRegionName
Type:string
Example
The Name of the State or Country Subdivision for the Port of Load as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

carrierGeoID
Type:string
Example
Geo Location ID as defined by A.P. Moller-Maersk A/S

carrierRktsCode
Type:string
Example
RKTS system location code as defined by A.P. Moller-Maersk A/S

carrierRkstCode
Type:string
Example
RKST system location code as defined by A.P. Moller-Maersk A/S

timeZoneID
Type:string
Example
Time zone identifier, e.g. Europe/Copenhagen, BST

carrierCountryGeoID
Type:string
Example
Country Geo Location ID as defined by A.P. Moller-Maersk A/S

alternateAliases
Type:array string[]
Example
the alternate aliases of the location, only visible when the input query parameter isRequiredAlias is True

Selected Content Type:
application/json

400
Bad request; the request is unacceptable often due to a missing or invalid parameter.

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

401
Unauthorized

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

404
The requested resource cannot be found

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

405
Method not allowed on resource

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

application/json

500
Internal server error

Type:object
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array object[]
The list of invalid fields in the request.

Hide Child Attributesfor subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.

MODELS

Location​#Copy link
countryCode
Type:string
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

countryName
Type:string
Example
Name of the Country or partial Name containing at least 1 alpha character defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)
https://www.iso.org/iso-3166-country-codes.html

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE https://www.unece.org/cefact/locode/welcome.html

cityName
Type:string
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

UNRegionName
Type:string
Example
The Name of the State or Country Subdivision for the Port of Load as defined by the UNECE
http://www.unece.org/cefact/locode/subdivisions.html

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

carrierGeoID
Type:string
Example
Geo Location ID as defined by A.P. Moller-Maersk A/S


CarrierLocation​#Copy link
carrierRktsCode
Type:string
Example
RKTS system location code as defined by A.P. Moller-Maersk A/S

carrierRkstCode
Type:string
Example
RKST system location code as defined by A.P. Moller-Maersk A/S

timeZoneID
Type:string
Example
Time zone identifier, e.g. Europe/Copenhagen, BST

carrierCountryGeoID
Type:string
Example
Country Geo Location ID as defined by A.P. Moller-Maersk A/S

alternateAliases
Type:array string[]
Example
the alternate aliases of the location, only visible when the input query parameter isRequiredAlias is True


ApiError​#Copy link
method
Type:string
required
The request method type e.g. GET, POST.

requestUri
Type:string
required
The request URI.

status
Type:string
required
The textual representation of the response status.

timestamp
Type:string
required
The date and time (dd-MM-yyyy hh:mm:ss) the error occured.

message
Type:string
required
High level error message.

debugMessage
Type:string
required
Detailed error message.

subErrors
Type:array ApiValidationError[]
The list of invalid fields in the request.


subErrors
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.


ApiValidationError​#Copy link
field
Type:string
required
The field that has failed validation.

rejectedValue
Type:string
required
The value that has failed validation.

message
Type:string
required
The reason and advice for failed validation.