# Bigship Domestic Outbound API Documents

> **Source:** This document was generated from [Bigship Domestic Outbound API Documents](https://web.archive.org/web/20260408120641/https://bigship.in/api-document/Bigship-Domestic-Outbound-API-Documents.pdf).

# Points to Remember

Here are the key points to remember:
- Base URL: https://api.bigship.in/
- API Endpoint: api/login/user
- Full URL Construction: Combine the Base URL and API Endpoint to form the Full URL.

**Example:**
- Full URL: https://api.bigship.in/api/login/user
Whenever constructing the full URL, use the same pattern:
Full URL = Base URL + API Endpoint
API Support: If you have any doubts, please feel free to contact us at
apisupport@bigship.in and CC your Sales POC.
API Rate Limiting:
To ensure fair usage and optimal performance, our API has a rate limit of 100 requests per
minute per IP address. If this limit is exceeded, additional requests will be denied until the
rate limit window resets.

**Example:**
If your application makes 101 requests within a single minute from the same IP address, the
101st request and any subsequent requests within that minute will receive a rate limit error response.
Error Response
When the rate limit is exceeded, the API will respond with a `429 Too Many Requests` status code.

# Table of Contents

| # | Section | Page |
|---|---------|------|
| 1 | API to Login / Generate Token | 3 |
| 2 | API to Get Payment Category | 5 |
| 3 | API to Get Courier List | 6 |
| 4 | API to Get Current Wallet Balance | 9 |
| 5 | API to Add Warehouse | 9 |
| 6 | API to Add Single Order | 11 |
| 7 | API to Manifest Single Order | 17 |
| 8 | API to Get AWB, Label and Manifest | 18 |
| 9 | API to Cancel AWB | 20 |
| 10 | List of Product Category | 22 |
| 11 | API to Get Shipping Rates List | 22 |
| 12 | API to Add Heavy Order | 25 |
| 13 | API to Manifest Heavy Order | 31 |
| 14 | List of Risk Type | 33 |
| 15 | API to Calculate Rates | 33 |
| 16 | API to Get Tracking Details | 38 |
| 17 | List of Scan Status in Tracking API | 41 |
| 18 | API to Get Warehouse List Details | 41 |
| 19 | API to Get Courier Transporter Id | 43 |

# Table of Modification Logs

| Version | Date | Name | Description |
| ----- | --- | --- | ------- |
| 2 | 30/07/2024 | 1. Security Implement - API | 1. Added the API Rate Limit of 100 Rate Limit requests per minute per IP address |
| 3 | 01/09/2024 | 1. New API Addition – Rate | 1. Added a new API for both Calculator shipment_category B2B and B2C. 2. Bug Fix – Add Single and 2. We fixed the issue of consignee Heavy Order last name mapping while adding 3. API Modification - Get order (Single and Heavy). Now it is Shipping Rates List visible on panel. 3. We add a new key as pickup_charge in response of the API - Get Shipping Rates List for shipment_category B2B. |
| 4 | 11/10/2024 | 1. New API Addition – Get | 1. Added a new API for both Tracking Detail tracking_type LRN and AWB. 2. API Modification – Get 2. We have introduced some new Courier List courier in shipment_category b2b and b2c. |
| 5 | 28/10/2024 | 1. API Validation | 1. We have modified the validation of Modification – Add Heavy ewaybill_number for Order shipment_category b2b. |
| 6 | 21/12/2024 | 1. Add Scan Status Detail | 1. We have added the list of possible 2. Modification – List of Risk scan_status for Tracking API Type 2. We have removed the “ThirdPartyInsurance” as the RiskType. |
| 7 | 27/03/2025 | 1. API Validation | 1. We have modified validation of Modification – Add address_line1 and address_line2 Warehouse API |
| 8 | 01/05/2025 | 1. New API Addition – Get | 1. Added a new API to get existing Warehouse List API warehouse list pagination wise |
| 9 | 28/05/2025 | 1. API Modification – | 1. We have added a new key as Calculate Rates API courier_id in response of the API – Calculate Rates API for both B2B and B2C shipment_cateogry |
| 10 | 04/07/2025 | 1. API Modification – Get | 1. We have added two new key as Courier List API courier_status and admin_status in the response of the API – Get Courier List API for both B2B and B2C shipment_cateogry. 2. We have modified some courier_id with respect to their courier_name. |
| 11 | 08/01/2026 | 1. New API Addition – Get | 1. Added a new API to get the courier Courier Transporter Transporter Id on behalf of couriers. API Detail |

## 1. API to Login / Generate Token

**Purpose: This API is used to generate token which is used to access other outbound API.**
**Http Method: POST**
**API Endpoint: api/login/user**
**Payload:**

**Body Parameter**
```json
{
  "user_name": "dummy@gmail.com",
  "password": "12BUG&*fnuv",
  "access_key": "6e2ac11edab7145109d4cb6cf214c4e1nhj878bbh99f690a1bdc5227632987813"
}
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| user_name | string | Yes | Your Bigship Login user_name |
| password | string | Yes | Your Bigship Login Password |
| access_key | string | Yes | Your Access_Key |

**Note: The expiration time of the generated Token is 12 hours as of now.**
Response

**1: When the user is login successfully || Successful**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2MjU0MDY2MCIsInVuaXF1ZV9uYW1lIjoi dGVzdGluZ0BiaWdzaGlwLmluIiwiYJKuyuNzX3Rva2VuX2lkIjoiZDU1MGVhODY3ZmU4NDFhNmZlZjRkM zdiNTM4ZDg3OWViMDczMzU2MjBkNzMwYmRkMzRhNGI5M2U5ZDU5ZTJjYiIsIm5iZiI6MTcxNTQxMD g3OSwiZXhwIjoxNzE1NDc3NDc5LCJpYXQiOjE3MTU0MTA4Nzl9.ESlXFQHArDvmHWDc- TMv9WYwAToe7QlGTQnAKFBTHbuZvgM80J_ssK5nxfpkxSoVOHocrj7qTmDgngvSW1oksw"
  },
  "success": true,
  "message": "Token Generated Successfully",
  "responseCode": 200
}
```

**2: When the user is not exists**
```json
{
  "data": null,
  "success": false,
  "message": "User not found.",
  "responseCode": 0
}
```

**3: When the user entered wrong password**
```json
{
  "data": null,
  "success": false,
  "message": "Wrong password",
  "responseCode": 0
}
```

**4: When the user entered wrong access_key**
```json
{
  "data": null,
  "success": false,
  "message": "Invalid Access Key",
  "responseCode": 401
}
```

## 2. API to Get Payment Category

**Purpose: This API is used to get payment category.**
**Http Method: GET**
**API Endpoint: api/payment/category?shipment_category=b2c**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
shipment_category = b2c or b2b

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_category | string | Yes | - Default value of shipment_category is b2c |

**Note: shipment_category can be b2c and b2b**
Response

**1: When shipment_category is b2c || Successful**
```json
{
  "data": [
    {
      "payment_category": "COD",
      "status": true
    },
    {
      "payment_category": "Prepaid",
      "status": true
    }
  ],
  "success": true,
  "message": "Sucessed!!!",
  "responseCode": 200
}
```

**2: When shipment_category is b2b || Successful**
```json
{
  "data": [
    {
      "payment_category": "COD",
      "status": true
    },
    {
      "payment_category": "Prepaid",
      "status": true
    },
    {
      "payment_category": "ToPay",
      "status": true
    }
  ],
  "success": true,
  "message": "Sucessed!!!",
  "responseCode": 200
}
```

**3: When shipment_category is other than b2c or b2b**
```json
{
  "data": null,
  "success": false,
  "message": "Invalid shipment_category. Only shipment_category: b2c and b2b are allowed.",
  "responseCode": 202
}
```

## 3. API to Get Courier List

**Purpose: This API is used to get courier list.**
**Http Method: GET**
**API Endpoint: api/courier/get/all?shipment_category=b2c**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
shipment_category = b2c or b2b

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_category | string | Yes | - Default value of shipment_category is b2c |

**Note: shipment_category can be b2c and b2b**
Response

**1: When shipment_category is b2c || Successful**
```json
{
  "data": [
    {
      "shipment_category": "b2c",
      "courier_id": 1,
      "courier_name": "Delhivery",
      "courier_type": "Surface",
      "courier_status": true,
      "admin_status": true
    },
    {
      "shipment_category": "b2c",
      "courier_id": 2,
      "courier_name": "Ekart Surface",
      "courier_type": "Air",
      "courier_status": true,
      "admin_status": true
    }
  ],
  "success": true,
  "message": "",
  "responseCode": 200
}
```

**2: When shipment_category is b2b || Successful**
```json
{
  "data": [
    {
      "shipment_category": "b2b",
      "courier_id": 15,
      "courier_name": "LTL Delhivery",
      "courier_type": "Surface",
      "courier_status": true,
      "admin_status": true
    },
    {
      "shipment_category": "b2b",
      "courier_id": 41,
      "courier_name": "LTL MOVIN",
      "courier_type": "Surface",
      "courier_status": true,
      "admin_status": true
    },
    {
      "shipment_category": "b2b",
      "courier_id": 54,
      "courier_name": "LTL MOVIN AIR",
      "courier_type": "Air",
      "courier_status": true,
      "admin_status": true
    }
  ],
  "success": true,
  "message": "",
  "responseCode": 200
}
```

**3: When shipment_category is other than b2c or b2b**
```json
{
  "data": null,
  "success": false,
  "message": "Invalid shipment_category. Only shipment_category: b2c and b2b are allowed.",
  "responseCode": 202
}
```

## 4. API to Get Current Wallet Balance

**Purpose: This API is used to get the current wallet balance.**
**Http Method: GET**
**API Endpoint: api/Wallet/balance/get**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload: Not Required**
Response
```json
{
  "data": "20854.61",
  "success": true,
  "message": "success",
  "responseCode": 200
}
```

## 5. API to Add Warehouse

**Purpose: This API is used to add warehouse.**
**Http Method: POST**
**API Endpoint: api/warehouse/add**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
{
  "address_line1": "H-No 188, Near Green View Doon",
  "address_line2": "Malsi",
  "address_landmark": "Sinola",
  "address_pincode": 248009,
  "contact_number_primary": "9998887772"
}
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| address_line1 | string | Yes | - address_line1 must be between 10 and 50 |
| address_line2 | string | - address_line2 cannot exceed 50 characters |  |
| address_landmark | string | - address_landmark cannot exceed 50 |  |
| address_pincode | string | Yes | - It should be a 6-digit numeric code |
| contact_number_primary | string | Yes | - contact_number_primary must be a 10- |

Response

**1: When the warehouse is added successfully || Successful**
```json
{
  "data": {
    "contact_person_name": "Big Enterprises",
    "company_name": "Big Enterprises",
    "warehouse_id": 44156,
    "address_line1": "H-No 188, Near Green View Doon",
    "address_line2": "Malsi",
    "address_landmark": "Sinola",
    "address_pincode": 248009,
    "address_city": "Dehradun",
    "address_state": "UTTARAKHAND",
    "address_country": "India",
    "address_email_id": "testing@bigship.in",
    "contact_number_primary": "9998887772"
  },
  "success": true,
  "message": "success",
  "responseCode": 200
}
```

**2: When the warehouse is not added successfully || Unsuccessful**
```json
{
  "data": null,
  "success": false,
  "message": "fail",
  "responseCode": 200
}
```

## 6. API to Add Single Order

**Purpose: This API is used to add Single Order.**
**Http Method: POST**
**API Endpoint: api/order/add/single**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
{
  "shipment_category": "b2c",
  "warehouse_detail": {
    "pickup_location_id": 44156,
    "return_location_id": 43932
  },
  "consignee_detail": {
    "first_name": "Preeti",
    "last_name": "Verma",
    "company_name": "",
    "contact_number_primary": "8889998889",
    "contact_number_secondary": "9998889998",
    "email_id": "",
    "consignee_address": {
      "address_line1": "Near Green View Doon",
      "address_line2": "Malsi",
      "address_landmark": "Sinola",
      "pincode": "248001"
    }
  },
  "order_detail": {
    "invoice_date": "2024-04-15T05:23:49.651Z",
    "invoice_id": "TE45",
    "payment_type": "COD",
    "shipment_invoice_amount": 3000,
    "total_collectable_amount": 300,
    "box_details": [
      {
        "each_box_dead_weight": 1,
        "each_box_length": 10,
        "each_box_width": 1,
        "each_box_height": 30,
        "each_box_invoice_amount": 3000,
        "each_box_collectable_amount": 300,
        "box_count": 1,
        "product_details": [
          {
            "product_category": "Others",
            "product_sub_category": "PINS",
            "product_name": "cloth",
            "product_quantity": 1,
            "each_product_invoice_amount": 2000,
            "each_product_collectable_amount": 200,
            "hsn": ""
          },
          {
            "product_category": "Others",
            "product_sub_category": "PINS",
            "product_name": "cloth",
            "product_quantity": 1,
            "each_product_invoice_amount": 1000,
            "each_product_collectable_amount": 100,
            "hsn": ""
          }
        ]
      }
    ],
    "ewaybill_number": "",
    "document_detail": {
      "invoice_document_file": "",
      "ewaybill_document_file": ""
    }
  }
}
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_category | enum | Yes | - It is B2C. |
| pickup_location_id | long | Yes | - It is the warehouse_id which is getting |
| return_location_id | long | Yes | - It is the warehouse_id which is getting |
| first_name | string | Yes | - first_name must be between 3 and 25 |
| last_name | string | Yes | - last_name must be between 3 and 25 |
| company_name | string | No | - company_name cannot exceed 50 |
| contact_number_primary | string | Yes | - contact_number_primary must be |
| contact_number_secondary | string | No | - contact_number_secondary must be |
| email_id | string | No | - It should be valid email_id. |
| address_line1 | string | Yes | - address_line1 must be between 10 and |
| address_line2 | string | No | - address_line2 cannot exceed 50 |
| address_landmark | string | No | - address_landmark cannot exceed 50 |
| pincode | string | Yes | - It should be a 6-digit numeric code |
| invoice_date | DateTime | Yes | - It should be in UTC time Format |
| invoice_id | string | Yes | - invoice_id must be between 1 and 25 |
| payment_type | enum | Yes | - Only 'COD' and 'Prepaid' is allowed |
| shipment_invoice_amount | decimal | Yes | - Invoice Amount must be greater than 0 |
| total_collectable_amount | decimal | No | - For Prepaid payment_type, |
| each_box_dead_weight | decimal | Yes | - each_box_dead_weight is required and |
| each_box_length | int | Yes | - each_box_length is required and must be |
| each_box_width | int | Yes | - each_box_weight is required and must |
| each_box_height | int | Yes | - each_box_height is required and must be |
| each_box_invoice_amount | decimal | Yes | - each_box_invoice_amount is required |
| each_box_collectable_amount | decimal | No | - For Prepaid payment_type, |
| box_count | int | Yes | - box_count is required and must be |
| product_category | enum | Yes | - The value should be taken from List of |
| product_sub_category | string | No | - Only Alphabets, spaces and some special |
| product_name | string | Yes | - Only Alphabets, spaces and some special |
| product_quantity | int | Yes | - Product quantity must be greater than 0 |
| each_product_invoice_amount | decimal | Yes | - each_product_invoice_amount must be |
| each_product_collectable_amount | decimal | No | - For Prepaid payment_type, |
| hsn | string | No | - Only Numbers are allowed |
| ewaybill_number | string | No | - Only alphabet and numbers are allowed. |
| invoice_document_file | string | No | - Only PDF or JPEG base 64 string in Data |
| ewaybill_document_file | string | No | - Only PDF or JPEG base 64 string in Data |

```json
{
  "box_details": [
    {
      "each_box_dead_weight": 0,
      "each_box_length": 0,
      "each_box_width": 0,
      "each_box_height": 0,
      "each_box_invoice_amount": 0,
      "each_box_collectable_amount": 0,
      "box_count": 0,
      "product_details": [
        {
          "product_category": "Accessories",
          "product_sub_category": "string",
          "product_name": "string",
          "product_quantity": 0,
          "each_product_invoice_amount": 0,
          "each_product_collectable_amount": 0,
          "hsn": "string"
        }
      ]
    }
  ]
}
```

box_details –
- box_details should have exactly one array of data for shipment_category B2C.
New Updates:
We have modified our request payload by adding two new fields:
1. each_product_invoice_amount: This field has been added to specify the invoice amount for each product.
2. each_product_collectable_amount: This field has been added to specify the collectable
amount for each product.
Response

**1: When the order is added successfully|| Successful**
```json
{
  "data": "system_order_id is 1000252960",
  "success": true,
  "message": "Order Added Successfully !!!",
  "responseCode": 200
}
```

## 7. API to Manifest Single Order

**Purpose: This API is used to manifest Single Order.**
**Http Method: POST**
**API Endpoint: api/order/manifest/single**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
{
  "system_order_id": 1000252960,
  "courier_id": 2
}
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| system_order_id | long | Yes | - This is the system_order_id which is |
| courier_id | int | No | - Enter the specific courier_id through |

Response

**1: When the order is manifest successfully|| Successful**
```json
{
  "data": null,
  "success": true,
  "message": "Completed Successfully!!!",
  "responseCode": 200
}
```

**2: When the courier_id does not belong to shipment_category B2C**
```json
{
  "data": null,
  "success": false,
  "message": "The requested courier_id 15 does not belong to shipment_category b2c.",
  "responseCode": 0
}
```

**3: When the system_order_id does not belong to shipment_category B2C**
```json
{
  "data": null,
  "success": false,
  "message": "The requested system_order_id 1000253353 does not belong to shipment_category b2c",
  "responseCode": 0
}
```

## 8. API to Get AWB, Label and Manifest

**Purpose: This API is used to download label, manifest and get AWBs.**
**Http Method: POST**
**API Endpoint: api/shipment/data?shipment_data_id=1&system_order_id=1000252329**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
shipment_data_id = 1 system_order_id = 1000252329

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_data_id | int | Yes | - It should be 1, 2 or 3. |
| system_order_id | string | Yes | - This is the system_order_id which is |

Response

**1: When the shipment_data_id = 1 || Successful**
```json
{
  "data": {
    "courier_id": "1",
    "courier_name": "Delhivery",
    "lr_number": null,
    "master_awb": "17079311845535"
  },
  "success": true,
  "message": "Successfully Completed",
  "responseCode": 200
}
```

**2: When the shipment_data_id = 2 || Successful**
```json
{
  "data": {
    "res_FileName": "Label_17079311845535",
    "res_FileContent": "JVBERi0xLjQNCiW0tba3DQolDQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAg Ug0KL0Rlc3RzIDMgMCBSDQovUGFnZUxheYNCg==",
    "res_MediaType": "application/pdf",
    "res_PrintFor": "label"
  },
  "success": true,
  "message": "Label Generated Successfully",
  "responseCode": 200
}
```

**3: When the shipment_data_id = 3 || Successful**
```json
{
  "data": {
    "res_FileName": "BS_Manifest_10885_Sunday_2024526",
    "res_FileContent": "JVBERi0xLjQNCiW0tba3DQolDQoxIDAgb2JqDQo+Pg0KDQpzdGFydHhyZWYNCjkxMDk1DQolJUVPRg0 K",
    "res_MediaType": "application/pdf",
    "res_PrintFor": "label"
  },
  "success": true,
  "message": "Manifest Generated Successfully",
  "responseCode": 200
}
```

## 9. API to Cancel AWB

**Purpose: This API is used to cancel the AWBs.**
**Http Method: PUT**
**API Endpoint: api/order/cancel**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
[
  "17079311845535"
]
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| 17079311845535 | List<string> | Yes | - This contains all the awbs which you |

Response

**1: When the AWB is cancelled successfully || Successful**
```json
{
  "data": [
    {
      "courier_id": 1,
      "master_awb": "17079311845535",
      "cancel_response": "Successfully Cancelled"
    }
  ],
  "success": true,
  "message": "Successfully Processed",
  "responseCode": 200
}
```

**2: When the AWB is already cancelled or get an issue at the time of AWB cancellation**
```json
{
  "data": [
    {
      "courier_id": 1,
      "master_awb": "17079311845535",
      "cancel_response": "Cancellation Request is not Accepted"
    }
  ],
  "success": true,
  "message": "Successfully Processed",
  "responseCode": 200
}
```

**3: When the requested AWB is not exists**
```json
{
  "data": null,
  "success": false,
  "message": "AWBs Not Found",
  "responseCode": 404
}
```

## 10.     List of Product Category

Below is the list of all product categories:
1. Accessories
2. FashionClothing
3. BookStationary
4. Electronics 5. FMCG 6. Footwear 7. Toys 8. SportsEquipment 9. Others
10. Wellness 11. Medicines Date: 17-July-2024

## 11.     API to Get Shipping Rates List

**Purpose: This API is used to get the list of of shipping charges according to the courier for**
both shipment_category B2C and B2B.
**Http Method: GET**
**API Endpoint:**
For shipment_category B2C:
/api/order/shipping/rates?shipment_category=B2C&system_order_id=1000253342
For shipment_category B2B: /api/order/shipping/rates?shipment_category=B2B&system_order_id= 1000253349&risk_type=OwnerRisk

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
shipment_category = B2C or B2B system_order_id = 1000253291
risk_type = OwnerRisk or CarrierRisk

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_category | string | Yes | - It can be b2c or b2b. |
| system_order_id | long | Yes | - This is the system_order_id which is |
| risk_type | string | No | - For shipment_category B2C, |

Response

**1: When this system_order_id is belong to the shipment_category b2c|| Successful**
```json
{
  "data": [
    {
      "system_order_id": 1000253342,
      "courier_id": 2,
      "courier_name": "Ekart Surface",
      "risk_type_name": null,
      "total_shipping_charges": 96.0,
      "freight_charge": 96.0,
      "cod_charge": 0.0,
      "other_additional_charges": null
    },
    {
      "system_order_id": 1000253342,
      "courier_id": 38,
      "courier_name": "XpressBees Surface 1Kg",
      "risk_type_name": null,
      "total_shipping_charges": 108.0,
      "freight_charge": 108.0,
      "cod_charge": 0.0,
      "other_additional_charges": null
    }
  ],
  "success": true,
  "message": "OK",
  "responseCode": 200
}
```

**2: When this system_order_id is belong to the shipment_category b2b|| Successful**
```json
{
  "data": [
    {
      "system_order_id": 1000253349,
      "courier_id": 15,
      "courier_name": "LTL Delhivery",
      "risk_type_name": "owner_risk",
      "total_shipping_charges": 789.7,
      "freight_charge": 576.7,
      "cod_charge": 0.0,
      "other_additional_charges": {
        "risk_type_charge": 33.0,
        "lr_cost": 80.0,
        "green_tax": 100.0,
        "handling_charge": 0.0,
        "to_pay": 0.0,
        "oda": 0.0,
        "warai_charge": 0.0,
        "state_tax": 0.0,
        "odc_charge": 0.0,
        "pickup_charge": 0.0
      }
    },
    {
      "system_order_id": 1000253349,
      "courier_id": 54,
      "courier_name": "LTL MOVIN AIR",
      "risk_type_name": "owner_risk",
      "total_shipping_charges": 4805.25,
      "freight_charge": 4690.25,
      "cod_charge": 0.0,
      "other_additional_charges": {
        "risk_type_charge": 25.0,
        "lr_cost": 50.0,
        "green_tax": 40.0,
        "handling_charge": 0.0,
        "to_pay": 0.0,
        "oda": 0.0,
        "warai_charge": 0.0,
        "state_tax": 0.0,
        "odc_charge": 0.0,
        "pickup_charge": 0.0
      }
    }
  ],
  "success": true,
  "message": "OK",
  "responseCode": 200
}
```

## 12.            API to Add Heavy Order

**Purpose: This API is used to add Heavy Order.**
**Http Method: POST**
**API Endpoint: api/order/add/heavy**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
{
  "shipment_category": "b2b",
  "warehouse_detail": {
    "pickup_location_id": 44250,
    "return_location_id": 44250
  },
  "consignee_detail": {
    "first_name": "Preeti",
    "last_name": "Verma",
    "company_name": "",
    "contact_number_primary": "6782212764",
    "contact_number_secondary": "8882212481",
    "email_id": "",
    "consignee_address": {
      "address_line1": "Near Green View Doon",
      "address_line2": "Malsi",
      "address_landmark": "Sinola",
      "pincode": "248001"
    }
  },
  "order_detail": {
    "invoice_date": "2024-08-07T05:23:49.651Z",
    "invoice_id": "JH567",
    "payment_type": "Prepaid",
    "total_collectable_amount": 0,
    "shipment_invoice_amount": 1000,
    "box_details": [
      {
        "each_box_dead_weight": 1,
        "each_box_length": 10,
        "each_box_width": 1,
        "each_box_height": 30,
        "each_box_invoice_amount": 0,
        "each_box_collectable_amount": 0,
        "box_count": 1,
        "product_details": [
          {
            "product_category": "Others",
            "product_sub_category": "PINS",
            "product_name": "cloth",
            "product_quantity": 1,
            "each_product_invoice_amount": 0,
            "each_product_collectable_amount": 0,
            "hsn": ""
          }
        ]
      },
      {
        "each_box_dead_weight": 2,
        "each_box_length": 20,
        "each_box_width": 2,
        "each_box_height": 40,
        "each_box_invoice_amount": 0,
        "each_box_collectable_amount": 0,
        "box_count": 1,
        "product_details": [
          {
            "product_category": "Others",
            "product_sub_category": "PINS",
            "product_name": "cloth",
            "product_quantity": 1,
            "each_product_invoice_amount": 0,
            "each_product_collectable_amount": 0,
            "hsn": ""
          }
        ]
      }
    ],
    "ewaybill_number": "",
    "document_detail": {
      "invoice_document_file": "data:image/jpeg;base64,/9j/4AAQSk",
      "ewaybill_document_file": ""
    }
  }
}
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_category | enum | Yes | - It is B2B. |
| pickup_location_id | long | Yes | - It is the warehouse_id which is getting |
| return_location_id | long | Yes | - It is the warehouse_id which is getting |
| first_name | string | Yes | - first_name must be between 3 and 25 |
| last_name | string | Yes | - last_name must be between 3 and 25 |
| company_name | string | No | - company_name cannot exceed 50 |
| contact_number_primary | string | Yes | - contact_number_primary must be |
| contact_number_secondary | string | No | - contact_number_secondary must be |
| email_id | string | No | - It should be valid email_id. |
| address_line1 | string | Yes | - address_line1 must be between 10 and 50 |
| address_line2 | string | No | - address_line2 cannot exceed 50 characters |
| address_landmark | string | No | - address_landmark cannot exceed 50 |
| pincode | string | Yes | - It should be a 6-digit numeric code |
| invoice_date | DateTime | Yes | - It should be in UTC time Format |
| invoice_id | string | Yes | - invoice_id must be between 1 and 25 |
| payment_type | enum | Yes | - Only 'COD', 'Prepaid' and 'ToPay' is allowed |
| shipment_invoice_amount | decimal | Yes | - shipment_invoice_amount must be greater |
| total_collectable_amount | decimal | No | - For Prepaid payment_type, |
| each_box_dead_weight | decimal | Yes | - each_box_dead_weight is required and |
| each_box_length | int | Yes | - each_box_length is required and must be |
| each_box_width | int | Yes | - each_box_weight is required and must be |
| each_box_height | int | Yes | - each_box_height is required and must be |
| each_box_invoice_amount | decimal | No | - each_box_invoice_amount must be 0 for |
| each_box_collectable_amount | decimal | No | - each_box_collectable_amount must be 0 |
| box_count | int | Yes | - box_count is required and must be greater |
| product_category | enum | Yes | - The value should be taken from List of |
| product_sub_category | string | No | - Only Alphabets, spaces and some special |
| product_name | string | Yes | - Only Alphabets, spaces and some special |
| product_quantity | int | Yes | - Product quantity must be greater than 0 |
| each_product_invoice_amount | decimal | No | - each_product_invoice_amount must be 0 |
| each_product_collectable_amou | decimal | No | - each_product_collectable_amount must |
| hsn | string | No | - Only Numbers are allowed |
| ewaybill_number | string | No | - It is required if shipment_invoice_amount |
| invoice_document_file | string | Yes | - It is required for shipment_category b2b |
| ewaybill_document_file | string | No | - It is required if shipment_invoice_amount |

```json
{
  "box_details": [
    {
      "each_box_dead_weight": 0,
      "each_box_length": 0,
      "each_box_width": 0,
      "each_box_height": 0,
      "each_box_invoice_amount": 0,
      "each_box_collectable_amount": 0,
      "box_count": 0,
      "product_details": [
        {
          "product_category": "Accessories",
          "product_sub_category": "string",
          "product_name": "string",
          "product_quantity": 0,
          "each_product_invoice_amount": 0,
          "each_product_collectable_amount": 0,
          "hsn": "string"
        }
      ]
    }
  ]
}
```

box_details –
- box_details should have at least one array of data for shipment_category B2B.
New Updates:
We have modified our request payload by adding two new fields:
1. each_product_invoice_amount: This field has been added to specify the invoice amount for each product.
2. each_product_collectable_amount: This field has been added to specify the collectable
amount for each product.
Response

**1: When the order is added successfully|| Successful**
```json
{
  "data": "system_order_id is 1000253312",
  "success": true,
  "message": "Order Added Successfully !!!",
  "responseCode": 200
}
```

## 13.               API to Manifest Heavy Order

**Purpose: This API is used to manifest Heavy Order.**
**Http Method: POST**
**API Endpoint: api/order/manifest/heavy**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
{
  "system_order_id": 1000253352,
  "courier_id": 15,
  "risk_type": "OwnerRisk"
}
```

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| system_order_id | long | Yes | - This is the system_order_id which is |
| courier_id | int | Yes | - Enter the specific courier_id through |
| risk_type | string | No | - For shipment_category B2C, risk_type |

Response

**1: When the order is manifest successfully|| Successful**
```json
{
  "data": null,
  "success": true,
  "message": "Completed Successfully!!!",
  "responseCode": 200
}
```

**2: When the courier_id does not belong to shipment_category B2B**
```json
{
  "data": null,
  "success": false,
  "message": "The requested courier_id 2 does not belong to shipment_category b2b.",
  "responseCode": 0
}
```

**3: When the system_order_id does not belong to shipment_category B2B**
```json
{
  "data": null,
  "success": false,
  "message": "The requested system_order_id 1000253355 does not belong to shipment_category b2b",
  "responseCode": 0
}
```

**4: When the courier_id is not serviceable or off in courier priority**
```json
{
  "data": null,
  "success": false,
  "message": "This courier_id : 15 is not serviceable at this time. Kindly choose another courier_id",
  "responseCode": 0
}
```

**5: When the risk_type is other than the List of Risk Type**
```json
{
  "data": null,
  "success": false,
  "message": "Only OwnerRisk and CarrierRisk is allowed for risk_type",
  "responseCode": 0
}
```

**6: When the entered risk_type is not allowed for the entered courier_id**
```json
{
  "data": null,
  "success": false,
  "message": "risk_type : CarrierRisk is not allowed for the courier_id 53.Kindly either change your courier_id or risk_type.",
  "responseCode": 0
}
```

## 14.      List of Risk Type

Below is the list of all risk types:
1. OwnerRisk
2. CarrierRisk

## 15.      API to Calculate Rates

**Purpose: This API is used to calculate rates for both shipment_category b2b and b2c.**
**Http Method: POST**
**API Endpoint: api/calculator**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**

**Body Parameter**
```json
{
  "shipment_category": "B2C",
  "payment_type": "COD",
  "pickup_pincode": 110092,
  "destination_pincode": 110092,
  "shipment_invoice_amount": 1000,
  "risk_type": "",
  "box_details": [
    {
      "each_box_dead_weight": 10,
      "each_box_length": 1,
      "each_box_width": 1,
      "each_box_height": 1,
      "box_count": 1
    }
  ]
}
```

box_details –
- box_details should have exact one array of data for shipment_category B2C.
- box_details should have at least one array of data for shipment_category B2B.

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| shipment_category | enum | Yes | - It can be b2c or b2b. |
| payment_type | enum | Yes | - Only 'COD' and 'Prepaid' is allowed |
| pickup_pincode | long | Yes | - It should be a 6-digit numeric |
| destination_pincode | long | Yes | - It should be a 6-digit numeric |
| shipment_invoice_amount | decimal | Yes | - It should be a 6-digit numeric for |
| risk_type | string | No | - For shipment_category B2C, |
| each_box_dead_weight | decimal | Yes | - each_box_dead_weight is |
| each_box_length | int | Yes | - each_box_length is required and |
| each_box_width | int | Yes | - each_box_weight is required and |
| each_box_height | int | Yes | - each_box_height is required and |
| box_count | int | Yes | - box_count is required and must be |

Response

**1: When the shipment_category is b2c|| Successful**
```json
{
  "data": [
    {
      "courier_id": 2,
      "courier_name": "Ekart Surface",
      "courier_type": "Air",
      "zone": "A",
      "tat": 1,
      "billable_weight": 10.0,
      "risk_type_name": null,
      "total_shipping_charges": 597.0,
      "courier_charge": 597.0,
      "other_additional_charges": null
    },
    {
      "courier_id": 4,
      "courier_name": "XpressBees",
      "courier_type": "Air",
      "zone": "A",
      "tat": 1,
      "billable_weight": 10.0,
      "risk_type_name": null,
      "total_shipping_charges": 1040.0,
      "courier_charge": 1040.0,
      "other_additional_charges": null
    }
  ],
  "success": true,
  "message": "Successfully Completed",
  "responseCode": 200
}
```

**2: When the shipment_category is b2b|| Successful**
```json
{
  "data": [
    {
      "courier_id": 15,
      "courier_name": "LTL Delhivery",
      "courier_type": "Surface",
      "zone": "N1-N1",
      "tat": 1,
      "billable_weight": 25.0,
      "risk_type_name": "owner_risk",
      "total_shipping_charges": 668.0,
      "courier_charge": 380.0,
      "other_additional_charges": {
        "risk_type_charge": 33.0,
        "lr_cost": 80.0,
        "green_tax": 100.0,
        "handling_charge": 0.0,
        "pickup_charge": 75.0,
        "state_tax": 0.0,
        "to_pay": 0.0,
        "oda": 0.0,
        "warai_charge": 0.0,
        "odc_charge": 0.0
      }
    },
    {
      "courier_id": 53,
      "courier_name": "LTL TCI Express",
      "courier_type": "Surface",
      "zone": "NORTH1-NORTH1",
      "tat": 7,
      "billable_weight": 20.0,
      "risk_type_name": "owner_risk",
      "total_shipping_charges": 670.0,
      "courier_charge": 355.0,
      "other_additional_charges": {
        "risk_type_charge": 125.0,
        "lr_cost": 90.0,
        "green_tax": 50.0,
        "handling_charge": 50.0,
        "pickup_charge": 0.0,
        "state_tax": 0.0,
        "to_pay": 0.0,
        "oda": 0.0,
        "warai_charge": 0.0,
        "odc_charge": 0.0
      }
    }
  ],
  "success": true,
  "message": "Successfully Completed",
  "responseCode": 200
}
```

**3: When the pincode is invalid|| Unsuccessful**
```json
{
  "data": null,
  "success": false,
  "message": "Invalid pickup_pincode",
  "responseCode": 0
}
```

**4: When the token is not valid|| Unsuccessful**
```json
{
  "data": null,
  "success": false,
  "message": "Unauthorized",
  "responseCode": 401
}
```

## 16. API to Get Tracking Details

**Purpose: This API is used to get the tracking details for both tracking_type lrn and awb.**
**Http Method: GET**
**API Endpoint: /api/tracking?tracking_type=lrn&tracking_id=953064324001001**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
tracking_type = lrn or awb tracking_id = 953064324001001

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| tracking_type | string | Yes | - It can be lrn or awb |
| tracking_id | string | Yes | - This is the tracking_id which is getting by |

Response

**1: When tracking_type is lrn || Successfull**
```json
{
  "data": {
    "order_detail": {
      "courier_name": "XB LTL",
      "tracking_type": "lrn",
      "tracking_id": "953064324001001",
      "invoice_id": "d4c3b3dc-7a2f-4ab9-81e3-a",
      "order_manifest_datetime": "29-09-2024 15:53:47",
      "current_tracking_datetime": "29-09-2024 15:53:48",
      "current_tracking_status": "PICKUP SCHEDULED"
    },
    "scan_histories": [
      {
        "scan_datetime": "29-09-2024 15:53:48",
        "scan_status": "Pickup Scheduled",
        "scan_remarks": "Manifest Data Received",
        "scan_location": "DEL/SMH-TSP - New Delhi"
      }
    ]
  },
  "success": true,
  "message": "Record Successfully Fetched!!!",
  "responseCode": 200
}
```

**2: When tracking_type is awb || Successfull**
```json
{
  "data": {
    "order_detail": {
      "courier_name": "XB LTL",
      "tracking_type": "awb",
      "tracking_id": "953064324001001",
      "invoice_id": "d4c3b3dc-7a2f-4ab9-81e3-a",
      "order_manifest_datetime": "29-09-2024 15:53:47",
      "current_tracking_datetime": "29-09-2024 15:53:48",
      "current_tracking_status": "PICKUP SCHEDULED"
    },
    "scan_histories": [
      {
        "scan_datetime": "29-09-2024 15:53:48",
        "scan_status": "Pickup Scheduled",
        "scan_remarks": "Manifest Data Received",
        "scan_location": "DEL/SMH-TSP - New Delhi"
      }
    ]
  },
  "success": true,
  "message": "Record Successfully Fetched!!!",
  "responseCode": 200
}
```

**3: When there is no tracking history**
```json
{
  "data": {
    "order_detail": {
      "courier_name": "ECOM Express 0.5Kg",
      "tracking_type": "awb",
      "tracking_id": "3356912868",
      "invoice_id": "kmj80",
      "order_manifest_datetime": "09-10-2024 23:58:25",
      "current_tracking_datetime": "10-10-2024 00:04:34",
      "current_tracking_status": "CANCELLED"
    },
    "scan_histories": []
  },
  "success": false,
  "message": "No Tracking History Found!!!",
  "responseCode": 200
}
```

**4: When the tracking_id is not found || Unsuccesfull**
```json
{
  "data": null,
  "success": false,
  "message": "No Record(s) Found",
  "responseCode": 404
}
```

**5: When tracking_type is Invalid**
```json
{
  "data": null,
  "success": false,
  "message": "Invalid tracking_type. Only tracking_type: lrn and awb are allowed.",
  "responseCode": 202
}
```

## 17.      List of Scan Status in Tracking API

Below is the list of all possible tracking statuses for the scan_status field in the Tracking API 1. Pickup Scheduled 2. Not Picked 3. Cancelled 4. In-Transit
5. Out for Delivery 6. Delivered 7. Undelivered
8. RTO In Transit 9. RTO Delivered 10. Lost

## 18. API to Get Warehouse List Details

**Purpose: This API is used to get the existing warehouse details.**
**Http Method: GET**
**API Endpoint: /api/warehouse/get/list?page_index=1&page_size=10**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
page_index = 1 page_size = 10

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| page_index | int | Yes | - It should be greater than 0 |
| page_size | int | Yes | - It should be greater than 0 and less than |

Response 1: Successful
```json
{
  "data": {
    "result_count": 275,
    "result_data": [
      {
        "warehouse_id": 40007,
        "warehouse_name": "noida sector 13",
        "address_line1": "noida sector 16",
        "address_line2": null,
        "address_landmark": null,
        "address_pincode": "203135",
        "address_city": "BULANDSHAHR(UP)",
        "address_state": "UTTAR PRADESH",
        "warehouse_contact_person": "HITESH",
        "warehouse_contact_number_primary": "9998887778",
        "create_date": "2025-04-28T12:45:46.3196691"
      },
      {
        "warehouse_id": 40008,
        "warehouse_name": "testingstaging5454",
        "address_line1": "silver line apartment",
        "address_line2": "",
        "address_landmark": "",
        "address_pincode": "110011",
        "address_city": "DELHI",
        "address_state": "DELHI",
        "warehouse_contact_person": "ram singh",
        "warehouse_contact_number_primary": "9998887778",
        "create_date": "2025-04-30T13:21:06.6871417"
      }
    ]
  },
  "success": true,
  "message": "Warehouse Fetched Successfully",
  "responseCode": 200
}
```

**2: When page_size is 201 || Unsuccessful**
```json
{
  "data": null,
  "success": false,
  "message": "Maximum 200 Records can be fetched at a time",
  "responseCode": 400
}
```

**3: When page_index or page_size is 0 || Unsuccessful**
```json
{
  "data": null,
  "success": false,
  "message": "PageIndex and Page Size should be greater than Zero.",
  "responseCode": 400
}
```

## 19. API to Get Courier Transporter Id

**Purpose: This API is used to get the courier transporter ids.**
**Http Method: GET**
**API Endpoint: /api/courier/get/transport/list**
**API Endpoint: /api/courier/get/transport/list?courier_id=1**

**Headers:**
Content-Type: application/json Authorization: Bearer {token}
**Payload:**
**Query Parameter**
courier_id = 1

| Variable Name | Data Type | Required | Description |
| -------- | ------ | ----- | ------- |
| courier_id | long | No | - It should be the valid courier_id |

**Note: If you want to get all courier’s transporter id then do not use this query_parameter.**
Response 1: Successful
```json
{
  "data": [
    {
      "courier_id": 1,
      "courier_name": "Delhivery",
      "transport_id": "06AAPCS9575E1ZR"
    },
    {
      "courier_id": 8,
      "courier_name": "Delhivery 10kg",
      "transport_id": "06AAPCS9575E1ZR"
    },
    {
      "courier_id": 69,
      "courier_name": "LTL DP World",
      "transport_id": "88AADCD1983D1ZS"
    }
  ],
  "success": true,
  "message": "Successfully Completed",
  "responseCode": 200
}
```

**2: When requested courier_id is not found**
```json
{
  "data": null,
  "success": false,
  "message": "No Active Courier Found",
  "responseCode": 204
}
```

**3: When requested courier_id does not have any transporter id**
```json
{
  "data": [
    {
      "courier_id": 83,
      "courier_name": "Shadowfax 0.5kg",
      "transport_id": null
    }
  ],
  "success": true,
  "message": "Successfully Completed",
  "responseCode": 200
}
```
