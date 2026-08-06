/**
 * 06 — Error Handling
 *
 * Every error class, every type guard, every helper method.
 *
 * Run: npx tsx examples/06-error-handling.ts
 */

import {
  BigshipClient,
  BigshipError,
  BigshipApiError,
  BigshipDuplicateInvoiceError,
  BigshipValidationError,
  BigshipAuthError,
  BigshipNetworkError,
  isBigshipApiError,
  isBigshipDuplicateInvoiceError,
  isBigshipValidationError,
  isBigshipAuthError,
  isBigshipNetworkError,
  isSuccessResponse,
  isFailedResponse,
} from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
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
  await client.addSingleOrder({
    shipment_category: 'b2c',
    warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
    consignee_detail: {
      first_name: 'Test',
      last_name: 'User',
      contact_number_primary: '9876543210',
      consignee_address: { address_line1: '123 Main Street City', pincode: '110001' },
    },
    order_detail: {
      invoice_date: new Date().toISOString(),
      invoice_id: 'INV-001',
      payment_type: 'Prepaid',
      total_collectable_amount: 0,
      shipment_invoice_amount: 1000,
      box_details: [{
        each_box_dead_weight: 1,
        each_box_length: 10,
        each_box_width: 10,
        each_box_height: 10,
        each_box_invoice_amount: 1000,
        each_box_collectable_amount: 0,
        box_count: 1,
        product_details: [{
          product_category: 'Electronics',
          product_name: 'Phone',
          product_quantity: 1,
          each_product_invoice_amount: 1000,
          each_product_collectable_amount: 0,
        }],
      }],
      document_detail: {
        invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      },
    },
  });
} catch (error) {
  // ── Duplicate invoice (HTTP 409) ──
  if (isBigshipDuplicateInvoiceError(error)) {
    console.error('Duplicate invoice ID:', error.invoiceId);
    console.error('Use a different invoice number');
  }

  // ── Client-side validation failure (Zod) ──
  else if (isBigshipValidationError(error)) {
    console.error('Validation errors:', error.validationErrors);
    // → { "order_detail.invoice_id": ["Required"], "consignee_detail.pincode": ["Invalid"] }
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
