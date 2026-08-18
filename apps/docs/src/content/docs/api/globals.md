---
title: API Reference
description: Complete API reference for @agamya/bigship-sdk
---

# @agamya/bigship-sdk

## Enumerations

### ShipmentDataType

Defined in: [packages/sdk/src/core/types.ts:645](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L645)

Shipment data type identifiers

#### See

Bigship API documentation

#### Enumeration Members

| Enumeration Member | Value | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enumeration-member-awb"></a> `AWB` | `1` | Air Waybill - Contains AWB number and courier details | [packages/sdk/src/core/types.ts:647](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L647) |
| <a id="enumeration-member-label"></a> `LABEL` | `2` | Shipping label - Contains label download URL/data | [packages/sdk/src/core/types.ts:649](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L649) |
| <a id="enumeration-member-manifest"></a> `MANIFEST` | `3` | Manifest document - Contains manifest download URL/data | [packages/sdk/src/core/types.ts:651](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L651) |

## Classes

### BigshipApiError

Defined in: [packages/sdk/src/errors/index.ts:30](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L30)

Base API error with additional context information

#### Example

```ts
try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipApiError) {
    console.log('Request ID:', error.requestId);
    console.log('Endpoint:', error.endpoint);
    console.log('Response:', error.responseBody);
  }
}
```

#### Extends

