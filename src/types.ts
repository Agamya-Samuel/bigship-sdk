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

// ==================== RESPONSE SCHEMAS ====================

// Standard API Response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    responseCode: z.number(),
    data: dataSchema.nullable(),
  });

// Auth Response
export const LoginDataSchema = z.object({
  token: z.string(),
});

export const LoginResponseSchema = ApiResponseSchema(LoginDataSchema);

// Wallet Response
export const WalletBalanceResponseSchema = ApiResponseSchema(z.string());

// Courier Response
export const CourierItemSchema = z.object({
  shipment_category: z.enum(['b2c', 'b2b']),
  courier_id: z.number(),
  courier_name: z.string(),
  courier_type: z.enum(['Surface', 'Air']).optional(),
  courier_status: z.boolean().optional(),
  admin_status: z.boolean().optional(),
});

export const CourierListResponseSchema = ApiResponseSchema(z.array(CourierItemSchema));

export const TransporterItemSchema = z.object({
  transporter_id: z.number(),
  transporter_name: z.string(),
});

export const TransporterListResponseSchema = ApiResponseSchema(z.array(TransporterItemSchema));

// Payment Category Response
export const PaymentCategoryItemSchema = z.object({
  payment_category: z.enum(['COD', 'Prepaid', 'ToPay']),
  status: z.boolean(),
});

export const PaymentCategoryResponseSchema = ApiResponseSchema(z.array(PaymentCategoryItemSchema));

// Warehouse Response
export const WarehouseItemSchema = z.object({
  warehouse_id: z.number(),
  company_name: z.string().optional(),
  contact_person_name: z.string().optional(),
  address_line1: z.string(),
  address_line2: z.string().optional(),
  address_landmark: z.string().optional(),
  address_pincode: z.string(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_country: z.string().optional(),
  address_email_id: z.string().optional(),
  contact_number_primary: z.string(),
});

export const WarehouseAddResponseSchema = ApiResponseSchema(WarehouseItemSchema);

export const WarehouseListDataSchema = z.object({
  warehouses: z.array(WarehouseItemSchema),
  total_count: z.number(),
  page_index: z.number(),
  page_size: z.number(),
});

export const WarehouseListResponseSchema = ApiResponseSchema(WarehouseListDataSchema);

// Order Response
export const AddOrderDataSchema = z.object({
  system_order_id: z.string(),
});

export const AddOrderResponseSchema = ApiResponseSchema(AddOrderDataSchema);
export const ManifestResponseSchema = ApiResponseSchema(z.null());
export const CancelResponseSchema = ApiResponseSchema(z.null());

// Shipping Rates Response
export const AdditionalChargesSchema = z.object({
  risk_type_charge: z.number().optional(),
  lr_cost: z.number().optional(),
  green_tax: z.number().optional(),
  handling_charge: z.number().optional(),
  pickup_charge: z.number().optional(),
  state_tax: z.number().optional(),
  to_pay: z.number().optional(),
  oda: z.number().optional(),
  warai_charge: z.number().optional(),
  odc_charge: z.number().optional(),
  courier_charge: z.number().optional(),
});

export const ShippingRateItemSchema = z.object({
  system_order_id: z.number().optional(),
  courier_id: z.number(),
  courier_name: z.string(),
  courier_type: z.string().optional(),
  zone: z.string().optional(),
  tat: z.number().optional(),
  billable_weight: z.number().optional(),
  risk_type_name: z.string().nullable().optional(),
  total_shipping_charges: z.number(),
  freight_charge: z.number().optional(),
  cod_charge: z.number().optional(),
  courier_charge: z.number().optional(),
  other_additional_charges: AdditionalChargesSchema.nullable().optional(),
});

export const ShippingRatesResponseSchema = ApiResponseSchema(z.array(ShippingRateItemSchema));

// Shipment Data Response
export const ShipmentDataDataSchema = z.object({
  courier_id: z.string(),
  courier_name: z.string(),
  lr_number: z.string().nullable(),
  master_awb: z.string(),
});

export const ShipmentDataResponseSchema = ApiResponseSchema(ShipmentDataDataSchema);

// Calculator Response
export const CalculatorRateItemSchema = z.object({
  courier_id: z.number(),
  courier_name: z.string(),
  courier_type: z.string(),
  zone: z.string(),
  tat: z.number(),
  billable_weight: z.number(),
  risk_type_name: z.string().nullable(),
  total_shipping_charges: z.number(),
  courier_charge: z.number(),
  other_additional_charges: AdditionalChargesSchema.nullable(),
});

export const CalculateRateResponseSchema = ApiResponseSchema(z.array(CalculatorRateItemSchema));

// Tracking Response
export const TrackingEventSchema = z.object({
  scan_status: z.string(),
  scan_datetime: z.string(),
  scan_location: z.string().optional(),
  scan_remarks: z.string().optional(),
});

export const TrackingDataSchema = z.object({
  tracking_id: z.string(),
  tracking_type: z.string(),
  current_status: z.string().optional(),
  tracking_events: z.array(TrackingEventSchema),
});

export const TrackingResponseSchema = ApiResponseSchema(TrackingDataSchema);

// ==================== RESPONSE TYPE EXPORTS ====================
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type WalletBalanceResponse = z.infer<typeof WalletBalanceResponseSchema>;
export type CourierListResponse = z.infer<typeof CourierListResponseSchema>;
export type TransporterListResponse = z.infer<typeof TransporterListResponseSchema>;
export type PaymentCategoryResponse = z.infer<typeof PaymentCategoryResponseSchema>;
export type WarehouseAddResponse = z.infer<typeof WarehouseAddResponseSchema>;
export type WarehouseListResponse = z.infer<typeof WarehouseListResponseSchema>;
export type AddOrderResponse = z.infer<typeof AddOrderResponseSchema>;
export type ManifestResponse = z.infer<typeof ManifestResponseSchema>;
export type CancelResponse = z.infer<typeof CancelResponseSchema>;
export type ShippingRatesResponse = z.infer<typeof ShippingRatesResponseSchema>;
export type ShipmentDataResponse = z.infer<typeof ShipmentDataResponseSchema>;
export type CalculateRateResponse = z.infer<typeof CalculateRateResponseSchema>;
export type TrackingResponse = z.infer<typeof TrackingResponseSchema>;

// ==================== PRODUCT CATEGORIES ====================

/**
 * Static list of product categories supported by Bigship API.
 * These categories are used in the product_category field when creating orders.
 *
 * @example
 * ```ts
 * import { PRODUCT_CATEGORIES } from '@agamya/bigship-sdk';
 *
 * // Get category name by ID
 * const category = PRODUCT_CATEGORIES.find(c => c.id === 4);
 * console.log(category.name); // "Electronics"
 *
 * // Use in order creation
 * await client.addSingleOrder({
 *   ...
 *   order_detail: {
 *     ...
 *     box_details: [{
 *       ...
 *       product_details: [{
 *         product_category: category.name,
 *         ...
 *       }]
 *     }]
 *   }
 * });
 * ```
 */
export const PRODUCT_CATEGORIES = [
  { id: 1, name: 'Accessories' },
  { id: 2, name: 'Fashion & Clothing' },
  { id: 3, name: 'Book & Stationary' },
  { id: 4, name: 'Electronics' },
  { id: 5, name: 'FMCG' },
  { id: 6, name: 'Footwear' },
  { id: 7, name: 'Toys' },
  { id: 8, name: 'Sports Equipment' },
  { id: 9, name: 'Others' },
  { id: 10, name: 'Wellness' },
  { id: 11, name: 'Medicines' },
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
