/**
 * 06 — Error Handling
 *
 * Every error class, every type guard, every helper method.
 *
 * Run: npx tsx examples/node/error-handling.ts
 */

import {
  BigshipClient,
  BigshipError,
  BigshipApiError,
  BigshipValidationError,
  BigshipAuthError,
  BigshipNetworkError,
  isBigshipApiError,
  isBigshipValidationError,
  isBigshipAuthError,
  isBigshipNetworkError,
  isSuccessResponse,
  isFailedResponse,
} from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ──────────────────────────────────────────────
// Response type guards
// ──────────────────────────────────────────────

const response = await client.getWalletBalance();

if (isSuccessResponse(response)) {
  // TypeScript narrows: response.data is string (non-null)
  console.log('Balance:', response.data.toUpperCase());
}

if (isFailedResponse(response)) {
  // TypeScript narrows: response.data is null
  console.log('Failed:', response.message);
}

// ──────────────────────────────────────────────
// Error hierarchy + type guards
// ──────────────────────────────────────────────

try {
  await client.createOrder({
    segment_type: 'domestic_b2c',
    MasterOrderPickUpLocation: 1,
    MasterOrderReturnLocation: 1,
    MasterOrderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    MasterOrderPaymentMode: 1,
    OrderInvoiceNo: 'INV-001',
    MasterOrderInvoiceAmount: 1000,
    MasterOrderShippingName: 'Test User',
    MasterOrderShippingMobileNo: '9876543210',
    MasterOrderShippingAddress: '123 Main Street City',
    MasterOrderShippingZipCode: '110001',
    MasterOrderShippingCity: 'DELHI',
    MasterOrderShippingState: 'DELHI',
    MasterOrderShippingCountry: 'India',
    totalNumOfBoxes: 1,
    boxes: [{
      weight_unit: 'kg',
      dimension_unit: 'cm',
      noOfBoxes: 1,
      dimensions: [{ length: 10, width: 10, height: 10, weight: 1 }],
      products: [{
        productName: 'Phone',
        qty: '1',
        amount: '1000',
        totalAmount: 1000,
        collectableAmount: 0,
        categoryId: '4',
      }],
    }],
  });
} catch (error) {
  // ── Client-side validation failure (Zod) ──
  if (isBigshipValidationError(error)) {
    console.error('Validation errors:', error.validationErrors);
    // → { "OrderInvoiceNo": ["Required"], "MasterOrderShippingZipCode": ["Invalid"] }
  }

  // ── Authentication failure (HTTP 401/403) ──
  else if (isBigshipAuthError(error)) {
    console.error('Auth failed — check credentials');
    console.error('Status:', error.statusCode);  // 401 or 403
  }

  // ── Network/timeout error ──
  else if (isBigshipNetworkError(error)) {
    console.error('Network error — check connection');
    console.error('Status:', error.statusCode);  // -1 (sentinel)
  }

  // ── Generic API error ──
  else if (isBigshipApiError(error)) {
    console.error('API error:', error.message);
    console.error('Request ID:', error.requestId);
    console.error('Endpoint:', error.endpoint);
    console.error('Response body:', error.responseBody);
  }

  // ── Base error (catches all above) ──
  else if (error instanceof BigshipError) {
    console.error('Bigship error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
  }
}

// ──────────────────────────────────────────────
// Error helper methods
// ──────────────────────────────────────────────

const err = new BigshipError('test', 429, 'RATE_LIMIT_EXCEEDED');
console.log(err.isRateLimitError());   // true (status 429 or code RATE_LIMIT_EXCEEDED)
console.log(err.isAuthError());        // false
console.log(err.isValidationError());  // false

const authErr = new BigshipError('unauthorized', 401);
console.log(authErr.isAuthError());    // true (status 401 or 403)
