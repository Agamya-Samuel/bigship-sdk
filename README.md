# @agamya/bigship-sdk

TypeScript SDK for the Bigship.in External Outbound API - a production-ready, type-safe NPM package for shipping, orders, rates, tracking, and more.

## Disclaimer

This SDK is an unofficial community project based on the publicly available [Bigship External Outbound API Postman Collection](https://www.postman.com/bigshipapi/bigship-in-domestic-outbound-api/collection/mcfvb23/bigship-external-outbound-api-project). It is not officially affiliated with, endorsed by, or connected to Bigship.in.

## Features

- **Type-Safe**: Built with Zod for runtime validation and automatic TypeScript type inference
- **Auto-Authentication**: Login once, token cached for all subsequent requests
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

```typescript
const tracking = await client.trackShipment('13090318586270', 'awb');
console.log(tracking);
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

The SDK throws `BigshipError` for API errors:

```typescript
import { BigshipClient, BigshipError } from '@agamya/bigship-sdk';

try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (error instanceof BigshipError) {
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  }
}
```

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

For issues and questions, please visit the [GitHub repository](https://github.com/agamya/bigship-sdk).
