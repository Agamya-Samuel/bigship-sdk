/**
 * 05 — Warehouse Management
 *
 * Add, list, and manage warehouses (pickup/return locations).
 * Warehouse IDs are used in order creation as MasterOrderPickUpLocation.
 *
 * Run: npx tsx examples/node/warehouse-management.ts
 */

import { BigshipClient, isSuccessResponse } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ──────────────────────────────────────────────
// 1. List existing warehouses (paginated)
// ──────────────────────────────────────────────

const list = await client.getWarehouseList({
  page: '1',
  perPage: '10',
  segment_type: 'hyperlocal', // 'hyperlocal' | 'local'
});

if (isSuccessResponse(list) && list.data) {
  console.log(`Found ${list.data.total} warehouses:\n`);
  for (const wh of list.data.warehouse) {
    console.log(`  ID: ${wh.warehouseId} — ${wh.warehouseName}`);
    console.log(`  Address: ${wh.warehouseAddressLine1}, ${wh.city}, ${wh.state} - ${wh.pincode}`);
    console.log(`  Contact: ${wh.warehouseContactPerson} (${wh.warehouseAddressPhone})\n`);
  }
}
// → Found 2 warehouses:
// →   ID: 123456 — Main Warehouse
// →   Address: 45 Industrial Area, New Delhi, Delhi - 110020
// →   Contact: Raj (9876543210)

// ──────────────────────────────────────────────
// 2. Add a new warehouse (hyperlocal)
// ──────────────────────────────────────────────

const newWh = await client.saveWarehouse({
  segment_type: 'hyperlocal',                  // 'hyperlocal' | 'local'
  warehouseContactPerson: 'Rajesh Kumar',
  warehouseAddressPhone: '9876543210',         // 10-digit phone
  warehouseCountry: 'India',
  warehouseState: 'Delhi',
  warehouseCity: 'New Delhi',
  warehousePinCode: '110020',                  // 6-digit pincode
  warehouseAddressLine1: '45 Industrial Area Phase 2',  // 3-75 words
  warehouseAddressLine2: 'Near Metro Station',
  warehouseAddressLandMark: 'Behind Reliance Warehouse', // 3-50 words
  latitude: '28.641909999999999',              // Required for hyperlocal
  longitude: '77.222053000000002',             // Required for hyperlocal
  address_type: 'Factory',                     // Required for hyperlocal
});

if (isSuccessResponse(newWh) && newWh.data) {
  console.log('Warehouse created:');
  console.log(`  ID: ${newWh.data.warehouseId}`);       // Use this in orders
  console.log(`  Phone verified: ${newWh.data.is_phone_verified === 1 ? 'Yes' : 'No'}`);
  console.log(`  Phone: ${newWh.data.phone_number}`);
}
// → Warehouse created:
// →   ID: 789012
// →   Phone verified: No
// →   Phone: 9876543210

// ──────────────────────────────────────────────
// 3. Update an existing warehouse
// ──────────────────────────────────────────────

const updatedWh = await client.updateWarehouse({
  warehouseId: '789012',
  warehouseName: 'Main Warehouse Delhi',
  warehouseContactPerson: 'Rajesh Kumar',
  warehouseAddressPhone: '9876543210',
  warehouseCountry: 'India',
  warehouseState: 'Delhi',
  warehouseCity: 'New Delhi',
  warehousePinCode: '110020',
  warehouseAddressLine1: '45 Industrial Area Phase 2 Updated',
  warehouseAddressLine2: 'Near Metro Station',
  warehouseAddressLandMark: 'Behind Reliance Warehouse',
  latitude: '28.641909999999999',
  longitude: '77.222053000000002',
  address_type: 'Factory',
});

if (isSuccessResponse(updatedWh) && updatedWh.data) {
  console.log('Warehouse updated:');
  console.log(`  Phone verified: ${updatedWh.data.is_phone_verified === 1 ? 'Yes' : 'No'}`);
}

// ──────────────────────────────────────────────
// 4. Use warehouse ID in order creation
// ──────────────────────────────────────────────

// const order = await client.createOrder({
//   segment_type: 'domestic_b2c',
//   MasterOrderPickUpLocation: 789012,   // ← from newWh.data.warehouseId
//   MasterOrderReturnLocation: 789012,
//   ...rest of order
// });
