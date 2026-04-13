import { z } from 'zod';

import type { InternalAxiosRequestConfig } from 'axios';

export interface BigshipConfig {
  baseURL: string;
  userName: string;
  password: string;
  accessKey: string;
  timeout?: number;

  // New options (all optional, with sensible defaults)
  throwOnUnsuccessfulResponse?: boolean;  // Default: true
  enableDetailedLogging?: boolean;         // Default: false
  maxRetries?: number;                     // Default: 3
  retryDelay?: number;                     // Default: 1000 (ms)
  retryOnStatusCodes?: number[];           // Default: [408, 429, 500, 502, 503, 504]

  // Event hooks
  onResponse?: (response: ApiResponse<unknown>, context: RequestContext) => void;
  onError?: (error: BigshipError, context: RequestContext) => void;
  onRetry?: (attempt: number, error: BigshipError, context: RequestContext) => void;
  onBeforeRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
}

/**
 * Request context for event hooks
 * Provides information about the current request for logging and debugging
 */
export interface RequestContext {
  endpoint: string;
  method: string;
  requestId?: string;
  attempt?: number;
  startTime: number;
}

// ==================== VALIDATION HELPERS ====================

const base64DataURI = () =>
  z.string().regex(/^data:(image\/pdf|image\/jpeg);base64,/);

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
  address_line1: z.string().min(10).max(50).regex(/^[a-zA-Z0-9 .,\-/]+$/),
  address_line2: z.string().max(50).regex(/^[a-zA-Z0-9 .,\-/]+$/).optional(),
  address_landmark: z.string().max(50).regex(/^[a-zA-Z0-9 .,\-/]+$/).optional(),
  pincode: z.string().regex(/^[0-9]{6}$/),
});

export const ConsigneeDetailSchema = z.object({
  first_name: z.string().min(3).max(25).regex(/^[a-zA-Z. ]+$/),
  last_name: z.string().min(3).max(25).regex(/^[a-zA-Z. ]+$/),
  company_name: z.string().max(50).optional(),
  contact_number_primary: z.string().min(10).max(12).regex(/^[0-9]+$/),
  contact_number_secondary: z.string().min(10).max(12).regex(/^[0-9]+$/).optional(),
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
  hsn: z.string().min(12).max(15).regex(/^[a-zA-Z0-9]+$/).optional(),
});

// B2C Box Detail - exactly 1 box
export const BoxDetailB2CSchema = z.object({
  each_box_dead_weight: z.number().positive(),
  each_box_length: z.number().positive(),
  each_box_width: z.number().positive(),
  each_box_height: z.number().positive(),
  each_box_invoice_amount: z.number().nonnegative(),
  each_box_collectable_amount: z.number().nonnegative(),
  box_count: z.literal(1), // B2C must have exactly 1 box
  product_details: z.array(ProductDetailSchema),
});

// B2B Box Detail - multiple boxes allowed
export const BoxDetailB2BSchema = z.object({
  each_box_dead_weight: z.number().positive(),
  each_box_length: z.number().positive(),
  each_box_width: z.number().positive(),
  each_box_height: z.number().positive(),
  each_box_invoice_amount: z.number().nonnegative(),
  each_box_collectable_amount: z.number().nonnegative(),
  box_count: z.number().int().positive(),
  product_details: z.array(ProductDetailSchema),
});

// B2C Document Detail - invoice required, ewaybill optional
export const DocumentDetailB2CSchema = z.object({
  invoice_document_file: base64DataURI(),
  ewaybill_document_file: base64DataURI().optional(),
});

// B2B Document Detail - both invoice and ewaybill required
export const DocumentDetailB2BSchema = z.object({
  invoice_document_file: base64DataURI(),
  ewaybill_document_file: base64DataURI(),
});

/**
 * Document files for B2C orders
 * @property {string} invoice_document_file - REQUIRED. Base64 Data URI of invoice PDF/JPG
 * @property {string} [ewaybill_document_file] - Optional. Base64 Data URI of ewaybill PDF/JPG
 *
 * @example
 * ```ts
 * document_detail: {
 *   invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
 * }
 * ```
 */
export type DocumentDetailB2C = z.infer<typeof DocumentDetailB2CSchema>;

