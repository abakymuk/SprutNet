servers

https://api.maersk.com/products
https://api-stage.maersk.com/products

ApiKeyHeader

Consumer-Key IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
secret CnIcg3YgUUtSp8a3

GET /ocean-products


curl 'https://api-stage.maersk.com/products/ocean-products?vesselOperatorCarrierCode=MAEU' \
  --header 'Consumer-Key: IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'

https://developer.maersk.com/api-catalogue/Point-to-Point%20Schedules#tag/ocean-products/GET/ocean-products

Returns A.P. Moller-Maersk A/S Ocean Products for preferred cargo routings with point to point schedules based on a specific origin and destination.\

This endpoint requires ONE OF the following combinations of parameters to identify a collectionOrigin and deliveryDestination:

countryCode (mandatory) + cityName (mandatory) + UNLocationCode (optional) + UNRegionCode (optional)

carrierGeoID (mandatory)

Note: When more than one collectionOrigin or deliveryDestination location is retrieved by the query parameters provided by the consumer, a list of valid city locations against 409 HTTP code will be returned that can be used to query for available MAERSK Ocean Products.

Query Parameters
carrierCollectionOriginGeoID
Type:string | null
Pattern:[a-zA-Z0-9]{13}
Examples
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the collectionOrigin City

carrierDeliveryDestinationGeoID
Type:string | null
Pattern:[a-zA-Z0-9]{13}
Examples
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the deliveryDestination City

collectionOriginCountryCode
Type:string
Pattern:[a-zA-Z]{2}
Example
Two-letter country code for the Origin defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

