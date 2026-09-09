import { z } from 'zod';
import {
  SaveWarehouseRequestSchema,
  GetWarehouseListRequestSchema,
  UpdateWarehouseRequestSchema,
  RateCalculatorRequestSchema,
  HyperlocalOrderRequestSchema,
  DomesticB2BOrderRequestSchema,
  DomesticB2COrderRequestSchema,
  ServiceableCouriersRequestSchema,
  PlaceOrderRequestSchema,
  CancelOrderRequestSchema,
  TrackOrderRequestSchema,
  OrderDetailRequestSchema,
  DownloadDocumentRequestSchema,
} from '@agamya/bigship-sdk';

// ==================== WAREHOUSE ====================

export const SAMPLE_WAREHOUSE: z.infer<typeof SaveWarehouseRequestSchema> = {
  segment_type: 'hyperlocal',
  warehouseContactPerson: 'Siddharth',
  warehouseAddressPhone: '7854693258',
  warehouseCountry: 'India',
  warehouseState: 'Karnataka',
  warehouseCity: 'BANGALORE',
  warehousePinCode: '560113',
  warehouseAddressLine1: 'Sector 29',
  warehouseAddressLine2: 'Near Hudda City Centre',
  warehouseAddressLandMark: 'Hudda City Centre',
  latitude: '12.947146336879577',
  longitude: '77.62102993895199',
  address_type: 'Home',
};

export const SAMPLE_WAREHOUSE_LIST: z.infer<typeof GetWarehouseListRequestSchema> = {
  page: '1',
  perPage: '10',
  segment_type: 'hyperlocal',
  status: '',
  filter_type: undefined,
  filter_value: undefined,
};

export const SAMPLE_UPDATE_WAREHOUSE: z.infer<typeof UpdateWarehouseRequestSchema> = {
  warehouseId: '214',
  warehouseName: 'Hyperlocal BANGALORE Pickup Rohit',
  warehouseContactPerson: 'Siddharth',
  warehouseAddressPhone: '7854693258',
  warehouseCountry: 'India',
  warehouseState: 'Karnataka',
  warehouseCity: 'BANGALORE',
  warehousePinCode: '560113',
  warehouseAddressLandMark: 'Hudda City Centre',
  warehouseAddressLine1: 'Sector 52',
  warehouseAddressLine2: 'Sector 29',
  latitude: '12.947146336879577',
  longitude: '77.62102993895199',
  address_type: 'Home',
};

// ==================== RATE CALCULATOR ====================

export const SAMPLE_RATE_CALC_B2B: z.infer<typeof RateCalculatorRequestSchema> = {
  segment_type: 'domestic_b2b',
  sourcePincode: '302017',
  destPincode: '110006',
  invoiceValue: 5000,
  paymentModeId: 2, // 1: Prepaid, 2: COD, 3: ToPay
  riskTypeId: 2, // 1: Third Party Insurance, 2: Owner Risk, 3: Carrier Risk
  boxes: [
    {
      no_of_box: 10,
      box_length: 10,
      box_width: 10,
      box_height: 10,
      box_dead_weight: 10,
    },
  ],
};

export const SAMPLE_RATE_CALC_B2C: z.infer<typeof RateCalculatorRequestSchema> = {
  segment_type: 'domestic_b2c',
  sourcePincode: '110001',
  destPincode: '400001',
  invoiceValue: 2500,
  paymentModeId: 1, // Prepaid
  riskTypeId: 2, // Owner Risk
  boxes: [
    {
      no_of_box: 1,
      box_length: 20,
      box_width: 15,
      box_height: 10,
      box_dead_weight: 1,
    },
  ],
};

// ==================== ORDERS ====================

export const SAMPLE_HYPERLOCAL_ORDER: z.infer<typeof HyperlocalOrderRequestSchema> = {
  segment_type: 'hyperlocal',
  MasterOrderPickUpLocation: 96,
  PackageTypeId: 5,
  MasterOrderInvoiceAmount: 100,
  OrderInvoiceNo: '1234',
  MasterOrderPaymentMode: 1,
  MasterOrderShippingName: 'Tony carreiro',
  MasterOrderShippingMobileNo: '9166761588',
  MasterOrderShippingZipCode: '110002',
  MasterOrderShippingCity: 'DELHI',
  MasterOrderShippingState: 'DELHI',
  MasterOrderShippingCountry: 'India',
  MasterOrderShippingAddress: 'asq',
  MasterOrderShippingAddress2: 'wqewq',
  MasterOrderShippingLandmark: 'N/A',
  MasterOrderShippingLatitude: '28.641909999999999',
  MasterOrderShippingLongitude: '77.222053000000002',
  pickup_instructions: '',
  additional_comments: '',
  boxes: {
    weight_unit: 'kg',
    dimension_unit: 'cm',
    dimensions: [
      {
        length: 40,
        breadth: 40,
        height: 40,
        weight: 20,
      },
    ],
  },
};

