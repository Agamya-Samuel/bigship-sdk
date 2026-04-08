import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';
import {
  BigshipConfig,
  LoginRequestSchema,
  AddSingleOrderRequestSchema,
  AddHeavyOrderRequestSchema,
  RateCalculatorRequestSchema,
  ManifestSingleRequestSchema,
  ManifestHeavyRequestSchema,
  CancelRequestSchema,
  WarehouseAddRequestSchema,
  BigshipError,
  type LoginRequest,
  type AddSingleOrderRequest,
  type AddHeavyOrderRequest,
  type RateCalculatorRequest,
  type WarehouseAddRequest,
} from './types';

export class BigshipClient {
  private axios: AxiosInstance;
  private token: string | null = null;
  private config: Required<BigshipConfig>;

  constructor(config: BigshipConfig) {
    this.config = {
      timeout: 15000,
      ...config,
    };

    this.axios = axios.create({
      baseURL: this.config.baseURL.endsWith('/') ? this.config.baseURL : `${this.config.baseURL}/`,
      timeout: this.config.timeout,
      headers: { 'Content-Type': 'application/json', 'User-Agent': '@agamya/bigship-sdk/1.0.0' },
    });

    this.axios.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        const data = err.response?.data as any;
        throw new BigshipError(
          data?.message || err.message || 'Bigship API error',
          err.response?.status,
          data?.code,
          data
        );
      }
    );
  }

  /** Login and cache token (called automatically by other methods) */
  async login(): Promise<string> {
    if (this.token) return this.token;

    const payload: LoginRequest = {
      user_name: this.config.userName,
      password: this.config.password,
      access_key: this.config.accessKey,
    };

    const validated = LoginRequestSchema.parse(payload);

    const res = await this.axios.post('/api/login/user', validated);
    const token = (res.data as any).data.token;
    this.token = token;

    // Set Bearer for all future requests
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  }

  // ==================== WALLET ====================

  async getWalletBalance() {
    await this.login();
    const res = await this.axios.get('/api/Wallet/balance/get');
    return res.data;
  }

  // ==================== COURIER ====================

  async getCourierList(shipmentCategory: 'b2b' | 'b2c' = 'b2c') {
    await this.login();
    const res = await this.axios.get('/api/courier/get/all', { params: { shipment_category: shipmentCategory } });
    return res.data;
  }

  async getCourierTransporterList(courierId: number) {
    await this.login();
    const res = await this.axios.get('/api/courier/get/transport/list', { params: { courier_id: courierId } });
    return res.data;
  }

  // ==================== PAYMENT ====================

  async getPaymentCategory(shipmentCategory: 'b2b' | 'b2c' = 'b2c') {
    await this.login();
    const res = await this.axios.get('/api/payment/category', { params: { shipment_category: shipmentCategory } });
    return res.data;
  }

  // ==================== WAREHOUSE ====================

  async addWarehouse(payload: WarehouseAddRequest) {
    await this.login();
    const validated = WarehouseAddRequestSchema.parse(payload);
    const res = await this.axios.post('/api/warehouse/add', validated);
    return res.data;
  }

  async getWarehouseList(pageIndex = 1, pageSize = 10) {
    await this.login();
    const res = await this.axios.get('/api/warehouse/get/list', {
      params: { page_index: pageIndex, page_size: pageSize },
    });
    return res.data;
  }

  // ==================== ORDER ====================

  async addSingleOrder(payload: AddSingleOrderRequest) {
    await this.login();
    const validated = AddSingleOrderRequestSchema.parse(payload);
    const res = await this.axios.post('/api/order/add/single', validated);
    return res.data;
  }

  async addHeavyOrder(payload: AddHeavyOrderRequest) {
    await this.login();
    const validated = AddHeavyOrderRequestSchema.parse(payload);
    const res = await this.axios.post('/api/order/add/heavy', validated);
    return res.data;
  }

  async manifestSingle(payload: z.infer<typeof ManifestSingleRequestSchema>) {
    await this.login();
    const validated = ManifestSingleRequestSchema.parse(payload);
    const res = await this.axios.post('/api/order/manifest/single', validated);
    return res.data;
  }

  async manifestHeavy(payload: z.infer<typeof ManifestHeavyRequestSchema>) {
    await this.login();
    const validated = ManifestHeavyRequestSchema.parse(payload);
    const res = await this.axios.post('/api/order/manifest/heavy', validated);
    return res.data;
  }

  async getShippingRates(systemOrderId: string, shipmentCategory: 'B2C' | 'B2B' = 'B2C', riskType = '') {
    await this.login();
    const res = await this.axios.get('/api/order/shipping/rates', {
      params: { shipment_category: shipmentCategory, system_order_id: systemOrderId, risk_type: riskType },
    });
    return res.data;
  }

  async cancelShipments(awbs: string[]) {
    await this.login();
    const validated = CancelRequestSchema.parse(awbs);
    const res = await this.axios.put('/api/order/cancel', validated);
    return res.data;
  }

  // ==================== CALCULATOR ====================

  async calculateRate(payload: RateCalculatorRequest) {
    await this.login();
    const validated = RateCalculatorRequestSchema.parse(payload);
    const res = await this.axios.post('/api/calculator', validated);
    return res.data;
  }

  // ==================== SHIPMENT ====================

  async getShipmentData(shipmentDataId: number, systemOrderId: string) {
    await this.login();
    const res = await this.axios.post('/api/shipment/data', null, {
      params: { shipment_data_id: shipmentDataId, system_order_id: systemOrderId },
    });
    return res.data;
  }

  async trackShipment(trackingId: string, trackingType: 'awb' = 'awb') {
    await this.login();
    const res = await this.axios.get('/api/tracking', {
      params: { tracking_type: trackingType, tracking_id: trackingId },
    });
    return res.data;
  }
}

export default BigshipClient;
