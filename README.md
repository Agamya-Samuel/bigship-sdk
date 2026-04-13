# @agamya/bigship-sdk

TypeScript SDK for the Bigship.in External Outbound API - a production-ready, type-safe NPM package for shipping, orders, rates, tracking, and more.

## Disclaimer

This SDK is an unofficial community project based on the publicly available [Bigship Domestic Outbound API Documentation](https://web.archive.org/web/20260408120641/https://bigship.in/api-document/Bigship-Domestic-Outbound-API-Documents.pdf). It is not officially affiliated with, endorsed by, or connected to Bigship.in.

**Legal Contact:** If you have any legal concerns or would like this project to be removed, please contact [legal@agamya.dev](mailto:legal@agamya.dev) (reply within 24 hrs).

## Features

- **Type-Safe**: Built with Zod for runtime validation and automatic TypeScript type inference
- **Auto-Authentication**: Login once, token cached for all subsequent requests
- **Rate Limiting**: Automatic retry with exponential backoff for 429 errors (100 req/min limit)
- **Zero Runtime Dependencies**: Only `axios` for HTTP and `zod` for validation
- **Next.js / TypeScript First**: Designed for modern server-side applications
- **Production Ready**: Comprehensive error handling, timeout support, sandbox/live mode
- **Full API Coverage**: All 16 endpoints supported

## Installation

```bash
npm install @agamya/bigship-sdk
```

```bash
yarn add @agamya/bigship-sdk
```

```bash
pnpm add @agamya/bigship-sdk
```

## Quick Start

```typescript
import { BigshipClient } from '@agamya/bigship-sdk';

// Initialize the client
const client = new BigshipClient({
  baseURL: 'https://api.bigship.in', // or your sandbox URL
  userName: process.env.BIGSHIP_USERNAME,
  password: process.env.BIGSHIP_PASSWORD,
  accessKey: process.env.BIGSHIP_ACCESS_KEY,
});

// Create a new order
const order = await client.addSingleOrder({
  shipment_category: 'b2c',
  warehouse_detail: {
    pickup_location_id: 123456,
    return_location_id: 123456,
  },
  consignee_detail: {
    first_name: 'John',
    last_name: 'Doe',
    contact_number_primary: '9876543210',
    consignee_address: {
      address_line1: '123 Main St',
      pincode: '110001',
    },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: 'INV-001',
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 1000,
    box_details: [
      {
        each_box_dead_weight: 1,
        each_box_length: 10,
        each_box_width: 10,
        each_box_height: 10,
        each_box_invoice_amount: 1000,
        each_box_collectable_amount: 0,
        box_count: 1,
        product_details: [
          {
            product_category: 'Electronics',
            product_name: 'Laptop',
            product_quantity: 1,
            each_product_invoice_amount: 1000,
            each_product_collectable_amount: 0,
          },
        ],
      },
    ],
  },
});

console.log(order);
```

## Environment Variables

Create a `.env.local` file in your project root:

```env
BIGSHIP_BASE_URL=https://api.bigship.in
BIGSHIP_USERNAME=your-email@example.com
BIGSHIP_PASSWORD=your-password
BIGSHIP_ACCESS_KEY=your-access-key
```

## API Methods Reference

| Method | Description | Endpoint |
|--------|-------------|----------|
| `getWalletBalance()` | Get wallet balance | GET `/api/Wallet/balance/get` |
| `getCourierList(category)` | Get available couriers | GET `/api/courier/get/all` |
| `getCourierTransporterList(id)` | Get transporter list | GET `/api/courier/get/transport/list` |
| `getPaymentCategory(category)` | Get payment modes | GET `/api/payment/category` |
| `addWarehouse(payload)` | Add new warehouse | POST `/api/warehouse/add` |
| `getWarehouseList(page, size)` | List warehouses | GET `/api/warehouse/get/list` |
| `addSingleOrder(payload)` | Create B2C order | POST `/api/order/add/single` |
| `addHeavyOrder(payload)` | Create B2B heavy order | POST `/api/order/add/heavy` |
| `manifestSingle(payload)` | Manifest single order | POST `/api/order/manifest/single` |
| `manifestHeavy(payload)` | Manifest heavy order | POST `/api/order/manifest/heavy` |
| `getShippingRates(orderId, category, riskType)` | Get shipping rates | GET `/api/order/shipping/rates` |
| `calculateRate(payload)` | Calculate shipping rate | POST `/api/calculator` |
| `cancelShipments(awbs[])` | Cancel shipments | PUT `/api/order/cancel` |
| `getShipmentData(id, orderId)` | Get shipment details | POST `/api/shipment/data` |
| `trackShipment(trackingId, type)` | Track shipment | GET `/api/tracking` |

## Usage Examples

### Calculate Shipping Rates

```typescript
const rates = await client.calculateRate({
  shipment_category: 'B2C',
  payment_type: 'Prepaid',
  pickup_pincode: '110001',
  destination_pincode: '400001',
  shipment_invoice_amount: 1000,
  box_details: [
    {
      each_box_dead_weight: 1,
      each_box_length: 10,
      each_box_width: 10,
      each_box_height: 10,
      box_count: 1,
    },
  ],
});
```

### Track Shipment

Track by AWB (Air Waybill) or LRN (Lorry Receipt Number):

```typescript
// Track by AWB (default)
const tracking = await client.trackShipment('13090318586270', 'awb');

// Track by LRN
const tracking = await client.trackShipment('LR-6554921441', 'lrn');
console.log(tracking);
```

### Get Shipment Data

Get AWB, download label, or download manifest:

```typescript
// Get AWB details
const awb = await client.getShipmentData(1, 'SYSTEM_ORDER_ID');

// Download label PDF
const label = await client.getShipmentData(2, 'SYSTEM_ORDER_ID');

// Download manifest PDF
const manifest = await client.getShipmentData(3, 'SYSTEM_ORDER_ID');
```

### Cancel Shipments

```typescript
await client.cancelShipments(['LR-6554921441', 'LR-6554921442']);
```

### Add Warehouse

```typescript
await client.addWarehouse({
  address_line1: '123 Warehouse St',
  address_line2: 'Sector 5',
  address_landmark: 'Near Metro Station',
  address_pincode: '110001',
  contact_number_primary: '9876543210',
});
```

## Utility Functions

The SDK includes helper functions for common tasks:

### File to Base64 Conversion

Convert browser File objects to base64 Data URIs:

```typescript
import { BigshipClient, BigshipUtils } from '@agamya/bigship-sdk';

// Using BigshipUtils
const file = fileInput.files[0];
const base64 = await BigshipUtils.fileToBase64DataURI(file);

// OR using static method on BigshipClient
const base64 = await BigshipClient.fileToBase64DataURI(file);

// Use in order creation
await client.addSingleOrder({
  shipment_category: 'b2c',
  warehouse_detail: {
    pickup_location_id: 123456,
    return_location_id: 123456,
  },
  consignee_detail: {
    first_name: 'John',
    last_name: 'Doe',
    contact_number_primary: '9876543210',
    consignee_address: {
      address_line1: '123 Main St',
      pincode: '110001',
    },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: 'INV-001',
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 1000,
    box_details: [
      {
        each_box_dead_weight: 1,
        each_box_length: 10,
        each_box_width: 10,
        each_box_height: 10,
        each_box_invoice_amount: 1000,
        each_box_collectable_amount: 0,
        box_count: 1,
        product_details: [
          {
            product_category: 'Electronics',
            product_name: 'Laptop',
            product_quantity: 1,
            each_product_invoice_amount: 1000,
            each_product_collectable_amount: 0,
          },
        ],
      },
    ],
    document_detail: {
      invoice_document_file: base64, // Use the converted base64 string
    },
  },
});
```

### Validate Base64 Data URI

Check if a string is a valid base64 Data URI:

```typescript
import { BigshipUtils } from '@agamya/bigship-sdk';

// OR using BigshipClient
const isValid = BigshipClient.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x...');
console.log(isValid); // true

const invalid = BigshipClient.isValidBase64DataURI('not-a-data-uri');
console.log(invalid); // false
```

### Calculate Collectable Amount

Automatically set the correct `total_collectable_amount` based on payment type:

```typescript
import { BigshipUtils } from '@agamya/bigship-sdk';

const paymentType: 'COD' | 'Prepaid' = 'COD';
const orderValue = 1000;

const totalCollectable = BigshipUtils.calculateCollectableAmount(
  paymentType,
  orderValue
);
console.log(totalCollectable); // 1000 (for COD)

// For Prepaid
const prepaidAmount = BigshipUtils.calculateCollectableAmount('Prepaid', 1000);
console.log(prepaidAmount); // 0 (for Prepaid)
```

### Validate Order Details

Validate required fields before sending an order:

```typescript
import { BigshipUtils } from '@agamya/bigship-sdk';

try {
  BigshipUtils.validateOrderDetail(orderData.order_detail, 'b2c');
  // Proceed with order creation
  await client.addSingleOrder(orderData);
} catch (error) {
  console.error('Validation failed:', error.message);
  // "invoice_document_file is required in document_detail for B2C orders"
}
```

## Next.js API Route Example

```typescript
// pages/api/shipping/create-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { BigshipClient } from '@agamya/bigship-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = new BigshipClient({
      baseURL: process.env.BIGSHIP_BASE_URL!,
      userName: process.env.BIGSHIP_USERNAME!,
      password: process.env.BIGSHIP_PASSWORD!,
      accessKey: process.env.BIGSHIP_ACCESS_KEY!,
    });

    const order = await client.addSingleOrder(req.body);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
}
```

## Error Handling

The SDK provides structured error handling with helper methods:

```typescript
import { BigshipClient, BigshipError } from '@agamya/bigship-sdk';

try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipError) {
    // Check error type using helper methods
    if (error.isValidationError()) {
      console.error('Validation failed:', error.validationErrors);
    }

    if (error.isRateLimitError()) {
      console.error('Rate limited, retry after 60s');
    }

    if (error.isAuthError()) {
      console.error('Authentication failed');
    }

    // Access error details
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
    console.error('Message:', error.message);
    console.error('Trace ID:', error.traceId);
    console.error('Full API Response:', error.apiResponse);
  }
}
```

### Error Properties

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number` | HTTP status code |
| `code` | `string \| undefined` | API error code |
| `message` | `string` | Error message |
| `apiResponse` | `BigshipErrorData \| undefined` | Full API response data |
| `validationErrors` | `Record<string, string[]> \| undefined` | Validation error details |
| `traceId` | `string \| undefined` | Request tracking ID |

### Error Helper Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isValidationError()` | `boolean` | Check if error contains validation errors |
| `isRateLimitError()` | `boolean` | Check if error is due to rate limiting (429) |
| `isAuthError()` | `boolean` | Check if error is authentication-related (401/403) |
```

### Rate Limiting

The Bigship API has a rate limit of **100 requests per minute**. The SDK automatically handles rate limit errors (HTTP 429) with:

- **Automatic retries** up to 3 times
- **Exponential backoff**: 2s, 4s, 8s delays between retries
- **Clear error message** when limit is exceeded: `"Rate limit exceeded (100 requests/minute). Please retry after 60 seconds."`

If you need to make many requests in bulk, consider adding delays between requests or implementing a queue system.

## Important: Required Fields

### B2C Orders
- `document_detail.invoice_document_file` is **REQUIRED** (must be a valid base64 Data URI)
- `document_detail.ewaybill_document_file` is **optional**

### B2B Orders
- `document_detail.invoice_document_file` is **REQUIRED** (must be a valid base64 Data URI)
- `document_detail.ewaybill_document_file` is **REQUIRED** (must be a valid base64 Data URI)
- `ewaybill_number` is **REQUIRED** in `order_detail`

### Payment Type Rules
- For `Prepaid` orders: `total_collectable_amount` must be `0`
- For `COD` orders: `total_collectable_amount` should equal the order value

### Base64 Data URI Format

Document files must be provided as base64 Data URIs:
- PDF: `data:application/pdf;base64,JVBERi0xLjQKJ...`
- JPEG: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`

Use `BigshipUtils.fileToBase64DataURI()` or `BigshipClient.fileToBase64DataURI()` to convert files.

## TypeScript Support

All methods are fully typed. Import types for type-safe payloads:

```typescript
import type {
  AddSingleOrderRequest,
  RateCalculatorRequest,
  WarehouseAddRequest,
  BigshipConfig,
} from '@agamya/bigship-sdk';
```

## License

MIT

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/Agamya-Samuel/bigship-sdk).
