/**
 * 08 — Next.js App Router Integration
 *
 * Shows how to use the SDK in:
 * - Server Actions
 * - Route Handlers (API routes)
 *
 * This file is NOT runnable directly — it shows the patterns to copy into
 * your Next.js project.
 */

// ──────────────────────────────────────────────
// app/shipping/actions.ts — Server Action
// ──────────────────────────────────────────────

'use server';

import { BigshipClient, isSuccessResponse, isFailedResponse } from '@agamya/bigship-sdk';

function getClient() {
  return new BigshipClient({
    baseURL: process.env.BIGSHIP_BASE_URL!,
    userName: process.env.BIGSHIP_USERNAME!,
    password: process.env.BIGSHIP_PASSWORD!,
    accessKey: process.env.BIGSHIP_ACCESS_KEY!,
  });
}

export async function createOrderAction(formData: FormData) {
  const client = getClient();

  const order = await client.addSingleOrder({
    shipment_category: 'b2c',
    warehouse_detail: {
      pickup_location_id: Number(formData.get('warehouse_id')),
      return_location_id: Number(formData.get('warehouse_id')),
    },
    consignee_detail: {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      contact_number_primary: formData.get('phone') as string,
      consignee_address: {
        address_line1: formData.get('address') as string,
        pincode: formData.get('pincode') as string,
      },
    },
    order_detail: {
      invoice_date: new Date().toISOString(),
      invoice_id: `INV-${Date.now()}`,
      payment_type: 'Prepaid',
      total_collectable_amount: 0,
      shipment_invoice_amount: Number(formData.get('amount')),
      box_details: [{
        each_box_dead_weight: 1,
        each_box_length: 10,
        each_box_width: 10,
        each_box_height: 10,
        each_box_invoice_amount: Number(formData.get('amount')),
        each_box_collectable_amount: 0,
        box_count: 1,
        product_details: [{
          product_category: formData.get('category') as string,
          product_name: formData.get('product_name') as string,
          product_quantity: 1,
          each_product_invoice_amount: Number(formData.get('amount')),
          each_product_collectable_amount: 0,
        }],
      }],
      document_detail: {
        invoice_document_file: formData.get('invoice_pdf') as string,
      },
    },
  });

  if (isFailedResponse(order)) {
    return { error: order.message };
  }

  return { orderId: order.data };
}

// ──────────────────────────────────────────────
// app/api/shipping/manifest/route.ts — Route Handler
// ──────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { BigshipClient, isSuccessResponse, isFailedResponse } from '@agamya/bigship-sdk';

export async function POST(request: NextRequest) {
  const { orderId, courierId } = await request.json();

  const client = new BigshipClient({
    baseURL: process.env.BIGSHIP_BASE_URL!,
    userName: process.env.BIGSHIP_USERNAME!,
    password: process.env.BIGSHIP_PASSWORD!,
    accessKey: process.env.BIGSHIP_ACCESS_KEY!,
  });

  // Manifest the order
  const manifest = await client.manifestSingle({
    system_order_id: orderId,
    courier_id: courierId,
  });

  if (isFailedResponse(manifest)) {
    return NextResponse.json({ error: manifest.message }, { status: 400 });
  }

  // Get AWB details
  const { ShipmentDataType } = await import('@agamya/bigship-sdk');
  const awb = await client.getShipmentData(ShipmentDataType.AWB, orderId);

  if (isSuccessResponse(awb) && awb.data && typeof awb.data !== 'string') {
    return NextResponse.json({
      success: true,
      awb: awb.data.master_awb,
      courierName: awb.data.courier_name,
    });
  }

  return NextResponse.json({ error: 'AWB not available yet' }, { status: 202 });
}