- [`BigshipError`](#bigshiperror)

#### Extended by

- [`BigshipDuplicateInvoiceError`](#bigshipduplicateinvoiceerror)
- [`BigshipValidationError`](#bigshipvalidationerror)
- [`BigshipAuthError`](#bigshipautherror)
- [`BigshipNetworkError`](#bigshipnetworkerror)

#### Constructors

##### Constructor

```ts
new BigshipApiError(
   message: string, 
   statusCode: number, 
   options?: BigshipApiErrorOptions): BigshipApiError;
```

Defined in: [packages/sdk/src/errors/index.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L35)

###### Parameters

###### message

`string`

###### statusCode

`number`

###### options?

[`BigshipApiErrorOptions`](#bigshipapierroroptions) = `{}`

###### Returns

[`BigshipApiError`](#bigshipapierror)

###### Overrides

[`BigshipError`](#bigshiperror).[`constructor`](#constructor-4)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="apiresponse"></a> `apiResponse?` | `readonly` | [`BigshipErrorData`](#bigshiperrordata) | - | [`BigshipError`](#bigshiperror).[`apiResponse`](#apiresponse-3) | [packages/sdk/src/errors/BigshipError.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L33) |
| <a id="cause"></a> `cause?` | `public` | `unknown` | - | [`BigshipError`](#bigshiperror).[`cause`](#cause-3) | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="code"></a> `code?` | `readonly` | `string` | - | [`BigshipError`](#bigshiperror).[`code`](#code-3) | [packages/sdk/src/errors/BigshipError.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L32) |
| <a id="endpoint"></a> `endpoint?` | `readonly` | `string` | - | - | [packages/sdk/src/errors/index.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L32) |
| <a id="message"></a> `message` | `public` | `string` | - | [`BigshipError`](#bigshiperror).[`message`](#message-3) | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name"></a> `name` | `public` | `string` | - | [`BigshipError`](#bigshiperror).[`name`](#name-3) | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="requestid"></a> `requestId?` | `readonly` | `string` | - | - | [packages/sdk/src/errors/index.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L31) |
| <a id="responsebody"></a> `responseBody?` | `readonly` | `unknown` | - | - | [packages/sdk/src/errors/index.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L33) |
| <a id="stack"></a> `stack?` | `public` | `string` | - | [`BigshipError`](#bigshiperror).[`stack`](#stack-3) | node\_modules/typescript/lib/lib.es5.d.ts:1078 |
| <a id="statuscode"></a> `statusCode` | `readonly` | `number` | - | [`BigshipError`](#bigshiperror).[`statusCode`](#statuscode-3) | [packages/sdk/src/errors/BigshipError.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L31) |
| <a id="traceid"></a> `traceId?` | `readonly` | `string` | - | [`BigshipError`](#bigshiperror).[`traceId`](#traceid-3) | [packages/sdk/src/errors/BigshipError.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L35) |
| <a id="validationerrors"></a> `validationErrors?` | `readonly` | `Record`\<`string`, `string`[]\> | - | [`BigshipError`](#bigshiperror).[`validationErrors`](#validationerrors-3) | [packages/sdk/src/errors/BigshipError.ts:34](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L34) |
| <a id="stacktracelimit"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | [`BigshipError`](#bigshiperror).[`stackTraceLimit`](#stacktracelimit-3) | node\_modules/@types/node/globals.d.ts:68 |

#### Methods

##### isAuthError()

```ts
isAuthError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:61](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L61)

###### Returns

`boolean`

###### Inherited from

[`BigshipError`](#bigshiperror).[`isAuthError`](#isautherror-3)

##### isRateLimitError()

```ts
isRateLimitError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:57](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L57)

###### Returns

`boolean`

###### Inherited from

[`BigshipError`](#bigshiperror).[`isRateLimitError`](#isratelimiterror-3)

##### isValidationError()

```ts
isValidationError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:53](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L53)

###### Returns

`boolean`

###### Inherited from

[`BigshipError`](#bigshiperror).[`isValidationError`](#isvalidationerror-3)

##### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

###### Returns

`void`

###### Inherited from

[`BigshipError`](#bigshiperror).[`captureStackTrace`](#capturestacktrace-3)

##### prepareStackTrace()

```ts
static prepareStackTrace(err: Error, stackTraces: CallSite[]): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:56

###### Parameters

###### err

`Error`

###### stackTraces

`CallSite`[]

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

[`BigshipError`](#bigshiperror).[`prepareStackTrace`](#preparestacktrace-3)

***

### BigshipAuthError

Defined in: [packages/sdk/src/errors/index.ts:147](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L147)

Error thrown when authentication fails

#### Example

```ts
try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipAuthError) {
    console.error('Authentication failed - check credentials');
  }
}
```

#### Extends

- [`BigshipApiError`](#bigshipapierror)

#### Constructors

##### Constructor

```ts
new BigshipAuthError(message?: string, options?: Omit<BigshipApiErrorOptions, "code" | "apiResponse">): BigshipAuthError;
```

Defined in: [packages/sdk/src/errors/index.ts:148](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L148)

###### Parameters

###### message?

`string` = `'Authentication failed'`

###### options?

`Omit`\<[`BigshipApiErrorOptions`](#bigshipapierroroptions), `"code"` \| `"apiResponse"`\> = `{}`

###### Returns

[`BigshipAuthError`](#bigshipautherror)

###### Overrides

[`BigshipApiError`](#bigshipapierror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="apiresponse-1"></a> `apiResponse?` | `readonly` | [`BigshipErrorData`](#bigshiperrordata) | - | [`BigshipApiError`](#bigshipapierror).[`apiResponse`](#apiresponse) | [packages/sdk/src/errors/BigshipError.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L33) |
| <a id="cause-1"></a> `cause?` | `public` | `unknown` | - | [`BigshipApiError`](#bigshipapierror).[`cause`](#cause) | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="code-1"></a> `code?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`code`](#code) | [packages/sdk/src/errors/BigshipError.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L32) |
| <a id="endpoint-1"></a> `endpoint?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`endpoint`](#endpoint) | [packages/sdk/src/errors/index.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L32) |
| <a id="message-1"></a> `message` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`message`](#message) | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name-1"></a> `name` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`name`](#name) | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="requestid-1"></a> `requestId?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`requestId`](#requestid) | [packages/sdk/src/errors/index.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L31) |
| <a id="responsebody-1"></a> `responseBody?` | `readonly` | `unknown` | - | [`BigshipApiError`](#bigshipapierror).[`responseBody`](#responsebody) | [packages/sdk/src/errors/index.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L33) |
| <a id="stack-1"></a> `stack?` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`stack`](#stack) | node\_modules/typescript/lib/lib.es5.d.ts:1078 |
| <a id="statuscode-1"></a> `statusCode` | `readonly` | `number` | - | [`BigshipApiError`](#bigshipapierror).[`statusCode`](#statuscode) | [packages/sdk/src/errors/BigshipError.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L31) |
| <a id="traceid-1"></a> `traceId?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`traceId`](#traceid) | [packages/sdk/src/errors/BigshipError.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L35) |
| <a id="validationerrors-1"></a> `validationErrors?` | `readonly` | `Record`\<`string`, `string`[]\> | - | [`BigshipApiError`](#bigshipapierror).[`validationErrors`](#validationerrors) | [packages/sdk/src/errors/BigshipError.ts:34](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L34) |
| <a id="stacktracelimit-1"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | [`BigshipApiError`](#bigshipapierror).[`stackTraceLimit`](#stacktracelimit) | node\_modules/@types/node/globals.d.ts:68 |

#### Methods

##### isAuthError()

```ts
isAuthError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:61](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L61)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isAuthError`](#isautherror)

##### isRateLimitError()

```ts
isRateLimitError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:57](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L57)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isRateLimitError`](#isratelimiterror)

##### isValidationError()

```ts
isValidationError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:53](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L53)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isValidationError`](#isvalidationerror)

##### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

###### Returns

`void`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`captureStackTrace`](#capturestacktrace)

##### prepareStackTrace()

```ts
static prepareStackTrace(err: Error, stackTraces: CallSite[]): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:56

###### Parameters

###### err

`Error`

###### stackTraces

`CallSite`[]

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`prepareStackTrace`](#preparestacktrace)

***

### BigshipClient

Defined in: [packages/sdk/src/core/BigshipClient.ts:79](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L79)

#### Constructors

##### Constructor

```ts
new BigshipClient(config: BigshipConfig & {
  loggerAdapter?: LoggerAdapter;
}): BigshipClient;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:87](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L87)

###### Parameters

###### config

[`BigshipConfig`](#bigshipconfig) & \{
  `loggerAdapter?`: [`LoggerAdapter`](#loggeradapter);
\}

###### Returns

[`BigshipClient`](#bigshipclient)

#### Methods

##### addHeavyOrder()

```ts
addHeavyOrder(payload: {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2b";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}, options?: RequestOptions): Promise<{
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:348](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L348)

###### Parameters

###### payload

###### consignee_detail

\{
  `company_name?`: `string`;
  `consignee_address`: \{
     `address_landmark?`: `string`;
     `address_line1`: `string`;
     `address_line2?`: `string`;
     `pincode`: `string`;
  \};
  `contact_number_primary`: `string`;
  `contact_number_secondary?`: `string`;
  `email_id?`: `string`;
  `first_name`: `string`;
  `last_name`: `string`;
\} = `ConsigneeDetailSchema`

###### consignee_detail.company_name?

`string` = `...`

###### consignee_detail.consignee_address

\{
  `address_landmark?`: `string`;
  `address_line1`: `string`;
  `address_line2?`: `string`;
  `pincode`: `string`;
\} = `ConsigneeAddressSchema`

###### consignee_detail.consignee_address.address_landmark?

`string` = `...`

###### consignee_detail.consignee_address.address_line1

`string` = `...`

###### consignee_detail.consignee_address.address_line2?

`string` = `...`

###### consignee_detail.consignee_address.pincode

`string` = `...`

###### consignee_detail.contact_number_primary

`string` = `...`

###### consignee_detail.contact_number_secondary?

`string` = `...`

###### consignee_detail.email_id?

`string` = `...`

###### consignee_detail.first_name

`string` = `...`

###### consignee_detail.last_name

`string` = `...`

###### order_detail

\{
  `box_details`: \{
     `box_count`: `number`;
     `each_box_collectable_amount?`: `number`;
     `each_box_dead_weight`: `number`;
     `each_box_height`: `number`;
     `each_box_invoice_amount?`: `number`;
     `each_box_length`: `number`;
     `each_box_width`: `number`;
     `product_details`: \{
        `each_product_collectable_amount?`: `number`;
        `each_product_invoice_amount?`: `number`;
        `hsn?`: `string`;
        `product_category`: `string`;
        `product_name`: `string`;
        `product_quantity`: `number`;
        `product_sub_category?`: `string`;
     \}[];
  \}[];
  `document_detail`: \{
     `ewaybill_document_file?`: `string`;
     `invoice_document_file`: `string`;
  \};
  `ewaybill_number?`: `string`;
  `invoice_date`: `string`;
  `invoice_id`: `string`;
  `payment_type`: `"Prepaid"` \| `"COD"` \| `"ToPay"`;
  `shipment_invoice_amount`: `number`;
  `total_collectable_amount?`: `number`;
\} = `OrderDetailB2BSchema`

###### order_detail.box_details

\{
  `box_count`: `number`;
  `each_box_collectable_amount?`: `number`;
  `each_box_dead_weight`: `number`;
  `each_box_height`: `number`;
  `each_box_invoice_amount?`: `number`;
  `each_box_length`: `number`;
  `each_box_width`: `number`;
  `product_details`: \{
     `each_product_collectable_amount?`: `number`;
     `each_product_invoice_amount?`: `number`;
     `hsn?`: `string`;
     `product_category`: `string`;
     `product_name`: `string`;
     `product_quantity`: `number`;
     `product_sub_category?`: `string`;
  \}[];
\}[] = `...`

###### order_detail.document_detail

\{
  `ewaybill_document_file?`: `string`;
  `invoice_document_file`: `string`;
\} = `DocumentDetailB2BSchema`

###### order_detail.document_detail.ewaybill_document_file?

`string` = `...`

###### order_detail.document_detail.invoice_document_file

`string` = `...`

###### order_detail.ewaybill_number?

`string` = `...`

###### order_detail.invoice_date

`string` = `...`

###### order_detail.invoice_id

`string` = `...`

###### order_detail.payment_type

`"Prepaid"` \| `"COD"` \| `"ToPay"` = `...`

###### order_detail.shipment_invoice_amount

`number` = `...`

###### order_detail.total_collectable_amount?

`number` = `...`

###### shipment_category

`"b2b"` = `...`

###### warehouse_detail

\{
  `pickup_location_id`: `number`;
  `return_location_id`: `number`;
\} = `WarehouseDetailSchema`

###### warehouse_detail.pickup_location_id

`number` = `...`

###### warehouse_detail.return_location_id

`number` = `...`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`: `string` \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails.

###### Throws

When invoice ID already exists.

###### Throws

When API request fails

##### addSingleOrder()

```ts
addSingleOrder(payload: {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2c";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}, options?: RequestOptions): Promise<{
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:336](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L336)

###### Parameters

###### payload

###### consignee_detail

\{
  `company_name?`: `string`;
  `consignee_address`: \{
     `address_landmark?`: `string`;
     `address_line1`: `string`;
     `address_line2?`: `string`;
     `pincode`: `string`;
  \};
  `contact_number_primary`: `string`;
  `contact_number_secondary?`: `string`;
  `email_id?`: `string`;
  `first_name`: `string`;
  `last_name`: `string`;
\} = `ConsigneeDetailSchema`

###### consignee_detail.company_name?

`string` = `...`

###### consignee_detail.consignee_address

\{
  `address_landmark?`: `string`;
  `address_line1`: `string`;
  `address_line2?`: `string`;
  `pincode`: `string`;
\} = `ConsigneeAddressSchema`

###### consignee_detail.consignee_address.address_landmark?

`string` = `...`

###### consignee_detail.consignee_address.address_line1

`string` = `...`

###### consignee_detail.consignee_address.address_line2?

`string` = `...`

###### consignee_detail.consignee_address.pincode

`string` = `...`

###### consignee_detail.contact_number_primary

`string` = `...`

###### consignee_detail.contact_number_secondary?

`string` = `...`

###### consignee_detail.email_id?

`string` = `...`

###### consignee_detail.first_name

`string` = `...`

###### consignee_detail.last_name

`string` = `...`

###### order_detail

\{
  `box_details`: \{
     `box_count`: `1`;
     `each_box_collectable_amount`: `number`;
     `each_box_dead_weight`: `number`;
     `each_box_height`: `number`;
     `each_box_invoice_amount`: `number`;
     `each_box_length`: `number`;
     `each_box_width`: `number`;
     `product_details`: \{
        `each_product_collectable_amount?`: `number`;
        `each_product_invoice_amount?`: `number`;
        `hsn?`: `string`;
        `product_category`: `string`;
        `product_name`: `string`;
        `product_quantity`: `number`;
        `product_sub_category?`: `string`;
     \}[];
  \}[];
  `document_detail`: \{
     `ewaybill_document_file?`: `string`;
     `invoice_document_file?`: `string`;
  \};
  `ewaybill_number?`: `string`;
  `invoice_date`: `string`;
  `invoice_id`: `string`;
  `payment_type`: `"Prepaid"` \| `"COD"`;
  `shipment_invoice_amount`: `number`;
  `total_collectable_amount?`: `number`;
\} = `OrderDetailB2CSchema`

###### order_detail.box_details

\{
  `box_count`: `1`;
  `each_box_collectable_amount`: `number`;
  `each_box_dead_weight`: `number`;
  `each_box_height`: `number`;
  `each_box_invoice_amount`: `number`;
  `each_box_length`: `number`;
  `each_box_width`: `number`;
  `product_details`: \{
     `each_product_collectable_amount?`: `number`;
     `each_product_invoice_amount?`: `number`;
     `hsn?`: `string`;
     `product_category`: `string`;
     `product_name`: `string`;
     `product_quantity`: `number`;
     `product_sub_category?`: `string`;
  \}[];
\}[] = `...`

###### order_detail.document_detail

\{
  `ewaybill_document_file?`: `string`;
  `invoice_document_file?`: `string`;
\} = `DocumentDetailB2CSchema`

###### order_detail.document_detail.ewaybill_document_file?

`string` = `...`

###### order_detail.document_detail.invoice_document_file?

`string` = `...`

###### order_detail.ewaybill_number?

`string` = `...`

###### order_detail.invoice_date

`string` = `...`

###### order_detail.invoice_id

`string` = `...`

###### order_detail.payment_type

`"Prepaid"` \| `"COD"` = `...`

###### order_detail.shipment_invoice_amount

`number` = `...`

###### order_detail.total_collectable_amount?

`number` = `...`

###### shipment_category

`"b2c"` = `...`

###### warehouse_detail

\{
  `pickup_location_id`: `number`;
  `return_location_id`: `number`;
\} = `WarehouseDetailSchema`

###### warehouse_detail.pickup_location_id

`number` = `...`

###### warehouse_detail.return_location_id

`number` = `...`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`: `string` \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails.

###### Throws

When invoice ID already exists.

###### Throws

When API request fails

##### addWarehouse()

```ts
addWarehouse(payload: {
  address_landmark?: string;
  address_line1: string;
  address_line2?: string;
  address_pincode: string;
  contact_number_primary: string;
}, options?: RequestOptions): Promise<{
  data:   | {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:297](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L297)

###### Parameters

###### payload

###### address_landmark?

`string` = `...`

###### address_line1

`string` = `...`

###### address_line2?

`string` = `...`

###### address_pincode

`string` = `...`

###### contact_number_primary

`string` = `...`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `address_city`: `string`;
     `address_country?`: `string`;
     `address_email_id?`: `string`;
     `address_landmark`: `string` \| `null`;
     `address_line1`: `string`;
     `address_line2`: `string` \| `null`;
     `address_pincode`: `string`;
     `address_state`: `string`;
     `create_date?`: `string`;
     `warehouse_contact_number_primary`: `string`;
     `warehouse_contact_person`: `string`;
     `warehouse_id`: `number`;
     `warehouse_name`: `string`;
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails

##### calculateRate()

```ts
calculateRate(payload: {
  box_details: {
     box_count: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_length: number;
     each_box_width: number;
  }[];
  destination_pincode: string;
  payment_type: "Prepaid" | "COD" | "ToPay";
  pickup_pincode: string;
  risk_type?: string;
  shipment_category: "B2C" | "B2B" | "b2c" | "b2b";
  shipment_invoice_amount: number;
}, options?: RequestOptions): Promise<{
  data:   | {
     billable_weight: number;
     courier_charge: number;
     courier_id: number;
     courier_name: string;
     courier_type: string;
     other_additional_charges:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name: string | null;
     tat: number;
     total_shipping_charges: number;
     zone: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:394](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L394)

###### Parameters

###### payload

###### box_details

\{
  `box_count`: `number`;
  `each_box_dead_weight`: `number`;
  `each_box_height`: `number`;
  `each_box_length`: `number`;
  `each_box_width`: `number`;
\}[] = `...`

###### destination_pincode

`string` = `...`

###### payment_type

`"Prepaid"` \| `"COD"` \| `"ToPay"` = `...`

###### pickup_pincode

`string` = `...`

###### risk_type?

`string` = `...`

###### shipment_category

`"B2C"` \| `"B2B"` \| `"b2c"` \| `"b2b"` = `...`

###### shipment_invoice_amount

`number` = `...`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `billable_weight`: `number`;
     `courier_charge`: `number`;
     `courier_id`: `number`;
     `courier_name`: `string`;
     `courier_type`: `string`;
     `other_additional_charges`:   \| \{
        `courier_charge?`: `number`;
        `green_tax?`: `number`;
        `handling_charge?`: `number`;
        `lr_cost?`: `number`;
        `oda?`: `number`;
        `odc_charge?`: `number`;
        `pickup_charge?`: `number`;
        `risk_type_charge?`: `number`;
        `state_tax?`: `number`;
        `to_pay?`: `number`;
        `warai_charge?`: `number`;
      \}
        \| `null`;
     `risk_type_name`: `string` \| `null`;
     `tat`: `number`;
     `total_shipping_charges`: `number`;
     `zone`: `string`;
   \}[]
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails.

###### Throws

When API request fails

##### cancelShipments()

```ts
cancelShipments(awbs: string[], options?: RequestOptions): Promise<{
  data:   | {
     cancel_response: string;
     courier_id: number;
     master_awb: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:384](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L384)

###### Parameters

###### awbs

`string`[]

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `cancel_response`: `string`;
     `courier_id`: `number`;
     `master_awb`: `string`;
   \}[]
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails.

###### Throws

When API request fails

##### createAndFinalizeShipment()

```ts
createAndFinalizeShipment(config: {
  awbPollDelay?: number;
  awbPollMaxAttempts?: number;
  courierId: number;
  options?: RequestOptions;
  order:   | {
     consignee_detail: {
        company_name?: string;
        consignee_address: {
           address_landmark?: string;
           address_line1: string;
           address_line2?: string;
           pincode: string;
        };
        contact_number_primary: string;
        contact_number_secondary?: string;
        email_id?: string;
        first_name: string;
        last_name: string;
     };
     order_detail: {
        box_details: {
           box_count: 1;
           each_box_collectable_amount: number;
           each_box_dead_weight: number;
           each_box_height: number;
           each_box_invoice_amount: number;
           each_box_length: number;
           each_box_width: number;
           product_details: {
              each_product_collectable_amount?: number;
              each_product_invoice_amount?: number;
              hsn?: string;
              product_category: string;
              product_name: string;
              product_quantity: number;
              product_sub_category?: string;
           }[];
        }[];
        document_detail: {
           ewaybill_document_file?: string;
           invoice_document_file?: string;
        };
        ewaybill_number?: string;
        invoice_date: string;
        invoice_id: string;
        payment_type: "Prepaid" | "COD";
        shipment_invoice_amount: number;
        total_collectable_amount?: number;
     };
     shipment_category: "b2c";
     warehouse_detail: {
        pickup_location_id: number;
        return_location_id: number;
     };
   }
     | {
     consignee_detail: {
        company_name?: string;
        consignee_address: {
           address_landmark?: string;
           address_line1: string;
           address_line2?: string;
           pincode: string;
        };
        contact_number_primary: string;
        contact_number_secondary?: string;
        email_id?: string;
        first_name: string;
        last_name: string;
     };
     order_detail: {
        box_details: {
           box_count: number;
           each_box_collectable_amount?: number;
           each_box_dead_weight: number;
           each_box_height: number;
           each_box_invoice_amount?: number;
           each_box_length: number;
           each_box_width: number;
           product_details: {
              each_product_collectable_amount?: number;
              each_product_invoice_amount?: number;
              hsn?: string;
              product_category: string;
              product_name: string;
              product_quantity: number;
              product_sub_category?: string;
           }[];
        }[];
        document_detail: {
           ewaybill_document_file?: string;
           invoice_document_file: string;
        };
        ewaybill_number?: string;
        invoice_date: string;
        invoice_id: string;
        payment_type: "Prepaid" | "COD" | "ToPay";
        shipment_invoice_amount: number;
        total_collectable_amount?: number;
     };
     shipment_category: "b2b";
     warehouse_detail: {
        pickup_location_id: number;
        return_location_id: number;
     };
   };
}): Promise<{
  awb: string;
  courierName: string;
  labelData: string;
  manifestData: string;
  orderId: string;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:545](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L545)

###### Parameters

###### config

###### awbPollDelay?

`number`

Delay between AWB poll attempts in ms (default: 2000)

###### awbPollMaxAttempts?

`number`

Max attempts to poll for AWB availability after manifest (default: 5)

###### courierId

`number`

###### options?

[`RequestOptions`](#requestoptions)

###### order

  \| \{
  `consignee_detail`: \{
     `company_name?`: `string`;
     `consignee_address`: \{
        `address_landmark?`: `string`;
        `address_line1`: `string`;
        `address_line2?`: `string`;
        `pincode`: `string`;
     \};
     `contact_number_primary`: `string`;
     `contact_number_secondary?`: `string`;
     `email_id?`: `string`;
     `first_name`: `string`;
     `last_name`: `string`;
  \};
  `order_detail`: \{
     `box_details`: \{
        `box_count`: `1`;
        `each_box_collectable_amount`: `number`;
        `each_box_dead_weight`: `number`;
        `each_box_height`: `number`;
        `each_box_invoice_amount`: `number`;
        `each_box_length`: `number`;
        `each_box_width`: `number`;
        `product_details`: \{
           `each_product_collectable_amount?`: `number`;
           `each_product_invoice_amount?`: `number`;
           `hsn?`: `string`;
           `product_category`: `string`;
           `product_name`: `string`;
           `product_quantity`: `number`;
           `product_sub_category?`: `string`;
        \}[];
     \}[];
     `document_detail`: \{
        `ewaybill_document_file?`: `string`;
        `invoice_document_file?`: `string`;
     \};
     `ewaybill_number?`: `string`;
     `invoice_date`: `string`;
     `invoice_id`: `string`;
     `payment_type`: `"Prepaid"` \| `"COD"`;
     `shipment_invoice_amount`: `number`;
     `total_collectable_amount?`: `number`;
  \};
  `shipment_category`: `"b2c"`;
  `warehouse_detail`: \{
     `pickup_location_id`: `number`;
     `return_location_id`: `number`;
  \};
\}
  \| \{
  `consignee_detail`: \{
     `company_name?`: `string`;
     `consignee_address`: \{
        `address_landmark?`: `string`;
        `address_line1`: `string`;
        `address_line2?`: `string`;
        `pincode`: `string`;
     \};
     `contact_number_primary`: `string`;
     `contact_number_secondary?`: `string`;
     `email_id?`: `string`;
     `first_name`: `string`;
     `last_name`: `string`;
  \};
  `order_detail`: \{
     `box_details`: \{
        `box_count`: `number`;
        `each_box_collectable_amount?`: `number`;
        `each_box_dead_weight`: `number`;
        `each_box_height`: `number`;
        `each_box_invoice_amount?`: `number`;
        `each_box_length`: `number`;
        `each_box_width`: `number`;
        `product_details`: \{
           `each_product_collectable_amount?`: `number`;
           `each_product_invoice_amount?`: `number`;
           `hsn?`: `string`;
           `product_category`: `string`;
           `product_name`: `string`;
           `product_quantity`: `number`;
           `product_sub_category?`: `string`;
        \}[];
     \}[];
     `document_detail`: \{
        `ewaybill_document_file?`: `string`;
        `invoice_document_file`: `string`;
     \};
     `ewaybill_number?`: `string`;
     `invoice_date`: `string`;
     `invoice_id`: `string`;
     `payment_type`: `"Prepaid"` \| `"COD"` \| `"ToPay"`;
     `shipment_invoice_amount`: `number`;
     `total_collectable_amount?`: `number`;
  \};
  `shipment_category`: `"b2b"`;
  `warehouse_detail`: \{
     `pickup_location_id`: `number`;
     `return_location_id`: `number`;
  \};
\}

###### Returns

`Promise`\<\{
  `awb`: `string`;
  `courierName`: `string`;
  `labelData`: `string`;
  `manifestData`: `string`;
  `orderId`: `string`;
\}\>

###### Throws

When order creation or AWB polling fails

##### getAWB()

```ts
getAWB(systemOrderId: string, options?: RequestOptions): Promise<{
  data:   | {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:407](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L407)

###### Parameters

###### systemOrderId

`string`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `courier_id`: `string`;
     `courier_name`: `string`;
     `lr_number`: `string` \| `null`;
     `master_awb`: `string`;
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### getCourierList()

```ts
getCourierList(shipmentCategory?: "b2c" | "b2b", options?: RequestOptions): Promise<{
  data:   | {
     admin_status?: boolean;
     courier_id: number;
     courier_name: string;
     courier_status?: boolean;
     courier_type?: "Surface" | "Air";
     shipment_category: "b2c" | "b2b";
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:272](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L272)

###### Parameters

###### shipmentCategory?

`"b2c"` \| `"b2b"`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `admin_status?`: `boolean`;
     `courier_id`: `number`;
     `courier_name`: `string`;
     `courier_status?`: `boolean`;
     `courier_type?`: `"Surface"` \| `"Air"`;
     `shipment_category`: `"b2c"` \| `"b2b"`;
   \}[]
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### getCourierTransporterList()

```ts
getCourierTransporterList(courierId: number, options?: RequestOptions): Promise<{
  data:   | {
     courier_id: number;
     courier_name: string;
     transport_id: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:279](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L279)

###### Parameters

###### courierId

`number`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `courier_id`: `number`;
     `courier_name`: `string`;
     `transport_id`: `string`;
   \}[]
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### getPaymentCategory()

```ts
getPaymentCategory(shipmentCategory?: "b2c" | "b2b", options?: RequestOptions): Promise<{
  data:   | {
     payment_category: "Prepaid" | "COD" | "ToPay";
     status: boolean;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:288](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L288)

###### Parameters

###### shipmentCategory?

`"b2c"` \| `"b2b"`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `payment_category`: `"Prepaid"` \| `"COD"` \| `"ToPay"`;
     `status`: `boolean`;
   \}[]
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### getShipmentData()

###### Call Signature

```ts
getShipmentData(
   shipmentDataId: 1, 
   systemOrderId: string, 
   options?: RequestOptions): Promise<{
  data:   | {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:432](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L432)

###### Parameters

###### shipmentDataId

`1`

###### systemOrderId

`string`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `courier_id`: `string`;
     `courier_name`: `string`;
     `lr_number`: `string` \| `null`;
     `master_awb`: `string`;
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails or invalid shipmentDataId

###### Call Signature

```ts
getShipmentData(
   shipmentDataId: 2 | 3, 
   systemOrderId: string, 
   options?: RequestOptions): Promise<{
  data:   | string
     | {
     res_FileContent: string;
     res_FileName?: string;
     res_MediaType?: string;
     res_PrintFor?: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:433](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L433)

###### Parameters

###### shipmentDataId

`2` \| `3`

###### systemOrderId

`string`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| `string`
     \| \{
     `res_FileContent`: `string`;
     `res_FileName?`: `string`;
     `res_MediaType?`: `string`;
     `res_PrintFor?`: `string`;
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails or invalid shipmentDataId

###### Call Signature

```ts
getShipmentData(
   shipmentDataId: number, 
   systemOrderId: string, 
options?: RequestOptions): Promise<ShipmentDataAnyResponse>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:434](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L434)

###### Parameters

###### shipmentDataId

`number`

###### systemOrderId

`string`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<[`ShipmentDataAnyResponse`](#shipmentdataanyresponse)\>

###### Throws

When API request fails or invalid shipmentDataId

##### getShipmentDetails()

```ts
getShipmentDetails(orderId: string, options?: RequestOptions): Promise<{
  awb: string;
  courierId: string;
  courierName: string;
  labelData: string;
  manifestData: string;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:513](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L513)

###### Parameters

###### orderId

`string`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `awb`: `string`;
  `courierId`: `string`;
  `courierName`: `string`;
  `labelData`: `string`;
  `manifestData`: `string`;
\}\>

###### Throws

When AWB, label, or manifest data is not available

##### getShipmentFile()

```ts
getShipmentFile(
   shipmentDataId: 2 | 3, 
   systemOrderId: string, 
   options?: RequestOptions): Promise<{
  data:   | string
     | {
     res_FileContent: string;
     res_FileName?: string;
     res_MediaType?: string;
     res_PrintFor?: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:414](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L414)

###### Parameters

###### shipmentDataId

`2` \| `3`

###### systemOrderId

`string`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| `string`
     \| \{
     `res_FileContent`: `string`;
     `res_FileName?`: `string`;
     `res_MediaType?`: `string`;
     `res_PrintFor?`: `string`;
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails or data is null

##### getShippingRates()

```ts
getShippingRates(
   systemOrderId: string, 
   shipmentCategory?: "B2C" | "B2B" | "b2c" | "b2b", 
   riskType?: string, 
   options?: RequestOptions): Promise<{
  data:   | {
     billable_weight?: number;
     cod_charge?: number;
     courier_charge?: number;
     courier_id: number;
     courier_name: string;
     courier_type?: string;
     freight_charge?: number;
     other_additional_charges?:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name?: string | null;
     system_order_id?: number;
     tat?: number;
     total_shipping_charges: number;
     zone?: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:376](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L376)

###### Parameters

###### systemOrderId

`string`

###### shipmentCategory?

`"B2C"` \| `"B2B"` \| `"b2c"` \| `"b2b"`

###### riskType?

`string` = `''`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `billable_weight?`: `number`;
     `cod_charge?`: `number`;
     `courier_charge?`: `number`;
     `courier_id`: `number`;
     `courier_name`: `string`;
     `courier_type?`: `string`;
     `freight_charge?`: `number`;
     `other_additional_charges?`:   \| \{
        `courier_charge?`: `number`;
        `green_tax?`: `number`;
        `handling_charge?`: `number`;
        `lr_cost?`: `number`;
        `oda?`: `number`;
        `odc_charge?`: `number`;
        `pickup_charge?`: `number`;
        `risk_type_charge?`: `number`;
        `state_tax?`: `number`;
        `to_pay?`: `number`;
        `warai_charge?`: `number`;
      \}
        \| `null`;
     `risk_type_name?`: `string` \| `null`;
     `system_order_id?`: `number`;
     `tat?`: `number`;
     `total_shipping_charges`: `number`;
     `zone?`: `string`;
   \}[]
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### getWalletBalance()

```ts
getWalletBalance(options?: RequestOptions): Promise<{
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:263](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L263)

###### Parameters

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`: `string` \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### getWarehouseList()

```ts
getWarehouseList(
   pageIndex?: number, 
   pageSize?: number, 
   options?: RequestOptions): Promise<{
  data:   | {
     result_count: number;
     result_data: {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
     }[];
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:305](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L305)

###### Parameters

###### pageIndex?

`number` = `1`

###### pageSize?

`number` = `10`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `result_count`: `number`;
     `result_data`: \{
        `address_city`: `string`;
        `address_country?`: `string`;
        `address_email_id?`: `string`;
        `address_landmark`: `string` \| `null`;
        `address_line1`: `string`;
        `address_line2`: `string` \| `null`;
        `address_pincode`: `string`;
        `address_state`: `string`;
        `create_date?`: `string`;
        `warehouse_contact_number_primary`: `string`;
        `warehouse_contact_person`: `string`;
        `warehouse_id`: `number`;
        `warehouse_name`: `string`;
     \}[];
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### ~~login()~~

```ts
login(): Promise<string>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:256](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L256)

###### Returns

`Promise`\<`string`\>

###### Deprecated

Token management is handled automatically by TokenManager

##### manifestAndGetAWB()

```ts
manifestAndGetAWB(
   orderId: string, 
   courierId: number, 
   options?: RequestOptions): Promise<{
  awb: string;
  courierName: string;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:491](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L491)

###### Parameters

###### orderId

`string`

###### courierId

`number`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `awb`: `string`;
  `courierName`: `string`;
\}\>

###### Throws

When AWB data is not available after manifest

##### manifestHeavy()

```ts
manifestHeavy(payload: {
  courier_id: number;
  risk_type?: string;
  system_order_id: string;
}, options?: RequestOptions): Promise<{
  data: null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:368](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L368)

###### Parameters

###### payload

###### courier_id

`number` = `...`

###### risk_type?

`string` = `...`

###### system_order_id

`string` = `...`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`: `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails.

###### Throws

When API request fails

##### manifestSingle()

```ts
manifestSingle(payload: {
  courier_id: number;
  system_order_id: string;
}, options?: RequestOptions): Promise<{
  data: null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:360](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L360)

###### Parameters

###### payload

###### courier_id

`number` = `...`

###### system_order_id

`string` = `...`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`: `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When request validation fails.

###### Throws

When API request fails

##### trackShipment()

```ts
trackShipment(
   trackingId: string, 
   trackingType?: "awb" | "lrn", 
   options?: RequestOptions): Promise<{
  data:   | {
     order_detail: {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
     };
     scan_histories: {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
     }[];
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:450](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L450)

###### Parameters

###### trackingId

`string`

###### trackingType?

`"awb"` \| `"lrn"`

###### options?

[`RequestOptions`](#requestoptions)

###### Returns

`Promise`\<\{
  `data`:   \| \{
     `order_detail`: \{
        `courier_name?`: `string`;
        `current_tracking_datetime?`: `string`;
        `current_tracking_status?`: `string`;
        `invoice_id?`: `string`;
        `order_manifest_datetime?`: `string`;
        `tracking_id`: `string`;
        `tracking_type`: `string`;
     \};
     `scan_histories`: \{
        `scan_datetime`: `string`;
        `scan_location?`: `string`;
        `scan_remarks?`: `string`;
        `scan_status`: `string`;
     \}[];
   \}
     \| `null`;
  `message`: `string`;
  `responseCode`: `number`;
  `success`: `boolean`;
\}\>

###### Throws

When API request fails

##### workflow()

```ts
workflow(): ShipmentWorkflow;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:623](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L623)

###### Returns

[`ShipmentWorkflow`](#shipmentworkflow)

##### fileToBase64DataURI()

```ts
static fileToBase64DataURI(file: File): Promise<string>;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:325](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L325)

###### Parameters

###### file

`File`

###### Returns

`Promise`\<`string`\>

##### isValidBase64DataURI()

```ts
static isValidBase64DataURI(value: string): boolean;
```

Defined in: [packages/sdk/src/core/BigshipClient.ts:329](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L329)

###### Parameters

###### value

`string`

###### Returns

`boolean`

***

### BigshipDuplicateInvoiceError

Defined in: [packages/sdk/src/errors/index.ts:69](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L69)

Error thrown when a duplicate invoice ID is detected

#### Example

```ts
try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipDuplicateInvoiceError) {
    console.log('Duplicate invoice ID:', error.invoiceId);
    console.log('Please use a different invoice number');
  }
}
```

#### Extends

- [`BigshipApiError`](#bigshipapierror)

#### Constructors

##### Constructor

```ts
new BigshipDuplicateInvoiceError(invoiceId: string, options?: Omit<BigshipApiErrorOptions, "code">): BigshipDuplicateInvoiceError;
```

Defined in: [packages/sdk/src/errors/index.ts:72](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L72)

###### Parameters

###### invoiceId

`string`

###### options?

`Omit`\<[`BigshipApiErrorOptions`](#bigshipapierroroptions), `"code"`\> = `{}`

###### Returns

[`BigshipDuplicateInvoiceError`](#bigshipduplicateinvoiceerror)

###### Overrides

[`BigshipApiError`](#bigshipapierror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="apiresponse-2"></a> `apiResponse?` | `readonly` | [`BigshipErrorData`](#bigshiperrordata) | - | [`BigshipApiError`](#bigshipapierror).[`apiResponse`](#apiresponse) | [packages/sdk/src/errors/BigshipError.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L33) |
| <a id="cause-2"></a> `cause?` | `public` | `unknown` | - | [`BigshipApiError`](#bigshipapierror).[`cause`](#cause) | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="code-2"></a> `code?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`code`](#code) | [packages/sdk/src/errors/BigshipError.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L32) |
| <a id="endpoint-2"></a> `endpoint?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`endpoint`](#endpoint) | [packages/sdk/src/errors/index.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L32) |
| <a id="invoiceid"></a> `invoiceId` | `readonly` | `string` | - | - | [packages/sdk/src/errors/index.ts:70](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L70) |
| <a id="message-2"></a> `message` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`message`](#message) | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name-2"></a> `name` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`name`](#name) | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="requestid-2"></a> `requestId?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`requestId`](#requestid) | [packages/sdk/src/errors/index.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L31) |
| <a id="responsebody-2"></a> `responseBody?` | `readonly` | `unknown` | - | [`BigshipApiError`](#bigshipapierror).[`responseBody`](#responsebody) | [packages/sdk/src/errors/index.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L33) |
| <a id="stack-2"></a> `stack?` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`stack`](#stack) | node\_modules/typescript/lib/lib.es5.d.ts:1078 |
| <a id="statuscode-2"></a> `statusCode` | `readonly` | `number` | - | [`BigshipApiError`](#bigshipapierror).[`statusCode`](#statuscode) | [packages/sdk/src/errors/BigshipError.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L31) |
| <a id="traceid-2"></a> `traceId?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`traceId`](#traceid) | [packages/sdk/src/errors/BigshipError.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L35) |
| <a id="validationerrors-2"></a> `validationErrors?` | `readonly` | `Record`\<`string`, `string`[]\> | - | [`BigshipApiError`](#bigshipapierror).[`validationErrors`](#validationerrors) | [packages/sdk/src/errors/BigshipError.ts:34](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L34) |
| <a id="stacktracelimit-2"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | [`BigshipApiError`](#bigshipapierror).[`stackTraceLimit`](#stacktracelimit) | node\_modules/@types/node/globals.d.ts:68 |

#### Methods

##### isAuthError()

```ts
isAuthError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:61](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L61)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isAuthError`](#isautherror)

##### isRateLimitError()

```ts
isRateLimitError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:57](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L57)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isRateLimitError`](#isratelimiterror)

##### isValidationError()

```ts
isValidationError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:53](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L53)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isValidationError`](#isvalidationerror)

##### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

###### Returns

`void`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`captureStackTrace`](#capturestacktrace)

##### prepareStackTrace()

```ts
static prepareStackTrace(err: Error, stackTraces: CallSite[]): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:56

###### Parameters

###### err

`Error`

###### stackTraces

`CallSite`[]

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`prepareStackTrace`](#preparestacktrace)

***

### BigshipError

Defined in: [packages/sdk/src/errors/BigshipError.ts:30](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L30)

Custom error class for Bigship API errors
Provides structured access to error details and helper methods for error type checking

#### Example

```ts
try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipError) {
    if (error.isValidationError()) {
      console.error('Validation failed:', error.validationErrors);
    }
    if (error.isRateLimitError()) {
      console.error('Rate limited, retry after 60s');
    }
    console.error('Status:', error.statusCode);
    console.error('Trace ID:', error.traceId);
  }
}
```

#### Extends

- `Error`

#### Extended by

- [`BigshipApiError`](#bigshipapierror)

#### Constructors

##### Constructor

```ts
new BigshipError(
   message: string, 
   statusCode?: number, 
   code?: string, 
   apiResponse?: BigshipErrorData, 
   options?: {
  cause?: Error;
}): BigshipError;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:37](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L37)

###### Parameters

###### message

`string`

###### statusCode?

`number`

###### code?

`string`

###### apiResponse?

[`BigshipErrorData`](#bigshiperrordata)

###### options?

###### cause?

`Error`

###### Returns

[`BigshipError`](#bigshiperror)

###### Overrides

```ts
Error.constructor
```

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="apiresponse-3"></a> `apiResponse?` | `readonly` | [`BigshipErrorData`](#bigshiperrordata) | - | - | [packages/sdk/src/errors/BigshipError.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L33) |
| <a id="cause-3"></a> `cause?` | `public` | `unknown` | - | `Error.cause` | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="code-3"></a> `code?` | `readonly` | `string` | - | - | [packages/sdk/src/errors/BigshipError.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L32) |
| <a id="message-3"></a> `message` | `public` | `string` | - | `Error.message` | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name-3"></a> `name` | `public` | `string` | - | `Error.name` | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="stack-3"></a> `stack?` | `public` | `string` | - | `Error.stack` | node\_modules/typescript/lib/lib.es5.d.ts:1078 |
| <a id="statuscode-3"></a> `statusCode` | `readonly` | `number` | - | - | [packages/sdk/src/errors/BigshipError.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L31) |
| <a id="traceid-3"></a> `traceId?` | `readonly` | `string` | - | - | [packages/sdk/src/errors/BigshipError.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L35) |
| <a id="validationerrors-3"></a> `validationErrors?` | `readonly` | `Record`\<`string`, `string`[]\> | - | - | [packages/sdk/src/errors/BigshipError.ts:34](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L34) |
| <a id="stacktracelimit-3"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | `Error.stackTraceLimit` | node\_modules/@types/node/globals.d.ts:68 |

#### Methods

##### isAuthError()

```ts
isAuthError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:61](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L61)

###### Returns

`boolean`

##### isRateLimitError()

```ts
isRateLimitError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:57](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L57)

###### Returns

`boolean`

##### isValidationError()

```ts
isValidationError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:53](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L53)

###### Returns

`boolean`

##### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

###### Returns

`void`

###### Inherited from

```ts
Error.captureStackTrace
```

##### prepareStackTrace()

```ts
static prepareStackTrace(err: Error, stackTraces: CallSite[]): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:56

###### Parameters

###### err

`Error`

###### stackTraces

`CallSite`[]

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

```ts
Error.prepareStackTrace
```

***

### BigshipNetworkError

Defined in: [packages/sdk/src/errors/index.ts:169](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L169)

Error thrown when network request fails
Uses statusCode -1 since this is not an HTTP error.
Check `error instanceof BigshipNetworkError` rather than comparing statusCode.

#### Extends

- [`BigshipApiError`](#bigshipapierror)

#### Constructors

##### Constructor

```ts
new BigshipNetworkError(message: string, options?: Omit<BigshipApiErrorOptions, "code">): BigshipNetworkError;
```

Defined in: [packages/sdk/src/errors/index.ts:170](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L170)

###### Parameters

###### message

`string`

###### options?

`Omit`\<[`BigshipApiErrorOptions`](#bigshipapierroroptions), `"code"`\> = `{}`

###### Returns

[`BigshipNetworkError`](#bigshipnetworkerror)

###### Overrides

[`BigshipApiError`](#bigshipapierror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="apiresponse-4"></a> `apiResponse?` | `readonly` | [`BigshipErrorData`](#bigshiperrordata) | - | [`BigshipApiError`](#bigshipapierror).[`apiResponse`](#apiresponse) | [packages/sdk/src/errors/BigshipError.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L33) |
| <a id="cause-4"></a> `cause?` | `public` | `unknown` | - | [`BigshipApiError`](#bigshipapierror).[`cause`](#cause) | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="code-4"></a> `code?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`code`](#code) | [packages/sdk/src/errors/BigshipError.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L32) |
| <a id="endpoint-3"></a> `endpoint?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`endpoint`](#endpoint) | [packages/sdk/src/errors/index.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L32) |
| <a id="message-4"></a> `message` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`message`](#message) | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name-4"></a> `name` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`name`](#name) | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="requestid-3"></a> `requestId?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`requestId`](#requestid) | [packages/sdk/src/errors/index.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L31) |
| <a id="responsebody-3"></a> `responseBody?` | `readonly` | `unknown` | - | [`BigshipApiError`](#bigshipapierror).[`responseBody`](#responsebody) | [packages/sdk/src/errors/index.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L33) |
| <a id="stack-4"></a> `stack?` | `public` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`stack`](#stack) | node\_modules/typescript/lib/lib.es5.d.ts:1078 |
| <a id="statuscode-4"></a> `statusCode` | `readonly` | `number` | - | [`BigshipApiError`](#bigshipapierror).[`statusCode`](#statuscode) | [packages/sdk/src/errors/BigshipError.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L31) |
| <a id="traceid-4"></a> `traceId?` | `readonly` | `string` | - | [`BigshipApiError`](#bigshipapierror).[`traceId`](#traceid) | [packages/sdk/src/errors/BigshipError.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L35) |
| <a id="validationerrors-4"></a> `validationErrors?` | `readonly` | `Record`\<`string`, `string`[]\> | - | [`BigshipApiError`](#bigshipapierror).[`validationErrors`](#validationerrors) | [packages/sdk/src/errors/BigshipError.ts:34](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L34) |
| <a id="stacktracelimit-4"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | [`BigshipApiError`](#bigshipapierror).[`stackTraceLimit`](#stacktracelimit) | node\_modules/@types/node/globals.d.ts:68 |

#### Methods

##### isAuthError()

```ts
isAuthError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:61](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L61)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isAuthError`](#isautherror)

##### isRateLimitError()

```ts
isRateLimitError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:57](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L57)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isRateLimitError`](#isratelimiterror)

##### isValidationError()

```ts
isValidationError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:53](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L53)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isValidationError`](#isvalidationerror)

##### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

###### Returns

`void`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`captureStackTrace`](#capturestacktrace)

##### prepareStackTrace()

```ts
static prepareStackTrace(err: Error, stackTraces: CallSite[]): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:56

###### Parameters

###### err

`Error`

###### stackTraces

`CallSite`[]

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`prepareStackTrace`](#preparestacktrace)

***

### BigshipValidationError

Defined in: [packages/sdk/src/errors/index.ts:111](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L111)

Error thrown when request validation fails

#### Example

```ts
try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipValidationError) {
    console.error('Validation errors:', error.validationErrors);
    // { invoice_id: ['Invalid format'], pincode: ['Invalid pincode'] }
  }
}
```

#### Extends

- [`BigshipApiError`](#bigshipapierror)

#### Constructors

##### Constructor

```ts
new BigshipValidationError(
   message: string, 
   validationErrors: Record<string, string[]>, 
   options?: Omit<BigshipApiErrorOptions, "code" | "apiResponse">): BigshipValidationError;
```

Defined in: [packages/sdk/src/errors/index.ts:114](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L114)

###### Parameters

###### message

`string`

###### validationErrors

`Record`\<`string`, `string`[]\>

###### options?

`Omit`\<[`BigshipApiErrorOptions`](#bigshipapierroroptions), `"code"` \| `"apiResponse"`\> = `{}`

###### Returns

[`BigshipValidationError`](#bigshipvalidationerror)

###### Overrides

[`BigshipApiError`](#bigshipapierror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="apiresponse-5"></a> `apiResponse?` | `readonly` | [`BigshipErrorData`](#bigshiperrordata) | - | - | [`BigshipApiError`](#bigshipapierror).[`apiResponse`](#apiresponse) | [packages/sdk/src/errors/BigshipError.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L33) |
| <a id="cause-5"></a> `cause?` | `public` | `unknown` | - | - | [`BigshipApiError`](#bigshipapierror).[`cause`](#cause) | node\_modules/typescript/lib/lib.es2022.error.d.ts:26 |
| <a id="code-5"></a> `code?` | `readonly` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`code`](#code) | [packages/sdk/src/errors/BigshipError.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L32) |
| <a id="endpoint-4"></a> `endpoint?` | `readonly` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`endpoint`](#endpoint) | [packages/sdk/src/errors/index.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L32) |
| <a id="message-5"></a> `message` | `public` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`message`](#message) | node\_modules/typescript/lib/lib.es5.d.ts:1077 |
| <a id="name-5"></a> `name` | `public` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`name`](#name) | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="requestid-4"></a> `requestId?` | `readonly` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`requestId`](#requestid) | [packages/sdk/src/errors/index.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L31) |
| <a id="responsebody-4"></a> `responseBody?` | `readonly` | `unknown` | - | - | [`BigshipApiError`](#bigshipapierror).[`responseBody`](#responsebody) | [packages/sdk/src/errors/index.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L33) |
| <a id="stack-5"></a> `stack?` | `public` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`stack`](#stack) | node\_modules/typescript/lib/lib.es5.d.ts:1078 |
| <a id="statuscode-5"></a> `statusCode` | `readonly` | `number` | - | - | [`BigshipApiError`](#bigshipapierror).[`statusCode`](#statuscode) | [packages/sdk/src/errors/BigshipError.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L31) |
| <a id="traceid-5"></a> `traceId?` | `readonly` | `string` | - | - | [`BigshipApiError`](#bigshipapierror).[`traceId`](#traceid) | [packages/sdk/src/errors/BigshipError.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L35) |
| <a id="validationerrors-5"></a> `validationErrors` | `readonly` | `Record`\<`string`, `string`[]\> | - | [`BigshipApiError`](#bigshipapierror).[`validationErrors`](#validationerrors) | - | [packages/sdk/src/errors/index.ts:112](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L112) |
| <a id="stacktracelimit-5"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | - | [`BigshipApiError`](#bigshipapierror).[`stackTraceLimit`](#stacktracelimit) | node\_modules/@types/node/globals.d.ts:68 |

#### Methods

##### isAuthError()

```ts
isAuthError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:61](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L61)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isAuthError`](#isautherror)

##### isRateLimitError()

```ts
isRateLimitError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:57](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L57)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isRateLimitError`](#isratelimiterror)

##### isValidationError()

```ts
isValidationError(): boolean;
```

Defined in: [packages/sdk/src/errors/BigshipError.ts:53](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L53)

###### Returns

`boolean`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`isValidationError`](#isvalidationerror)

##### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

###### Returns

`void`

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`captureStackTrace`](#capturestacktrace)

##### prepareStackTrace()

```ts
static prepareStackTrace(err: Error, stackTraces: CallSite[]): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:56

###### Parameters

###### err

`Error`

###### stackTraces

`CallSite`[]

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

[`BigshipApiError`](#bigshipapierror).[`prepareStackTrace`](#preparestacktrace)

***

### ShipmentWorkflow

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:8](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L8)

#### Constructors

##### Constructor

```ts
new ShipmentWorkflow(client: BigshipClient): ShipmentWorkflow;
```

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:14](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L14)

###### Parameters

###### client

[`BigshipClient`](#bigshipclient)

###### Returns

[`ShipmentWorkflow`](#shipmentworkflow)

#### Methods

##### create()

```ts
create(order: 
  | {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2c";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}
  | {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2b";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}): Promise<ShipmentWorkflow>;
```

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:18](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L18)

###### Parameters

###### order

  \| \{
  `consignee_detail`: \{
     `company_name?`: `string`;
     `consignee_address`: \{
        `address_landmark?`: `string`;
        `address_line1`: `string`;
        `address_line2?`: `string`;
        `pincode`: `string`;
     \};
     `contact_number_primary`: `string`;
     `contact_number_secondary?`: `string`;
     `email_id?`: `string`;
     `first_name`: `string`;
     `last_name`: `string`;
  \};
  `order_detail`: \{
     `box_details`: \{
        `box_count`: `1`;
        `each_box_collectable_amount`: `number`;
        `each_box_dead_weight`: `number`;
        `each_box_height`: `number`;
        `each_box_invoice_amount`: `number`;
        `each_box_length`: `number`;
        `each_box_width`: `number`;
        `product_details`: \{
           `each_product_collectable_amount?`: `number`;
           `each_product_invoice_amount?`: `number`;
           `hsn?`: `string`;
           `product_category`: `string`;
           `product_name`: `string`;
           `product_quantity`: `number`;
           `product_sub_category?`: `string`;
        \}[];
     \}[];
     `document_detail`: \{
        `ewaybill_document_file?`: `string`;
        `invoice_document_file?`: `string`;
     \};
     `ewaybill_number?`: `string`;
     `invoice_date`: `string`;
     `invoice_id`: `string`;
     `payment_type`: `"Prepaid"` \| `"COD"`;
     `shipment_invoice_amount`: `number`;
     `total_collectable_amount?`: `number`;
  \};
  `shipment_category`: `"b2c"`;
  `warehouse_detail`: \{
     `pickup_location_id`: `number`;
     `return_location_id`: `number`;
  \};
\}
  \| \{
  `consignee_detail`: \{
     `company_name?`: `string`;
     `consignee_address`: \{
        `address_landmark?`: `string`;
        `address_line1`: `string`;
        `address_line2?`: `string`;
        `pincode`: `string`;
     \};
     `contact_number_primary`: `string`;
     `contact_number_secondary?`: `string`;
     `email_id?`: `string`;
     `first_name`: `string`;
     `last_name`: `string`;
  \};
  `order_detail`: \{
     `box_details`: \{
        `box_count`: `number`;
        `each_box_collectable_amount?`: `number`;
        `each_box_dead_weight`: `number`;
        `each_box_height`: `number`;
        `each_box_invoice_amount?`: `number`;
        `each_box_length`: `number`;
        `each_box_width`: `number`;
        `product_details`: \{
           `each_product_collectable_amount?`: `number`;
           `each_product_invoice_amount?`: `number`;
           `hsn?`: `string`;
           `product_category`: `string`;
           `product_name`: `string`;
           `product_quantity`: `number`;
           `product_sub_category?`: `string`;
        \}[];
     \}[];
     `document_detail`: \{
        `ewaybill_document_file?`: `string`;
        `invoice_document_file`: `string`;
     \};
     `ewaybill_number?`: `string`;
     `invoice_date`: `string`;
     `invoice_id`: `string`;
     `payment_type`: `"Prepaid"` \| `"COD"` \| `"ToPay"`;
     `shipment_invoice_amount`: `number`;
     `total_collectable_amount?`: `number`;
  \};
  `shipment_category`: `"b2b"`;
  `warehouse_detail`: \{
     `pickup_location_id`: `number`;
     `return_location_id`: `number`;
  \};
\}

###### Returns

`Promise`\<[`ShipmentWorkflow`](#shipmentworkflow)\>

##### execute()

```ts
execute(order: 
  | {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2c";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}
  | {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2b";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}, courierId: number): Promise<{
  awb: string;
  courierName: string;
  labelData: string;
  manifestData: string;
}>;
```

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:77](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L77)

###### Parameters

###### order

  \| \{
  `consignee_detail`: \{
     `company_name?`: `string`;
     `consignee_address`: \{
        `address_landmark?`: `string`;
        `address_line1`: `string`;
        `address_line2?`: `string`;
        `pincode`: `string`;
     \};
     `contact_number_primary`: `string`;
     `contact_number_secondary?`: `string`;
     `email_id?`: `string`;
     `first_name`: `string`;
     `last_name`: `string`;
  \};
  `order_detail`: \{
     `box_details`: \{
        `box_count`: `1`;
        `each_box_collectable_amount`: `number`;
        `each_box_dead_weight`: `number`;
        `each_box_height`: `number`;
        `each_box_invoice_amount`: `number`;
        `each_box_length`: `number`;
        `each_box_width`: `number`;
        `product_details`: \{
           `each_product_collectable_amount?`: `number`;
           `each_product_invoice_amount?`: `number`;
           `hsn?`: `string`;
           `product_category`: `string`;
           `product_name`: `string`;
           `product_quantity`: `number`;
           `product_sub_category?`: `string`;
        \}[];
     \}[];
     `document_detail`: \{
        `ewaybill_document_file?`: `string`;
        `invoice_document_file?`: `string`;
     \};
     `ewaybill_number?`: `string`;
     `invoice_date`: `string`;
     `invoice_id`: `string`;
     `payment_type`: `"Prepaid"` \| `"COD"`;
     `shipment_invoice_amount`: `number`;
     `total_collectable_amount?`: `number`;
  \};
  `shipment_category`: `"b2c"`;
  `warehouse_detail`: \{
     `pickup_location_id`: `number`;
     `return_location_id`: `number`;
  \};
\}
  \| \{
  `consignee_detail`: \{
     `company_name?`: `string`;
     `consignee_address`: \{
        `address_landmark?`: `string`;
        `address_line1`: `string`;
        `address_line2?`: `string`;
        `pincode`: `string`;
     \};
     `contact_number_primary`: `string`;
     `contact_number_secondary?`: `string`;
     `email_id?`: `string`;
     `first_name`: `string`;
     `last_name`: `string`;
  \};
  `order_detail`: \{
     `box_details`: \{
        `box_count`: `number`;
        `each_box_collectable_amount?`: `number`;
        `each_box_dead_weight`: `number`;
        `each_box_height`: `number`;
        `each_box_invoice_amount?`: `number`;
        `each_box_length`: `number`;
        `each_box_width`: `number`;
        `product_details`: \{
           `each_product_collectable_amount?`: `number`;
           `each_product_invoice_amount?`: `number`;
           `hsn?`: `string`;
           `product_category`: `string`;
           `product_name`: `string`;
           `product_quantity`: `number`;
           `product_sub_category?`: `string`;
        \}[];
     \}[];
     `document_detail`: \{
        `ewaybill_document_file?`: `string`;
        `invoice_document_file`: `string`;
     \};
     `ewaybill_number?`: `string`;
     `invoice_date`: `string`;
     `invoice_id`: `string`;
     `payment_type`: `"Prepaid"` \| `"COD"` \| `"ToPay"`;
     `shipment_invoice_amount`: `number`;
     `total_collectable_amount?`: `number`;
  \};
  `shipment_category`: `"b2b"`;
  `warehouse_detail`: \{
     `pickup_location_id`: `number`;
     `return_location_id`: `number`;
  \};
\}

###### courierId

`number`

###### Returns

`Promise`\<\{
  `awb`: `string`;
  `courierName`: `string`;
  `labelData`: `string`;
  `manifestData`: `string`;
\}\>

##### finalize()

```ts
finalize(): Promise<{
  awb: string;
  courierName: string;
  labelData: string;
  manifestData: string;
}>;
```

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:55](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L55)

###### Returns

`Promise`\<\{
  `awb`: `string`;
  `courierName`: `string`;
  `labelData`: `string`;
  `manifestData`: `string`;
\}\>

##### manifest()

```ts
manifest(): Promise<ShipmentWorkflow>;
```

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:41](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L41)

###### Returns

`Promise`\<[`ShipmentWorkflow`](#shipmentworkflow)\>

##### withCourier()

```ts
withCourier(courierId: number): this;
```

Defined in: [packages/sdk/src/workflow/ShipmentWorkflow.ts:36](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/workflow/ShipmentWorkflow.ts#L36)

###### Parameters

###### courierId

`number`

###### Returns

`this`

## Interfaces

### ApiResponse

Defined in: [packages/sdk/src/core/types.ts:596](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L596)

Base API response wrapper
All Bigship API responses follow this structure

#### Type Parameters

##### T

`T` = `unknown`

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="data"></a> `data` | `T` \| `null` | [packages/sdk/src/core/types.ts:600](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L600) |
| <a id="message-6"></a> `message` | `string` | [packages/sdk/src/core/types.ts:598](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L598) |
| <a id="responsecode"></a> `responseCode` | `number` | [packages/sdk/src/core/types.ts:599](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L599) |
| <a id="success"></a> `success` | `boolean` | [packages/sdk/src/core/types.ts:597](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L597) |

***

### BigshipApiErrorOptions

Defined in: [packages/sdk/src/errors/index.ts:5](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L5)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="apiresponse-7"></a> `apiResponse?` | [`BigshipErrorData`](#bigshiperrordata) | [packages/sdk/src/errors/index.ts:7](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L7) |
| <a id="cause-6"></a> `cause?` | `Error` | [packages/sdk/src/errors/index.ts:11](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L11) |
| <a id="code-6"></a> `code?` | `string` | [packages/sdk/src/errors/index.ts:6](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L6) |
| <a id="endpoint-5"></a> `endpoint?` | `string` | [packages/sdk/src/errors/index.ts:9](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L9) |
| <a id="requestid-5"></a> `requestId?` | `string` | [packages/sdk/src/errors/index.ts:8](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L8) |
| <a id="responsebody-5"></a> `responseBody?` | `unknown` | [packages/sdk/src/errors/index.ts:10](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L10) |

***

### BigshipConfig

Defined in: [packages/sdk/src/core/types.ts:6](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L6)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="accesskey"></a> `accessKey` | `string` | [packages/sdk/src/core/types.ts:10](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L10) |
| <a id="baseurl"></a> `baseURL` | `string` | [packages/sdk/src/core/types.ts:7](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L7) |
| <a id="enabledetailedlogging"></a> `enableDetailedLogging?` | `boolean` | [packages/sdk/src/core/types.ts:14](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L14) |
| <a id="maxretries"></a> `maxRetries?` | `number` | [packages/sdk/src/core/types.ts:15](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L15) |
| <a id="maxretrydelay"></a> `maxRetryDelay?` | `number` | [packages/sdk/src/core/types.ts:17](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L17) |
| <a id="onbeforerequest"></a> `onBeforeRequest?` | (`config`: `InternalAxiosRequestConfig`) => \| `InternalAxiosRequestConfig`\<`any`, `any`\> \| `Promise`\<`InternalAxiosRequestConfig`\<`any`, `any`\>\> | [packages/sdk/src/core/types.ts:25](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L25) |
| <a id="onerror"></a> `onError?` | (`error`: [`BigshipError`](#bigshiperror), `context`: [`RequestContext`](#requestcontext)) => `void` \| `Promise`\<`void`\> | [packages/sdk/src/core/types.ts:23](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L23) |
| <a id="onresponse"></a> `onResponse?` | (`response`: [`ApiResponse`](#apiresponse-6)\<`unknown`\>, `context`: [`RequestContext`](#requestcontext)) => `void` \| `Promise`\<`void`\> | [packages/sdk/src/core/types.ts:22](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L22) |
| <a id="onretry"></a> `onRetry?` | (`attempt`: `number`, `error`: [`BigshipError`](#bigshiperror), `context`: [`RequestContext`](#requestcontext)) => `void` \| `Promise`\<`void`\> | [packages/sdk/src/core/types.ts:24](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L24) |
| <a id="password"></a> `password` | `string` | [packages/sdk/src/core/types.ts:9](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L9) |
| <a id="retrydelay"></a> `retryDelay?` | `number` | [packages/sdk/src/core/types.ts:16](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L16) |
| <a id="retryonstatuscodes"></a> `retryOnStatusCodes?` | `number`[] | [packages/sdk/src/core/types.ts:18](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L18) |
| <a id="timeout"></a> `timeout?` | `number` | [packages/sdk/src/core/types.ts:11](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L11) |
| <a id="tokenttlms"></a> `tokenTtlMs?` | `number` | [packages/sdk/src/core/types.ts:19](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L19) |
| <a id="username"></a> `userName` | `string` | [packages/sdk/src/core/types.ts:8](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L8) |

***

### BigshipErrorData

Defined in: [packages/sdk/src/errors/BigshipError.ts:1](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L1)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="errors"></a> `errors?` | `Record`\<`string`, `string`[]\> | [packages/sdk/src/errors/BigshipError.ts:4](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L4) |
| <a id="message-7"></a> `message?` | `string` | [packages/sdk/src/errors/BigshipError.ts:3](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L3) |
| <a id="status"></a> `status?` | `string` | [packages/sdk/src/errors/BigshipError.ts:2](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L2) |
| <a id="trace_id"></a> `trace_id?` | `string` | [packages/sdk/src/errors/BigshipError.ts:5](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/BigshipError.ts#L5) |

***

### LoggerAdapter

Defined in: [packages/sdk/src/core/types.ts:32](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L32)

Logger interface for pluggable logging.
Implement this interface to integrate with Winston, pino, etc.

#### Methods

##### debug()?

```ts
optional debug(message: string, data?: unknown): void;
```

Defined in: [packages/sdk/src/core/types.ts:33](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L33)

###### Parameters

###### message

`string`

###### data?

`unknown`

###### Returns

`void`

##### error()?

```ts
optional error(message: string, data?: unknown): void;
```

Defined in: [packages/sdk/src/core/types.ts:36](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L36)

###### Parameters

###### message

`string`

###### data?

`unknown`

###### Returns

`void`

##### info()?

```ts
optional info(message: string, data?: unknown): void;
```

Defined in: [packages/sdk/src/core/types.ts:34](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L34)

###### Parameters

###### message

`string`

###### data?

`unknown`

###### Returns

`void`

##### warn()?

```ts
optional warn(message: string, data?: unknown): void;
```

Defined in: [packages/sdk/src/core/types.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L35)

###### Parameters

###### message

`string`

###### data?

`unknown`

###### Returns

`void`

***

### RequestContext

Defined in: [packages/sdk/src/core/types.ts:43](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L43)

Request context for event hooks
Provides information about the current request for logging and debugging

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="attempt"></a> `attempt?` | `number` | [packages/sdk/src/core/types.ts:47](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L47) |
| <a id="duration"></a> `duration?` | `number` | [packages/sdk/src/core/types.ts:49](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L49) |
| <a id="endpoint-6"></a> `endpoint` | `string` | [packages/sdk/src/core/types.ts:44](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L44) |
| <a id="method"></a> `method` | `string` | [packages/sdk/src/core/types.ts:45](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L45) |
| <a id="requestid-6"></a> `requestId?` | `string` | [packages/sdk/src/core/types.ts:46](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L46) |
| <a id="starttime"></a> `startTime` | `number` | [packages/sdk/src/core/types.ts:48](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L48) |

***

### RequestOptions

Defined in: [packages/sdk/src/core/BigshipClient.ts:72](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L72)

Per-request options that can override client-level defaults.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="signal"></a> `signal?` | `AbortSignal` | AbortSignal to cancel the request | [packages/sdk/src/core/BigshipClient.ts:76](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L76) |
| <a id="timeout-1"></a> `timeout?` | `number` | Override the default timeout (ms) for this request | [packages/sdk/src/core/BigshipClient.ts:74](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/BigshipClient.ts#L74) |

## Type Aliases

### AddHeavyOrderRequest

```ts
type AddHeavyOrderRequest = z.infer<typeof AddHeavyOrderRequestSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:253](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L253)

***

### AddOrderResponse

```ts
type AddOrderResponse = z.infer<typeof AddOrderResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:528](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L528)

***

### AddSingleOrderRequest

```ts
type AddSingleOrderRequest = z.infer<typeof AddSingleOrderRequestSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:243](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L243)

***

### BigshipUtilsType

```ts
type BigshipUtilsType = typeof BigshipUtils;
```

Defined in: [packages/sdk/src/utils/index.ts:72](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L72)

***

### CalculateRateResponse

```ts
type CalculateRateResponse = z.infer<typeof CalculateRateResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:535](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L535)

***

### CancelResponse

```ts
type CancelResponse = z.infer<typeof CancelResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:530](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L530)

***

### CourierListResponse

```ts
type CourierListResponse = z.infer<typeof CourierListResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:523](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L523)

***

### DocumentDetailB2B

```ts
type DocumentDetailB2B = z.infer<typeof DocumentDetailB2BSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:162](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L162)

Document files for B2B orders

#### Example

```ts
document_detail: {
  invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
  ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
}
```

***

### DocumentDetailB2C

```ts
type DocumentDetailB2C = z.infer<typeof DocumentDetailB2CSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:147](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L147)

Document files for B2C orders

#### Example

```ts
document_detail: {
  invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
}
```

***

### LoginRequest

```ts
type LoginRequest = z.infer<typeof LoginRequestSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:64](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L64)

***

### LoginResponse

```ts
type LoginResponse = z.infer<typeof LoginResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:521](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L521)

***

### ManifestResponse

```ts
type ManifestResponse = z.infer<typeof ManifestResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:529](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L529)

***

### PaymentCategoryResponse

```ts
type PaymentCategoryResponse = z.infer<typeof PaymentCategoryResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:525](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L525)

***

### ProductCategory

```ts
type ProductCategory = typeof PRODUCT_CATEGORIES[number];
```

Defined in: [packages/sdk/src/core/types.ts:588](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L588)

***

### RateCalculatorRequest

```ts
type RateCalculatorRequest = z.infer<typeof RateCalculatorRequestSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:207](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L207)

***

### ShipmentAWBResponse

```ts
type ShipmentAWBResponse = z.infer<typeof ShipmentAWBResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:533](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L533)

***

### ShipmentDataAnyResponse

```ts
type ShipmentDataAnyResponse = 
  | ShipmentAWBResponse
  | ShipmentFileResponse;
```

Defined in: [packages/sdk/src/core/types.ts:542](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L542)

Union type for all possible shipment data responses
Use this when the shipment data type is unknown at compile time

***

### ShipmentDataResponse

```ts
type ShipmentDataResponse = z.infer<typeof ShipmentDataResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:532](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L532)

***

### ShipmentFileResponse

```ts
type ShipmentFileResponse = z.infer<typeof ShipmentFileResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:534](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L534)

***

### ShippingRatesResponse

```ts
type ShippingRatesResponse = z.infer<typeof ShippingRatesResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:531](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L531)

***

### TrackingResponse

```ts
type TrackingResponse = z.infer<typeof TrackingResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:536](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L536)

***

### TransporterListResponse

```ts
type TransporterListResponse = z.infer<typeof TransporterListResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:524](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L524)

***

### WalletBalanceResponse

```ts
type WalletBalanceResponse = z.infer<typeof WalletBalanceResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:522](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L522)

***

### WarehouseAddRequest

```ts
type WarehouseAddRequest = z.infer<typeof WarehouseAddRequestSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:231](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L231)

***

### WarehouseAddResponse

```ts
type WarehouseAddResponse = z.infer<typeof WarehouseAddResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:526](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L526)

***

### WarehouseListResponse

```ts
type WarehouseListResponse = z.infer<typeof WarehouseListResponseSchema>;
```

Defined in: [packages/sdk/src/core/types.ts:527](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L527)

## Variables

### AddHeavyOrderRequestSchema

```ts
const AddHeavyOrderRequestSchema: ZodObject<{
  consignee_detail: ZodObject<{
     company_name: ZodOptional<ZodString>;
     consignee_address: ZodObject<{
        address_landmark: ZodOptional<ZodString>;
        address_line1: ZodString;
        address_line2: ZodOptional<ZodString>;
        pincode: ZodString;
      }, "strip", ZodTypeAny, {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
      }, {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     }>;
     contact_number_primary: ZodString;
     contact_number_secondary: ZodOptional<ZodString>;
     email_id: ZodOptional<ZodString>;
     first_name: ZodString;
     last_name: ZodString;
   }, "strip", ZodTypeAny, {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
   }, {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  }>;
  order_detail: ZodObject<{
     box_details: ZodArray<ZodObject<{
        box_count: ZodNumber;
        each_box_collectable_amount: ZodOptional<ZodNumber>;
        each_box_dead_weight: ZodNumber;
        each_box_height: ZodNumber;
        each_box_invoice_amount: ZodOptional<ZodNumber>;
        each_box_length: ZodNumber;
        each_box_width: ZodNumber;
        product_details: ZodArray<ZodObject<{
           each_product_collectable_amount: ZodOptional<...>;
           each_product_invoice_amount: ZodOptional<...>;
           hsn: ZodOptional<...>;
           product_category: ZodString;
           product_name: ZodString;
           product_quantity: ZodNumber;
           product_sub_category: ZodOptional<...>;
         }, "strip", ZodTypeAny, {
           each_product_collectable_amount?: ... | ...;
           each_product_invoice_amount?: ... | ...;
           hsn?: ... | ...;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: ... | ...;
         }, {
           each_product_collectable_amount?: ... | ...;
           each_product_invoice_amount?: ... | ...;
           hsn?: ... | ...;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: ... | ...;
        }>, "many">;
      }, "strip", ZodTypeAny, {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
      }, {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }>, "many">;
     document_detail: ZodObject<{
        ewaybill_document_file: ZodOptional<ZodString>;
        invoice_document_file: ZodString;
      }, "strip", ZodTypeAny, {
        ewaybill_document_file?: string;
        invoice_document_file: string;
      }, {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     }>;
     ewaybill_number: ZodOptional<ZodString>;
     invoice_date: ZodString;
     invoice_id: ZodString;
     payment_type: ZodEnum<["Prepaid", "COD", "ToPay"]>;
     shipment_invoice_amount: ZodNumber;
     total_collectable_amount: ZodOptional<ZodNumber>;
   }, "strip", ZodTypeAny, {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
   }, {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  }>;
  shipment_category: ZodLiteral<"b2b">;
  warehouse_detail: ZodObject<{
     pickup_location_id: ZodNumber;
     return_location_id: ZodNumber;
   }, "strip", ZodTypeAny, {
     pickup_location_id: number;
     return_location_id: number;
   }, {
     pickup_location_id: number;
     return_location_id: number;
  }>;
}, "strip", ZodTypeAny, {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2b";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}, {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2b";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}>;
```

Defined in: [packages/sdk/src/core/types.ts:246](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L246)

***

### AdditionalChargesSchema

```ts
const AdditionalChargesSchema: ZodObject<{
  courier_charge: ZodOptional<ZodNumber>;
  green_tax: ZodOptional<ZodNumber>;
  handling_charge: ZodOptional<ZodNumber>;
  lr_cost: ZodOptional<ZodNumber>;
  oda: ZodOptional<ZodNumber>;
  odc_charge: ZodOptional<ZodNumber>;
  pickup_charge: ZodOptional<ZodNumber>;
  risk_type_charge: ZodOptional<ZodNumber>;
  state_tax: ZodOptional<ZodNumber>;
  to_pay: ZodOptional<ZodNumber>;
  warai_charge: ZodOptional<ZodNumber>;
}, "strip", ZodTypeAny, {
  courier_charge?: number;
  green_tax?: number;
  handling_charge?: number;
  lr_cost?: number;
  oda?: number;
  odc_charge?: number;
  pickup_charge?: number;
  risk_type_charge?: number;
  state_tax?: number;
  to_pay?: number;
  warai_charge?: number;
}, {
  courier_charge?: number;
  green_tax?: number;
  handling_charge?: number;
  lr_cost?: number;
  oda?: number;
  odc_charge?: number;
  pickup_charge?: number;
  risk_type_charge?: number;
  state_tax?: number;
  to_pay?: number;
  warai_charge?: number;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:384](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L384)

Additional charges breakdown for shipping rates

***

### AddOrderResponseSchema

```ts
const AddOrderResponseSchema: ZodObject<{
  data: ZodNullable<ZodString>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:357](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L357)

Response from addSingleOrder or addHeavyOrder

#### Example

```ts
// Success response
{
  success: true,
  message: "Order added successfully.",
  responseCode: 200,
  data: "1005202970"  // This is the system_order_id
}

// Error response
{
  success: false,
  message: "Invalid pincode",
  responseCode: 400,
  data: null
}
```

***

### AddSingleOrderRequestSchema

```ts
const AddSingleOrderRequestSchema: ZodObject<{
  consignee_detail: ZodObject<{
     company_name: ZodOptional<ZodString>;
     consignee_address: ZodObject<{
        address_landmark: ZodOptional<ZodString>;
        address_line1: ZodString;
        address_line2: ZodOptional<ZodString>;
        pincode: ZodString;
      }, "strip", ZodTypeAny, {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
      }, {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     }>;
     contact_number_primary: ZodString;
     contact_number_secondary: ZodOptional<ZodString>;
     email_id: ZodOptional<ZodString>;
     first_name: ZodString;
     last_name: ZodString;
   }, "strip", ZodTypeAny, {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
   }, {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  }>;
  order_detail: ZodObject<{
     box_details: ZodArray<ZodObject<{
        box_count: ZodLiteral<1>;
        each_box_collectable_amount: ZodNumber;
        each_box_dead_weight: ZodNumber;
        each_box_height: ZodNumber;
        each_box_invoice_amount: ZodNumber;
        each_box_length: ZodNumber;
        each_box_width: ZodNumber;
        product_details: ZodArray<ZodObject<{
           each_product_collectable_amount: ZodOptional<...>;
           each_product_invoice_amount: ZodOptional<...>;
           hsn: ZodOptional<...>;
           product_category: ZodString;
           product_name: ZodString;
           product_quantity: ZodNumber;
           product_sub_category: ZodOptional<...>;
         }, "strip", ZodTypeAny, {
           each_product_collectable_amount?: ... | ...;
           each_product_invoice_amount?: ... | ...;
           hsn?: ... | ...;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: ... | ...;
         }, {
           each_product_collectable_amount?: ... | ...;
           each_product_invoice_amount?: ... | ...;
           hsn?: ... | ...;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: ... | ...;
        }>, "many">;
      }, "strip", ZodTypeAny, {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
      }, {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }>, "many">;
     document_detail: ZodObject<{
        ewaybill_document_file: ZodOptional<ZodString>;
        invoice_document_file: ZodOptional<ZodString>;
      }, "strip", ZodTypeAny, {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
      }, {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     }>;
     ewaybill_number: ZodOptional<ZodString>;
     invoice_date: ZodString;
     invoice_id: ZodString;
     payment_type: ZodEnum<["Prepaid", "COD"]>;
     shipment_invoice_amount: ZodNumber;
     total_collectable_amount: ZodOptional<ZodNumber>;
   }, "strip", ZodTypeAny, {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
   }, {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  }>;
  shipment_category: ZodLiteral<"b2c">;
  warehouse_detail: ZodObject<{
     pickup_location_id: ZodNumber;
     return_location_id: ZodNumber;
   }, "strip", ZodTypeAny, {
     pickup_location_id: number;
     return_location_id: number;
   }, {
     pickup_location_id: number;
     return_location_id: number;
  }>;
}, "strip", ZodTypeAny, {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2c";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}, {
  consignee_detail: {
     company_name?: string;
     consignee_address: {
        address_landmark?: string;
        address_line1: string;
        address_line2?: string;
        pincode: string;
     };
     contact_number_primary: string;
     contact_number_secondary?: string;
     email_id?: string;
     first_name: string;
     last_name: string;
  };
  order_detail: {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  };
  shipment_category: "b2c";
  warehouse_detail: {
     pickup_location_id: number;
     return_location_id: number;
  };
}>;
```

Defined in: [packages/sdk/src/core/types.ts:236](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L236)

***

### BigshipUtils

```ts
const BigshipUtils: {
  calculateCollectableAmount: (paymentType: "Prepaid" | "COD", codAmount: number) => number;
  fileToBase64DataURI: (file: File) => Promise<string>;
  formatZodErrors: (zodErrors: ZodIssue[]) => Record<string, string[]>;
  isValidBase64DataURI: (value: string) => boolean;
  validateOrderDetail: (orderDetail: 
     | {
     box_details: {
        box_count: 1;
        each_box_collectable_amount: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file?: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
   }
     | {
     box_details: {
        box_count: number;
        each_box_collectable_amount?: number;
        each_box_dead_weight: number;
        each_box_height: number;
        each_box_invoice_amount?: number;
        each_box_length: number;
        each_box_width: number;
        product_details: {
           each_product_collectable_amount?: number;
           each_product_invoice_amount?: number;
           hsn?: string;
           product_category: string;
           product_name: string;
           product_quantity: number;
           product_sub_category?: string;
        }[];
     }[];
     document_detail: {
        ewaybill_document_file?: string;
        invoice_document_file: string;
     };
     ewaybill_number?: string;
     invoice_date: string;
     invoice_id: string;
     payment_type: "Prepaid" | "COD" | "ToPay";
     shipment_invoice_amount: number;
     total_collectable_amount?: number;
  }, shipmentCategory: "b2c" | "b2b") => void;
};
```

Defined in: [packages/sdk/src/utils/index.ts:64](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L64)

#### Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| <a id="property-calculatecollectableamount"></a> `calculateCollectableAmount()` | (`paymentType`: `"Prepaid"` \| `"COD"`, `codAmount`: `number`) => `number` | [packages/sdk/src/utils/index.ts:67](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L67) |
| <a id="property-filetobase64datauri"></a> `fileToBase64DataURI()` | (`file`: `File`) => `Promise`\<`string`\> | [packages/sdk/src/utils/index.ts:65](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L65) |
| <a id="property-formatzoderrors"></a> `formatZodErrors()` | (`zodErrors`: `ZodIssue`[]) => `Record`\<`string`, `string`[]\> | [packages/sdk/src/utils/index.ts:69](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L69) |
| <a id="property-isvalidbase64datauri"></a> `isValidBase64DataURI()` | (`value`: `string`) => `boolean` | [packages/sdk/src/utils/index.ts:66](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L66) |
| <a id="property-validateorderdetail"></a> `validateOrderDetail()` | (`orderDetail`: \| \{ `box_details`: \{ `box_count`: `1`; `each_box_collectable_amount`: `number`; `each_box_dead_weight`: `number`; `each_box_height`: `number`; `each_box_invoice_amount`: `number`; `each_box_length`: `number`; `each_box_width`: `number`; `product_details`: \{ `each_product_collectable_amount?`: `number`; `each_product_invoice_amount?`: `number`; `hsn?`: `string`; `product_category`: `string`; `product_name`: `string`; `product_quantity`: `number`; `product_sub_category?`: `string`; \}[]; \}[]; `document_detail`: \{ `ewaybill_document_file?`: `string`; `invoice_document_file?`: `string`; \}; `ewaybill_number?`: `string`; `invoice_date`: `string`; `invoice_id`: `string`; `payment_type`: `"Prepaid"` \| `"COD"`; `shipment_invoice_amount`: `number`; `total_collectable_amount?`: `number`; \} \| \{ `box_details`: \{ `box_count`: `number`; `each_box_collectable_amount?`: `number`; `each_box_dead_weight`: `number`; `each_box_height`: `number`; `each_box_invoice_amount?`: `number`; `each_box_length`: `number`; `each_box_width`: `number`; `product_details`: \{ `each_product_collectable_amount?`: `number`; `each_product_invoice_amount?`: `number`; `hsn?`: `string`; `product_category`: `string`; `product_name`: `string`; `product_quantity`: `number`; `product_sub_category?`: `string`; \}[]; \}[]; `document_detail`: \{ `ewaybill_document_file?`: `string`; `invoice_document_file`: `string`; \}; `ewaybill_number?`: `string`; `invoice_date`: `string`; `invoice_id`: `string`; `payment_type`: `"Prepaid"` \| `"COD"` \| `"ToPay"`; `shipment_invoice_amount`: `number`; `total_collectable_amount?`: `number`; \}, `shipmentCategory`: `"b2c"` \| `"b2b"`) => `void` | [packages/sdk/src/utils/index.ts:68](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L68) |

***

### BoxDetailB2BSchema

```ts
const BoxDetailB2BSchema: ZodObject<{
  box_count: ZodNumber;
  each_box_collectable_amount: ZodOptional<ZodNumber>;
  each_box_dead_weight: ZodNumber;
  each_box_height: ZodNumber;
  each_box_invoice_amount: ZodOptional<ZodNumber>;
  each_box_length: ZodNumber;
  each_box_width: ZodNumber;
  product_details: ZodArray<ZodObject<{
     each_product_collectable_amount: ZodOptional<ZodNumber>;
     each_product_invoice_amount: ZodOptional<ZodNumber>;
     hsn: ZodOptional<ZodString>;
     product_category: ZodString;
     product_name: ZodString;
     product_quantity: ZodNumber;
     product_sub_category: ZodOptional<ZodString>;
   }, "strip", ZodTypeAny, {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
   }, {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
  }>, "many">;
}, "strip", ZodTypeAny, {
  box_count: number;
  each_box_collectable_amount?: number;
  each_box_dead_weight: number;
  each_box_height: number;
  each_box_invoice_amount?: number;
  each_box_length: number;
  each_box_width: number;
  product_details: {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
  }[];
}, {
  box_count: number;
  each_box_collectable_amount?: number;
  each_box_dead_weight: number;
  each_box_height: number;
  each_box_invoice_amount?: number;
  each_box_length: number;
  each_box_width: number;
  product_details: {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
  }[];
}>;
```

Defined in: [packages/sdk/src/core/types.ts:112](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L112)

***

### BoxDetailB2CSchema

```ts
const BoxDetailB2CSchema: ZodObject<{
  box_count: ZodLiteral<1>;
  each_box_collectable_amount: ZodNumber;
  each_box_dead_weight: ZodNumber;
  each_box_height: ZodNumber;
  each_box_invoice_amount: ZodNumber;
  each_box_length: ZodNumber;
  each_box_width: ZodNumber;
  product_details: ZodArray<ZodObject<{
     each_product_collectable_amount: ZodOptional<ZodNumber>;
     each_product_invoice_amount: ZodOptional<ZodNumber>;
     hsn: ZodOptional<ZodString>;
     product_category: ZodString;
     product_name: ZodString;
     product_quantity: ZodNumber;
     product_sub_category: ZodOptional<ZodString>;
   }, "strip", ZodTypeAny, {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
   }, {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
  }>, "many">;
}, "strip", ZodTypeAny, {
  box_count: 1;
  each_box_collectable_amount: number;
  each_box_dead_weight: number;
  each_box_height: number;
  each_box_invoice_amount: number;
  each_box_length: number;
  each_box_width: number;
  product_details: {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
  }[];
}, {
  box_count: 1;
  each_box_collectable_amount: number;
  each_box_dead_weight: number;
  each_box_height: number;
  each_box_invoice_amount: number;
  each_box_length: number;
  each_box_width: number;
  product_details: {
     each_product_collectable_amount?: number;
     each_product_invoice_amount?: number;
     hsn?: string;
     product_category: string;
     product_name: string;
     product_quantity: number;
     product_sub_category?: string;
  }[];
}>;
```

Defined in: [packages/sdk/src/core/types.ts:100](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L100)

***

### CalculateRateResponseSchema

```ts
const CalculateRateResponseSchema: ZodObject<{
  data: ZodNullable<ZodArray<ZodObject<{
     billable_weight: ZodNumber;
     courier_charge: ZodNumber;
     courier_id: ZodNumber;
     courier_name: ZodString;
     courier_type: ZodString;
     other_additional_charges: ZodNullable<ZodObject<{
        courier_charge: ZodOptional<ZodNumber>;
        green_tax: ZodOptional<ZodNumber>;
        handling_charge: ZodOptional<ZodNumber>;
        lr_cost: ZodOptional<ZodNumber>;
        oda: ZodOptional<ZodNumber>;
        odc_charge: ZodOptional<ZodNumber>;
        pickup_charge: ZodOptional<ZodNumber>;
        risk_type_charge: ZodOptional<ZodNumber>;
        state_tax: ZodOptional<ZodNumber>;
        to_pay: ZodOptional<ZodNumber>;
        warai_charge: ZodOptional<ZodNumber>;
      }, "strip", ZodTypeAny, {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }, {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
     }>>;
     risk_type_name: ZodNullable<ZodString>;
     tat: ZodNumber;
     total_shipping_charges: ZodNumber;
     zone: ZodString;
   }, "strip", ZodTypeAny, {
     billable_weight: number;
     courier_charge: number;
     courier_id: number;
     courier_name: string;
     courier_type: string;
     other_additional_charges:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name: string | null;
     tat: number;
     total_shipping_charges: number;
     zone: string;
   }, {
     billable_weight: number;
     courier_charge: number;
     courier_id: number;
     courier_name: string;
     courier_type: string;
     other_additional_charges:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name: string | null;
     tat: number;
     total_shipping_charges: number;
     zone: string;
  }>, "many">>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     billable_weight: number;
     courier_charge: number;
     courier_id: number;
     courier_name: string;
     courier_type: string;
     other_additional_charges:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name: string | null;
     tat: number;
     total_shipping_charges: number;
     zone: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     billable_weight: number;
     courier_charge: number;
     courier_id: number;
     courier_name: string;
     courier_type: string;
     other_additional_charges:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name: string | null;
     tat: number;
     total_shipping_charges: number;
     zone: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:495](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L495)

***

### CalculatorRateItemSchema

```ts
const CalculatorRateItemSchema: ZodObject<{
  billable_weight: ZodNumber;
  courier_charge: ZodNumber;
  courier_id: ZodNumber;
  courier_name: ZodString;
  courier_type: ZodString;
  other_additional_charges: ZodNullable<ZodObject<{
     courier_charge: ZodOptional<ZodNumber>;
     green_tax: ZodOptional<ZodNumber>;
     handling_charge: ZodOptional<ZodNumber>;
     lr_cost: ZodOptional<ZodNumber>;
     oda: ZodOptional<ZodNumber>;
     odc_charge: ZodOptional<ZodNumber>;
     pickup_charge: ZodOptional<ZodNumber>;
     risk_type_charge: ZodOptional<ZodNumber>;
     state_tax: ZodOptional<ZodNumber>;
     to_pay: ZodOptional<ZodNumber>;
     warai_charge: ZodOptional<ZodNumber>;
   }, "strip", ZodTypeAny, {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
   }, {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
  }>>;
  risk_type_name: ZodNullable<ZodString>;
  tat: ZodNumber;
  total_shipping_charges: ZodNumber;
  zone: ZodString;
}, "strip", ZodTypeAny, {
  billable_weight: number;
  courier_charge: number;
  courier_id: number;
  courier_name: string;
  courier_type: string;
  other_additional_charges:   | {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
   }
     | null;
  risk_type_name: string | null;
  tat: number;
  total_shipping_charges: number;
  zone: string;
}, {
  billable_weight: number;
  courier_charge: number;
  courier_id: number;
  courier_name: string;
  courier_type: string;
  other_additional_charges:   | {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
   }
     | null;
  risk_type_name: string | null;
  tat: number;
  total_shipping_charges: number;
  zone: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:482](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L482)

***

### CancelRequestSchema

```ts
const CancelRequestSchema: ZodArray<ZodString, "many">;
```

Defined in: [packages/sdk/src/core/types.ts:220](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L220)

***

### CancelResponseSchema

```ts
const CancelResponseSchema: ZodObject<{
  data: ZodNullable<ZodNullable<ZodArray<ZodObject<{
     cancel_response: ZodString;
     courier_id: ZodNumber;
     master_awb: ZodString;
   }, "strip", ZodTypeAny, {
     cancel_response: string;
     courier_id: number;
     master_awb: string;
   }, {
     cancel_response: string;
     courier_id: number;
     master_awb: string;
  }>, "many">>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     cancel_response: string;
     courier_id: number;
     master_awb: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     cancel_response: string;
     courier_id: number;
     master_awb: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:361](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L361)

***

### ConsigneeAddressSchema

```ts
const ConsigneeAddressSchema: ZodObject<{
  address_landmark: ZodOptional<ZodString>;
  address_line1: ZodString;
  address_line2: ZodOptional<ZodString>;
  pincode: ZodString;
}, "strip", ZodTypeAny, {
  address_landmark?: string;
  address_line1: string;
  address_line2?: string;
  pincode: string;
}, {
  address_landmark?: string;
  address_line1: string;
  address_line2?: string;
  pincode: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:72](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L72)

***

### ConsigneeDetailSchema

```ts
const ConsigneeDetailSchema: ZodObject<{
  company_name: ZodOptional<ZodString>;
  consignee_address: ZodObject<{
     address_landmark: ZodOptional<ZodString>;
     address_line1: ZodString;
     address_line2: ZodOptional<ZodString>;
     pincode: ZodString;
   }, "strip", ZodTypeAny, {
     address_landmark?: string;
     address_line1: string;
     address_line2?: string;
     pincode: string;
   }, {
     address_landmark?: string;
     address_line1: string;
     address_line2?: string;
     pincode: string;
  }>;
  contact_number_primary: ZodString;
  contact_number_secondary: ZodOptional<ZodString>;
  email_id: ZodOptional<ZodString>;
  first_name: ZodString;
  last_name: ZodString;
}, "strip", ZodTypeAny, {
  company_name?: string;
  consignee_address: {
     address_landmark?: string;
     address_line1: string;
     address_line2?: string;
     pincode: string;
  };
  contact_number_primary: string;
  contact_number_secondary?: string;
  email_id?: string;
  first_name: string;
  last_name: string;
}, {
  company_name?: string;
  consignee_address: {
     address_landmark?: string;
     address_line1: string;
     address_line2?: string;
     pincode: string;
  };
  contact_number_primary: string;
  contact_number_secondary?: string;
  email_id?: string;
  first_name: string;
  last_name: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:79](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L79)

***

### CourierItemSchema

```ts
const CourierItemSchema: ZodObject<{
  admin_status: ZodOptional<ZodBoolean>;
  courier_id: ZodNumber;
  courier_name: ZodString;
  courier_status: ZodOptional<ZodBoolean>;
  courier_type: ZodOptional<ZodEnum<["Surface", "Air"]>>;
  shipment_category: ZodEnum<["b2c", "b2b"]>;
}, "strip", ZodTypeAny, {
  admin_status?: boolean;
  courier_id: number;
  courier_name: string;
  courier_status?: boolean;
  courier_type?: "Surface" | "Air";
  shipment_category: "b2c" | "b2b";
}, {
  admin_status?: boolean;
  courier_id: number;
  courier_name: string;
  courier_status?: boolean;
  courier_type?: "Surface" | "Air";
  shipment_category: "b2c" | "b2b";
}>;
```

Defined in: [packages/sdk/src/core/types.ts:277](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L277)

***

### CourierListResponseSchema

```ts
const CourierListResponseSchema: ZodObject<{
  data: ZodNullable<ZodArray<ZodObject<{
     admin_status: ZodOptional<ZodBoolean>;
     courier_id: ZodNumber;
     courier_name: ZodString;
     courier_status: ZodOptional<ZodBoolean>;
     courier_type: ZodOptional<ZodEnum<["Surface", "Air"]>>;
     shipment_category: ZodEnum<["b2c", "b2b"]>;
   }, "strip", ZodTypeAny, {
     admin_status?: boolean;
     courier_id: number;
     courier_name: string;
     courier_status?: boolean;
     courier_type?: "Surface" | "Air";
     shipment_category: "b2c" | "b2b";
   }, {
     admin_status?: boolean;
     courier_id: number;
     courier_name: string;
     courier_status?: boolean;
     courier_type?: "Surface" | "Air";
     shipment_category: "b2c" | "b2b";
  }>, "many">>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     admin_status?: boolean;
     courier_id: number;
     courier_name: string;
     courier_status?: boolean;
     courier_type?: "Surface" | "Air";
     shipment_category: "b2c" | "b2b";
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     admin_status?: boolean;
     courier_id: number;
     courier_name: string;
     courier_status?: boolean;
     courier_type?: "Surface" | "Air";
     shipment_category: "b2c" | "b2b";
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:286](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L286)

***

### DocumentDetailB2BSchema

```ts
const DocumentDetailB2BSchema: ZodObject<{
  ewaybill_document_file: ZodOptional<ZodString>;
  invoice_document_file: ZodString;
}, "strip", ZodTypeAny, {
  ewaybill_document_file?: string;
  invoice_document_file: string;
}, {
  ewaybill_document_file?: string;
  invoice_document_file: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:130](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L130)

***

### DocumentDetailB2CSchema

```ts
const DocumentDetailB2CSchema: ZodObject<{
  ewaybill_document_file: ZodOptional<ZodString>;
  invoice_document_file: ZodOptional<ZodString>;
}, "strip", ZodTypeAny, {
  ewaybill_document_file?: string;
  invoice_document_file?: string;
}, {
  ewaybill_document_file?: string;
  invoice_document_file?: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:124](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L124)

***

### LoginDataSchema

```ts
const LoginDataSchema: ZodObject<{
  token: ZodString;
}, "strip", ZodTypeAny, {
  token: string;
}, {
  token: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:267](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L267)

***

### LoginRequestSchema

```ts
const LoginRequestSchema: ZodObject<{
  access_key: ZodString;
  password: ZodString;
  user_name: ZodString;
}, "strip", ZodTypeAny, {
  access_key: string;
  password: string;
  user_name: string;
}, {
  access_key: string;
  password: string;
  user_name: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:58](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L58)

***

### LoginResponseSchema

```ts
const LoginResponseSchema: ZodObject<{
  data: ZodNullable<ZodObject<{
     token: ZodString;
   }, "strip", ZodTypeAny, {
     token: string;
   }, {
     token: string;
  }>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     token: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     token: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:271](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L271)

***

### ManifestHeavyRequestSchema

```ts
const ManifestHeavyRequestSchema: ZodObject<{
  courier_id: ZodNumber;
  system_order_id: ZodString;
} & {
  risk_type: ZodOptional<ZodString>;
}, "strip", ZodTypeAny, {
  courier_id: number;
  risk_type?: string;
  system_order_id: string;
}, {
  courier_id: number;
  risk_type?: string;
  system_order_id: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:215](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L215)

***

### ManifestResponseSchema

```ts
const ManifestResponseSchema: ZodObject<{
  data: ZodNullable<ZodNull>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data: null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data: null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:359](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L359)

***

### ManifestSingleRequestSchema

```ts
const ManifestSingleRequestSchema: ZodObject<{
  courier_id: ZodNumber;
  system_order_id: ZodString;
}, "strip", ZodTypeAny, {
  courier_id: number;
  system_order_id: string;
}, {
  courier_id: number;
  system_order_id: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:210](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L210)

***

### OrderDetailB2BSchema

```ts
const OrderDetailB2BSchema: ZodObject<{
  box_details: ZodArray<ZodObject<{
     box_count: ZodNumber;
     each_box_collectable_amount: ZodOptional<ZodNumber>;
     each_box_dead_weight: ZodNumber;
     each_box_height: ZodNumber;
     each_box_invoice_amount: ZodOptional<ZodNumber>;
     each_box_length: ZodNumber;
     each_box_width: ZodNumber;
     product_details: ZodArray<ZodObject<{
        each_product_collectable_amount: ZodOptional<ZodNumber>;
        each_product_invoice_amount: ZodOptional<ZodNumber>;
        hsn: ZodOptional<ZodString>;
        product_category: ZodString;
        product_name: ZodString;
        product_quantity: ZodNumber;
        product_sub_category: ZodOptional<ZodString>;
      }, "strip", ZodTypeAny, {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
      }, {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }>, "many">;
   }, "strip", ZodTypeAny, {
     box_count: number;
     each_box_collectable_amount?: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount?: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
   }, {
     box_count: number;
     each_box_collectable_amount?: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount?: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }>, "many">;
  document_detail: ZodObject<{
     ewaybill_document_file: ZodOptional<ZodString>;
     invoice_document_file: ZodString;
   }, "strip", ZodTypeAny, {
     ewaybill_document_file?: string;
     invoice_document_file: string;
   }, {
     ewaybill_document_file?: string;
     invoice_document_file: string;
  }>;
  ewaybill_number: ZodOptional<ZodString>;
  invoice_date: ZodString;
  invoice_id: ZodString;
  payment_type: ZodEnum<["Prepaid", "COD", "ToPay"]>;
  shipment_invoice_amount: ZodNumber;
  total_collectable_amount: ZodOptional<ZodNumber>;
}, "strip", ZodTypeAny, {
  box_details: {
     box_count: number;
     each_box_collectable_amount?: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount?: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }[];
  document_detail: {
     ewaybill_document_file?: string;
     invoice_document_file: string;
  };
  ewaybill_number?: string;
  invoice_date: string;
  invoice_id: string;
  payment_type: "Prepaid" | "COD" | "ToPay";
  shipment_invoice_amount: number;
  total_collectable_amount?: number;
}, {
  box_details: {
     box_count: number;
     each_box_collectable_amount?: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount?: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }[];
  document_detail: {
     ewaybill_document_file?: string;
     invoice_document_file: string;
  };
  ewaybill_number?: string;
  invoice_date: string;
  invoice_id: string;
  payment_type: "Prepaid" | "COD" | "ToPay";
  shipment_invoice_amount: number;
  total_collectable_amount?: number;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:177](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L177)

***

### OrderDetailB2CSchema

```ts
const OrderDetailB2CSchema: ZodObject<{
  box_details: ZodArray<ZodObject<{
     box_count: ZodLiteral<1>;
     each_box_collectable_amount: ZodNumber;
     each_box_dead_weight: ZodNumber;
     each_box_height: ZodNumber;
     each_box_invoice_amount: ZodNumber;
     each_box_length: ZodNumber;
     each_box_width: ZodNumber;
     product_details: ZodArray<ZodObject<{
        each_product_collectable_amount: ZodOptional<ZodNumber>;
        each_product_invoice_amount: ZodOptional<ZodNumber>;
        hsn: ZodOptional<ZodString>;
        product_category: ZodString;
        product_name: ZodString;
        product_quantity: ZodNumber;
        product_sub_category: ZodOptional<ZodString>;
      }, "strip", ZodTypeAny, {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
      }, {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }>, "many">;
   }, "strip", ZodTypeAny, {
     box_count: 1;
     each_box_collectable_amount: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
   }, {
     box_count: 1;
     each_box_collectable_amount: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }>, "many">;
  document_detail: ZodObject<{
     ewaybill_document_file: ZodOptional<ZodString>;
     invoice_document_file: ZodOptional<ZodString>;
   }, "strip", ZodTypeAny, {
     ewaybill_document_file?: string;
     invoice_document_file?: string;
   }, {
     ewaybill_document_file?: string;
     invoice_document_file?: string;
  }>;
  ewaybill_number: ZodOptional<ZodString>;
  invoice_date: ZodString;
  invoice_id: ZodString;
  payment_type: ZodEnum<["Prepaid", "COD"]>;
  shipment_invoice_amount: ZodNumber;
  total_collectable_amount: ZodOptional<ZodNumber>;
}, "strip", ZodTypeAny, {
  box_details: {
     box_count: 1;
     each_box_collectable_amount: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }[];
  document_detail: {
     ewaybill_document_file?: string;
     invoice_document_file?: string;
  };
  ewaybill_number?: string;
  invoice_date: string;
  invoice_id: string;
  payment_type: "Prepaid" | "COD";
  shipment_invoice_amount: number;
  total_collectable_amount?: number;
}, {
  box_details: {
     box_count: 1;
     each_box_collectable_amount: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }[];
  document_detail: {
     ewaybill_document_file?: string;
     invoice_document_file?: string;
  };
  ewaybill_number?: string;
  invoice_date: string;
  invoice_id: string;
  payment_type: "Prepaid" | "COD";
  shipment_invoice_amount: number;
  total_collectable_amount?: number;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:165](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L165)

***

### PaymentCategoryItemSchema

```ts
const PaymentCategoryItemSchema: ZodObject<{
  payment_category: ZodEnum<["COD", "Prepaid", "ToPay"]>;
  status: ZodBoolean;
}, "strip", ZodTypeAny, {
  payment_category: "Prepaid" | "COD" | "ToPay";
  status: boolean;
}, {
  payment_category: "Prepaid" | "COD" | "ToPay";
  status: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:297](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L297)

***

### PaymentCategoryResponseSchema

```ts
const PaymentCategoryResponseSchema: ZodObject<{
  data: ZodNullable<ZodArray<ZodObject<{
     payment_category: ZodEnum<["COD", "Prepaid", "ToPay"]>;
     status: ZodBoolean;
   }, "strip", ZodTypeAny, {
     payment_category: "Prepaid" | "COD" | "ToPay";
     status: boolean;
   }, {
     payment_category: "Prepaid" | "COD" | "ToPay";
     status: boolean;
  }>, "many">>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     payment_category: "Prepaid" | "COD" | "ToPay";
     status: boolean;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     payment_category: "Prepaid" | "COD" | "ToPay";
     status: boolean;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:302](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L302)

***

### PRODUCT\_CATEGORIES

```ts
const PRODUCT_CATEGORIES: readonly [{
  id: 1;
  name: "Accessories";
}, {
  id: 2;
  name: "FashionClothing";
}, {
  id: 3;
  name: "BookStationary";
}, {
  id: 4;
  name: "Electronics";
}, {
  id: 5;
  name: "FMCG";
}, {
  id: 6;
  name: "Footwear";
}, {
  id: 7;
  name: "Toys";
}, {
  id: 8;
  name: "SportsEquipment";
}, {
  id: 9;
  name: "Others";
}, {
  id: 10;
  name: "Wellness";
}, {
  id: 11;
  name: "Medicines";
}];
```

Defined in: [packages/sdk/src/core/types.ts:574](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L574)

Static list of product categories supported by Bigship API.
These categories are used in the product_category field when creating orders.

#### Example

```ts
import { PRODUCT_CATEGORIES } from '@agamya/bigship-sdk';

// Get category name by ID
const category = PRODUCT_CATEGORIES.find(c => c.id === 4);
console.log(category.name); // "Electronics"

// Use in order creation
await client.addSingleOrder({
  ...
  order_detail: {
    ...
    box_details: [{
      ...
      product_details: [{
        product_category: category.name,
        ...
      }]
    }]
  }
});
```

***

### ProductDetailSchema

```ts
const ProductDetailSchema: ZodObject<{
  each_product_collectable_amount: ZodOptional<ZodNumber>;
  each_product_invoice_amount: ZodOptional<ZodNumber>;
  hsn: ZodOptional<ZodString>;
  product_category: ZodString;
  product_name: ZodString;
  product_quantity: ZodNumber;
  product_sub_category: ZodOptional<ZodString>;
}, "strip", ZodTypeAny, {
  each_product_collectable_amount?: number;
  each_product_invoice_amount?: number;
  hsn?: string;
  product_category: string;
  product_name: string;
  product_quantity: number;
  product_sub_category?: string;
}, {
  each_product_collectable_amount?: number;
  each_product_invoice_amount?: number;
  hsn?: string;
  product_category: string;
  product_name: string;
  product_quantity: number;
  product_sub_category?: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:89](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L89)

***

### RateCalculatorBoxDetailSchema

```ts
const RateCalculatorBoxDetailSchema: ZodObject<{
  box_count: ZodNumber;
  each_box_dead_weight: ZodNumber;
  each_box_height: ZodNumber;
  each_box_length: ZodNumber;
  each_box_width: ZodNumber;
}, "strip", ZodTypeAny, {
  box_count: number;
  each_box_dead_weight: number;
  each_box_height: number;
  each_box_length: number;
  each_box_width: number;
}, {
  box_count: number;
  each_box_dead_weight: number;
  each_box_height: number;
  each_box_length: number;
  each_box_width: number;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:189](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L189)

***

### RateCalculatorRequestSchema

```ts
const RateCalculatorRequestSchema: ZodObject<{
  box_details: ZodArray<ZodObject<{
     box_count: ZodNumber;
     each_box_dead_weight: ZodNumber;
     each_box_height: ZodNumber;
     each_box_length: ZodNumber;
     each_box_width: ZodNumber;
   }, "strip", ZodTypeAny, {
     box_count: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_length: number;
     each_box_width: number;
   }, {
     box_count: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_length: number;
     each_box_width: number;
  }>, "many">;
  destination_pincode: ZodString;
  payment_type: ZodEnum<["COD", "Prepaid", "ToPay"]>;
  pickup_pincode: ZodString;
  risk_type: ZodOptional<ZodString>;
  shipment_category: ZodEnum<["B2C", "B2B", "b2c", "b2b"]>;
  shipment_invoice_amount: ZodNumber;
}, "strip", ZodTypeAny, {
  box_details: {
     box_count: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_length: number;
     each_box_width: number;
  }[];
  destination_pincode: string;
  payment_type: "Prepaid" | "COD" | "ToPay";
  pickup_pincode: string;
  risk_type?: string;
  shipment_category: "B2C" | "B2B" | "b2c" | "b2b";
  shipment_invoice_amount: number;
}, {
  box_details: {
     box_count: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_length: number;
     each_box_width: number;
  }[];
  destination_pincode: string;
  payment_type: "Prepaid" | "COD" | "ToPay";
  pickup_pincode: string;
  risk_type?: string;
  shipment_category: "B2C" | "B2B" | "b2c" | "b2b";
  shipment_invoice_amount: number;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:197](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L197)

***

### SDK\_VERSION

```ts
const SDK_VERSION: string = '2.2.0';
```

Defined in: [packages/sdk/src/version.ts:3](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/version.ts#L3)

***

### ShipmentAWBDataSchema

```ts
const ShipmentAWBDataSchema: ZodObject<{
  courier_id: ZodString;
  courier_name: ZodString;
  lr_number: ZodNullable<ZodString>;
  master_awb: ZodString;
}, "strip", ZodTypeAny, {
  courier_id: string;
  courier_name: string;
  lr_number: string | null;
  master_awb: string;
}, {
  courier_id: string;
  courier_name: string;
  lr_number: string | null;
  master_awb: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:454](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L454)

***

### ShipmentAWBResponseSchema

```ts
const ShipmentAWBResponseSchema: ZodObject<{
  data: ZodNullable<ZodObject<{
     courier_id: ZodString;
     courier_name: ZodString;
     lr_number: ZodNullable<ZodString>;
     master_awb: ZodString;
   }, "strip", ZodTypeAny, {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }, {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
  }>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:474](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L474)

***

### ShipmentDataDataSchema

```ts
const ShipmentDataDataSchema: ZodObject<{
  courier_id: ZodString;
  courier_name: ZodString;
  lr_number: ZodNullable<ZodString>;
  master_awb: ZodString;
}, "strip", ZodTypeAny, {
  courier_id: string;
  courier_name: string;
  lr_number: string | null;
  master_awb: string;
}, {
  courier_id: string;
  courier_name: string;
  lr_number: string | null;
  master_awb: string;
}> = ShipmentAWBDataSchema;
```

Defined in: [packages/sdk/src/core/types.ts:478](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L478)

***

### ShipmentDataResponseSchema

```ts
const ShipmentDataResponseSchema: ZodObject<{
  data: ZodNullable<ZodObject<{
     courier_id: ZodString;
     courier_name: ZodString;
     lr_number: ZodNullable<ZodString>;
     master_awb: ZodString;
   }, "strip", ZodTypeAny, {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }, {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
  }>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     courier_id: string;
     courier_name: string;
     lr_number: string | null;
     master_awb: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}> = ShipmentAWBResponseSchema;
```

Defined in: [packages/sdk/src/core/types.ts:479](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L479)

***

### ShipmentFileDataSchema

```ts
const ShipmentFileDataSchema: ZodUnion<[ZodString, ZodObject<{
  res_FileContent: ZodString;
  res_FileName: ZodOptional<ZodString>;
  res_MediaType: ZodOptional<ZodString>;
  res_PrintFor: ZodOptional<ZodString>;
}, "strip", ZodTypeAny, {
  res_FileContent: string;
  res_FileName?: string;
  res_MediaType?: string;
  res_PrintFor?: string;
}, {
  res_FileContent: string;
  res_FileName?: string;
  res_MediaType?: string;
  res_PrintFor?: string;
}>, ZodNull]>;
```

Defined in: [packages/sdk/src/core/types.ts:462](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L462)

***

### ShipmentFileResponseSchema

```ts
const ShipmentFileResponseSchema: ZodObject<{
  data: ZodNullable<ZodUnion<[ZodString, ZodObject<{
     res_FileContent: ZodString;
     res_FileName: ZodOptional<ZodString>;
     res_MediaType: ZodOptional<ZodString>;
     res_PrintFor: ZodOptional<ZodString>;
   }, "strip", ZodTypeAny, {
     res_FileContent: string;
     res_FileName?: string;
     res_MediaType?: string;
     res_PrintFor?: string;
   }, {
     res_FileContent: string;
     res_FileName?: string;
     res_MediaType?: string;
     res_PrintFor?: string;
  }>, ZodNull]>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | string
     | {
     res_FileContent: string;
     res_FileName?: string;
     res_MediaType?: string;
     res_PrintFor?: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | string
     | {
     res_FileContent: string;
     res_FileName?: string;
     res_MediaType?: string;
     res_PrintFor?: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:475](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L475)

***

### ShippingRateItemSchema

```ts
const ShippingRateItemSchema: ZodObject<{
  billable_weight: ZodOptional<ZodNumber>;
  cod_charge: ZodOptional<ZodNumber>;
  courier_charge: ZodOptional<ZodNumber>;
  courier_id: ZodNumber;
  courier_name: ZodString;
  courier_type: ZodOptional<ZodString>;
  freight_charge: ZodOptional<ZodNumber>;
  other_additional_charges: ZodOptional<ZodNullable<ZodObject<{
     courier_charge: ZodOptional<ZodNumber>;
     green_tax: ZodOptional<ZodNumber>;
     handling_charge: ZodOptional<ZodNumber>;
     lr_cost: ZodOptional<ZodNumber>;
     oda: ZodOptional<ZodNumber>;
     odc_charge: ZodOptional<ZodNumber>;
     pickup_charge: ZodOptional<ZodNumber>;
     risk_type_charge: ZodOptional<ZodNumber>;
     state_tax: ZodOptional<ZodNumber>;
     to_pay: ZodOptional<ZodNumber>;
     warai_charge: ZodOptional<ZodNumber>;
   }, "strip", ZodTypeAny, {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
   }, {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
  }>>>;
  risk_type_name: ZodOptional<ZodNullable<ZodString>>;
  system_order_id: ZodOptional<ZodNumber>;
  tat: ZodOptional<ZodNumber>;
  total_shipping_charges: ZodNumber;
  zone: ZodOptional<ZodString>;
}, "strip", ZodTypeAny, {
  billable_weight?: number;
  cod_charge?: number;
  courier_charge?: number;
  courier_id: number;
  courier_name: string;
  courier_type?: string;
  freight_charge?: number;
  other_additional_charges?:   | {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
   }
     | null;
  risk_type_name?: string | null;
  system_order_id?: number;
  tat?: number;
  total_shipping_charges: number;
  zone?: string;
}, {
  billable_weight?: number;
  cod_charge?: number;
  courier_charge?: number;
  courier_id: number;
  courier_name: string;
  courier_type?: string;
  freight_charge?: number;
  other_additional_charges?:   | {
     courier_charge?: number;
     green_tax?: number;
     handling_charge?: number;
     lr_cost?: number;
     oda?: number;
     odc_charge?: number;
     pickup_charge?: number;
     risk_type_charge?: number;
     state_tax?: number;
     to_pay?: number;
     warai_charge?: number;
   }
     | null;
  risk_type_name?: string | null;
  system_order_id?: number;
  tat?: number;
  total_shipping_charges: number;
  zone?: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:433](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L433)

Shipping rate quote from a courier

#### Example

```ts
// Response from getShippingRates
{
  courier_id: 123,
  courier_name: "Delhivery",
  courier_type: "Surface",
  zone: "North",
  tat: 3,
  total_shipping_charges: 150.50,
  freight_charge: 100,
  cod_charge: 25,
  other_additional_charges: {
    oda: 15,
    handling_charge: 10.50
  }
}
```

***

### ShippingRatesResponseSchema

```ts
const ShippingRatesResponseSchema: ZodObject<{
  data: ZodNullable<ZodArray<ZodObject<{
     billable_weight: ZodOptional<ZodNumber>;
     cod_charge: ZodOptional<ZodNumber>;
     courier_charge: ZodOptional<ZodNumber>;
     courier_id: ZodNumber;
     courier_name: ZodString;
     courier_type: ZodOptional<ZodString>;
     freight_charge: ZodOptional<ZodNumber>;
     other_additional_charges: ZodOptional<ZodNullable<ZodObject<{
        courier_charge: ZodOptional<...>;
        green_tax: ZodOptional<...>;
        handling_charge: ZodOptional<...>;
        lr_cost: ZodOptional<...>;
        oda: ZodOptional<...>;
        odc_charge: ZodOptional<...>;
        pickup_charge: ZodOptional<...>;
        risk_type_charge: ZodOptional<...>;
        state_tax: ZodOptional<...>;
        to_pay: ZodOptional<...>;
        warai_charge: ZodOptional<...>;
      }, "strip", ZodTypeAny, {
        courier_charge?: ... | ...;
        green_tax?: ... | ...;
        handling_charge?: ... | ...;
        lr_cost?: ... | ...;
        oda?: ... | ...;
        odc_charge?: ... | ...;
        pickup_charge?: ... | ...;
        risk_type_charge?: ... | ...;
        state_tax?: ... | ...;
        to_pay?: ... | ...;
        warai_charge?: ... | ...;
      }, {
        courier_charge?: ... | ...;
        green_tax?: ... | ...;
        handling_charge?: ... | ...;
        lr_cost?: ... | ...;
        oda?: ... | ...;
        odc_charge?: ... | ...;
        pickup_charge?: ... | ...;
        risk_type_charge?: ... | ...;
        state_tax?: ... | ...;
        to_pay?: ... | ...;
        warai_charge?: ... | ...;
     }>>>;
     risk_type_name: ZodOptional<ZodNullable<ZodString>>;
     system_order_id: ZodOptional<ZodNumber>;
     tat: ZodOptional<ZodNumber>;
     total_shipping_charges: ZodNumber;
     zone: ZodOptional<ZodString>;
   }, "strip", ZodTypeAny, {
     billable_weight?: number;
     cod_charge?: number;
     courier_charge?: number;
     courier_id: number;
     courier_name: string;
     courier_type?: string;
     freight_charge?: number;
     other_additional_charges?:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name?: string | null;
     system_order_id?: number;
     tat?: number;
     total_shipping_charges: number;
     zone?: string;
   }, {
     billable_weight?: number;
     cod_charge?: number;
     courier_charge?: number;
     courier_id: number;
     courier_name: string;
     courier_type?: string;
     freight_charge?: number;
     other_additional_charges?:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name?: string | null;
     system_order_id?: number;
     tat?: number;
     total_shipping_charges: number;
     zone?: string;
  }>, "many">>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     billable_weight?: number;
     cod_charge?: number;
     courier_charge?: number;
     courier_id: number;
     courier_name: string;
     courier_type?: string;
     freight_charge?: number;
     other_additional_charges?:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name?: string | null;
     system_order_id?: number;
     tat?: number;
     total_shipping_charges: number;
     zone?: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     billable_weight?: number;
     cod_charge?: number;
     courier_charge?: number;
     courier_id: number;
     courier_name: string;
     courier_type?: string;
     freight_charge?: number;
     other_additional_charges?:   | {
        courier_charge?: number;
        green_tax?: number;
        handling_charge?: number;
        lr_cost?: number;
        oda?: number;
        odc_charge?: number;
        pickup_charge?: number;
        risk_type_charge?: number;
        state_tax?: number;
        to_pay?: number;
        warai_charge?: number;
      }
        | null;
     risk_type_name?: string | null;
     system_order_id?: number;
     tat?: number;
     total_shipping_charges: number;
     zone?: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:449](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L449)

***

### TrackingDataSchema

```ts
const TrackingDataSchema: ZodObject<{
  order_detail: ZodObject<{
     courier_name: ZodOptional<ZodString>;
     current_tracking_datetime: ZodOptional<ZodString>;
     current_tracking_status: ZodOptional<ZodString>;
     invoice_id: ZodOptional<ZodString>;
     order_manifest_datetime: ZodOptional<ZodString>;
     tracking_id: ZodString;
     tracking_type: ZodString;
   }, "strip", ZodTypeAny, {
     courier_name?: string;
     current_tracking_datetime?: string;
     current_tracking_status?: string;
     invoice_id?: string;
     order_manifest_datetime?: string;
     tracking_id: string;
     tracking_type: string;
   }, {
     courier_name?: string;
     current_tracking_datetime?: string;
     current_tracking_status?: string;
     invoice_id?: string;
     order_manifest_datetime?: string;
     tracking_id: string;
     tracking_type: string;
  }>;
  scan_histories: ZodArray<ZodObject<{
     scan_datetime: ZodString;
     scan_location: ZodOptional<ZodString>;
     scan_remarks: ZodOptional<ZodString>;
     scan_status: ZodString;
   }, "strip", ZodTypeAny, {
     scan_datetime: string;
     scan_location?: string;
     scan_remarks?: string;
     scan_status: string;
   }, {
     scan_datetime: string;
     scan_location?: string;
     scan_remarks?: string;
     scan_status: string;
  }>, "many">;
}, "strip", ZodTypeAny, {
  order_detail: {
     courier_name?: string;
     current_tracking_datetime?: string;
     current_tracking_status?: string;
     invoice_id?: string;
     order_manifest_datetime?: string;
     tracking_id: string;
     tracking_type: string;
  };
  scan_histories: {
     scan_datetime: string;
     scan_location?: string;
     scan_remarks?: string;
     scan_status: string;
  }[];
}, {
  order_detail: {
     courier_name?: string;
     current_tracking_datetime?: string;
     current_tracking_status?: string;
     invoice_id?: string;
     order_manifest_datetime?: string;
     tracking_id: string;
     tracking_type: string;
  };
  scan_histories: {
     scan_datetime: string;
     scan_location?: string;
     scan_remarks?: string;
     scan_status: string;
  }[];
}>;
```

Defined in: [packages/sdk/src/core/types.ts:505](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L505)

***

### TrackingEventSchema

```ts
const TrackingEventSchema: ZodObject<{
  scan_datetime: ZodString;
  scan_location: ZodOptional<ZodString>;
  scan_remarks: ZodOptional<ZodString>;
  scan_status: ZodString;
}, "strip", ZodTypeAny, {
  scan_datetime: string;
  scan_location?: string;
  scan_remarks?: string;
  scan_status: string;
}, {
  scan_datetime: string;
  scan_location?: string;
  scan_remarks?: string;
  scan_status: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:498](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L498)

***

### TrackingResponseSchema

```ts
const TrackingResponseSchema: ZodObject<{
  data: ZodNullable<ZodObject<{
     order_detail: ZodObject<{
        courier_name: ZodOptional<ZodString>;
        current_tracking_datetime: ZodOptional<ZodString>;
        current_tracking_status: ZodOptional<ZodString>;
        invoice_id: ZodOptional<ZodString>;
        order_manifest_datetime: ZodOptional<ZodString>;
        tracking_id: ZodString;
        tracking_type: ZodString;
      }, "strip", ZodTypeAny, {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
      }, {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
     }>;
     scan_histories: ZodArray<ZodObject<{
        scan_datetime: ZodString;
        scan_location: ZodOptional<ZodString>;
        scan_remarks: ZodOptional<ZodString>;
        scan_status: ZodString;
      }, "strip", ZodTypeAny, {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
      }, {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
     }>, "many">;
   }, "strip", ZodTypeAny, {
     order_detail: {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
     };
     scan_histories: {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
     }[];
   }, {
     order_detail: {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
     };
     scan_histories: {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
     }[];
  }>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     order_detail: {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
     };
     scan_histories: {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
     }[];
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     order_detail: {
        courier_name?: string;
        current_tracking_datetime?: string;
        current_tracking_status?: string;
        invoice_id?: string;
        order_manifest_datetime?: string;
        tracking_id: string;
        tracking_type: string;
     };
     scan_histories: {
        scan_datetime: string;
        scan_location?: string;
        scan_remarks?: string;
        scan_status: string;
     }[];
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:518](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L518)

***

### TransporterItemSchema

```ts
const TransporterItemSchema: ZodObject<{
  courier_id: ZodNumber;
  courier_name: ZodString;
  transport_id: ZodString;
}, "strip", ZodTypeAny, {
  courier_id: number;
  courier_name: string;
  transport_id: string;
}, {
  courier_id: number;
  courier_name: string;
  transport_id: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:288](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L288)

***

### TransporterListResponseSchema

```ts
const TransporterListResponseSchema: ZodObject<{
  data: ZodNullable<ZodArray<ZodObject<{
     courier_id: ZodNumber;
     courier_name: ZodString;
     transport_id: ZodString;
   }, "strip", ZodTypeAny, {
     courier_id: number;
     courier_name: string;
     transport_id: string;
   }, {
     courier_id: number;
     courier_name: string;
     transport_id: string;
  }>, "many">>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     courier_id: number;
     courier_name: string;
     transport_id: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     courier_id: number;
     courier_name: string;
     transport_id: string;
   }[]
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:294](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L294)

***

### WalletBalanceResponseSchema

```ts
const WalletBalanceResponseSchema: ZodObject<{
  data: ZodNullable<ZodString>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data: string | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:274](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L274)

***

### WarehouseAddRequestSchema

```ts
const WarehouseAddRequestSchema: ZodObject<{
  address_landmark: ZodOptional<ZodString>;
  address_line1: ZodString;
  address_line2: ZodOptional<ZodString>;
  address_pincode: ZodString;
  contact_number_primary: ZodString;
}, "strip", ZodTypeAny, {
  address_landmark?: string;
  address_line1: string;
  address_line2?: string;
  address_pincode: string;
  contact_number_primary: string;
}, {
  address_landmark?: string;
  address_line1: string;
  address_line2?: string;
  address_pincode: string;
  contact_number_primary: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:223](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L223)

***

### WarehouseAddResponseSchema

```ts
const WarehouseAddResponseSchema: ZodObject<{
  data: ZodNullable<ZodObject<{
     address_city: ZodString;
     address_country: ZodOptional<ZodString>;
     address_email_id: ZodOptional<ZodString>;
     address_landmark: ZodNullable<ZodString>;
     address_line1: ZodString;
     address_line2: ZodNullable<ZodString>;
     address_pincode: ZodString;
     address_state: ZodString;
     create_date: ZodOptional<ZodString>;
     warehouse_contact_number_primary: ZodString;
     warehouse_contact_person: ZodString;
     warehouse_id: ZodNumber;
     warehouse_name: ZodString;
   }, "strip", ZodTypeAny, {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
   }, {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
  }>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:321](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L321)

***

### WarehouseDetailSchema

```ts
const WarehouseDetailSchema: ZodObject<{
  pickup_location_id: ZodNumber;
  return_location_id: ZodNumber;
}, "strip", ZodTypeAny, {
  pickup_location_id: number;
  return_location_id: number;
}, {
  pickup_location_id: number;
  return_location_id: number;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:67](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L67)

***

### WarehouseListDataSchema

```ts
const WarehouseListDataSchema: ZodObject<{
  result_count: ZodNumber;
  result_data: ZodArray<ZodObject<{
     address_city: ZodString;
     address_country: ZodOptional<ZodString>;
     address_email_id: ZodOptional<ZodString>;
     address_landmark: ZodNullable<ZodString>;
     address_line1: ZodString;
     address_line2: ZodNullable<ZodString>;
     address_pincode: ZodString;
     address_state: ZodString;
     create_date: ZodOptional<ZodString>;
     warehouse_contact_number_primary: ZodString;
     warehouse_contact_person: ZodString;
     warehouse_id: ZodNumber;
     warehouse_name: ZodString;
   }, "strip", ZodTypeAny, {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
   }, {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
  }>, "many">;
}, "strip", ZodTypeAny, {
  result_count: number;
  result_data: {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
  }[];
}, {
  result_count: number;
  result_data: {
     address_city: string;
     address_country?: string;
     address_email_id?: string;
     address_landmark: string | null;
     address_line1: string;
     address_line2: string | null;
     address_pincode: string;
     address_state: string;
     create_date?: string;
     warehouse_contact_number_primary: string;
     warehouse_contact_person: string;
     warehouse_id: number;
     warehouse_name: string;
  }[];
}>;
```

Defined in: [packages/sdk/src/core/types.ts:323](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L323)

***

### WarehouseListItemSchema

```ts
const WarehouseListItemSchema: ZodObject<{
  address_city: ZodString;
  address_country: ZodOptional<ZodString>;
  address_email_id: ZodOptional<ZodString>;
  address_landmark: ZodNullable<ZodString>;
  address_line1: ZodString;
  address_line2: ZodNullable<ZodString>;
  address_pincode: ZodString;
  address_state: ZodString;
  create_date: ZodOptional<ZodString>;
  warehouse_contact_number_primary: ZodString;
  warehouse_contact_person: ZodString;
  warehouse_id: ZodNumber;
  warehouse_name: ZodString;
}, "strip", ZodTypeAny, {
  address_city: string;
  address_country?: string;
  address_email_id?: string;
  address_landmark: string | null;
  address_line1: string;
  address_line2: string | null;
  address_pincode: string;
  address_state: string;
  create_date?: string;
  warehouse_contact_number_primary: string;
  warehouse_contact_person: string;
  warehouse_id: number;
  warehouse_name: string;
}, {
  address_city: string;
  address_country?: string;
  address_email_id?: string;
  address_landmark: string | null;
  address_line1: string;
  address_line2: string | null;
  address_pincode: string;
  address_state: string;
  create_date?: string;
  warehouse_contact_number_primary: string;
  warehouse_contact_person: string;
  warehouse_id: number;
  warehouse_name: string;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:305](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L305)

***

### WarehouseListResponseSchema

```ts
const WarehouseListResponseSchema: ZodObject<{
  data: ZodNullable<ZodObject<{
     result_count: ZodNumber;
     result_data: ZodArray<ZodObject<{
        address_city: ZodString;
        address_country: ZodOptional<ZodString>;
        address_email_id: ZodOptional<ZodString>;
        address_landmark: ZodNullable<ZodString>;
        address_line1: ZodString;
        address_line2: ZodNullable<ZodString>;
        address_pincode: ZodString;
        address_state: ZodString;
        create_date: ZodOptional<ZodString>;
        warehouse_contact_number_primary: ZodString;
        warehouse_contact_person: ZodString;
        warehouse_id: ZodNumber;
        warehouse_name: ZodString;
      }, "strip", ZodTypeAny, {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
      }, {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
     }>, "many">;
   }, "strip", ZodTypeAny, {
     result_count: number;
     result_data: {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
     }[];
   }, {
     result_count: number;
     result_data: {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
     }[];
  }>>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, {
  data:   | {
     result_count: number;
     result_data: {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
     }[];
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}, {
  data:   | {
     result_count: number;
     result_data: {
        address_city: string;
        address_country?: string;
        address_email_id?: string;
        address_landmark: string | null;
        address_line1: string;
        address_line2: string | null;
        address_pincode: string;
        address_state: string;
        create_date?: string;
        warehouse_contact_number_primary: string;
        warehouse_contact_person: string;
        warehouse_id: number;
        warehouse_name: string;
     }[];
   }
     | null;
  message: string;
  responseCode: number;
  success: boolean;
}>;
```

Defined in: [packages/sdk/src/core/types.ts:328](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L328)

## Functions

### ApiResponseSchema()

```ts
function ApiResponseSchema<T>(dataSchema: T): ZodObject<{
  data: ZodNullable<T>;
  message: ZodString;
  responseCode: ZodNumber;
  success: ZodBoolean;
}, "strip", ZodTypeAny, { [k in "message" | "success" | "responseCode" | "data"]: addQuestionMarks<baseObjectOutputType<{ data: ZodNullable<T>; message: ZodString; responseCode: ZodNumber; success: ZodBoolean }>, any>[k] }, { [k in "message" | "success" | "responseCode" | "data"]: baseObjectInputType<{ data: ZodNullable<T>; message: ZodString; responseCode: ZodNumber; success: ZodBoolean }>[k] }>;
```

Defined in: [packages/sdk/src/core/types.ts:258](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L258)

#### Type Parameters

##### T

`T` *extends* `ZodTypeAny`

#### Parameters

##### dataSchema

`T`

#### Returns

`ZodObject`\<\{
  `data`: `ZodNullable`\<`T`\>;
  `message`: `ZodString`;
  `responseCode`: `ZodNumber`;
  `success`: `ZodBoolean`;
\}, `"strip"`, `ZodTypeAny`, \{ \[k in "message" \| "success" \| "responseCode" \| "data"\]: addQuestionMarks\<baseObjectOutputType\<\{ data: ZodNullable\<T\>; message: ZodString; responseCode: ZodNumber; success: ZodBoolean \}\>, any\>\[k\] \}, \{ \[k in "message" \| "success" \| "responseCode" \| "data"\]: baseObjectInputType\<\{ data: ZodNullable\<T\>; message: ZodString; responseCode: ZodNumber; success: ZodBoolean \}\>\[k\] \}\>

***

### calculateCollectableAmount()

```ts
function calculateCollectableAmount(paymentType: "Prepaid" | "COD", codAmount: number): number;
```

Defined in: [packages/sdk/src/utils/index.ts:35](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L35)

#### Parameters

##### paymentType

`"Prepaid"` \| `"COD"`

##### codAmount

`number`

#### Returns

`number`

***

### fileToBase64DataURI()

```ts
function fileToBase64DataURI(file: File): Promise<string>;
```

Defined in: [packages/sdk/src/utils/index.ts:10](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L10)

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`string`\>

***

### formatZodErrors()

```ts
function formatZodErrors(zodErrors: ZodIssue[]): Record<string, string[]>;
```

Defined in: [packages/sdk/src/utils/index.ts:83](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L83)

Helper function to format Zod errors into a readable format

#### Parameters

##### zodErrors

`ZodIssue`[]

#### Returns

`Record`\<`string`, `string`[]\>

#### Example

```ts
const errors = formatZodErrors(zodError.issues);
// { 'order_detail.invoice_id': ['Invalid format'] }
```

***

### isBigshipApiError()

```ts
function isBigshipApiError(error: unknown): error is BigshipApiError;
```

Defined in: [packages/sdk/src/errors/index.ts:199](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L199)

#### Parameters

##### error

`unknown`

#### Returns

`error is BigshipApiError`

***

### isBigshipAuthError()

```ts
function isBigshipAuthError(error: unknown): error is BigshipAuthError;
```

Defined in: [packages/sdk/src/errors/index.ts:191](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L191)

#### Parameters

##### error

`unknown`

#### Returns

`error is BigshipAuthError`

***

### isBigshipDuplicateInvoiceError()

```ts
function isBigshipDuplicateInvoiceError(error: unknown): error is BigshipDuplicateInvoiceError;
```

Defined in: [packages/sdk/src/errors/index.ts:183](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L183)

#### Parameters

##### error

`unknown`

#### Returns

`error is BigshipDuplicateInvoiceError`

***

### isBigshipNetworkError()

```ts
function isBigshipNetworkError(error: unknown): error is BigshipNetworkError;
```

Defined in: [packages/sdk/src/errors/index.ts:195](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L195)

#### Parameters

##### error

`unknown`

#### Returns

`error is BigshipNetworkError`

***

### isBigshipValidationError()

```ts
function isBigshipValidationError(error: unknown): error is BigshipValidationError;
```

Defined in: [packages/sdk/src/errors/index.ts:187](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/errors/index.ts#L187)

#### Parameters

##### error

`unknown`

#### Returns

`error is BigshipValidationError`

***

### isFailedResponse()

```ts
function isFailedResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: null; success: false };
```

Defined in: [packages/sdk/src/core/types.ts:637](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L637)

Type guard to check if an API response failed
Narrows the type to ensure data is null.

**Breaking change from v1.0.0:** Previously also matched `data: undefined`.
Now only matches `data: null` to align with the Zod schema and ApiResponse interface.
If your code relied on `undefined` matching, add an explicit `data === undefined` check.

#### Type Parameters

##### T

`T`

#### Parameters

##### response

[`ApiResponse`](#apiresponse-6)\<`T`\>

#### Returns

`response is ApiResponse<T> & { data: null; success: false }`

#### Example

```ts
const response = await client.addSingleOrder(orderData);
if (isFailedResponse(response)) {
  console.log('Error:', response.message);
}
```

***

### isSuccessResponse()

```ts
function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T; success: true };
```

Defined in: [packages/sdk/src/core/types.ts:617](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/core/types.ts#L617)

Type guard to check if an API response is successful
Narrows the type to ensure data is non-null

#### Type Parameters

##### T

`T`

#### Parameters

##### response

[`ApiResponse`](#apiresponse-6)\<`T`\>

#### Returns

`response is ApiResponse<T> & { data: T; success: true }`

#### Example

```ts
const response = await client.addSingleOrder(orderData);
if (isSuccessResponse(response)) {
  console.log(response.data); // Order ID (string)
}
```

***

### isValidBase64DataURI()

```ts
function isValidBase64DataURI(value: string): boolean;
```

Defined in: [packages/sdk/src/utils/index.ts:31](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L31)

#### Parameters

##### value

`string`

#### Returns

`boolean`

***

### validateOrderDetail()

```ts
function validateOrderDetail(orderDetail: 
  | {
  box_details: {
     box_count: 1;
     each_box_collectable_amount: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }[];
  document_detail: {
     ewaybill_document_file?: string;
     invoice_document_file?: string;
  };
  ewaybill_number?: string;
  invoice_date: string;
  invoice_id: string;
  payment_type: "Prepaid" | "COD";
  shipment_invoice_amount: number;
  total_collectable_amount?: number;
}
  | {
  box_details: {
     box_count: number;
     each_box_collectable_amount?: number;
     each_box_dead_weight: number;
     each_box_height: number;
     each_box_invoice_amount?: number;
     each_box_length: number;
     each_box_width: number;
     product_details: {
        each_product_collectable_amount?: number;
        each_product_invoice_amount?: number;
        hsn?: string;
        product_category: string;
        product_name: string;
        product_quantity: number;
        product_sub_category?: string;
     }[];
  }[];
  document_detail: {
     ewaybill_document_file?: string;
     invoice_document_file: string;
  };
  ewaybill_number?: string;
  invoice_date: string;
  invoice_id: string;
  payment_type: "Prepaid" | "COD" | "ToPay";
  shipment_invoice_amount: number;
  total_collectable_amount?: number;
}, shipmentCategory: "b2c" | "b2b"): void;
```

Defined in: [packages/sdk/src/utils/index.ts:45](https://github.com/Agamya-Samuel/bigship-sdk/blob/9e5ca090f471a8053f9c955ed8688654fc227e6b/packages/sdk/src/utils/index.ts#L45)

#### Parameters

##### orderDetail

  \| \{
  `box_details`: \{
     `box_count`: `1`;
     `each_box_collectable_amount`: `number`;
     `each_box_dead_weight`: `number`;
     `each_box_height`: `number`;
     `each_box_invoice_amount`: `number`;
     `each_box_length`: `number`;
     `each_box_width`: `number`;
     `product_details`: \{
        `each_product_collectable_amount?`: `number`;
        `each_product_invoice_amount?`: `number`;
        `hsn?`: `string`;
        `product_category`: `string`;
        `product_name`: `string`;
        `product_quantity`: `number`;
        `product_sub_category?`: `string`;
     \}[];
  \}[];
  `document_detail`: \{
     `ewaybill_document_file?`: `string`;
     `invoice_document_file?`: `string`;
  \};
  `ewaybill_number?`: `string`;
  `invoice_date`: `string`;
  `invoice_id`: `string`;
  `payment_type`: `"Prepaid"` \| `"COD"`;
  `shipment_invoice_amount`: `number`;
  `total_collectable_amount?`: `number`;
\}
  \| \{
  `box_details`: \{
     `box_count`: `number`;
     `each_box_collectable_amount?`: `number`;
     `each_box_dead_weight`: `number`;
     `each_box_height`: `number`;
     `each_box_invoice_amount?`: `number`;
     `each_box_length`: `number`;
     `each_box_width`: `number`;
     `product_details`: \{
        `each_product_collectable_amount?`: `number`;
        `each_product_invoice_amount?`: `number`;
        `hsn?`: `string`;
        `product_category`: `string`;
        `product_name`: `string`;
        `product_quantity`: `number`;
        `product_sub_category?`: `string`;
     \}[];
  \}[];
  `document_detail`: \{
     `ewaybill_document_file?`: `string`;
     `invoice_document_file`: `string`;
  \};
  `ewaybill_number?`: `string`;
  `invoice_date`: `string`;
  `invoice_id`: `string`;
  `payment_type`: `"Prepaid"` \| `"COD"` \| `"ToPay"`;
  `shipment_invoice_amount`: `number`;
  `total_collectable_amount?`: `number`;
\}

##### shipmentCategory

`"b2c"` \| `"b2b"`

#### Returns

`void`
