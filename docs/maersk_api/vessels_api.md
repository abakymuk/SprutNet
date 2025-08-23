servers

https://api.maersk.com/reference-data
https://api-stage.maersk.com/reference-data

ApiKeyHeader

Consumer-Key IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
secret CnIcg3YgUUtSp8a3

GET /vessels

curl https://api-stage.maersk.com/reference-data/vessels \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

Lists active vessel information for vessels that sail A.P. Moller-Maersk A/S routes

Query Parameters
vesselIMONumbers
Type:array number[] 1…50
Examples
The unique 7-digit number assigned to a vessel by the International Maritime Organization (IMO)\ http://www.imo.org/en/Pages/Default.aspx

carrierVesselCodes
Type:array string[] 1…50
Examples
The unique 3-character code assigned by A.P. Moller-Maersk A/S to a vessel for internal use

vesselNames
Type:array string[] 1…50
Examples
Name of the Vessel containing no more than 35 alpha characters or partial Name containing at least 2 alpha characters

vesselFlagCodes
Type:array string[] 1…50
Examples
Vessel flag code that represents the 2-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO) under whose laws the vessel is registered or licensed

Responses

200
Returns a list of active vessels

Type:array Vessel[]
The list of active vessels that sail A.P. Moller-Maersk A/S routes

vesselIMONumber
Type:number
Example
The unique 7-digit number assigned to a vessel by the International Maritime Organization (IMO)\ http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
The unique 3-character code assigned by A.P. Moller-Maersk A/S to a vessel for internal use

vesselShortName
Type:string
Example
The first 18 characters of the vessel name

vesselLongName
Type:string
Example
The first 35 characters of the vessel name

vesselFlagCode
Type:string
Example
Vessel flag code that represents the 2-digit country code under whose laws the vessel is registered or licensed

vesselBuiltYear
Type:number
Example
The year the vessel was built

vesselCallSign
Type:string
Example
A unique alphanumeric identity that belongs to the vessel and is assigned by the International Telecommunication Union (ITU). It consists of a three-letter alphanumeric prefix that indicates nationality, followed by one to four characters to identify the individual vessel. The Vessel Call Sign changes whenever a vessel changes its flag.

vesselCapacityTEU
Type:number
Example
The number of Twenty Foot Equivalent Units (TEUs) ISO-standard containers that the vessel can carry

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

Selected Content Type:
application/json

401
The client cannot be authenticated by the system

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

403
The client does not have permissions to access this endpoint

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

Selected Content Type:
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


Vessels​#Copy link
The list of active vessels that sail A.P. Moller-Maersk A/S routes

Type:array Vessel[]
The list of active vessels that sail A.P. Moller-Maersk A/S routes


object
vesselIMONumber
Type:number
Example
The unique 7-digit number assigned to a vessel by the International Maritime Organization (IMO)\ http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
The unique 3-character code assigned by A.P. Moller-Maersk A/S to a vessel for internal use

vesselShortName
Type:string
Example
The first 18 characters of the vessel name

vesselLongName
Type:string
Example
The first 35 characters of the vessel name

vesselFlagCode
Type:string
Example
Vessel flag code that represents the 2-digit country code under whose laws the vessel is registered or licensed

vesselBuiltYear
Type:number
Example
The year the vessel was built

vesselCallSign
Type:string
Example
A unique alphanumeric identity that belongs to the vessel and is assigned by the International Telecommunication Union (ITU). It consists of a three-letter alphanumeric prefix that indicates nationality, followed by one to four characters to identify the individual vessel. The Vessel Call Sign changes whenever a vessel changes its flag.

vesselCapacityTEU
Type:number
Example
The number of Twenty Foot Equivalent Units (TEUs) ISO-standard containers that the vessel can carry


Vessel​#Copy link
vesselIMONumber
Type:number
Example
The unique 7-digit number assigned to a vessel by the International Maritime Organization (IMO)\ http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
The unique 3-character code assigned by A.P. Moller-Maersk A/S to a vessel for internal use

vesselShortName
Type:string
Example
The first 18 characters of the vessel name

vesselLongName
Type:string
Example
The first 35 characters of the vessel name

vesselFlagCode
Type:string
Example
Vessel flag code that represents the 2-digit country code under whose laws the vessel is registered or licensed

vesselBuiltYear
Type:number
Example
The year the vessel was built

vesselCallSign
Type:string
Example
A unique alphanumeric identity that belongs to the vessel and is assigned by the International Telecommunication Union (ITU). It consists of a three-letter alphanumeric prefix that indicates nationality, followed by one to four characters to identify the individual vessel. The Vessel Call Sign changes whenever a vessel changes its flag.

vesselCapacityTEU
Type:number
Example
The number of Twenty Foot Equivalent Units (TEUs) ISO-standard containers that the vessel can carry