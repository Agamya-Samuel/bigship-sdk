/**
 * 04 — Rate Calculation
 *
 * Compare shipping rates across couriers before creating an order.
 *
 * Run: npx tsx examples/node/rate-calculation.ts
 */

import { BigshipClient, isSuccessResponse } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ──────────────────────────────────────────────
// 1. B2C prepaid rate (basic)
// ──────────────────────────────────────────────

const prepaidRates = await client.calculateRate({
  segment_type: 'domestic_b2c',
  sourcePincode: '110001',       // Delhi
  destPincode: '400001',         // Mumbai
  invoiceValue: 2000,
  paymentModeId: 1,              // 1: Prepaid, 2: COD, 3: ToPay
  riskTypeId: 2,                 // 1: Third Party Insurance, 2: Owner Risk, 3: Carrier Risk
  boxes: [{
    box_dead_weight: 1,          // 1 kg
    box_length: 25,              // 25x20x15 cm
    box_width: 20,
    box_height: 15,
    no_of_box: 1,
  }],
});

if (isSuccessResponse(prepaidRates)) {
  console.log('\nB2C Prepaid rates (cheapest first):\n');
  const sorted = prepaidRates.data.sort(
    (a, b) => a.totalCharge - b.totalCharge
  );
  for (const rate of sorted) {
    const name = rate.courierName.padEnd(20);
    const price = `₹${rate.totalCharge.toFixed(2)}`.padStart(10);
    const tat = rate.tat ? `${rate.tat} days` : 'N/A';
    console.log(`  ${name} ${price}  ${tat}  ${rate.courierType ?? ''}`);
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
  segment_type: 'domestic_b2c',
  sourcePincode: '110001',
  destPincode: '560001',         // Bangalore
  invoiceValue: 3000,
  paymentModeId: 2,              // COD
  codAmount: '3000',             // Required when COD
  riskTypeId: 2,
  boxes: [{
    box_dead_weight: 2,
    box_length: 30,
    box_width: 25,
    box_height: 20,
    no_of_box: 1,
  }],
});

if (isSuccessResponse(codRates)) {
  const best = codRates.data[0];
  console.log(`\nCOD shipping: ₹${best.totalCharge}`);
  console.log(`  COD charges: ₹${best.codCharges}`);
  console.log(`  Risk type: ${best.riskTypeName}`);
  console.log(`  Courier charge: ₹${best.courierCharge}`);
  console.log(`  Handling: ₹${best.handlingCharge}`);
}

// ──────────────────────────────────────────────
// 3. B2B multi-box rate
// ──────────────────────────────────────────────

const b2bRates = await client.calculateRate({
  segment_type: 'domestic_b2b',
  sourcePincode: '110001',
  destPincode: '600001',         // Chennai
  invoiceValue: 100000,
  paymentModeId: 1,              // Prepaid
  riskTypeId: 2,
  boxes: [{
    box_dead_weight: 15,         // 15 kg per box
    box_length: 60,
    box_width: 40,
    box_height: 40,
    no_of_box: 3,                // 3 boxes
  }],
});

if (isSuccessResponse(b2bRates)) {
  console.log(`\nB2B rates (${b2bRates.data.length} couriers available):`);
  for (const rate of b2bRates.data) {
    console.log(`  ${rate.courierName}: ₹${rate.totalCharge} (${rate.tat ?? '?'} days)`);
  }
}

// ──────────────────────────────────────────────
// 4. Get serviceable couriers for an existing order
// ──────────────────────────────────────────────
// After creating an order, use getServiceableCouriers for real rates:

// const orderRates = await client.getServiceableCouriers('311276742');
// if (isSuccessResponse(orderRates) && orderRates.data) {
//   console.log('Order-specific rates:', orderRates.data.calculatedRates);
// }
