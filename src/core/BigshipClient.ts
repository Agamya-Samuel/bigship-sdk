import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';
import {
  BigshipConfig,
  LoginRequestSchema,
  WalletBalanceResponseSchema,
  CourierListResponseSchema,
  TransporterListResponseSchema,
  PaymentCategoryResponseSchema,
  WarehouseAddRequestSchema,
  WarehouseAddResponseSchema,
  WarehouseListResponseSchema,
  AddSingleOrderRequestSchema,
  AddHeavyOrderRequestSchema,
  AddOrderResponseSchema,
  ManifestSingleRequestSchema,
  ManifestHeavyRequestSchema,
  ManifestResponseSchema,
  ShippingRatesResponseSchema,
  CancelRequestSchema,
  CancelResponseSchema,
  ShipmentDataResponseSchema,
  RateCalculatorRequestSchema,
  CalculateRateResponseSchema,
  TrackingResponseSchema,
  BigshipError,
  type LoginRequest,
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
  type ShipmentDataResponse,
  type RateCalculatorRequest,
  type CalculateRateResponse,
  type TrackingResponse,
  type RequestContext,
} from './types';
import { ResponseValidator } from './validators';
import { EventDispatcher } from './event-dispatcher';
import { TokenManager } from './token-manager';
import { RetryManager } from './retry-manager';
import { Logger } from './logger';
import {
  BigshipApiError,
  BigshipDuplicateInvoiceError,
  BigshipAuthError,
  BigshipNetworkError,
} from './errors';

export class BigshipClient {
  private axios: AxiosInstance;
  private tokenManager: TokenManager;
  private retryManager: RetryManager;
  private eventDispatcher: EventDispatcher;
  private logger: Logger;
  private config: BigshipConfig & {
    timeout: number;
    throwOnUnsuccessfulResponse: boolean;
    enableDetailedLogging: boolean;
    maxRetries: number;
    retryDelay: number;
    retryOnStatusCodes: number[];
  };

  constructor(config: BigshipConfig) {
    // Merge with defaults
    const mergedConfig: BigshipConfig & {
      timeout: number;
      throwOnUnsuccessfulResponse: boolean;
      enableDetailedLogging: boolean;
      maxRetries: number;
      retryDelay: number;
      retryOnStatusCodes: number[];
    } = {
      timeout: 15000,
      throwOnUnsuccessfulResponse: true,
      enableDetailedLogging: false,
      maxRetries: 3,
      retryDelay: 1000,
      retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
      ...config,
    };
    this.config = mergedConfig;

    this.logger = new Logger(this.config.enableDetailedLogging);
    this.eventDispatcher = new EventDispatcher(this.config);

    // Initialize axios
    this.axios = axios.create({
      baseURL: this.config.baseURL.endsWith('/') ? this.config.baseURL : `${this.config.baseURL}/`,
      timeout: this.config.timeout,
      headers: { 'Content-Type': 'application/json', 'User-Agent': '@agamya/bigship-sdk/1.0.0' },
    });

    // Initialize managers
    this.tokenManager = new TokenManager(this.axios, this.config, this.eventDispatcher);
    this.retryManager = new RetryManager(this.config, this.eventDispatcher);

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      async (config) => {
        const modifiedConfig = await this.eventDispatcher.dispatchBeforeRequest(config);
        this.logger.logRequest(modifiedConfig);
        return modifiedConfig;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const context: RequestContext = {
          endpoint: error.config?.url || 'unknown',
          method: error.config?.method?.toUpperCase() || 'UNKNOWN',
          requestId: this.extractRequestId(error),
          startTime: Date.now()
        };

        // Handle 401/403 with token refresh
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.tokenManager.clearToken();

          try {
            await this.tokenManager.getToken();
            if (error.config) {
              return this.axios(error.config);
            }
          } catch (refreshError) {
            const authError = new BigshipAuthError('Authentication failed and token refresh failed', {
              requestId: context.requestId,
              endpoint: context.endpoint
            });
            this.eventDispatcher.dispatchError(authError, context);
            this.logger.logError(authError);
            throw authError;
          }
        }

        // Handle 429 rate limiting with retry (deprecated - kept for backward compatibility)
        if (error.response?.status === 429) {
          const config = error.config;
          if (!config) {
            const err = this.createBigshipError(error, context);
            this.eventDispatcher.dispatchError(err, context);
            this.logger.logError(err);
            throw err;
          }

          const retryCount = (config as any).__retryCount || 0;
          if (retryCount >= 3) {
            const rateLimitError = new BigshipError(
              'Rate limit exceeded (100 requests/minute). Please retry after 60 seconds.',
              429,
              'RATE_LIMIT_EXCEEDED',
              { status: 'error', message: 'Rate limit exceeded' }
            );
            this.eventDispatcher.dispatchError(rateLimitError, context);
            this.logger.logError(rateLimitError);
            throw rateLimitError;
          }

          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));

