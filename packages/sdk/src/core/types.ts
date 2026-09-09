import { z } from 'zod';

import type { InternalAxiosRequestConfig } from 'axios';
import type { BigshipError } from '../errors/BigshipError';

export interface BigshipConfig {
  baseURL: string;
  userName: string;
  password: string;
  accessKey: string;
  timeout?: number;

  // New options (all optional, with sensible defaults)
  enableDetailedLogging?: boolean;         // Default: false
  maxRetries?: number;                     // Default: 3
  retryDelay?: number;                     // Default: 1000 (ms)
  maxRetryDelay?: number;                  // Default: 30000 (ms) - upper bound for exponential backoff
  retryOnStatusCodes?: number[];           // Default: [408, 429, 500, 502, 503, 504]
  tokenTtlMs?: number;                     // Default: 3300000 (55 min). Set if API token TTL differs from 60 min.

  // Event hooks
  onResponse?: (response: ApiResponse<unknown>, context: RequestContext) => void | Promise<void>;
  onError?: (error: BigshipError, context: RequestContext) => void | Promise<void>;
  onRetry?: (attempt: number, error: BigshipError, context: RequestContext) => void | Promise<void>;
  onBeforeRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
}

/**
 * Logger interface for pluggable logging.
 * Implement this interface to integrate with Winston, pino, etc.
 */
export interface LoggerAdapter {
  debug?(message: string, data?: unknown): void;
  info?(message: string, data?: unknown): void;
  warn?(message: string, data?: unknown): void;
  error?(message: string, data?: unknown): void;
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
  duration?: number;
}

// ==================== API RESPONSE WRAPPER ====================

