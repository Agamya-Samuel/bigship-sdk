/**
 * 02 — B2C Complete Flow (Step by Step)
 *
 * Full lifecycle: check balance → get couriers → calculate rates →
 * create order → manifest → get AWB → get label → track → cancel
 *
 * Run: npx tsx examples/02-b2c-complete-flow.ts
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
// Step 1: Check wallet balance
// ──────────────────────────────────────────────

const balance = await client.getWalletBalance();
console.log('Wallet balance:', balance.data);
// → "5000.00"

// ──────────────────────────────────────────────
// Step 2: List available couriers for B2C
// ──────────────────────────────────────────────

const couriers = await client.getCourierList('b2c');
if (isSuccessResponse(couriers)) {
  for (const c of couriers.data) {
    console.log(`  courier_id=${c.courier_id}  ${c.courier_name}  (${c.courier_type ?? 'N/A'})`);
  }
}
// → courier_id=5   Delhivery  (Surface)
// → courier_id=12  DTDC       (Surface)
// → courier_id=18  Ekart      (Surface)

// ──────────────────────────────────────────────
// Step 3: Calculate shipping rates
// ──────────────────────────────────────────────

const rates = await client.calculateRate({
  shipment_category: 'B2C',
  payment_type: 'Prepaid',
  pickup_pincode: '110001',       // Warehouse pincode (Delhi)
  destination_pincode: '400001',  // Customer pincode (Mumbai)
  shipment_invoice_amount: 2500,
  box_details: [{
    each_box_dead_weight: 0.5,    // kg
    each_box_length: 20,          // cm
    each_box_width: 15,
    each_box_height: 10,
    box_count: 1,
  }],
});

if (isSuccessResponse(rates)) {
  const cheapest = rates.data
    .sort((a, b) => a.total_shipping_charges - b.total_shipping_charges)[0];
  console.log(`Best rate: ${cheapest.courier_name} — ₹${cheapest.total_shipping_charges}`);
  // → "Best rate: Delhivery — ₹85"
}

// ──────────────────────────────────────────────
// Step 4: Create B2C order
// ──────────────────────────────────────────────

const order = await client.addSingleOrder({
  shipment_category: 'b2c',

  // ── Warehouse (pickup location) ──
  warehouse_detail: {
    pickup_location_id: 123456,   // Your warehouse ID from Bigship dashboard
    return_location_id: 123456,   // Where undelivered packages are returned
  },

  // ── Customer (consignee) ──
  consignee_detail: {
    first_name: 'Rahul',
    last_name: 'Sharma',
    contact_number_primary: '9876543210',
    consignee_address: {
      address_line1: '42 MG Road Koramangala',  // Min 10 chars, alphanumeric + ,#':/-()
      address_line2: 'Near Forum Mall',
      address_landmark: 'Opposite HDFC Bank',
      pincode: '560034',                         // 6-digit Indian pincode
    },
  },

  // ── Order details ──
  order_detail: {
    invoice_date: new Date().toISOString(),       // ISO 8601 datetime
    invoice_id: `INV-${Date.now()}`,              // Must be unique per order
    payment_type: 'Prepaid',                       // 'Prepaid' | 'COD'
    total_collectable_amount: 0,                   // Must be 0 for Prepaid
    shipment_invoice_amount: 2500,                 // Total order value in INR

    // ── Box details ──
    box_details: [{
      each_box_dead_weight: 0.5,                  // Weight in kg
      each_box_length: 20,                        // Length in cm
      each_box_width: 15,                         // Width in cm
      each_box_height: 10,                        // Height in cm
      each_box_invoice_amount: 2500,              // Box invoice amount
      each_box_collectable_amount: 0,             // 0 for Prepaid
      box_count: 1,                               // B2C MUST be exactly 1
      product_details: [{
        product_category: 'Electronics',
        product_name: 'Wireless Earbuds',
        product_quantity: 1,
        each_product_invoice_amount: 2500,
        each_product_collectable_amount: 0,
      }],
    }],

    // ── Documents (REQUIRED) ──
    document_detail: {
      invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      // ewaybill_document_file: '...',           // Optional for B2C
    },
  },
});

if (isFailedResponse(order)) {
  console.error('Order failed:', order.message);
  process.exit(1);
}

const orderId = order.data!;                      // system_order_id from Bigship
console.log('Order created:', orderId);
// → "1005202970"

// ──────────────────────────────────────────────
// Step 5: Manifest (assigns courier to the order)
// ──────────────────────────────────────────────

await client.manifestSingle({
  system_order_id: orderId,
  courier_id: 5,                                  // Delhivery Surface (from Step 2)
});
console.log('Manifested successfully');

// ──────────────────────────────────────────────
// Step 6: Get AWB (Air Waybill) number
// ──────────────────────────────────────────────

const awbResp = await client.getShipmentData(ShipmentDataType.AWB, orderId);
if (isSuccessResponse(awbResp) && awbResp.data && typeof awbResp.data !== 'string') {
  console.log('AWB Number:', awbResp.data.master_awb);   // "13090318586270"
  console.log('Courier:', awbResp.data.courier_name);     // "Delhivery"
  console.log('LR Number:', awbResp.data.lr_number);      // null or LR string
}

// ──────────────────────────────────────────────
// Step 7: Get shipping label (PDF data URI or URL)
// ──────────────────────────────────────────────

const labelResp = await client.getShipmentData(ShipmentDataType.LABEL, orderId);
if (isSuccessResponse(labelResp) && typeof labelResp.data === 'string') {
  console.log('Label available:', labelResp.data.substring(0, 40) + '...');
  // → "Label available: data:application/pdf;base64,JVBERi0x..."
  // Save to file, embed in HTML, or send to printer
}

// ──────────────────────────────────────────────
// Step 8: Get manifest document
// ──────────────────────────────────────────────

const manifestResp = await client.getShipmentData(ShipmentDataType.MANIFEST, orderId);
if (isSuccessResponse(manifestResp) && typeof manifestResp.data === 'string') {
  console.log('Manifest doc available:', manifestResp.data.substring(0, 40) + '...');
}

// ──────────────────────────────────────────────
// Step 9: Track shipment
// ──────────────────────────────────────────────

const tracking = await client.trackShipment('13090318586270', 'awb');
if (isSuccessResponse(tracking)) {
  console.log('Tracking data:', tracking.data);
}

// ──────────────────────────────────────────────
// Step 10: Cancel if needed
// ──────────────────────────────────────────────

const cancel = await client.cancelShipments(['13090318586270']);
console.log('Cancelled:', cancel.success);       // true
