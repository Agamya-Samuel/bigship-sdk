/**
 * 03 — B2B (Heavy) Complete Flow
 *
 * B2B orders differ from B2C:
 * - ewaybill_number is REQUIRED
 * - ewaybill_document_file is REQUIRED (not optional like B2C)
 * - Multiple boxes per order are allowed (box_count > 1)
 * - Uses addHeavyOrder / manifestHeavy
 * - Track by LRN (Lorry Receipt Number) instead of AWB
 *
 * Run: npx tsx examples/03-b2b-complete-flow.ts
 */

import {
  BigshipClient,
  ShipmentDataType,
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
// Step 1: Get payment categories for B2B
// ──────────────────────────────────────────────

const categories = await client.getPaymentCategory('b2b');
if (isSuccessResponse(categories)) {
  for (const cat of categories.data) {
    console.log(`  ${cat.payment_category}: ${cat.status ? 'available' : 'disabled'}`);
  }
}

// ──────────────────────────────────────────────
// Step 2: Get transporters for a courier
// ──────────────────────────────────────────────

const transporters = await client.getCourierTransporterList(25); // courier_id = 25
if (isSuccessResponse(transporters)) {
  for (const t of transporters.data) {
    console.log(`  transporter_id=${t.transporter_id}  ${t.transporter_name}`);
  }
}

// ──────────────────────────────────────────────
// Step 3: Create B2B heavy order
// ──────────────────────────────────────────────

const order = await client.addHeavyOrder({
  shipment_category: 'b2b',

  warehouse_detail: {
    pickup_location_id: 123456,
    return_location_id: 123456,
  },

  consignee_detail: {
    first_name: 'Priya',
    last_name: 'Patel',
    company_name: 'TechCorp India Pvt Ltd',      // Optional but common for B2B
    contact_number_primary: '9123456789',
    consignee_address: {
      address_line1: 'Tower B 5th Floor DLF Cyber City',
      address_line2: 'Phase 2 Sector 24',
      pincode: '122002',
    },
  },

  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: `B2B-INV-${Date.now()}`,
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 50000,

    // ── REQUIRED for B2B ──
    ewaybill_number: '281012345678',

    // ── Multiple boxes allowed for B2B ──
    box_details: [
      {
        each_box_dead_weight: 5,                  // 5 kg
        each_box_length: 40,
        each_box_width: 30,
        each_box_height: 25,
        each_box_invoice_amount: 25000,
        each_box_collectable_amount: 0,
        box_count: 1,                             // First box
        product_details: [{
          product_category: 'Electronics',
          product_name: 'Server Motherboard',
          product_quantity: 1,
          each_product_invoice_amount: 25000,
          each_product_collectable_amount: 0,
          hsn: '84733099',                        // HSN code (optional but recommended for B2B)
        }],
      },
      {
        each_box_dead_weight: 3,
        each_box_length: 30,
        each_box_width: 20,
        each_box_height: 15,
        each_box_invoice_amount: 25000,
        each_box_collectable_amount: 0,
        box_count: 1,                             // Second box
        product_details: [{
          product_category: 'Electronics',
          product_name: 'Network Switch',
          product_quantity: 2,
          each_product_invoice_amount: 12500,
          each_product_collectable_amount: 0,
          hsn: '85176290',
        }],
      },
    ],

    // ── Both documents REQUIRED for B2B ──
    document_detail: {
      invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
    },
  },
});

if (isFailedResponse(order)) {
  console.error('B2B order failed:', order.message);
  process.exit(1);
}

const orderId = order.data!;
console.log('B2B order created:', orderId);

// ──────────────────────────────────────────────
// Step 4: Manifest heavy order
// ──────────────────────────────────────────────

await client.manifestHeavy({
  system_order_id: orderId,
  courier_id: 25,                                 // B2B courier
});
console.log('Manifested B2B order');

// ──────────────────────────────────────────────
// Step 5: Get AWB
// ──────────────────────────────────────────────

const awb = await client.getShipmentData(ShipmentDataType.AWB, orderId);
if (isSuccessResponse(awb) && awb.data && typeof awb.data !== 'string') {
  console.log('B2B AWB:', awb.data.master_awb);
}

// ──────────────────────────────────────────────
// Step 6: Track by LRN (Lorry Receipt Number)
// ──────────────────────────────────────────────

const tracking = await client.trackShipment('LR-1234567890', 'lrn');
console.log('B2B tracking:', tracking.data);
