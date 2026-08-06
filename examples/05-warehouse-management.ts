/**
 * 05 — Warehouse Management
 *
 * Add, list, and manage warehouses (pickup/return locations).
 * Warehouse IDs are used in order creation as pickup_location_id.
 *
 * Run: npx tsx examples/05-warehouse-management.ts
 */

import { BigshipClient, isSuccessResponse } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ──────────────────────────────────────────────
// 1. List existing warehouses (paginated)
// ──────────────────────────────────────────────

const list = await client.getWarehouseList(1, 10); // page 1, 10 per page
if (isSuccessResponse(list)) {
  console.log(`Found ${list.data.result_count} warehouses:\n`);
  for (const wh of list.data.result_data) {
    console.log(`  ID: ${wh.warehouse_id} — ${wh.warehouse_name}`);
    console.log(`  Address: ${wh.address_line1}, ${wh.address_city}, ${wh.address_state} - ${wh.address_pincode}`);
    console.log(`  Contact: ${wh.warehouse_contact_person} (${wh.warehouse_contact_number_primary})\n`);
  }
}
// → Found 2 warehouses:
// →   ID: 123456 — Main Warehouse
// →   Address: 45 Industrial Area, New Delhi, Delhi - 110020
// →   Contact: Raj (9876543210)

// ──────────────────────────────────────────────
// 2. Add a new warehouse
// ──────────────────────────────────────────────

const newWh = await client.addWarehouse({
  address_line1: '45 Industrial Area Phase 2',    // Min 10 chars
  address_line2: 'Near Metro Station',             // Optional
  address_landmark: 'Behind Reliance Warehouse',   // Optional
  address_pincode: '110020',                       // 6-digit pincode
  contact_number_primary: '9876543210',            // 10-12 digits
});

if (isSuccessResponse(newWh)) {
  console.log('Warehouse created:');
  console.log(`  ID: ${newWh.data.warehouse_id}`);       // Use this in orders
  console.log(`  Name: ${newWh.data.warehouse_name}`);
  console.log(`  City: ${newWh.data.address_city}`);
  console.log(`  State: ${newWh.data.address_state}`);
}
// → Warehouse created:
// →   ID: 789012
// →   Name: Warehouse 789012
// →   City: New Delhi
// →   State: Delhi

// ──────────────────────────────────────────────
// 3. Use warehouse ID in order creation
// ──────────────────────────────────────────────

// const order = await client.addSingleOrder({
//   shipment_category: 'b2c',
//   warehouse_detail: {
//     pickup_location_id: 789012,   // ← from newWh.data.warehouse_id
//     return_location_id: 789012,
//   },
//   ...rest of order
// });
