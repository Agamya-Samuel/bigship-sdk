import axios, { AxiosInstance, AxiosError, type AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import {
  type BigshipConfig,
  AddSingleOrderRequestSchema,
  AddHeavyOrderRequestSchema,
  ManifestSingleRequestSchema,
  ManifestHeavyRequestSchema,
  WarehouseAddRequestSchema,
  CancelRequestSchema,
  RateCalculatorRequestSchema,
  CourierItemSchema,
  TransporterItemSchema,
  PaymentCategoryItemSchema,
  WarehouseListItemSchema,
  WarehouseListDataSchema,
  ShippingRateItemSchema,
  ShipmentAWBDataSchema,
  ShipmentFileDataSchema,
  CalculatorRateItemSchema,
  TrackingDataSchema,
  ShipmentDataType,
  type WalletBalanceResponse,
  type CourierListResponse,
  type TransporterListResponse,
  type PaymentCategoryResponse,
  type WarehouseAddRequest,
  type WarehouseAddResponse,
  type WarehouseListResponse,
  type AddSingleOrderRequest,
  type AddHeavyOrderRequest,
  type AddOrderResponse,
  type ManifestResponse,
  type ShippingRatesResponse,
  type CancelResponse,
  type ShipmentAWBResponse,
  type ShipmentFileResponse,
  type ShipmentDataAnyResponse,
  type RateCalculatorRequest,
  type CalculateRateResponse,
  type TrackingResponse,
  type RequestContext,
} from './types';
import { ResponseValidator } from '../http/ResponseValidator';
import { EventDispatcher } from '../infrastructure/EventDispatcher';
import { TokenManager } from '../auth/TokenManager';
import { RetryManager } from '../http/RetryManager';
import { Logger, type LoggerAdapter } from '../infrastructure/Logger';
import {
  BigshipApiError,
  BigshipAuthError,
  BigshipValidationError,
} from '../errors';
import { fileToBase64DataURI, isValidBase64DataURI } from '../utils';
import { ShipmentWorkflow } from '../workflow/ShipmentWorkflow';
import { SDK_VERSION } from '../version';

interface ResolvedConfig extends BigshipConfig {
  readonly timeout: number;
  readonly enableDetailedLogging: boolean;
  readonly maxRetries: number;
  readonly retryDelay: number;
  readonly maxRetryDelay: number;
  readonly retryOnStatusCodes: number[];
}

/**
 * Per-request options that can override client-level defaults.
 */
export interface RequestOptions {
  /** Override the default timeout (ms) for this request */
  timeout?: number;
  /** AbortSignal to cancel the request */
  signal?: AbortSignal;
}

export class BigshipClient {
  private axios: AxiosInstance;
  private tokenManager: TokenManager;
  private retryManager: RetryManager;
  private eventDispatcher: EventDispatcher;
  private logger: Logger;
  private config: ResolvedConfig;

  constructor(config: BigshipConfig & { loggerAdapter?: LoggerAdapter }) {
    const { loggerAdapter, ...rest } = config;
    this.config = {
      timeout: 15000,
      enableDetailedLogging: false,
      maxRetries: 3,
      retryDelay: 1000,
      maxRetryDelay: 30000,
      retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
      ...rest,
    };

    this.logger = new Logger(this.config.enableDetailedLogging, loggerAdapter);
    this.eventDispatcher = new EventDispatcher(this.config, this.logger);

    this.axios = axios.create({
      baseURL: this.config.baseURL.endsWith('/') ? this.config.baseURL : `${this.config.baseURL}/`,
      timeout: this.config.timeout,
      headers: { 'Content-Type': 'application/json', 'User-Agent': `@agamya/bigship-sdk/${SDK_VERSION}` },
    });

    this.tokenManager = new TokenManager(this.axios, this.config, this.eventDispatcher);
    this.retryManager = new RetryManager(this.config, this.eventDispatcher);

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axios.interceptors.request.use(
      async (config) => {
        const modifiedConfig = await this.eventDispatcher.dispatchBeforeRequest(config);
        this.logger.logRequest(modifiedConfig);
        return modifiedConfig;
      },
      (error) => Promise.reject(error)
    );

    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const context: RequestContext = {
          endpoint: error.config?.url || 'unknown',
          method: error.config?.method?.toUpperCase() || 'UNKNOWN',
          requestId: this.extractRequestId(error),
          startTime: Date.now()
        };

        if (error.response?.status === 401 || error.response?.status === 403) {
          // Prevent infinite retry loop: skip if this request was already a retry
          if ((error.config as unknown as Record<string, unknown>)?._authRetried) {
            const authError = new BigshipAuthError('Authentication failed (token refresh already attempted)', {
              requestId: context.requestId,
              endpoint: context.endpoint,
            });
            context.duration = Date.now() - context.startTime;
            await this.eventDispatcher.dispatchError(authError, context);
            this.logger.logError(authError);
            throw authError;
          }

          this.tokenManager.clearToken();

          try {
            await this.tokenManager.getToken();
            if (error.config) {
              (error.config as unknown as Record<string, unknown>)._authRetried = true;
              return this.axios(error.config);
            }
          } catch (refreshError) {
            const authError = new BigshipAuthError('Authentication failed and token refresh failed', {
              requestId: context.requestId,
              endpoint: context.endpoint,
              cause: refreshError instanceof Error ? refreshError : undefined,
            });
            context.duration = Date.now() - context.startTime;
            await this.eventDispatcher.dispatchError(authError, context);
            this.logger.logError(authError);
            throw authError;
          }
        }

        const bigshipError = this.createBigshipError(error, context);
        context.duration = Date.now() - context.startTime;
        await this.eventDispatcher.dispatchError(bigshipError, context);
        this.logger.logError(bigshipError);

        throw bigshipError;
      }
    );
  }

  private extractRequestId(error: AxiosError): string | undefined {
    const headerValue = error.response?.headers['x-request-id'];
    if (headerValue) return headerValue;
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'trace_id' in data) {
      return (data as Record<string, unknown>).trace_id as string | undefined;
    }
    return undefined;
  }

  private createBigshipError(error: AxiosError, context: RequestContext) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;

    if (status === 401 || status === 403) {
      return new BigshipAuthError(
        (data?.message ? String(data.message) : undefined) || 'Authentication failed',
        { requestId: context.requestId, endpoint: context.endpoint, responseBody: data }
      );
    }

    return new BigshipApiError(
      (data?.message ? String(data.message) : undefined) || error.message || 'Bigship API error',
      status || 0,
      {
        code: data?.code ? String(data.code) : undefined,
        requestId: context.requestId,
        endpoint: context.endpoint,
        responseBody: data,
      }
    );
  }

  private parseRequest<T>(schema: z.ZodType<T>, payload: unknown, endpoint: string): T {
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new BigshipValidationError(
        'Request validation failed',
        ResponseValidator.formatZodErrors(result.error.issues),
        { endpoint }
      );
    }
    return result.data;
  }

  private async executeApiCall<T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<{ data: unknown }>,
    schema: z.ZodType<T>,
    message: string,
    validationOptions?: { allowNullData?: boolean }
  ): Promise<{ success: true; message: string; responseCode: 200; data: T }> {
    const retryContext: RequestContext = { endpoint, method, startTime: Date.now() };
    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();
      const startTime = Date.now();
      const res = await apiCall();
      const context: RequestContext = { endpoint, method, startTime, duration: Date.now() - startTime };
      const data = ResponseValidator.validate(res.data, schema, context, validationOptions);
      const response = { success: true as const, message, responseCode: 200 as const, data };
      await this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);
      return response;
    }, retryContext);
  }

  private mergeAxiosConfig(options?: RequestOptions): AxiosRequestConfig | undefined {
    if (!options || (options.timeout === undefined && options.signal === undefined)) return undefined;
    const config: AxiosRequestConfig = {};
    if (options.timeout !== undefined) config.timeout = options.timeout;
    if (options.signal !== undefined) config.signal = options.signal;
    return config;
  }

  /**
   * @deprecated Token management is handled automatically by TokenManager
   */
  async login(): Promise<string> {
    return this.tokenManager.getToken();
  }

  // ==================== WALLET ====================

  /** @throws {BigshipApiError} When API request fails */
  async getWalletBalance(options?: RequestOptions): Promise<WalletBalanceResponse> {
    return this.executeApiCall('/api/Wallet/balance/get', 'GET',
      () => this.axios.get('/api/Wallet/balance/get', this.mergeAxiosConfig(options)),
      z.string(), 'Wallet balance retrieved successfully');
  }

  // ==================== COURIER ====================

  /** @throws {BigshipApiError} When API request fails */
  async getCourierList(shipmentCategory: 'b2b' | 'b2c' = 'b2c', options?: RequestOptions): Promise<CourierListResponse> {
    return this.executeApiCall('/api/courier/get/all', 'GET',
      () => this.axios.get('/api/courier/get/all', { params: { shipment_category: shipmentCategory }, ...this.mergeAxiosConfig(options) }),
      z.array(CourierItemSchema), 'Courier list retrieved successfully');
  }

  /** @throws {BigshipApiError} When API request fails */
  async getCourierTransporterList(courierId: number, options?: RequestOptions): Promise<TransporterListResponse> {
    return this.executeApiCall('/api/courier/get/transport/list', 'GET',
      () => this.axios.get('/api/courier/get/transport/list', { params: { courier_id: courierId }, ...this.mergeAxiosConfig(options) }),
      z.array(TransporterItemSchema), 'Transporter list retrieved successfully');
  }

  // ==================== PAYMENT ====================

  /** @throws {BigshipApiError} When API request fails */
  async getPaymentCategory(shipmentCategory: 'b2b' | 'b2c' = 'b2c', options?: RequestOptions): Promise<PaymentCategoryResponse> {
    return this.executeApiCall('/api/payment/category', 'GET',
      () => this.axios.get('/api/payment/category', { params: { shipment_category: shipmentCategory }, ...this.mergeAxiosConfig(options) }),
      z.array(PaymentCategoryItemSchema), 'Payment category retrieved successfully');
  }

  // ==================== WAREHOUSE ====================

  /** @throws {BigshipValidationError} When request validation fails */
  async addWarehouse(payload: WarehouseAddRequest, options?: RequestOptions): Promise<WarehouseAddResponse> {
    const validated = this.parseRequest(WarehouseAddRequestSchema, payload, '/api/warehouse/add');
    return this.executeApiCall('/api/warehouse/add', 'POST',
      () => this.axios.post('/api/warehouse/add', validated, this.mergeAxiosConfig(options)),
      WarehouseListItemSchema, 'Warehouse added successfully');
  }

  /** @throws {BigshipApiError} When API request fails */
  async getWarehouseList(pageIndex = 1, pageSize = 10, options?: RequestOptions): Promise<WarehouseListResponse> {
    return this.executeApiCall('/api/warehouse/get/list', 'GET',
      () => this.axios.get('/api/warehouse/get/list', { params: { page_index: pageIndex, page_size: pageSize }, ...this.mergeAxiosConfig(options) }),
      WarehouseListDataSchema, 'Warehouse list retrieved successfully');
  }

  // ==================== HELPERS ====================

  static async fileToBase64DataURI(file: File): Promise<string> {
    return fileToBase64DataURI(file);
  }

  static isValidBase64DataURI(value: string): boolean {
    return isValidBase64DataURI(value);
  }

  // ==================== ORDER ====================

  /** @throws {BigshipValidationError} When request validation fails. @throws {BigshipDuplicateInvoiceError} When invoice ID already exists. @throws {BigshipApiError} When API request fails */
  async addSingleOrder(payload: AddSingleOrderRequest, options?: RequestOptions): Promise<AddOrderResponse> {
    const validated = this.parseRequest(AddSingleOrderRequestSchema, payload, '/api/order/add/single');
    return this.executeApiCall('/api/order/add/single', 'POST',
      () => this.axios.post('/api/order/add/single', validated, this.mergeAxiosConfig(options)),
      z.string(), 'Order added successfully');
  }

  /** @throws {BigshipValidationError} When request validation fails. @throws {BigshipDuplicateInvoiceError} When invoice ID already exists. @throws {BigshipApiError} When API request fails */
  async addHeavyOrder(payload: AddHeavyOrderRequest, options?: RequestOptions): Promise<AddOrderResponse> {
    const validated = this.parseRequest(AddHeavyOrderRequestSchema, payload, '/api/order/add/heavy');
    return this.executeApiCall('/api/order/add/heavy', 'POST',
      () => this.axios.post('/api/order/add/heavy', validated, this.mergeAxiosConfig(options)),
      z.string(), 'Order added successfully');
  }

  /** @throws {BigshipValidationError} When request validation fails. @throws {BigshipApiError} When API request fails */
  async manifestSingle(payload: z.infer<typeof ManifestSingleRequestSchema>, options?: RequestOptions): Promise<ManifestResponse> {
    const validated = this.parseRequest(ManifestSingleRequestSchema, payload, '/api/order/manifest/single');
    return this.executeApiCall('/api/order/manifest/single', 'POST',
      () => this.axios.post('/api/order/manifest/single', validated, this.mergeAxiosConfig(options)),
      z.null(), 'Manifest created successfully', { allowNullData: true });
  }

  /** @throws {BigshipValidationError} When request validation fails. @throws {BigshipApiError} When API request fails */
  async manifestHeavy(payload: z.infer<typeof ManifestHeavyRequestSchema>, options?: RequestOptions): Promise<ManifestResponse> {
    const validated = this.parseRequest(ManifestHeavyRequestSchema, payload, '/api/order/manifest/heavy');
    return this.executeApiCall('/api/order/manifest/heavy', 'POST',
      () => this.axios.post('/api/order/manifest/heavy', validated, this.mergeAxiosConfig(options)),
      z.null(), 'Manifest created successfully', { allowNullData: true });
  }

  /** @throws {BigshipApiError} When API request fails */
  async getShippingRates(systemOrderId: string, shipmentCategory: 'B2C' | 'B2B' = 'B2C', riskType = '', options?: RequestOptions): Promise<ShippingRatesResponse> {
    return this.executeApiCall('/api/order/shipping/rates', 'GET',
      () => this.axios.get('/api/order/shipping/rates', { params: { shipment_category: shipmentCategory, system_order_id: systemOrderId, risk_type: riskType }, ...this.mergeAxiosConfig(options) }),
      z.array(ShippingRateItemSchema), 'Shipping rates retrieved successfully');
  }

  /** @throws {BigshipValidationError} When request validation fails. @throws {BigshipApiError} When API request fails */
  async cancelShipments(awbs: string[], options?: RequestOptions): Promise<CancelResponse> {
    const validated = this.parseRequest(CancelRequestSchema, awbs, '/api/order/cancel');
    return this.executeApiCall('/api/order/cancel', 'PUT',
      () => this.axios.put('/api/order/cancel', validated, this.mergeAxiosConfig(options)),
      z.null(), 'Shipments cancelled successfully', { allowNullData: true });
  }

  // ==================== CALCULATOR ====================

  /** @throws {BigshipValidationError} When request validation fails. @throws {BigshipApiError} When API request fails */
  async calculateRate(payload: RateCalculatorRequest, options?: RequestOptions): Promise<CalculateRateResponse> {
    const validated = this.parseRequest(RateCalculatorRequestSchema, payload, '/api/calculator');
    return this.executeApiCall('/api/calculator', 'POST',
      () => this.axios.post('/api/calculator', validated, this.mergeAxiosConfig(options)),
      z.array(CalculatorRateItemSchema), 'Rate calculated successfully');
  }

  // ==================== SHIPMENT ====================

  /** @throws {BigshipApiError} When API request fails */
  async getAWB(systemOrderId: string, options?: RequestOptions): Promise<ShipmentAWBResponse> {
    return this.executeApiCall('/api/shipment/data', 'POST',
      () => this.axios.post('/api/shipment/data', null, { params: { shipment_data_id: 1, system_order_id: systemOrderId }, ...this.mergeAxiosConfig(options) }),
      ShipmentAWBDataSchema, 'Shipment AWB data retrieved successfully');
  }

  /** @throws {BigshipApiError} When API request fails or data is null */
  async getShipmentFile(shipmentDataId: 2 | 3, systemOrderId: string, options?: RequestOptions): Promise<ShipmentFileResponse> {
    return this.executeApiCall('/api/shipment/data', 'POST',
      () => this.axios.post('/api/shipment/data', null, { params: { shipment_data_id: shipmentDataId, system_order_id: systemOrderId }, ...this.mergeAxiosConfig(options) }),
      ShipmentFileDataSchema, 'Shipment file retrieved successfully', { allowNullData: true });
  }

  /** @throws {BigshipApiError} When API request fails or invalid shipmentDataId */
  async getShipmentData(shipmentDataId: 1, systemOrderId: string, options?: RequestOptions): Promise<ShipmentAWBResponse>;
  async getShipmentData(shipmentDataId: 2 | 3, systemOrderId: string, options?: RequestOptions): Promise<ShipmentFileResponse>;
  async getShipmentData(shipmentDataId: number, systemOrderId: string, options?: RequestOptions): Promise<ShipmentDataAnyResponse>;
  async getShipmentData(shipmentDataId: number, systemOrderId: string, options?: RequestOptions): Promise<ShipmentDataAnyResponse> {
    if (shipmentDataId !== 1 && shipmentDataId !== 2 && shipmentDataId !== 3) {
      throw new BigshipApiError(
        `Invalid shipmentDataId: ${shipmentDataId}. Must be 1 (AWB), 2 (Label), or 3 (Manifest).`,
        0,
        { code: 'INVALID_ARGUMENT' }
      );
    }
    if (shipmentDataId === 1) {
      return this.getAWB(systemOrderId, options);
    }
    return this.getShipmentFile(shipmentDataId, systemOrderId, options);
  }

  /** @throws {BigshipApiError} When API request fails */
  async trackShipment(trackingId: string, trackingType: 'awb' | 'lrn' = 'awb', options?: RequestOptions): Promise<TrackingResponse> {
    return this.executeApiCall('/api/tracking', 'GET',
      () => this.axios.get('/api/tracking', { params: { tracking_type: trackingType, tracking_id: trackingId }, ...this.mergeAxiosConfig(options) }),
      TrackingDataSchema, 'Tracking data retrieved successfully');
  }

  // ========== CONVENIENCE METHODS ==========

  /**
   * @throws {BigshipApiError} When AWB data is not available after manifest
   */
  async manifestAndGetAWB(
    orderId: string,
    courierId: number,
    options?: RequestOptions
  ): Promise<{ awb: string; courierName: string }> {
    await this.manifestSingle({ system_order_id: orderId, courier_id: courierId }, options);
    const awbResponse = await this.getShipmentData(ShipmentDataType.AWB, orderId, options);
    if (!awbResponse.data || typeof awbResponse.data === 'string') {
      throw new BigshipApiError('AWB data not available after manifest', 500, {
        code: 'NULL_DATA',
        endpoint: '/api/shipment/data',
      });
    }
    return {
      awb: awbResponse.data.master_awb,
      courierName: awbResponse.data.courier_name,
    };
  }

  /**
   * @throws {BigshipApiError} When AWB, label, or manifest data is not available
   */
  async getShipmentDetails(orderId: string, options?: RequestOptions): Promise<{
    awb: string;
    courierName: string;
    courierId: string;
    labelData: string;
    manifestData: string;
  }> {
    const [awbResponse, labelResponse, manifestResponse] = await Promise.all([
      this.getShipmentData(ShipmentDataType.AWB, orderId, options),
      this.getShipmentData(ShipmentDataType.LABEL, orderId, options),
      this.getShipmentData(ShipmentDataType.MANIFEST, orderId, options),
    ]);

    if (!awbResponse.data || typeof awbResponse.data === 'string') {
      throw new BigshipApiError('AWB data not available', 500, {
        code: 'NULL_DATA',
        endpoint: '/api/shipment/data',
      });
    }

    return {
      awb: awbResponse.data.master_awb,
      courierName: awbResponse.data.courier_name,
      courierId: awbResponse.data.courier_id,
      labelData: typeof labelResponse.data === 'string' ? labelResponse.data : '',
      manifestData: typeof manifestResponse.data === 'string' ? manifestResponse.data : '',
    };
  }

  /**
   * @throws {BigshipApiError} When order creation or AWB polling fails
   */
  async createAndFinalizeShipment(config: {
    order: AddSingleOrderRequest | AddHeavyOrderRequest;
    courierId: number;
    /** Max attempts to poll for AWB availability after manifest (default: 5) */
    awbPollMaxAttempts?: number;
    /** Delay between AWB poll attempts in ms (default: 2000) */
    awbPollDelay?: number;
    options?: RequestOptions;
  }): Promise<{
    orderId: string;
    awb: string;
    courierName: string;
    labelData: string;
    manifestData: string;
  }> {
    let orderResponse;
    if (config.order.shipment_category === 'b2b') {
      orderResponse = await this.addHeavyOrder(config.order as AddHeavyOrderRequest, config.options);
    } else {
      orderResponse = await this.addSingleOrder(config.order as AddSingleOrderRequest, config.options);
    }

    const orderId = orderResponse.data;
    if (orderId === null || orderId === undefined) {
      throw new BigshipApiError('Order creation failed: no order ID returned', 500, {
        code: 'NULL_DATA',
        endpoint: '/api/order/add/single',
      });
    }

    await this.manifestSingle({ system_order_id: orderId, courier_id: config.courierId }, config.options);

    const maxAttempts = config.awbPollMaxAttempts ?? 5;
    const pollDelay = config.awbPollDelay ?? 2000;

    // Poll only for AWB (single API call per attempt, not 3 parallel)
    let awbData: ShipmentAWBResponse['data'] | undefined;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const awbResponse = await this.getAWB(orderId, config.options);
        if (awbResponse.data && typeof awbResponse.data !== 'string') {
          awbData = awbResponse.data;
          break;
        }
      } catch (err) {
        if (err instanceof BigshipApiError && err.code === 'NULL_DATA') {
          // AWB not available yet, retry
        } else {
          throw err;
        }
      }
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollDelay));
      }
    }

    if (!awbData) {
      throw new BigshipApiError('AWB data not available after manifest (polling exhausted)', 500, {
        code: 'NULL_DATA',
        endpoint: '/api/shipment/data',
      });
    }

    // Fetch label and manifest once AWB is confirmed
    const [labelResponse, manifestResponse] = await Promise.all([
      this.getShipmentData(ShipmentDataType.LABEL, orderId, config.options),
      this.getShipmentData(ShipmentDataType.MANIFEST, orderId, config.options),
    ]);

    return {
      orderId,
      awb: awbData.master_awb,
      courierName: awbData.courier_name,
      labelData: typeof labelResponse.data === 'string' ? labelResponse.data : '',
      manifestData: typeof manifestResponse.data === 'string' ? manifestResponse.data : '',
    };
  }

  workflow(): ShipmentWorkflow {
    return new ShipmentWorkflow(this);
  }
}
