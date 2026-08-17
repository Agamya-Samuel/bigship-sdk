/**
 * 04 — Rate Calculation
 *
 * Compare shipping rates across couriers before creating an order.
 *
 * Run: npx tsx examples/04-rate-calculation.ts
 */

import { BigshipClient, isSuccessResponse } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ──────────────────────────────────────────────
// 1. B2C prepaid rate (basic)
// ──────────────────────────────────────────────

const prepaidRates = await client.calculateRate({
  shipment_category: 'B2C',
  payment_type: 'Prepaid',
  pickup_pincode: '110001',       // Delhi
  destination_pincode: '400001',  // Mumbai
  shipment_invoice_amount: 2000,
  box_details: [{
    each_box_dead_weight: 1,      // 1 kg
    each_box_length: 25,          // 25x20x15 cm
    each_box_width: 20,
    each_box_height: 15,
    box_count: 1,
  }],
});

if (isSuccessResponse(prepaidRates)) {
  console.log('\nB2C Prepaid rates (cheapest first):\n');
  const sorted = prepaidRates.data.sort(
    (a, b) => a.total_shipping_charges - b.total_shipping_charges
  );
  for (const rate of sorted) {
    const name = rate.courier_name.padEnd(20);
    const price = `₹${rate.total_shipping_charges.toFixed(2)}`.padStart(10);
    const tat = rate.tat ? `${rate.tat} days` : 'N/A';
    console.log(`  ${name} ${price}  ${tat}  ${rate.courier_type ?? ''}`);
  }
}
// → B2C Prepaid rates (cheapest first):
// →   Delhivery             ₹65.00  3 days  Surface
// →   DTDC Express          ₹80.00  2 days  Surface
// →   BlueDart             ₹120.00  1 days  Air

// ──────────────────────────────────────────────
// 2. B2C COD rate (includes COD charges)
// ──────────────────────────────────────────────

const codRates = await client.calculateRate({
  shipment_category: 'B2C',
  payment_type: 'COD',
  pickup_pincode: '110001',
  destination_pincode: '560001',  // Bangalore
  shipment_invoice_amount: 3000,
  box_details: [{
    each_box_dead_weight: 2,
    each_box_length: 30,
    each_box_width: 25,
    each_box_height: 20,
    box_count: 1,
  }],
});

if (isSuccessResponse(codRates)) {
  const best = codRates.data[0];
  console.log(`\nCOD shipping: ₹${best.total_shipping_charges}`);
  if (best.cod_charge) {
    console.log(`  COD charge included: ₹${best.cod_charge}`);
  }
  if (best.other_additional_charges) {
    console.log('  Additional charges:', best.other_additional_charges);
  }
}

// ──────────────────────────────────────────────
// 3. B2B multi-box rate
// ──────────────────────────────────────────────

const b2bRates = await client.calculateRate({
  shipment_category: 'B2B',
  payment_type: 'Prepaid',
  pickup_pincode: '110001',
  destination_pincode: '600001',  // Chennai
  shipment_invoice_amount: 100000,
  box_details: [{
    each_box_dead_weight: 15,     // 15 kg per box
    each_box_length: 60,
    each_box_width: 40,
    each_box_height: 40,
    box_count: 3,                 // 3 boxes
  }],
});

if (isSuccessResponse(b2bRates)) {
  console.log(`\nB2B rates (${b2bRates.data.length} couriers available):`);
  for (const rate of b2bRates.data) {
    console.log(`  ${rate.courier_name}: ₹${rate.total_shipping_charges} (${rate.tat ?? '?'} days)`);
  }
}

// ──────────────────────────────────────────────
// 4. Get shipping rates for an existing order
// ──────────────────────────────────────────────
// After creating an order, use getShippingRates for real rates:

// const orderRates = await client.getShippingRates('1005202970', 'B2C');
// if (isSuccessResponse(orderRates)) {
//   console.log('Order-specific rates:', orderRates.data);
// }