          (config as any).__retryCount = retryCount + 1;
          return this.axios(config);
        }

        // Handle other errors
        const bigshipError = this.createBigshipError(error, context);
        this.eventDispatcher.dispatchError(bigshipError, context);
        this.logger.logError(bigshipError);

        throw bigshipError;
      }
    );
  }

  /**
   * Extract request ID from error response
   */
  private extractRequestId(error: AxiosError): string | undefined {
    return error.response?.headers['x-request-id'] as string ||
           (error.response?.data as any)?.trace_id;
  }

  /**
   * Create appropriate BigshipError from Axios error
   */
  private createBigshipError(error: AxiosError, context: RequestContext): BigshipError {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Check for duplicate invoice
    if (this.isDuplicateInvoiceError(data)) {
      const invoiceId = this.extractInvoiceId(data);
      return new BigshipDuplicateInvoiceError(invoiceId, {
        requestId: context.requestId,
        endpoint: context.endpoint,
        responseBody: data
      });
    }

    // Create appropriate error based on status
    if (status === 401 || status === 403) {
      return new BigshipAuthError(data?.message || 'Authentication failed', {
        requestId: context.requestId,
        endpoint: context.endpoint
      });
    }

    if (status === 429) {
      return new BigshipError(
        'Rate limit exceeded (100 requests/minute). Please retry after 60 seconds.',
        429,
        'RATE_LIMIT_EXCEEDED',
        { status: 'error', message: 'Rate limit exceeded', trace_id: context.requestId }
      );
    }

    // Default API error
    return new BigshipApiError(
      data?.message || error.message || 'Bigship API error',
      status || 0,
      {
        code: data?.code,
        requestId: context.requestId,
        endpoint: context.endpoint,
        responseBody: data,
        apiResponse: data
      }
    );
  }

  /**
   * Check if response data indicates a duplicate invoice error
   */
  private isDuplicateInvoiceError(data: any): boolean {
    return (
      data?.message?.toLowerCase().includes('duplicate') ||
      data?.message?.toLowerCase().includes('already exists') ||
      data?.errors?.invoice_id?.some((msg: string) =>
        msg.toLowerCase().includes('already exists')
      )
    );
  }

  /**
   * Extract invoice ID from error response
   */
  private extractInvoiceId(data: any): string {
    return data?.errors?.invoice_id?.[0] || 'unknown';
  }

  /**
   * Login and cache token (called automatically by other methods)
   * @deprecated Use is handled automatically by TokenManager
   */
  async login(): Promise<string> {
    return this.tokenManager.getToken();
  }

  // ==================== WALLET ====================

  async getWalletBalance(): Promise<WalletBalanceResponse> {
    const context: RequestContext = {
      endpoint: '/api/Wallet/balance/get',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/Wallet/balance/get');

      // Validate response
      const data = ResponseValidator.validate(
        res.data,
        z.string(),
        context
      );

      const response: WalletBalanceResponse = {
        success: true,
        message: 'Wallet balance retrieved successfully',
        responseCode: 200,
        data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  // ==================== COURIER ====================

  async getCourierList(shipmentCategory: 'b2b' | 'b2c' = 'b2c'): Promise<CourierListResponse> {
    const context: RequestContext = {
      endpoint: '/api/courier/get/all',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/courier/get/all', { params: { shipment_category: shipmentCategory } });

      // Validate response with full schema
      const validatedResponse = CourierListResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: CourierListResponse = {
        success: true,
        message: 'Courier list retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async getCourierTransporterList(courierId: number): Promise<TransporterListResponse> {
    const context: RequestContext = {
      endpoint: '/api/courier/get/transport/list',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/courier/get/transport/list', { params: { courier_id: courierId } });

      const validatedResponse = TransporterListResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: TransporterListResponse = {
        success: true,
        message: 'Transporter list retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  // ==================== PAYMENT ====================

  async getPaymentCategory(shipmentCategory: 'b2b' | 'b2c' = 'b2c'): Promise<PaymentCategoryResponse> {
    const context: RequestContext = {
      endpoint: '/api/payment/category',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/payment/category', { params: { shipment_category: shipmentCategory } });

      const validatedResponse = PaymentCategoryResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: PaymentCategoryResponse = {
        success: true,
        message: 'Payment category retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  // ==================== WAREHOUSE ====================

  async addWarehouse(payload: WarehouseAddRequest): Promise<WarehouseAddResponse> {
    const context: RequestContext = {
      endpoint: '/api/warehouse/add',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = WarehouseAddRequestSchema.parse(payload);
      const res = await this.axios.post('/api/warehouse/add', validated);

      const validatedResponse = WarehouseAddResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: WarehouseAddResponse = {
        success: true,
        message: 'Warehouse added successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async getWarehouseList(pageIndex = 1, pageSize = 10): Promise<WarehouseListResponse> {
    const context: RequestContext = {
      endpoint: '/api/warehouse/get/list',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/warehouse/get/list', {
        params: { page_index: pageIndex, page_size: pageSize },
      });

      const validatedResponse = WarehouseListResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: WarehouseListResponse = {
        success: true,
        message: 'Warehouse list retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  // ==================== HELPERS ====================

  /**
   * Helper: Convert File to base64 Data URI
   * @param file - Browser File object
   * @returns Base64 Data URI string
   *
   * @example
   * ```ts
   * const file = fileInput.files[0];
   * const base64 = await BigshipClient.fileToBase64DataURI(file);
   * // Returns: "data:application/pdf;base64,JVBERi0xLjQKJ..."
   * ```
   */
  static async fileToBase64DataURI(file: File): Promise<string> {
    const { BigshipUtils } = await import('./utils');
    return BigshipUtils.fileToBase64DataURI(file);
  }

  /**
   * Helper: Validate base64 Data URI format
   * @param value - String to validate
   * @returns true if valid
   *
   * @example
   * ```ts
   * const isValid = BigshipClient.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x...');
   * ```
   */
  static isValidBase64DataURI(value: string): boolean {
    // Validate base64 Data URI format
    return /^data:(application\/pdf|image\/(jpeg|jpg));base64,[A-Za-z0-9+/]+=*$/i.test(value);
  }

  // ==================== ORDER ====================

  /**
   * Add a single B2C order
   * @throws {BigshipDuplicateInvoiceError} When invoice ID already exists
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async addSingleOrder(payload: AddSingleOrderRequest): Promise<AddOrderResponse> {
    const context: RequestContext = {
      endpoint: '/api/order/add/single',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = AddSingleOrderRequestSchema.parse(payload);
      const res = await this.axios.post('/api/order/add/single', validated);

      // Validate response - this will throw BigshipDuplicateInvoiceError for duplicate invoices
      const data = ResponseValidator.validate(
        res.data,
        z.string(),
        context
      );

      const response: AddOrderResponse = {
        success: true,
        message: 'Order added successfully',
        responseCode: 200,
        data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  /**
   * Add a heavy B2B order
   * @throws {BigshipDuplicateInvoiceError} When invoice ID already exists
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async addHeavyOrder(payload: AddHeavyOrderRequest): Promise<AddOrderResponse> {
    const context: RequestContext = {
      endpoint: '/api/order/add/heavy',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = AddHeavyOrderRequestSchema.parse(payload);
      const res = await this.axios.post('/api/order/add/heavy', validated);

      // Validate response - this will throw BigshipDuplicateInvoiceError for duplicate invoices
      const data = ResponseValidator.validate(
        res.data,
        z.string(),
        context
      );

      const response: AddOrderResponse = {
        success: true,
        message: 'Order added successfully',
        responseCode: 200,
        data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async manifestSingle(payload: z.infer<typeof ManifestSingleRequestSchema>): Promise<ManifestResponse> {
    const context: RequestContext = {
      endpoint: '/api/order/manifest/single',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = ManifestSingleRequestSchema.parse(payload);
      const res = await this.axios.post('/api/order/manifest/single', validated);

      const response: ManifestResponse = {
        success: true,
        message: 'Manifest created successfully',
        responseCode: 200,
        data: null
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async manifestHeavy(payload: z.infer<typeof ManifestHeavyRequestSchema>): Promise<ManifestResponse> {
    const context: RequestContext = {
      endpoint: '/api/order/manifest/heavy',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = ManifestHeavyRequestSchema.parse(payload);
      const res = await this.axios.post('/api/order/manifest/heavy', validated);

      const response: ManifestResponse = {
        success: true,
        message: 'Manifest created successfully',
        responseCode: 200,
        data: null
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async getShippingRates(systemOrderId: string, shipmentCategory: 'B2C' | 'B2B' = 'B2C', riskType = ''): Promise<ShippingRatesResponse> {
    const context: RequestContext = {
      endpoint: '/api/order/shipping/rates',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/order/shipping/rates', {
        params: { shipment_category: shipmentCategory, system_order_id: systemOrderId, risk_type: riskType },
      });

      const validatedResponse = ShippingRatesResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: ShippingRatesResponse = {
        success: true,
        message: 'Shipping rates retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async cancelShipments(awbs: string[]): Promise<CancelResponse> {
    const context: RequestContext = {
      endpoint: '/api/order/cancel',
      method: 'PUT',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = CancelRequestSchema.parse(awbs);
      const res = await this.axios.put('/api/order/cancel', validated);

      const response: CancelResponse = {
        success: true,
        message: 'Shipments cancelled successfully',
        responseCode: 200,
        data: null
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  // ==================== CALCULATOR ====================

  async calculateRate(payload: RateCalculatorRequest): Promise<CalculateRateResponse> {
    const context: RequestContext = {
      endpoint: '/api/calculator',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const validated = RateCalculatorRequestSchema.parse(payload);
      const res = await this.axios.post('/api/calculator', validated);

      const validatedResponse = CalculateRateResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: CalculateRateResponse = {
        success: true,
        message: 'Rate calculated successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  // ==================== SHIPMENT ====================

  /**
   * Get shipment data (AWB, Label, or Manifest)
   * @param shipmentDataId - 1 = AWB, 2 = Download Label, 3 = Download Manifest
   * @param systemOrderId - The system order ID from addSingleOrder or addHeavyOrder
   */
  async getShipmentData(shipmentDataId: number, systemOrderId: string): Promise<ShipmentDataResponse> {
    const context: RequestContext = {
      endpoint: '/api/shipment/data',
      method: 'POST',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.post('/api/shipment/data', null, {
        params: { shipment_data_id: shipmentDataId, system_order_id: systemOrderId },
      });

      const validatedResponse = ShipmentDataResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: ShipmentDataResponse = {
        success: true,
        message: 'Shipment data retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }

  async trackShipment(trackingId: string, trackingType: 'awb' | 'lrn' = 'awb'): Promise<TrackingResponse> {
    const context: RequestContext = {
      endpoint: '/api/tracking',
      method: 'GET',
      startTime: Date.now()
    };

    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();

      const res = await this.axios.get('/api/tracking', {
        params: { tracking_type: trackingType, tracking_id: trackingId },
      });

      const validatedResponse = TrackingResponseSchema.parse(res.data);
      if (!validatedResponse.success) {
        throw new BigshipApiError(
          validatedResponse.message || 'API request failed',
          validatedResponse.responseCode,
          { code: 'API_ERROR', requestId: context.requestId, endpoint: context.endpoint, responseBody: validatedResponse }
        );
      }
      if (validatedResponse.data === null) {
        throw new BigshipApiError(
          `API returned success=true but data is null for endpoint: ${context.endpoint}`,
          500,
          { code: 'NULL_DATA', requestId: context.requestId, endpoint: context.endpoint }
        );
      }

      const response: TrackingResponse = {
        success: true,
        message: 'Tracking data retrieved successfully',
        responseCode: 200,
        data: validatedResponse.data
      };

      this.eventDispatcher.dispatchResponse(response, context);
      this.logger.logResponse(response);

      return response;
    }, context);
  }
}

export default BigshipClient;
