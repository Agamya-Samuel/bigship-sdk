import { z } from 'zod';

export interface BigshipConfig {
  baseURL: string;
  userName: string;
  password: string;
  accessKey: string;
  timeout?: number;
}

// ==================== AUTH ====================
export const LoginRequestSchema = z.object({
  user_name: z.string().email(),
  password: z.string(),
  access_key: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = {
  status: string;
  message?: string;
  data: { token: string };
};

// ==================== ORDER ====================
export const WarehouseDetailSchema = z.object({
  pickup_location_id: z.number(),
  return_location_id: z.number(),
});

export const ConsigneeAddressSchema = z.object({
  address_line1: z.string(),
  address_line2: z.string().optional(),
  address_landmark: z.string().optional(),
  pincode: z.string(),
});

export const ConsigneeDetailSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  company_name: z.string().optional(),
  contact_number_primary: z.string(),
  contact_number_secondary: z.string().optional(),
  email_id: z.string().email().optional(),
  consignee_address: ConsigneeAddressSchema,
});

export const ProductDetailSchema = z.object({
  product_category: z.string(),
  product_sub_category: z.string().optional(),
  product_name: z.string(),
  product_quantity: z.number().int().positive(),
  each_product_invoice_amount: z.number().nonnegative(),
  each_product_collectable_amount: z.number().nonnegative(),
  hsn: z.string().optional(),
});

export const BoxDetailSchema = z.object({
  each_box_dead_weight: z.number().positive(),
  each_box_length: z.number().positive(),
  each_box_width: z.number().positive(),
  each_box_height: z.number().positive(),
  each_box_invoice_amount: z.number().nonnegative(),
  each_box_collectable_amount: z.number().nonnegative(),
  box_count: z.number().int().positive(),
  product_details: z.array(ProductDetailSchema),
});

export const DocumentDetailSchema = z.object({
  invoice_document_file: z.string().optional(),
  ewaybill_document_file: z.string().optional(),
});

export const OrderDetailSchema = z.object({
  invoice_date: z.string().datetime(),
  invoice_id: z.string(),
  payment_type: z.enum(['Prepaid', 'COD']),
  total_collectable_amount: z.number().nonnegative(),
  shipment_invoice_amount: z.number().nonnegative(),
  box_details: z.array(BoxDetailSchema),
  ewaybill_number: z.string().optional(),
  document_detail: z.object({
    invoice_document_file: z.string().optional(),
    ewaybill_document_file: z.string().optional(),
  }).optional(),
});

export const AddSingleOrderRequestSchema = z.object({
  shipment_category: z.enum(['b2c', 'b2b']),
  warehouse_detail: WarehouseDetailSchema,
  consignee_detail: ConsigneeDetailSchema,
  order_detail: OrderDetailSchema,
});

export type AddSingleOrderRequest = z.infer<typeof AddSingleOrderRequestSchema>;

export const AddHeavyOrderRequestSchema = AddSingleOrderRequestSchema;

export type AddHeavyOrderRequest = z.infer<typeof AddHeavyOrderRequestSchema>;

// Rate Calculator
export const RateCalculatorBoxDetailSchema = z.object({
  each_box_dead_weight: z.number().positive(),
  each_box_length: z.number().positive(),
  each_box_width: z.number().positive(),
  each_box_height: z.number().positive(),
  box_count: z.number().int().positive(),
});

export const RateCalculatorRequestSchema = z.object({
  shipment_category: z.enum(['B2C', 'B2B']),
  payment_type: z.enum(['COD', 'Prepaid']),
  pickup_pincode: z.string(),
  destination_pincode: z.string(),
  shipment_invoice_amount: z.number().nonnegative(),
  risk_type: z.string().optional(),
  box_details: z.array(RateCalculatorBoxDetailSchema),
});

export type RateCalculatorRequest = z.infer<typeof RateCalculatorRequestSchema>;

// Manifest
export const ManifestSingleRequestSchema = z.object({
  system_order_id: z.string(),
  courier_id: z.number().int().positive(),
});

export const ManifestHeavyRequestSchema = ManifestSingleRequestSchema.extend({
  risk_type: z.string().optional(),
});

// Cancel
export const CancelRequestSchema = z.array(z.string());

// ==================== WAREHOUSE ====================
export const WarehouseAddRequestSchema = z.object({
  address_line1: z.string(),
  address_line2: z.string().optional(),
  address_landmark: z.string().optional(),
  address_pincode: z.string(),
  contact_number_primary: z.string(),
});

export type WarehouseAddRequest = z.infer<typeof WarehouseAddRequestSchema>;

// ==================== ERROR ====================
export interface BigshipErrorData {
  status?: string;
  message?: string;
  [key: string]: any;
}

export class BigshipError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public response?: BigshipErrorData
  ) {
    super(message);
    this.name = 'BigshipError';
  }
}