/**
 * Document files for B2B orders
 * @property {string} invoice_document_file - REQUIRED. Base64 Data URI of invoice PDF/JPG
 * @property {string} ewaybill_document_file - REQUIRED. Base64 Data URI of ewaybill PDF/JPG
 *
 * @example
 * ```ts
 * document_detail: {
 *   invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
 *   ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
 * }
 * ```
 */
export type DocumentDetailB2B = z.infer<typeof DocumentDetailB2BSchema>;

// B2C Order Detail
export const OrderDetailB2CSchema = z.object({
  invoice_date: z.string().datetime(),
  invoice_id: z.string(),
  payment_type: z.enum(['Prepaid', 'COD']),
  total_collectable_amount: z.number().nonnegative(),
  shipment_invoice_amount: z.number().positive(),
  box_details: z.array(BoxDetailB2CSchema),
  ewaybill_number: z.string().optional(),
  document_detail: DocumentDetailB2CSchema,
});

// B2B Order Detail - ewaybill required
export const OrderDetailB2BSchema = z.object({
  invoice_date: z.string().datetime(),
  invoice_id: z.string(),
  payment_type: z.enum(['Prepaid', 'COD']),
  total_collectable_amount: z.number().nonnegative(),
  shipment_invoice_amount: z.number().positive(),
  box_details: z.array(BoxDetailB2BSchema),
  ewaybill_number: z.string(),
  document_detail: DocumentDetailB2BSchema,
});

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
  address_line1: z.string().min(10).max(50),
  address_line2: z.string().max(50).optional(),
  address_landmark: z.string().max(50).optional(),
  address_pincode: z.string().regex(/^[0-9]{6}$/),
  contact_number_primary: z.string().min(10).max(12).regex(/^[0-9]+$/),
});

export type WarehouseAddRequest = z.infer<typeof WarehouseAddRequestSchema>;

// ==================== ERROR ====================
export interface BigshipErrorData {
  status?: string;
  message?: string;
  errors?: Record<string, string[]>; // Validation errors
  trace_id?: string; // Request tracking
  [key: string]: any;
}

/**
 * Custom error class for Bigship API errors
 * Provides structured access to error details and helper methods for error type checking
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipError) {
 *     if (error.isValidationError()) {
 *       console.error('Validation failed:', error.validationErrors);
 *     }
 *     if (error.isRateLimitError()) {
 *       console.error('Rate limited, retry after 60s');
 *     }
 *     console.error('Status:', error.statusCode);
 *     console.error('Trace ID:', error.traceId);
 *   }
 * }
 * ```
 */
export class BigshipError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly apiResponse?: BigshipErrorData;
  readonly validationErrors?: Record<string, string[]>;
  readonly traceId?: string;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    apiResponse?: BigshipErrorData
  ) {
    super(message);
    this.name = 'BigshipError';
    this.statusCode = statusCode ?? 0;
    this.code = code;
    this.apiResponse = apiResponse;
    this.validationErrors = apiResponse?.errors;
    this.traceId = apiResponse?.trace_id;
  }

  /** Helper to check if this is a validation error */
  isValidationError(): boolean {
    return !!this.validationErrors && Object.keys(this.validationErrors).length > 0;
  }

  /** Helper to check if this is a rate limit error */
  isRateLimitError(): boolean {
    return this.statusCode === 429 || this.code === 'RATE_LIMIT_EXCEEDED';
  }

  /** Helper to check if this is an authentication error */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}

// ==================== REQUEST SCHEMAS ====================

// B2C Single Order
export const AddSingleOrderRequestSchema = z.object({
  shipment_category: z.literal('b2c'),
  warehouse_detail: WarehouseDetailSchema,
  consignee_detail: ConsigneeDetailSchema,
  order_detail: OrderDetailB2CSchema,
});

export type AddSingleOrderRequest = z.infer<typeof AddSingleOrderRequestSchema>;

// B2B Heavy Order
export const AddHeavyOrderRequestSchema = z.object({
  shipment_category: z.literal('b2b'),
  warehouse_detail: WarehouseDetailSchema,
  consignee_detail: ConsigneeDetailSchema,
  order_detail: OrderDetailB2BSchema,
});

export type AddHeavyOrderRequest = z.infer<typeof AddHeavyOrderRequestSchema>;

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
export const WarehouseListItemSchema = z.object({
  warehouse_id: z.number(),
  warehouse_name: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullable(),
  address_landmark: z.string().nullable(),
  address_pincode: z.string(),
  address_city: z.string(),
  address_state: z.string(),
  warehouse_contact_person: z.string(),
  warehouse_contact_number_primary: z.string(),
  create_date: z.string().optional(),
});