/**
 * Standard API response wrapper for Unified Outbound API
 * Uses `status` and `status_code` fields
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.boolean(),
    message: z.string(),
    status_code: z.number(),
    data: dataSchema.nullable(),
  });

// ==================== AUTH ====================

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string(),
  access_key: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  EmailID: z.string(),
  mobileNumber: z.string(),
  countryname: z.string(),
  IsEmailVerifed: z.union([z.string(), z.boolean()]),
  token: z.string(),
  tokenExpiringAt: z.string(),
  is_outbound_service_enabled: z.union([z.string(), z.boolean()]),
  api_master_client_account: z.object({
    access_key: z.string(),
    access_key_generated_date: z.string(),
    is_account_enabled: z.union([z.string(), z.boolean()]),
    created_date: z.string(),
    updated_date: z.string(),
  }),
  userWallet: z.object({
    Balance: z.union([z.string(), z.number()]),
    kycCurrency: z.string(),
  }),
});

export const LoginResponseSchema = ApiResponseSchema(LoginDataSchema);

// ==================== PROFILE ====================

export const ProfileDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  EmailID: z.string(),
  mobileNumber: z.string(),
  countryname: z.string(),
  IsEmailVerifed: z.string(),
  is_outbound_service_enabled: z.string(),
  api_master_client_account: z.object({
    access_key: z.string(),
    access_key_generated_date: z.string(),
    is_account_enabled: z.string(),
    created_date: z.string(),
    updated_date: z.string(),
  }),
  userWallet: z.object({
    Balance: z.union([z.string(), z.number()]),
    kycCurrency: z.string(),
  }),
});

export const ProfileResponseSchema = ApiResponseSchema(ProfileDataSchema);

// ==================== WAREHOUSE ====================

export const SaveWarehouseRequestSchema = z.object({
  segment_type: z.enum(['hyperlocal', 'local']),
  warehouseContactPerson: z.string().min(1),
  warehouseAddressPhone: z.string().regex(/^[0-9]{10}$/),
  warehouseCountry: z.string().default('India'),
  warehouseState: z.string().min(1),
  warehouseCity: z.string().min(1),
  warehousePinCode: z.string().regex(/^[0-9]{6}$/),
  warehouseAddressLine1: z.string().min(3).max(75), // 3-75 words
  warehouseAddressLine2: z.string().max(75).optional(),
  warehouseAddressLandMark: z.string().min(3).max(50), // 3-50 words
  latitude: z.string().optional(), // Required only when segment_type is hyperlocal
  longitude: z.string().optional(), // Required only when segment_type is hyperlocal
  address_type: z.enum(['Home', 'Office', 'Shop', 'Factory', 'Hotel', 'Other']).optional(), // Required only when segment_type is hyperlocal
});

export type SaveWarehouseRequest = z.infer<typeof SaveWarehouseRequestSchema>;

export const SaveWarehouseDataSchema = z.object({
  warehouseId: z.number(),
  is_phone_verified: z.number(),
  phone_number: z.string(),
});

export const SaveWarehouseResponseSchema = ApiResponseSchema(SaveWarehouseDataSchema);

export const GetWarehouseListRequestSchema = z.object({
  page: z.string(),
  perPage: z.string(),
  segment_type: z.enum(['hyperlocal', 'local']),
  status: z.string().optional(),
  filter_type: z.enum(['warehouse_name', 'warehouse_phone', 'warehouse_pin', 'warehouse_contact_person']).optional(),
  filter_value: z.string().optional(),
});

export type GetWarehouseListRequest = z.infer<typeof GetWarehouseListRequestSchema>;

export const HyperlocalInfoSchema = z.object({
  type: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  mapLocationId: z.string().nullable(),
  addressType: z.string(),
});

export const WarehouseListItemSchema = z.object({
  warehouseId: z.number(),
  warehouseName: z.string(),
  warehouseContactPerson: z.string(),
  warehouseAddressLine1: z.string(),
  warehouseAddressLine2: z.string(),
  warehouseAddressLandMark: z.string(),
  warehouseAddressPhone: z.string(),
  isActive: z.string(),
  isShipped: z.string(),
  isEditable: z.union([z.number(), z.boolean()]),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  pincode: z.string(),
  is_location_enabled: z.string(),
  addedOn: z.string(),
  hyperlocal: HyperlocalInfoSchema.optional(),
});

// API returns empty array [] when no warehouses, or object { warehouse: [], total: n } when there are
export const WarehouseListDataSchema = z.union([
  z.object({
    warehouse: z.array(WarehouseListItemSchema),
    total: z.number(),
  }),
  z.array(z.unknown()).transform(() => ({ warehouse: [] as z.infer<typeof WarehouseListItemSchema>[], total: 0 })),
]);

export const WarehouseListResponseSchema = ApiResponseSchema(WarehouseListDataSchema);

export const UpdateWarehouseRequestSchema = z.object({
  warehouseId: z.string(),
  warehouseName: z.string().min(1),
  warehouseContactPerson: z.string().min(1),
  warehouseAddressPhone: z.string().regex(/^[0-9]{10}$/),
  warehouseCountry: z.string().default('India'),
  warehouseState: z.string().min(1),
  warehouseCity: z.string().min(1),
  warehousePinCode: z.string().regex(/^[0-9]{6}$/),
  warehouseAddressLine1: z.string().min(3).max(75),
  warehouseAddressLine2: z.string().max(75).optional(),
  warehouseAddressLandMark: z.string().min(3).max(50),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address_type: z.enum(['Home', 'Office', 'Shop', 'Factory', 'Hotel', 'Other']).optional(),
});

export type UpdateWarehouseRequest = z.infer<typeof UpdateWarehouseRequestSchema>;

export const UpdateWarehouseDataSchema = z.object({
  is_phone_verified: z.number(),
  phone_number: z.string(),
});

export const UpdateWarehouseResponseSchema = ApiResponseSchema(UpdateWarehouseDataSchema);

// ==================== PACKAGE TYPES ====================

export const PackageTypeSchema = z.object({
  HyperlocalPackageTypeId: z.number(),
  PackageType: z.string(),
  Description: z.string(),
  IsEnabled: z.string(),
});

export const PackageTypeResponseSchema = ApiResponseSchema(z.array(PackageTypeSchema));

// ==================== PAYMENT MODES ====================

export const PaymentModeSchema = z.object({
  paymentModeId: z.string(),
  paymentModeName: z.string(),
});

export const PaymentModeResponseSchema = ApiResponseSchema(z.array(PaymentModeSchema));

// ==================== RISK TYPES ====================

export const RiskTypeSchema = z.object({
  riskTypeId: z.number(),
  riskName: z.string(),
  slug: z.string(),
});

export const RiskTypeResponseSchema = ApiResponseSchema(z.array(RiskTypeSchema));

// ==================== RATE CALCULATOR ====================

export const RateCalculatorBoxSchema = z.object({
  box_length: z.number().int().positive(),
  box_width: z.number().int().positive(),
  box_height: z.number().int().positive(),
  box_dead_weight: z.number().int().positive(),
  no_of_box: z.number().int().positive(),
});

export const RateCalculatorRequestSchema = z.object({
  segment_type: z.enum(['domestic_b2b', 'domestic_b2c']),
  sourcePincode: z.string().regex(/^[0-9]{6}$/),
  destPincode: z.string().regex(/^[0-9]{6}$/),
  invoiceValue: z.number().positive(),
  paymentModeId: z.number(),
  codAmount: z.string().optional(),
  riskTypeId: z.number(),
  boxes: z.array(RateCalculatorBoxSchema),
});

export type RateCalculatorRequest = z.infer<typeof RateCalculatorRequestSchema>;

export const RateCalculatorItemSchema = z.object({
  courierName: z.string(),
  courierImage: z.string().nullable(),
  courierType: z.string(),
  riskTypeName: z.string(),
  planName: z.string(),
  courier_partner_id: z.number(),
  courierCharge: z.number(),
  tat: z.string(),
  weight: z.union([z.number(), z.string()]),
  zone: z.string(),
  restricted_pincode_message: z.string().nullable(),
  codCharges: z.number(),
  riskType: z.string(),
  lrCost: z.union([z.string(), z.number()]),
  handlingCharge: z.string(),
  greenTax: z.number(),
  toPay: z.number(),
  oda: z.string(),
  warai_Charge: z.number(),
  state_Tax: z.string(),
  minimum_weight: z.string(),
  pickup_Charge: z.number(),
  whatsappNotificationCharge: z.number(),
  emailNotificationCharge: z.number(),
  smsNotificationCharge: z.number(),
  totalCharge: z.number(),
});

export const RateCalculatorResponseSchema = ApiResponseSchema(z.array(RateCalculatorItemSchema));

// ==================== ORDER CREATION ====================

// Common fields for all segment types
const OrderCommonFieldsSchema = z.object({
  segment_type: z.enum(['hyperlocal', 'domestic_b2b', 'domestic_b2c']),
  MasterOrderPickUpLocation: z.number(),
  MasterOrderPaymentMode: z.number(),
  MasterOrderShippingName: z.string().min(1),
  MasterOrderShippingEmail: z.string().email().optional(),
  MasterOrderShippingMobileNo: z.union([z.string(), z.number()]),
  MasterOrderShippingZipCode: z.string().regex(/^[0-9]{6}$/),
  MasterOrderShippingCity: z.string().min(1),
  MasterOrderShippingState: z.string().min(1),
  MasterOrderShippingCountry: z.string().default('India'),
  MasterOrderShippingAddress: z.string().min(1),
  MasterOrderShippingAddress2: z.string().optional(),
  MasterOrderShippingLandmark: z.string().optional(),
});

// Hyperlocal specific fields
const HyperlocalOrderFieldsSchema = z.object({
  MasterOrderShippingLatitude: z.string(),
  MasterOrderShippingLongitude: z.string(),
  OrderInvoiceNo: z.string().optional(),
  MasterOrderInvoiceAmount: z.number().positive(),
  PackageTypeId: z.number().int().positive(),
  pickup_instructions: z.string().optional(),
  additional_comments: z.string().optional(),
  boxes: z.object({
    weight_unit: z.literal('kg'),
    dimension_unit: z.literal('cm'),
    dimensions: z.array(z.object({
      length: z.number().optional(),
      breadth: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().positive(),
    })),
  }),
});

// Domestic B2B specific fields
const DomesticB2BOrderFieldsSchema = z.object({
  MasterOrderReturnLocation: z.number(),
  MasterOrderDate: z.string(), // UTC format: Y-m-d H:i:s
  OrderInvoiceNo: z.string().min(1),
  MasterOrderInvoiceAmount: z.number().positive(),
  MasterOrderCollectableAmount: z.string().optional(),
  ProductName: z.string().min(1),
  totalNumOfBoxes: z.number(),
  boxes: z.array(z.object({
    weight_unit: z.literal('kg'),
    dimension_unit: z.literal('cm'),
    noOfBoxes: z.number(),
    dimensions: z.array(z.object({
      length: z.number().positive(),
      breadth: z.number().positive(),
      height: z.number().positive(),
      weight: z.number().positive(),
    })),
  })),
});

// Domestic B2C specific fields
const ProductItemSchema = z.object({
  productName: z.string().min(1),
  hsn: z.string().optional(),
  qty: z.union([z.string(), z.number()]),
  amount: z.union([z.string(), z.number()]),
  totalAmount: z.union([z.string(), z.number()]),
  collectableAmount: z.union([z.string(), z.number()]),
  categoryId: z.string(),
});

const DomesticB2COrderFieldsSchema = z.object({
  MasterOrderReturnLocation: z.number(),
  MasterOrderDate: z.string(), // UTC format: Y-m-d H:i:s
  OrderInvoiceNo: z.string().min(1),
  MasterOrderInvoiceAmount: z.number().positive(),
  totalNumOfBoxes: z.number(),
  boxes: z.array(z.object({
    weight_unit: z.literal('kg'),
    dimension_unit: z.literal('cm'),
    noOfBoxes: z.number(),
    dimensions: z.array(z.object({
      length: z.number().positive(),
      breadth: z.number().positive(),
      height: z.number().positive(),
      weight: z.number().positive(),
    })),
    products: z.array(ProductItemSchema),
  })),
});

// Combined schemas for each segment type
export const HyperlocalOrderRequestSchema = OrderCommonFieldsSchema.extend({
  segment_type: z.literal('hyperlocal'),
}).merge(HyperlocalOrderFieldsSchema);

export const DomesticB2BOrderRequestSchema = OrderCommonFieldsSchema.extend({
  segment_type: z.literal('domestic_b2b'),
}).merge(DomesticB2BOrderFieldsSchema);

export const DomesticB2COrderRequestSchema = OrderCommonFieldsSchema.extend({
  segment_type: z.literal('domestic_b2c'),
}).merge(DomesticB2COrderFieldsSchema);

// Union type for all order requests
export const CreateOrderRequestSchema = z.discriminatedUnion('segment_type', [
  HyperlocalOrderRequestSchema,
  DomesticB2BOrderRequestSchema,
  DomesticB2COrderRequestSchema,
]);

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type HyperlocalOrderRequest = z.infer<typeof HyperlocalOrderRequestSchema>;
export type DomesticB2BOrderRequest = z.infer<typeof DomesticB2BOrderRequestSchema>;
export type DomesticB2COrderRequest = z.infer<typeof DomesticB2COrderRequestSchema>;

export const CreateOrderDataSchema = z.object({
  CustomGlobalOrderId: z.string(),
});

export const CreateOrderResponseSchema = ApiResponseSchema(CreateOrderDataSchema);

// ==================== SERVICEABLE COURIERS ====================

export const ServiceableCouriersRequestSchema = z.object({
  MasterCustomOrderId: z.string().min(1),
});

export type ServiceableCouriersRequest = z.infer<typeof ServiceableCouriersRequestSchema>;

// Hyperlocal courier rate
export const HyperlocalRateSchema = z.object({
  courierId: z.number(),
  courierName: z.string(),
  courierImage: z.string(),
  vehicle_type: z.string(),
  capacity: z.string(),
  planName: z.string(),
  base_freight: z.number(),
  gst_amount: z.number(),
  total_freight: z.number(),
  currency: z.string(),
});

// Domestic B2B/B2C courier rate
export const DomesticRateSchema = z.object({
  planName: z.string(),
  courierName: z.string(),
  courierId: z.string(),
  pickup: z.string(),
  destination: z.string(),
  charged_weight: z.number(),
  weight_unit: z.string(),
  base_freight: z.number(),
  riskTypeName: z.string(),
  courierType: z.string(),
  zone: z.string(),
  riskCharge: z.string(),
  lrCost: z.string(),
  handlingCharge: z.string(),
  greenTax: z.string(),
  codCharges: z.number(),
  toPay: z.string(),
  oda: z.string(),
  tat: z.number(),
  warai_Charge: z.number(),
  state_Tax: z.union([z.number(), z.string()]),
  pickup_Charge: z.string(),
  smsNotificationCharge: z.number(),
  emailNotificationCharge: z.number(),
  whatsappNotificationCharge: z.number(),
  total: z.string(),
  kycCurrency: z.string(),
  courierImage: z.string().nullable(),
  riskCharges: z.array(z.object({
    typeId: z.number(),
    name: z.string(),
    chargeValue: z.string(),
    isRisk: z.boolean(),
  })),
});

export const ServiceableCouriersDataSchema = z.object({
  segment_type: z.string(),
  calculatedRates: z.array(z.union([HyperlocalRateSchema, DomesticRateSchema])),
});

export const ServiceableCouriersResponseSchema = ApiResponseSchema(ServiceableCouriersDataSchema);

// ==================== PLACE ORDER ====================

export const PlaceOrderRequestSchema = z.object({
  MasterCustomOrderId: z.string().min(1),
  courierId: z.number().positive(),
  invoiceType: z.string().optional(),
  riskTypeId: z.string().optional(),
});

export type PlaceOrderRequest = z.infer<typeof PlaceOrderRequestSchema>;

export const PlaceOrderDataSchema = z.object({
  reference_number: z.union([z.string(), z.number()]),
  awb_assigned: z.union([z.string(), z.number()]).nullable(),
});

export const PlaceOrderResponseSchema = ApiResponseSchema(PlaceOrderDataSchema);

// ==================== CANCEL ORDER ====================

export const CancelOrderRequestSchema = z.object({
  CustomGlobalOrderId: z.string().min(1),
});

export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;

export const CancelOrderResponseSchema = ApiResponseSchema(z.array(z.unknown()));

// ==================== TRACK ORDER ====================

export const TrackOrderRequestSchema = z.object({
  CustomGlobalOrderId: z.string().min(1),
});

export type TrackOrderRequest = z.infer<typeof TrackOrderRequestSchema>;

export const TrackingCoordinateSchema = z.object({
  latitude: z.string(),
  longitude: z.string(),
  mapLocationId: z.string(),
  addressType: z.string(),
});

export const TrackingPartnerSchema = z.object({
  name: z.string(),
  vehicle: z.object({
    number: z.string().nullable(),
    type: z.string(),
  }),
  contact: z.object({
    primary: z.object({
      country_code: z.string(),
      number: z.string(),
    }),
    secondary: z.object({
      country_code: z.string(),
      number: z.string(),
    }),
  }),
});

export const TrackingCurrentStatusSchema = z.object({
  tracking_status: z.string(),
  partner_details: TrackingPartnerSchema.optional(),
  location: z.object({
    latitude: z.string().nullable(),
    longitude: z.string().nullable(),
  }),
  timestamps: z.object({
    pickup: z.string().nullable(),
    order: z.object({
      accepted: z.string().nullable(),
      started: z.string().nullable(),
      ended: z.string().nullable(),
    }),
  }),
  fare_details: z.object({
    currency: z.string(),
    amount: z.string(),
  }),
});

export const TrackingHistorySchema = z.object({
  location: z.object({
    latitude: z.string().nullable(),
    longitude: z.string().nullable(),
  }),
  tag: z.string(),
  order_status: z.string(),
  checkpoint_time: z.string(),
  message: z.string(),
});

export const TrackOrderDataSchema = z.object({
  CustomGlobalOrderId: z.string(),
  order_place_time: z.string(),
  tracking_number: z.string(),
  courier_name: z.string(),
  courier_image: z.string(),
  tag: z.string(),
  order_status: z.string(),
  latest_checkpoint_time: z.string(),
  source_coordinate: TrackingCoordinateSchema,
  drop_coordinate: TrackingCoordinateSchema,
  tracking_current_status: TrackingCurrentStatusSchema,
  tracking_histories: z.array(TrackingHistorySchema),
});

export const TrackOrderResponseSchema = ApiResponseSchema(TrackOrderDataSchema);

// ==================== ORDER DETAIL ====================

export const OrderDetailRequestSchema = z.object({
  MasterCustomOrderId: z.string().min(1),
});

export type OrderDetailRequest = z.infer<typeof OrderDetailRequestSchema>;

export const OrderDetailBoxSchema = z.object({
  parameterName: z.string(),
  parameterValue: z.string(),
  parameterCategory: z.string(),
});

export const OrderDetailProductSchema = z.object({
  numberOfProducts: z.string(),
  detailsIdentifier: z.string(),
  products: z.array(z.unknown()),
  box_details: z.array(OrderDetailBoxSchema),
  weight: z.object({
    value: z.string(),
    unit: z.string(),
  }),
});

export const OrderDetailConsignorSchema = z.object({
  companyName: z.string(),
  companyEmailId: z.string().nullable(),
  companyMobile: z.string(),
  orderCountry: z.string(),
  orderState: z.string(),
  orderCity: z.string(),
  orderPin: z.string(),
  billingAddress: z.string(),
  billingAddress2: z.string(),
  landmark: z.string(),
  consignorBusinessType: z.string(),
});

export const OrderDetailConsigneeSchema = z.object({
  companyName: z.string(),
  companyEmailId: z.string().nullable(),
  companyMobile: z.string(),
  orderCountry: z.string(),
  orderState: z.string(),
  orderCity: z.string(),
  orderPin: z.string(),
  billingAddress: z.string(),
  billingAddress2: z.string(),
  landmark: z.string(),
  consigneeBusinessType: z.string(),
});

export const OrderDetailPickupSchema = z.object({
  warehouseName: z.string(),
  warehouseContactPerson: z.string(),
  warehouseAddressLine1: z.string(),
  warehouseAddressLine2: z.string(),
  warehouseAddressLandMark: z.string(),
  warehouseAddressPhone: z.string(),
  warehousePin: z.string(),
  warehouseCity: z.string(),
  warehouseState: z.string(),
  warehouseCountry: z.string(),
});

export const OrderDetailDataSchema = z.object({
  segment_type: z.string(),
  getOrderDetails: z.object({
    MasterCustomOrderId: z.string(),
    InvoiceNumber: z.string(),
    MasterOrderCurrency: z.string(),
    AwbNumber: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    MasterCustomInvoiceId: z.string().nullable(),
    PaymentMode: z.string(),
    InvoiceStatusId: z.string(),
    InvoiceStatus: z.string(),
    status_id: z.string(),
    status: z.string(),
    products_name: z.string(),
    product_details: z.array(OrderDetailProductSchema),
    MasterOrderShippingZipCode: z.string(),
    totalNoOfBoxes: z.number().nullable(),
    consignorType: z.string(),
    consignor: OrderDetailConsignorSchema,
    consignee: OrderDetailConsigneeSchema,
    consigneeBilling: OrderDetailConsigneeSchema,
    pickupDetail: OrderDetailPickupSchema,
    totalInvoiceAmount: z.string(),
    InvoiceCurrency: z.string(),
    weight: z.string(),
    weightUnit: z.string(),
    box_dimensions: z.array(z.object({
      length: z.string(),
      breadth: z.string(),
      height: z.string(),
      each_box_weight: z.string(),
      no_of_box: z.string(),
    })),
    dimensions: z.array(z.string()),
    orderDate: z.string(),
    collectableAmount: z.string(),
    PackageTypeId: z.string(),
    PackageTypeName: z.string(),
  }),
});

export const OrderDetailResponseSchema = ApiResponseSchema(OrderDetailDataSchema);

// ==================== DOWNLOAD DOCUMENTS ====================

export const DownloadDocumentRequestSchema = z.object({
  CustomGlobalOrderId: z.string().min(1),
  document_type: z.enum(['invoice', 'label', 'ewaybill', 'manifest']),
});

export type DownloadDocumentRequest = z.infer<typeof DownloadDocumentRequestSchema>;

export const DownloadDocumentDataSchema = z.object({
  AttachmentData: z.string(),
  File_extention: z.string(),
});

export const DownloadDocumentResponseSchema = ApiResponseSchema(DownloadDocumentDataSchema);

// ==================== RESPONSE TYPE EXPORTS ====================

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type SaveWarehouseResponse = z.infer<typeof SaveWarehouseResponseSchema>;
export type WarehouseListResponse = ApiResponse<{
  warehouse: z.infer<typeof WarehouseListItemSchema>[];
  total: number;
}>;
export type UpdateWarehouseResponse = z.infer<typeof UpdateWarehouseResponseSchema>;
export type PackageTypeResponse = z.infer<typeof PackageTypeResponseSchema>;
export type PaymentModeResponse = z.infer<typeof PaymentModeResponseSchema>;
export type RiskTypeResponse = z.infer<typeof RiskTypeResponseSchema>;
export type RateCalculatorResponse = z.infer<typeof RateCalculatorResponseSchema>;
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;
export type ServiceableCouriersResponse = z.infer<typeof ServiceableCouriersResponseSchema>;
export type PlaceOrderResponse = z.infer<typeof PlaceOrderResponseSchema>;
export type CancelOrderResponse = z.infer<typeof CancelOrderResponseSchema>;
export type TrackOrderResponse = z.infer<typeof TrackOrderResponseSchema>;
export type OrderDetailResponse = z.infer<typeof OrderDetailResponseSchema>;
export type DownloadDocumentResponse = z.infer<typeof DownloadDocumentResponseSchema>;

// ==================== API RESPONSE TYPES ====================

/**
 * Base API response wrapper
 * All Bigship API responses follow this structure
 */
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  status_code: number;
  data: T | null;
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if an API response is successful
 * Narrows the type to ensure data is non-null
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { status: true; data: T } {
  return response.status === true && response.data !== null && response.data !== undefined;
}

/**
 * Type guard to check if an API response failed
 * Narrows the type to ensure data is null.
 */
export function isFailedResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { status: false; data: null } {
  return response.status === false && response.data === null;
}
