import { z } from 'zod';
import {
  AddSingleOrderRequestSchema,
  AddHeavyOrderRequestSchema,
  WarehouseAddRequestSchema,
  RateCalculatorRequestSchema,
  ManifestSingleRequestSchema,
  ManifestHeavyRequestSchema,
  CancelRequestSchema,
} from '@agamya/bigship-sdk';

export const SAMPLE_BASE64_PDF = 'data:application/pdf;base64,JVBERi0xLjQKJ';

export const SAMPLE_B2C_ORDER: z.infer<typeof AddSingleOrderRequestSchema> = {
  shipment_category: 'b2c',
  warehouse_detail: {
    pickup_location_id: 123456,
    return_location_id: 123456,
  },
  consignee_detail: {
    first_name: 'Rahul',
    last_name: 'Sharma',
    contact_number_primary: '9876543210',
    consignee_address: {
      address_line1: '42 MG Road Koramangala',
      address_line2: 'Near Forum Mall',
      address_landmark: 'Opposite HDFC Bank',
      pincode: '560034',
    },
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
      invoice_document_file: SAMPLE_BASE64_PDF,
    },
  },
};

export const SAMPLE_B2B_ORDER: z.infer<typeof AddHeavyOrderRequestSchema> = {
  shipment_category: 'b2b',
  warehouse_detail: {
    pickup_location_id: 123456,
    return_location_id: 123456,
  },
  consignee_detail: {
    first_name: 'Priya',
    last_name: 'Patel',
    company_name: 'TechCorp India Pvt Ltd',
    contact_number_primary: '9123456789',
    consignee_address: {
      address_line1: 'Tower B 5th Floor DLF Cyber City',
      pincode: '122002',
    },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: `B2B-${Date.now()}`,
    payment_type: 'Prepaid',
    shipment_invoice_amount: 50000,
    ewaybill_number: '281012345678',
    box_details: [{
      each_box_dead_weight: 5,
      each_box_length: 40,
      each_box_width: 30,
      each_box_height: 25,
      each_box_invoice_amount: 25000,
      box_count: 1,
      product_details: [{
        product_category: 'Electronics',
        product_name: 'Server Motherboard',
        product_quantity: 1,
        each_product_invoice_amount: 25000,
        hsn: '84733099',
      }],
    }],
    document_detail: {
      invoice_document_file: SAMPLE_BASE64_PDF,
      ewaybill_document_file: SAMPLE_BASE64_PDF,
    },
  },
};

export const SAMPLE_WAREHOUSE: z.infer<typeof WarehouseAddRequestSchema> = {
  address_line1: '42 Industrial Area Phase 2',
  address_line2: 'Near Metro Station',
  address_landmark: 'Behind SBI Branch',
  address_pincode: '110020',
  contact_number_primary: '9876543210',
};

export const SAMPLE_RATE_CALC: z.infer<typeof RateCalculatorRequestSchema> = {
  shipment_category: 'B2C',
  payment_type: 'Prepaid',
  pickup_pincode: '110001',
  destination_pincode: '400001',
  shipment_invoice_amount: 2500,
  box_details: [{
    each_box_dead_weight: 0.5,
    each_box_length: 20,
    each_box_width: 15,
    each_box_height: 10,
    box_count: 1,
  }],
};

export const SAMPLE_MANIFEST: z.infer<typeof ManifestSingleRequestSchema> = {
  system_order_id: '',
  courier_id: 5,
};

export const SAMPLE_MANIFEST_HEAVY: z.infer<typeof ManifestHeavyRequestSchema> = {
  system_order_id: '',
  courier_id: 25,
};

export const SAMPLE_CANCEL: z.infer<typeof CancelRequestSchema> = [''];

export const SAMPLE_ORDER_ID = '';
export const SAMPLE_COURIER_ID = 5;
