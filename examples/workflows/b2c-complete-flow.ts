/**
 * 02 — B2C Complete Flow (Step by Step)
 *
 * Full lifecycle: check balance → calculate rates → create order →
 * get serviceable couriers → place order → track → get details → download label
 *
 * Run: npx tsx examples/workflows/b2c-complete-flow.ts
 */

import {
  BigshipClient,
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
// Step 1: Check wallet balance
// ──────────────────────────────────────────────

const balance = await client.getWalletBalance();
console.log('Wallet balance:', balance.data);
// → "5000.00"

// ──────────────────────────────────────────────
// Step 2: Calculate shipping rates (without creating an order)
// ──────────────────────────────────────────────

const rates = await client.calculateRate({
  segment_type: 'domestic_b2c',
  sourcePincode: '110001',       // Warehouse pincode (Delhi)
  destPincode: '400001',         // Customer pincode (Mumbai)
  invoiceValue: 2500,
  paymentModeId: 1,              // 1: Prepaid, 2: COD, 3: ToPay
  riskTypeId: 2,                 // 1: Third Party Insurance, 2: Owner Risk, 3: Carrier Risk
  boxes: [{
    box_length: 20,              // cm
    box_width: 15,               // cm
    box_height: 10,              // cm
    box_dead_weight: 0.5,        // kg
    no_of_box: 1,
  }],
});

if (isSuccessResponse(rates)) {
  const cheapest = rates.data
    .sort((a, b) => a.totalCharge - b.totalCharge)[0];
  console.log(`Best rate: ${cheapest.courierName} — ₹${cheapest.totalCharge}`);
  // → "Best rate: Delhivery — ₹85"
}

// ──────────────────────────────────────────────
// Step 3: Create B2C order (draft mode)
// ──────────────────────────────────────────────

const order = await client.createOrder({
  segment_type: 'domestic_b2c',

  // ── Warehouse (pickup location) ──
  MasterOrderPickUpLocation: 123456,   // Your warehouse ID from Bigship dashboard
  MasterOrderReturnLocation: 123456,  // Where undelivered packages are returned

  // ── Order details ──
  MasterOrderDate: new Date().toISOString().replace('T', ' ').substring(0, 19), // UTC: Y-m-d H:i:s
  MasterOrderPaymentMode: 1,           // 1: Prepaid, 2: COD, 3: ToPay
  OrderInvoiceNo: `INV-${Date.now()}`, // Must be unique per order
  MasterOrderInvoiceAmount: 2500,      // Total order value in INR
  totalNumOfBoxes: 1,

  // ── Customer (consignee) ──
  MasterOrderShippingName: 'Rahul Sharma',
  MasterOrderShippingMobileNo: '9876543210',
  MasterOrderShippingEmail: 'rahul@example.com',
  MasterOrderShippingAddress: '42 MG Road Koramangala',
  MasterOrderShippingAddress2: 'Near Forum Mall',
  MasterOrderShippingLandmark: 'Opposite HDFC Bank',
  MasterOrderShippingZipCode: '560034', // 6-digit Indian pincode
  MasterOrderShippingCity: 'BANGALORE',
  MasterOrderShippingState: 'KARNATAKA',
  MasterOrderShippingCountry: 'India',

  // ── Box details ──
  boxes: [{
    weight_unit: 'kg',
    dimension_unit: 'cm',
    noOfBoxes: 1,
    dimensions: [{
      length: 20,
      width: 15,
      height: 10,
      weight: 0.5,
    }],
    products: [{
      productName: 'Wireless Earbuds',
      hsn: '85182900',           // Optional HSN code
      qty: '1',
      amount: '2500',
      totalAmount: 2500,
      collectableAmount: 0,
      categoryId: '4',           // Electronics
    }],
  }],
});

if (isFailedResponse(order)) {
  console.error('Order failed:', order.message);
  process.exit(1);
}

const orderId = order.data!.CustomGlobalOrderId;
console.log('Order created (draft):', orderId);
// → "311276742"

// ──────────────────────────────────────────────
// Step 4: Get serviceable couriers and rates for this order
// ──────────────────────────────────────────────

const couriers = await client.getServiceableCouriers(orderId);
if (isSuccessResponse(couriers) && couriers.data) {
  for (const rate of couriers.data.calculatedRates) {
    console.log(`  courier=${rate.courierName}  rate=₹${'total' in rate ? rate.total : rate.total_freight}`);
  }
}

// ──────────────────────────────────────────────
// Step 5: Place order (manifest with selected courier)
// ──────────────────────────────────────────────

const selectedCourierId = couriers.data?.calculatedRates[0]?.courierId ?? 5;
const placeResult = await client.placeOrder({
  MasterCustomOrderId: orderId,
  courierId: typeof selectedCourierId === 'string' ? parseInt(selectedCourierId, 10) : selectedCourierId,
  riskTypeId: '2', // Owner Risk
});

if (isSuccessResponse(placeResult) && placeResult.data) {
  console.log('Order placed successfully!');
  console.log('AWB Number:', placeResult.data.awb_assigned);
  console.log('Reference:', placeResult.data.reference_number);
}

// ──────────────────────────────────────────────
// Step 6: Track order
// ──────────────────────────────────────────────

const tracking = await client.trackOrder(orderId);
if (isSuccessResponse(tracking) && tracking.data) {
  console.log('Order status:', tracking.data.order_status);
  console.log('Tracking number:', tracking.data.tracking_number);
  console.log('Courier:', tracking.data.courier_name);
}

// ──────────────────────────────────────────────
// Step 7: Get order details
// ──────────────────────────────────────────────

const details = await client.getOrderDetail(orderId);
if (isSuccessResponse(details) && details.data) {
  const orderDetails = details.data.getOrderDetails;
  console.log('Order status:', orderDetails.status);
  console.log('AWB:', orderDetails.AwbNumber);
  console.log('Payment mode:', orderDetails.PaymentMode);
  console.log('Invoice amount:', orderDetails.totalInvoiceAmount);
}

// ──────────────────────────────────────────────
// Step 8: Download shipping label
// ──────────────────────────────────────────────

const label = await client.downloadDocument(orderId, 'label');
if (isSuccessResponse(label) && label.data) {
  console.log('Label URL:', label.data.AttachmentData);
  console.log('File type:', label.data.File_extention);
}

// ──────────────────────────────────────────────
// Step 9: Cancel order (if needed, before rider is assigned)
// ──────────────────────────────────────────────

const cancel = await client.cancelOrder(orderId);
console.log('Cancelled:', cancel.status); // true