export const SAMPLE_B2B_ORDER: z.infer<typeof DomesticB2BOrderRequestSchema> = {
  segment_type: 'domestic_b2b',
  MasterOrderPickUpLocation: 258,
  MasterOrderReturnLocation: 258,
  MasterOrderDate: '2025-11-15 01:05:15',
  MasterOrderPaymentMode: 1,
  OrderInvoiceNo: '1234',
  MasterOrderInvoiceAmount: 1000,
  MasterOrderCollectableAmount: '',
  MasterOrderShippingEmail: 'test@gmail.com',
  MasterOrderShippingName: 'test company',
  MasterOrderShippingMobileNo: 8956231470,
  MasterOrderShippingAddress: 'test',
  MasterOrderShippingAddress2: '',
  MasterOrderShippingLandmark: 'test',
  MasterOrderShippingZipCode: '110011',
  MasterOrderShippingCountry: 'India',
  MasterOrderShippingState: 'DELHI',
  MasterOrderShippingCity: 'DELHI',
  totalNumOfBoxes: 2,
  ProductName: 'test product',
  boxes: [
    {
      weight_unit: 'kg',
      dimension_unit: 'cm',
      noOfBoxes: 1,
      dimensions: [
        {
          length: 101,
          breadth: 40,
          height: 40,
          weight: 20,
        },
      ],
    },
    {
      weight_unit: 'kg',
      dimension_unit: 'cm',
      noOfBoxes: 1,
      dimensions: [
        {
          length: 40,
          breadth: 40,
          height: 40,
          weight: 20,
        },
      ],
    },
  ],
};

export const SAMPLE_B2C_ORDER: z.infer<typeof DomesticB2COrderRequestSchema> = {
  segment_type: 'domestic_b2c',
  MasterOrderPickUpLocation: 258,
  MasterOrderReturnLocation: 258,
  MasterOrderDate: '2025-08-28 01:05:15',
  MasterOrderPaymentMode: 1,
  OrderInvoiceNo: '1234',
  MasterOrderInvoiceAmount: 1000,
  MasterOrderShippingEmail: 'test@gmail.com',
  MasterOrderShippingName: 'test company',
  MasterOrderShippingMobileNo: 8956231470,
  MasterOrderShippingAddress: 'test',
  MasterOrderShippingAddress2: '',
  MasterOrderShippingLandmark: 'test',
  MasterOrderShippingZipCode: '110011',
  MasterOrderShippingCountry: 'India',
  MasterOrderShippingState: 'DELHI',
  MasterOrderShippingCity: 'DELHI',
  totalNumOfBoxes: 1,
  boxes: [
    {
      weight_unit: 'kg',
      dimension_unit: 'cm',
      noOfBoxes: 1,
      dimensions: [
        {
          length: 101,
          breadth: 40,
          height: 40,
          weight: 20,
        },
      ],
      products: [
        {
          productName: 'soap',
          hsn: '1111',
          qty: '1',
          amount: '4000',
          totalAmount: 4000,
          collectableAmount: 4000,
          categoryId: '1',
        },
      ],
    },
  ],
};

// ==================== ORDER LIFECYCLE ====================

export const SAMPLE_SERVICEABLE_COURIERS: z.infer<typeof ServiceableCouriersRequestSchema> = {
  MasterCustomOrderId: '311276742',
};

export const SAMPLE_PLACE_ORDER: z.infer<typeof PlaceOrderRequestSchema> = {
  MasterCustomOrderId: '311276742',
  courierId: 25,
  riskTypeId: '2',
};

export const SAMPLE_CANCEL_ORDER: z.infer<typeof CancelOrderRequestSchema> = {
  CustomGlobalOrderId: '311276742',
};

export const SAMPLE_TRACK_ORDER: z.infer<typeof TrackOrderRequestSchema> = {
  CustomGlobalOrderId: '311276742',
};

export const SAMPLE_ORDER_DETAIL: z.infer<typeof OrderDetailRequestSchema> = {
  MasterCustomOrderId: '311276742',
};

export const SAMPLE_DOWNLOAD_DOCUMENT: z.infer<typeof DownloadDocumentRequestSchema> = {
  CustomGlobalOrderId: '664736461',
  document_type: 'label',
};

// ==================== PAYMENT MODES ====================

export const SAMPLE_SEGMENT_TYPE = 'domestic_b2b' as const;
