servers

https://api.maersk.com
https://api-stage.maersk.com


GET /shipment-deadlines

curl 'https://api-stage.maersk.com/shipment-deadlines?ISOCountryCode=HK&portOfLoad=Hong%20Kong&vesselIMONumber=9456783&voyage=216E' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'


Returns the deadlines for a specific Vessel IMO Number/Voyage Number/Port of Load combination

Query Parameters
ISOCountryCode
Type:string
Pattern:[a-zA-Z]{2}
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO) https://www.iso.org/iso-3166-country-codes.html

portOfLoad
Type:string
Pattern:[a-zA-Z -’]{3,50}
required
Example
Name of the Port of Load (name of City) as defined by the UNECE https://www.unece.org/cefact/codesfortrade/codes_index.html

vesselIMONumber
Type:string
Pattern:[0-9]{7}
required
Example
The IMO number of the vessel as defined by the Internation Maritime Organization http://www.imo.org/en/Pages/Default.aspx

voyage
Type:string
Pattern:[a-zA-Z0-9]{4}
required
Example
The voyage number for the vessel

Responses

200
Returns a list of Deadlines

Type:array ShipmentDeadlines[]
shipmentDeadlines
Type:object
Hide Child Attributesfor shipmentDeadlines
terminalName
Type:string
Example
The name of the terminal for the Port of Load requested

deadlines
Type:array object[]
Hide Child Attributesfor deadlines
deadlineName
Type:string
Example
The name of the Deadline

deadlineLocal
Type:string
Format:date-time
Example
The deadline timestamp for the local time zone that is calculated based on a fixed offset to an event time which can either be the (proforma or scheduled) ETA or ETD of a port call or another deadline.

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


ShipmentDeadlines​#Copy link
The list of deadlines for each terminal for the specific Vessel/Voyage/Port of Load combination provided by the consumer.

shipmentDeadlines
Type:object

shipmentDeadlines
terminalName
Type:string
Example
The name of the terminal for the Port of Load requested

deadlines
Type:array object[]

deadlines
deadlineName
Type:string
Example
The name of the Deadline

deadlineLocal
Type:string
Format:date-time
Example
The deadline timestamp for the local time zone that is calculated based on a fixed offset to an event time which can either be the (proforma or scheduled) ETA or ETD of a port call or another deadline.


ShipmentDeadline​#Copy link
terminalName
Type:string
Example
The name of the terminal for the Port of Load requested

deadlines
Type:array Deadline[]

deadlines
deadlineName
Type:string
Example
The name of the Deadline

deadlineLocal
Type:string
Format:date-time
Example
The deadline timestamp for the local time zone that is calculated based on a fixed offset to an event time which can either be the (proforma or scheduled) ETA or ETD of a port call or another deadline.


Deadline​#Copy link
deadlineName
Type:string
Example
The name of the Deadline

deadlineLocal
Type:string
Format:date-time
Example
The deadline timestamp for the local time zone that is calculated based on a fixed offset to an event time which can either be the (proforma or scheduled) ETA or ETD of a port call or another deadline.