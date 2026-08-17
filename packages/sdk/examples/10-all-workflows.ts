/**
 * 10 — All Workflows Compared
 *
 * Side-by-side comparison of the 4 ways to ship an order.
 * Shows when to use each approach.
 *
 * Run: npx tsx examples/10-all-workflows.ts
 */

import {
  BigshipClient,
  ShipmentDataType,
  isSuccessResponse,
  isFailedResponse,
  type AddSingleOrderRequest,
} from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// Reusable order payload
const orderPayload: AddSingleOrderRequest = {
  shipment_category: 'b2c',
  warehouse_detail: { pickup_location_id: 123456, return_location_id: 123456 },
  consignee_detail: {
    first_name: 'Rahul',
    last_name: 'Sharma',
    contact_number_primary: '9876543210',
    consignee_address: { address_line1: '42 MG Road Koramangala', pincode: '560034' },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: `INV-${Date.now()}`,
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 2500,
    box_details: [{
      each_box_dead_weight: 0.5,
      each_box_length: 20,
      each_box_width: 15,
      each_box_height: 10,
      each_box_invoice_amount: 2500,
      each_box_collectable_amount: 0,
      box_count: 1,
      product_details: [{
        product_category: 'Electronics',
        product_name: 'Wireless Earbuds',
        product_quantity: 1,
        each_product_invoice_amount: 2500,
        each_product_collectable_amount: 0,
      }],
    }],
    document_detail: {
      invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
    },
  },
};

const COURIER_ID = 5; // Delhivery

// ══════════════════════════════════════════════
// APPROACH 1: Manual (full control)
// ══════════════════════════════════════════════
// Best when: you need to handle each step independently,
// insert custom logic between steps, or retry individual steps.

async function manualWorkflow() {
  // Step 1: Create order
  const order = await client.addSingleOrder(orderPayload);
  if (isFailedResponse(order)) throw new Error(order.message);
  const orderId = order.data!;

  // Step 2: Manifest
  await client.manifestSingle({ system_order_id: orderId, courier_id: COURIER_ID });

  // Step 3: Get AWB
  const awbResp = await client.getShipmentData(ShipmentDataType.AWB, orderId);
  const awb = isSuccessResponse(awbResp) && awbResp.data && typeof awbResp.data !== 'string'
    ? awbResp.data.master_awb
    : null;

  // Step 4: Get label
  const labelResp = await client.getShipmentData(ShipmentDataType.LABEL, orderId);
  const label = isSuccessResponse(labelResp) ? labelResp.data : null;

  // Step 5: Get manifest doc
  const manifestResp = await client.getShipmentData(ShipmentDataType.MANIFEST, orderId);
  const manifestDoc = isSuccessResponse(manifestResp) ? manifestResp.data : null;

  return { orderId, awb, label, manifestDoc };
}

// ══════════════════════════════════════════════
// APPROACH 2: manifestAndGetAWB (manifest + AWB in one call)
// ══════════════════════════════════════════════
// Best when: you already have an order ID and just need to manifest + get AWB.

async function manifestAndGetAWBWorkflow() {
  const order = await client.addSingleOrder(orderPayload);
  if (isFailedResponse(order)) throw new Error(order.message);
  const orderId = order.data!;

  const { awb, courierName } = await client.manifestAndGetAWB(orderId, COURIER_ID);
  return { orderId, awb, courierName };
}

// ══════════════════════════════════════════════
// APPROACH 3: createAndFinalizeShipment (all-in-one)
// ══════════════════════════════════════════════
// Best when: you want the simplest possible code and don't need
// intermediate control. Handles polling for AWB availability.

async function allInOneWorkflow() {
  const result = await client.createAndFinalizeShipment({
    order: orderPayload,
    courierId: COURIER_ID,
    awbPollMaxAttempts: 5,  // Poll up to 5 times for AWB (default: 5)
    awbPollDelay: 3000,     // Wait 3s between polls (default: 2000)
  });

  return result;
  // result.orderId, result.awb, result.courierName,
  // result.labelData, result.manifestData
}

// ══════════════════════════════════════════════
// APPROACH 4: ShipmentWorkflow builder (fluent API)
// ══════════════════════════════════════════════
// Best when: you want readable, chainable code and may need to
// insert logic between steps later.

async function workflowBuilder() {
  const result = await client.workflow()
    .create(orderPayload)         // Step 1: create order
    .withCourier(COURIER_ID)      // Step 2: select courier
    .manifest()                   // Step 3: manifest
    .finalize();                  // Step 4: get AWB + label + manifest

  return result;
  // result.awb, result.courierName, result.labelData, result.manifestData
}

// ──────────────────────────────────────────────
// Quick comparison
// ──────────────────────────────────────────────

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Workflow Comparison                       ║
╠══════════════════════════════════════════════════════════════╣
║ Approach                   │ Lines │ Control │ Auto-poll    ║
╠────────────────────────────┼───────┼─────────┼──────────────╣
║ 1. Manual                  │ ~15   │ Full    │ No           ║
║ 2. manifestAndGetAWB       │ ~5    │ Partial │ No           ║
║ 3. createAndFinalizeShipment│ ~5   │ Minimal │ Yes          ║
║ 4. Workflow builder        │ ~5    │ Partial │ No           ║
╚══════════════════════════════════════════════════════════════╝
`);
