/**
 * 09 — Browser File Upload
 *
 * Convert browser File objects to base64 Data URIs for invoice/ewaybill documents.
 * This example shows browser-side code (requires FileReader API).
 *
 * NOT runnable in Node.js — copy into your frontend code.
 */

import {
  BigshipClient,
  BigshipUtils,
} from '@agamya/bigship-sdk';

// ──────────────────────────────────────────────
// 1. Convert file input to base64 Data URI
// ──────────────────────────────────────────────

async function handleFileUpload(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;

  // Validate file type (only PDF and JPEG allowed)
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    alert('Only PDF and JPEG files are allowed');
    return;
  }

  // Convert to base64 Data URI
  const base64DataUri = await BigshipUtils.fileToBase64DataURI(file);
  console.log('Data URI:', base64DataUri.substring(0, 50) + '...');
  // → "data:application/pdf;base64,JVBERi0xLjQKJ..."

  // Validate before sending
  const isValid = BigshipClient.isValidBase64DataURI(base64DataUri);
  console.log('Valid:', isValid); // → true

  return base64DataUri;
}

// ──────────────────────────────────────────────
// 2. Use in order creation
// ──────────────────────────────────────────────

async function createOrderWithFile(invoiceFile: File) {
  const client = new BigshipClient({
    baseURL: 'https://api.bigship.in',
    userName: 'user@example.com',
    password: 'password',
    accessKey: 'key',
  });

  const invoiceBase64 = await BigshipUtils.fileToBase64DataURI(invoiceFile);

  const order = await client.addSingleOrder({
    shipment_category: 'b2c',
    warehouse_detail: {
      pickup_location_id: 123456,
      return_location_id: 123456,
    },
    consignee_detail: {
      first_name: 'Test',
      last_name: 'User',
      contact_number_primary: '9876543210',
      consignee_address: {
        address_line1: '123 Main Street City',
        pincode: '110001',
      },
    },
    order_detail: {
      invoice_date: new Date().toISOString(),
      invoice_id: `INV-${Date.now()}`,
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
        invoice_document_file: invoiceBase64,  // ← converted file
      },
    },
  });

  return order;
}

// ──────────────────────────────────────────────
// 3. Utility helpers
// ──────────────────────────────────────────────

// Calculate collectable amount based on payment type
const codAmount = BigshipUtils.calculateCollectableAmount('COD', 1000);
console.log('COD collectable:', codAmount);    // → 1000

const prepaidAmount = BigshipUtils.calculateCollectableAmount('Prepaid', 1000);
console.log('Prepaid collectable:', prepaidAmount); // → 0

// Validate base64 Data URI format
console.log(BigshipUtils.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x')); // → true
console.log(BigshipUtils.isValidBase64DataURI('not-a-data-uri'));                       // → false
console.log(BigshipUtils.isValidBase64DataURI('data:image/png;base64,abc'));             // → false (PNG not allowed)