collectionOriginCityName
Type:string
Pattern:^([a-zA-Z0-9\(\)-ɏ '.,-]){1,50}$
Example
Name of the City of Origin

collectionOriginUNLocationCode
Type:string
Pattern:[a-zA-Z]{5}
Example
United Nations Code for the City of Origin for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE\

https://www.unece.org/cefact/locode/welcome.html

collectionOriginUNRegionCode
Type:string
Pattern:[a-zA-Z0-9]{1,3}
Example
Two-letter Region Code of the State or Country Subdivision for the Destination as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

deliveryDestinationCountryCode
Type:string
Pattern:[a-zA-Z]{2}
Example
Two-letter country code for the Destination defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

deliveryDestinationCityName
Type:string
Pattern:^([a-zA-Z0-9\(\)-ɏ '.,-]){1,50}$
Example
Name of the City for the Destination

deliveryDestinationUNLocationCode
Type:string
Pattern:[a-zA-Z]{5}
Example
United Nations Code for the City of Destination for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE\

https://www.unece.org/cefact/locode/welcome.html

deliveryDestinationUNRegionCode
Type:string
Pattern:[a-zA-Z0-9]{1,3}
Example
Two-letter Region Code of the State or Country Subdivision for the Destination as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

vesselOperatorCarrierCode
Type:string
enum
required
Example
National Motor Freight Traffic Association (NMFTA) - Standard Carrier Alpha Codes (SCAC) 2019:\

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
cargoType
Type:string
enum
default: 
DRY
The type of cargo to be shipped DRY - Dry cargo REEF - Reefer (refrigerated) cargo

DRY
REEF
ISOEquipmentCode
Type:string
Pattern:[a-zA-Z0-9]{4}
default: 
42G1
The container size and type BIC code as defined in the ISO-6346 standard published by the International Organization for Standardization (ISO)\

https://www.bic-code.org/wp-content/uploads/2018/01/SizeAndType-Table1-3.pdf

stuffingWeight
Type:integer
min: 
1
default: 
18000
The value for the Gross Weight of the cargo in container

weightMeasurementUnit
Type:string
enum
default: 
KGS
The Measurement Unit for for the Gross Weight of the cargo in container

KGS
LBS
stuffingVolume
Type:integer
min: 
1
default: 
10
The value for the Volume of the cargo in container

volumeMeasurementUnit
Type:string
enum
default: 
MTQ
The Measurement Unit for for the Volume of the cargo in container

MTQ - Cubic Meters
FTQ - Cubic Feet
MTQ
FTQ
exportServiceMode
Type:string
enum
default: 
CY
How cargo is received at the collectionOrigin

CY - Container Yard is any facility operated by MAERSK or a third party on MAERSK's behalf. CY exportServiceMode refers to a routing where the shipper delivers the container and its cargo to a MAERSK Container Yard, sometimes referred to as 'Merchant Haulage'.

SD - Store Door is a customer's premises. SD exportServiceMode refers to a routing where MAERSK collects the container and its cargo from the shipper, sometimes referred to as 'Carrier Haulage'.

CFS - Container Freight Station is a facility where LCL (Less Than Container Load) shipments are consolidated and cargo is stuffed into containers prior to shipment.

CY
SD
CFS
importServiceMode
Type:string
enum
default: 
CY
How cargo is delivered to the deliveryDestination

CY - Container Yard is any facility operated by MAERSK or a third party on MAERSK's behalf. CY importServiceMode refers to a routing where the consignee collects the cargo from a MAERSK Container Yard, sometimes referred to as 'Merchant Haulage'.

SD - Store Door is a customer's premises. SD exportServiceMode refers to a routing where MAERSK delivers the container and its cargo to the consignee, sometimes referred to as 'Carrier Haulage'.

CFS - Container Freight Station is a facility where LCL (Less Than Container Load) shipments are dispersed and cargo is stripped from containers prior to release to the consignee.

CY
SD
CFS
startDate
Type:string | null
Format:date
Examples
The start date of the period for which product information is requested in ISO 8601 Date format. If not provided, the tomorrow’s date is used by default. You may see results up to 2 days prior to your date when searching with 'earliest departure date'\

https://www.iso.org/iso-8601-date-and-time-format.html

startDateType
Type:string
enum
default: 
D
Defines the type of search required for the startDate selected

D - Earliest Departure Date
A - Latest Arrival Date
D
A
dateRange
Type:string
enum
default: 
P4W
The time period for which Product information is requested . The duration is populated in ISO 8601 Duration format. If not provided, P4W is used by default.\

https://www.iso.org/iso-8601-date-and-time-format.html

P1W
P2W
P3W
P4W
P5W
P6W
P7W
P8W
vesselFlagCode
Type:string | null
Pattern:[a-zA-Z]{2}
Examples
Vessel flag code that represents the 2-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO) under whose laws the vessel is registered or licensed

Responses

200
Returns a list of preferred A.P. Moller-Maersk A/S ocean products with multiple schedules

Type:object
oceanProducts
Type:array
The Preferred A.P. Moller-Maersk A/S Ocean Products with Point to Point Future Schedules based on a Specific Origin and Destination

Hide Child Attributesfor oceanProducts
vesselOperatorCarrierCode
Type:string
Example
National Motor Freight Traffic Association (NMFTA) - Standard Carrier Alpha Codes (SCAC) 2019:\

http://www.nmfta.org/pages/scac

MAEU - Maersk A/S

SEAU - Maersk A/S* trading as Sealand Americas

SEJJ - Sealand Europe A/S

MCPU - Sealand Maersk Asia Pte. Ltd.

MAEI - Maersk Line Limited

carrierProductId
Type:string
Example
A.P. Moller-Maersk A/S assigned ID for the Ocean Product retrieved based on a Specific Origin and Destination

carrierProductSequenceId
Type:string
Example
A.P. Moller-Maersk A/S assigned sequence ID for the Ocean Product retrieved based on Specific Origin and Destination

productValidFromDate
Type:string
Format:date
Example
The effective date for the Ocean Product in YYYY-MM-DD format. This parameter is null if no Valid From Date exists.

productValidToDate
Type:string
Format:date
Example
The expiration date for the Ocean Product in YYYY-MM-DD format. This parameter is null if no expiration date exists.

numberOfProductLinks
Type:string
Example
Number of links in the Ocean Product from the Origin to the Destination

transportSchedules
Type:array object[]
Hide Child Attributesfor transportSchedules
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

firstDepartureVessel
Type:object
Hide Child Attributesfor firstDepartureVessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transitTime
Type:string
Example
An approximation of the transit time for the Ocean Product in minutes. Time zone adjustment is not taken into account.

facilities
Type:object
Hide Child Attributesfor facilities
collectionOrigin
Hide Child Attributesfor collectionOrigin
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

deliveryDestination
Hide Child Attributesfor deliveryDestination
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

transportLegs
Type:array object[]
The details for the individual schedule

Hide Child Attributesfor transportLegs
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

transport
Type:object
Hide Child Attributesfor transport
vessel
Type:object
Hide Child Attributesfor vessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transportMode
Type:string
Example
The mode of transportation for the route link

BAR - Barge
BCO - Barge - Combined Transport
DST - Doublestack
FEF - Foreign Feeder
FEO - Maersk Owned Feeder
MVS - Mother Vessel
RCO - Railroad - Combined
RR - Railroad
SSH - Equalization
TRK - Truck
VSF - VSA Feeder
VSL - USA Feeder
VSM - VSA Mother VSL
carrierTradeLaneName
Type:string
Example
When the transportMode is vessel, the name of the trade lane generally defined by the route source and destination; only visible when transportMode is water based.

carrierDepartureVoyageNumber
Type:string
Example
4-character export voyage code unique to the vessel departure; only visible when transportMode is water based.

inducementLinkFlag
Type:string
Example
Indicator that defines the link as a port call offered as an inducement

carrierServiceCode
Type:string
Example
3-character service code assigned by the carrier for the service/route

carrierServiceName
Type:string
Example
Name assigned by the carrier for the service/route

linkDirection
Type:string
Example
The cardinal direction for the route link

carrierCode
Type:string
Example
RKST system Carrier Code as defined by A.P. Moller-Maersk A/S for the scheduled carrier

routingType
Type:string
Example
Describes the type of route link

P: Export S/D link (Pickup)
E: Export hub routing
M: Main routing
I: Import hub routing
D: Import S/D link (Delivery)
T: Inter Terminal Transfer
facilities
Type:object
Hide Child Attributesfor facilities
startLocation
Hide Child Attributesfor startLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

endLocation
Hide Child Attributesfor endLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

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

409
Conflict; more than one collectionOrigin or deliveryDestination location is retrieved by the query parameters provided by the consumer, a list of valid city locations will be returned that can be used to query for available MAERSK Ocean Products.

Type:object
message
Type:string
required
Example
message and suggestion for multiple locations found case

collectionOriginLocations
Type:array object[]
Hide Child Attributesfor collectionOriginLocations
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

deliveryDestinationLocations
Type:array object[]
Hide Child Attributesfor deliveryDestinationLocations
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

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

Product​#Copy link
carrierProductId
Type:string
Example
A.P. Moller-Maersk A/S assigned ID for the Ocean Product retrieved based on a Specific Origin and Destination

carrierProductSequenceId
Type:string
Example
A.P. Moller-Maersk A/S assigned sequence ID for the Ocean Product retrieved based on Specific Origin and Destination

productValidFromDate
Type:string
Format:date
Example
The effective date for the Ocean Product in YYYY-MM-DD format. This parameter is null if no Valid From Date exists.

productValidToDate
Type:string
Format:date
Example
The expiration date for the Ocean Product in YYYY-MM-DD format. This parameter is null if no expiration date exists.

numberOfProductLinks
Type:string
Example
Number of links in the Ocean Product from the Origin to the Destination


Location​#Copy link
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html


Facility​#Copy link
carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location


Vessel​#Copy link
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S

vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name


TransportPlan​#Copy link
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.


Transport​#Copy link
vessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


vessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transportMode
Type:string
Example
The mode of transportation for the route link

BAR - Barge
BCO - Barge - Combined Transport
DST - Doublestack
FEF - Foreign Feeder
FEO - Maersk Owned Feeder
MVS - Mother Vessel
RCO - Railroad - Combined
RR - Railroad
SSH - Equalization
TRK - Truck
VSF - VSA Feeder
VSL - USA Feeder
VSM - VSA Mother VSL
carrierTradeLaneName
Type:string
Example
When the transportMode is vessel, the name of the trade lane generally defined by the route source and destination; only visible when transportMode is water based.

carrierDepartureVoyageNumber
Type:string
Example
4-character export voyage code unique to the vessel departure; only visible when transportMode is water based.

inducementLinkFlag
Type:string
Example
Indicator that defines the link as a port call offered as an inducement

carrierServiceCode
Type:string
Example
3-character service code assigned by the carrier for the service/route

carrierServiceName
Type:string
Example
Name assigned by the carrier for the service/route

linkDirection
Type:string
Example
The cardinal direction for the route link

carrierCode
Type:string
Example
RKST system Carrier Code as defined by A.P. Moller-Maersk A/S for the scheduled carrier

routingType
Type:string
Example
Describes the type of route link

P: Export S/D link (Pickup)
E: Export hub routing
M: Main routing
I: Import hub routing
D: Import S/D link (Delivery)
T: Inter Terminal Transfer

TransportLeg​#Copy link
Each transport move constitutes a transport leg

departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

transport
Type:object

transport
vessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


vessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transportMode
Type:string
Example
The mode of transportation for the route link

BAR - Barge
BCO - Barge - Combined Transport
DST - Doublestack
FEF - Foreign Feeder
FEO - Maersk Owned Feeder
MVS - Mother Vessel
RCO - Railroad - Combined
RR - Railroad
SSH - Equalization
TRK - Truck
VSF - VSA Feeder
VSL - USA Feeder
VSM - VSA Mother VSL
carrierTradeLaneName
Type:string
Example
When the transportMode is vessel, the name of the trade lane generally defined by the route source and destination; only visible when transportMode is water based.

carrierDepartureVoyageNumber
Type:string
Example
4-character export voyage code unique to the vessel departure; only visible when transportMode is water based.

inducementLinkFlag
Type:string
Example
Indicator that defines the link as a port call offered as an inducement

carrierServiceCode
Type:string
Example
3-character service code assigned by the carrier for the service/route

carrierServiceName
Type:string
Example
Name assigned by the carrier for the service/route

linkDirection
Type:string
Example
The cardinal direction for the route link

carrierCode
Type:string
Example
RKST system Carrier Code as defined by A.P. Moller-Maersk A/S for the scheduled carrier

routingType
Type:string
Example
Describes the type of route link

P: Export S/D link (Pickup)
E: Export hub routing
M: Main routing
I: Import hub routing
D: Import S/D link (Delivery)
T: Inter Terminal Transfer
facilities
Type:object

facilities
startLocation

startLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

endLocation

endLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode


TransportSchedule​#Copy link
Schedule for the Ocean Products retrieved based on a Specific Origin and Destination

departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

firstDepartureVessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


firstDepartureVessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transitTime
Type:string
Example
An approximation of the transit time for the Ocean Product in minutes. Time zone adjustment is not taken into account.

facilities
Type:object

facilities
collectionOrigin

collectionOrigin
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

deliveryDestination

deliveryDestination
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

transportLegs
Type:array object[]
The details for the individual schedule

Each transport move constitutes a transport leg


transportLegs
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

transport
Type:object

transport
vessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


vessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transportMode
Type:string
Example
The mode of transportation for the route link

BAR - Barge
BCO - Barge - Combined Transport
DST - Doublestack
FEF - Foreign Feeder
FEO - Maersk Owned Feeder
MVS - Mother Vessel
RCO - Railroad - Combined
RR - Railroad
SSH - Equalization
TRK - Truck
VSF - VSA Feeder
VSL - USA Feeder
VSM - VSA Mother VSL
carrierTradeLaneName
Type:string
Example
When the transportMode is vessel, the name of the trade lane generally defined by the route source and destination; only visible when transportMode is water based.

carrierDepartureVoyageNumber
Type:string
Example
4-character export voyage code unique to the vessel departure; only visible when transportMode is water based.

inducementLinkFlag
Type:string
Example
Indicator that defines the link as a port call offered as an inducement

carrierServiceCode
Type:string
Example
3-character service code assigned by the carrier for the service/route

carrierServiceName
Type:string
Example
Name assigned by the carrier for the service/route

linkDirection
Type:string
Example
The cardinal direction for the route link

carrierCode
Type:string
Example
RKST system Carrier Code as defined by A.P. Moller-Maersk A/S for the scheduled carrier

routingType
Type:string
Example
Describes the type of route link

P: Export S/D link (Pickup)
E: Export hub routing
M: Main routing
I: Import hub routing
D: Import S/D link (Delivery)
T: Inter Terminal Transfer
facilities
Type:object

facilities
startLocation

startLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

endLocation

endLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode


TransportSchedules​#Copy link
Schedules for the Ocean Products retrieved based on a Specific Origin and Destination

transportSchedules
Type:array
Schedule for the Ocean Products retrieved based on a Specific Origin and Destination


transportSchedules
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

firstDepartureVessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


firstDepartureVessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transitTime
Type:string
Example
An approximation of the transit time for the Ocean Product in minutes. Time zone adjustment is not taken into account.

facilities
Type:object

facilities
collectionOrigin

collectionOrigin
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

deliveryDestination

deliveryDestination
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

transportLegs
Type:array object[]
The details for the individual schedule

Each transport move constitutes a transport leg


transportLegs
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

transport
Type:object

transport
vessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


vessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transportMode
Type:string
Example
The mode of transportation for the route link

BAR - Barge
BCO - Barge - Combined Transport
DST - Doublestack
FEF - Foreign Feeder
FEO - Maersk Owned Feeder
MVS - Mother Vessel
RCO - Railroad - Combined
RR - Railroad
SSH - Equalization
TRK - Truck
VSF - VSA Feeder
VSL - USA Feeder
VSM - VSA Mother VSL
carrierTradeLaneName
Type:string
Example
When the transportMode is vessel, the name of the trade lane generally defined by the route source and destination; only visible when transportMode is water based.

carrierDepartureVoyageNumber
Type:string
Example
4-character export voyage code unique to the vessel departure; only visible when transportMode is water based.

inducementLinkFlag
Type:string
Example
Indicator that defines the link as a port call offered as an inducement

carrierServiceCode
Type:string
Example
3-character service code assigned by the carrier for the service/route

carrierServiceName
Type:string
Example
Name assigned by the carrier for the service/route

linkDirection
Type:string
Example
The cardinal direction for the route link

carrierCode
Type:string
Example
RKST system Carrier Code as defined by A.P. Moller-Maersk A/S for the scheduled carrier

routingType
Type:string
Example
Describes the type of route link

P: Export S/D link (Pickup)
E: Export hub routing
M: Main routing
I: Import hub routing
D: Import S/D link (Delivery)
T: Inter Terminal Transfer
facilities
Type:object

facilities
startLocation

startLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

endLocation

endLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode


OceanProducts​#Copy link
The Preferred A.P. Moller-Maersk A/S Ocean Products with Point to Point Future Schedules based on a Specific Origin and Destination

Type:array
The Preferred A.P. Moller-Maersk A/S Ocean Products with Point to Point Future Schedules based on a Specific Origin and Destination

Schedules for the Ocean Products retrieved based on a Specific Origin and Destination

vesselOperatorCarrierCode
Type:string
Example
National Motor Freight Traffic Association (NMFTA) - Standard Carrier Alpha Codes (SCAC) 2019:\

http://www.nmfta.org/pages/scac

MAEU - Maersk A/S

SEAU - Maersk A/S* trading as Sealand Americas

SEJJ - Sealand Europe A/S

MCPU - Sealand Maersk Asia Pte. Ltd.

MAEI - Maersk Line Limited

carrierProductId
Type:string
Example
A.P. Moller-Maersk A/S assigned ID for the Ocean Product retrieved based on a Specific Origin and Destination

carrierProductSequenceId
Type:string
Example
A.P. Moller-Maersk A/S assigned sequence ID for the Ocean Product retrieved based on Specific Origin and Destination

productValidFromDate
Type:string
Format:date
Example
The effective date for the Ocean Product in YYYY-MM-DD format. This parameter is null if no Valid From Date exists.

productValidToDate
Type:string
Format:date
Example
The expiration date for the Ocean Product in YYYY-MM-DD format. This parameter is null if no expiration date exists.

numberOfProductLinks
Type:string
Example
Number of links in the Ocean Product from the Origin to the Destination

transportSchedules
Type:array object[]
Schedule for the Ocean Products retrieved based on a Specific Origin and Destination


transportSchedules
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

firstDepartureVessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


firstDepartureVessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transitTime
Type:string
Example
An approximation of the transit time for the Ocean Product in minutes. Time zone adjustment is not taken into account.

facilities
Type:object

facilities
collectionOrigin

collectionOrigin
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

deliveryDestination

deliveryDestination
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

transportLegs
Type:array object[]
The details for the individual schedule

Each transport move constitutes a transport leg


transportLegs
departureDateTime
Type:string
Format:date-time
Example
The local date and time of departure in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

arrivalDateTime
Type:string
Format:date-time
Example
The local date and time of arrival in ISO 8601 format. In case of a port omission, the field is populated with the previously shared value by default.

transport
Type:object

transport
vessel
Type:object
Vessel information to be provided when the transportMode is water based and registered internally by A.P. Moller-Maersk A/S


vessel
vesselIMONumber
Type:string
Example
International Maritime Organization (IMO) number unique to a vessel
http://www.imo.org/en/Pages/Default.aspx

carrierVesselCode
Type:string
Example
A unique 3-character code assigned by the carrier for internal purposes.

vesselName
Type:string
Example
The first 35 characters of the vessel name

transportMode
Type:string
Example
The mode of transportation for the route link

BAR - Barge
BCO - Barge - Combined Transport
DST - Doublestack
FEF - Foreign Feeder
FEO - Maersk Owned Feeder
MVS - Mother Vessel
RCO - Railroad - Combined
RR - Railroad
SSH - Equalization
TRK - Truck
VSF - VSA Feeder
VSL - USA Feeder
VSM - VSA Mother VSL
carrierTradeLaneName
Type:string
Example
When the transportMode is vessel, the name of the trade lane generally defined by the route source and destination; only visible when transportMode is water based.

carrierDepartureVoyageNumber
Type:string
Example
4-character export voyage code unique to the vessel departure; only visible when transportMode is water based.

inducementLinkFlag
Type:string
Example
Indicator that defines the link as a port call offered as an inducement

carrierServiceCode
Type:string
Example
3-character service code assigned by the carrier for the service/route

carrierServiceName
Type:string
Example
Name assigned by the carrier for the service/route

linkDirection
Type:string
Example
The cardinal direction for the route link

carrierCode
Type:string
Example
RKST system Carrier Code as defined by A.P. Moller-Maersk A/S for the scheduled carrier

routingType
Type:string
Example
Describes the type of route link

P: Export S/D link (Pickup)
E: Export hub routing
M: Main routing
I: Import hub routing
D: Import S/D link (Delivery)
T: Inter Terminal Transfer
facilities
Type:object

facilities
startLocation

startLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

endLocation

endLocation
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

carrierSiteGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the site such as a terminal or depot\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

locationType
Type:string
Example
type of location

locationName
Type:string
Example
Name of the Location

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode


AvailableLocations​#Copy link
message
Type:string
required
Example
message and suggestion for multiple locations found case

collectionOriginLocations
Type:array Location[]

collectionOriginLocations
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html

deliveryDestinationLocations
Type:array Location[]

deliveryDestinationLocations
carrierCityGeoID
Type:string
Example
Unique GEO ID used internally by A.P. Moller-Maersk A/S to identify the city of the Port\

Note: this API returns either carrierCityGeoID or carrierSiteGeoID depends on the locationType

UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

countryCode
Type:string
required
Example
Two-letter country code defined in the ISO 3166-1 standard published by the International Organization for Standardization (ISO)\

https://www.iso.org/iso-3166-country-codes.html

cityName
Type:string
required
Example
Name of the City

UNRegionCode
Type:string
Example
Two-letter Region Code of the State or Country Subdivision as defined by the UNECE\

http://www.unece.org/cefact/locode/subdivisions.html


UNLocationCodes​#Copy link
UNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: to avoid confusion, this attribute is separated into cityUNLocationCode + siteUNLocationCode from API Version V.2.2, will be removed from the next major version e.g V.3.0.0

cityUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the City\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode

siteUNLocationCode
Type:string
Example
United Nations Code for Trade and Transport Locations (UN/LOCODE) as defined by the UNECE for the Site\

https://www.unece.org/cefact/locode/welcome.html

Note: it's important to use cityUNLocationCode to place booking but not siteUNLocationCode


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