export const WarehouseAddResponseSchema = ApiResponseSchema(WarehouseListItemSchema);

export const WarehouseListDataSchema = z.object({
  result_count: z.number(),
  result_data: z.array(WarehouseListItemSchema),
});

export const WarehouseListResponseSchema = ApiResponseSchema(WarehouseListDataSchema);

// Order Response - data is system_order_id as string directly
/**
 * Response from addSingleOrder or addHeavyOrder
 * @property {boolean} success - true if order was created successfully
 * @property {string} message - Success or error message
 * @property {number} responseCode - HTTP status code
 * @property {string | null} data - The system_order_id as a string, or null on error
 *
 * @example
 * ```ts
 * // Success response
 * {
 *   success: true,
 *   message: "Order added successfully.",
 *   responseCode: 200,
 *   data: "1005202970"  // This is the system_order_id
 * }
 *
 * // Error response
 * {
 *   success: false,
 *   message: "Invalid pincode",
 *   responseCode: 400,
 *   data: null
 * }
 * ```
 */
export const AddOrderResponseSchema = ApiResponseSchema(z.string());

export const ManifestResponseSchema = ApiResponseSchema(z.null());

export const CancelResponseSchema = ApiResponseSchema(z.null());

// Shipping Rates Response
/**
 * Additional charges breakdown for shipping rates
 * @property {number} [risk_type_charge] - Risk type surcharge
 * @property {number} [lr_cost] - LR (Lorry Receipt) cost
 * @property {number} [green_tax] - Environmental/green tax
 * @property {number} [handling_charge] - Handling charges
 * @property {number} [pickup_charge] - Pickup charges
 * @property {number} [state_tax] - State-level taxes
 * @property {number} [to_pay] - To-pay charges
 * @property {number} [oda] - ODA - Out of Delivery Area charges
 * @property {number} [warai_charge] - Warai charge
 * @property {number} [odc_charge] - ODC - Out of Delivery City charges
 * @property {number} [courier_charge] - Base courier charge
 */
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

/**
 * Shipping rate quote from a courier
 * @property {number} [system_order_id] - Internal system order ID
 * @property {number} courier_id - Internal courier identifier
 * @property {string} courier_name - Name of the courier service
 * @property {string} [courier_type] - Transport type: "Surface" or "Air"
 * @property {string} [zone] - Delivery zone: "North", "South", "East", "West", etc.
 * @property {number} [tat] - Turnaround time in days
 * @property {number} [billable_weight] - Billable weight for shipping calculation
 * @property {string} [risk_type_name] - Risk type name (nullable)
 * @property {number} total_shipping_charges - FINAL total cost including all charges (INR)
 * @property {number} [freight_charge] - Base freight cost
 * @property {number} [cod_charge] - Cash on Delivery fee
 * @property {number} [courier_charge] - Base courier charge before additional fees
 * @property {AdditionalCharges} [other_additional_charges] - Breakdown of additional fees
 *
 * @example
 * ```ts
 * // Response from getShippingRates
 * {
 *   courier_id: 123,
 *   courier_name: "Delhivery",
 *   courier_type: "Surface",
 *   zone: "North",
 *   tat: 3,
 *   total_shipping_charges: 150.50,
 *   freight_charge: 100,
 *   cod_charge: 25,
 *   other_additional_charges: {
 *     oda: 15,
 *     handling_charge: 10.50
 *   }
 * }
 * ```
 */
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

// ==================== API RESPONSE TYPES ====================

/**
 * Base API response wrapper
 * All Bigship API responses follow this structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  responseCode: number;
  data: T;
}

// ==================== TYPE GUARDS ====================

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if an API response is successful
 * Narrows the type to ensure data is non-null
 *
 * @example
 * ```ts
 * const response = await client.addSingleOrder(orderData);
 * if (isSuccessResponse(response)) {
 *   console.log(response.data); // Order ID (string)
 * }
 * ```
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true;
}

/**
 * Type guard to check if an API response failed
 * Narrows the type to ensure data is null
 *
 * @example
 * ```ts
 * const response = await client.addSingleOrder(orderData);
 * if (isFailedResponse(response)) {
 *   console.log('Error:', response.message);
 * }
 * ```
 */
export function isFailedResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; data: null } {
  return response.success === false;
}
