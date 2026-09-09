import axios, { AxiosInstance, AxiosError, type AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import {
  type BigshipConfig,
  // Auth
  LoginDataSchema,
  // Profile
  ProfileDataSchema,
  // Warehouse
  SaveWarehouseRequestSchema,
  SaveWarehouseDataSchema,
  GetWarehouseListRequestSchema,
  WarehouseListDataSchema,
  UpdateWarehouseRequestSchema,
  UpdateWarehouseDataSchema,
  // Reference Data
  PackageTypeSchema,
  PaymentModeSchema,
  RiskTypeSchema,
  // Rate Calculator
  RateCalculatorRequestSchema,
  RateCalculatorItemSchema,
  // Order
  CreateOrderRequestSchema,
  CreateOrderDataSchema,
  ServiceableCouriersRequestSchema,
  ServiceableCouriersDataSchema,
  PlaceOrderRequestSchema,
  PlaceOrderDataSchema,
  CancelOrderRequestSchema,
  // Tracking & Details
  TrackOrderRequestSchema,
  TrackOrderDataSchema,
  OrderDetailRequestSchema,
  OrderDetailDataSchema,
  DownloadDocumentRequestSchema,
  DownloadDocumentDataSchema,
  // Types
  type SaveWarehouseRequest,
  type SaveWarehouseResponse,
  type GetWarehouseListRequest,
  type WarehouseListResponse,
  type UpdateWarehouseRequest,
  type UpdateWarehouseResponse,
  type PackageTypeResponse,
  type PaymentModeResponse,
  type RiskTypeResponse,
  type RateCalculatorRequest,
  type RateCalculatorResponse,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type ServiceableCouriersRequest,
  type ServiceableCouriersResponse,
  type PlaceOrderRequest,
  type PlaceOrderResponse,
  type CancelOrderRequest,
  type CancelOrderResponse,
  type TrackOrderRequest,
  type TrackOrderResponse,
  type OrderDetailRequest,
  type OrderDetailResponse,
  type DownloadDocumentRequest,
  type DownloadDocumentResponse,
  type ProfileResponse,
  type WalletBalanceResponse,
  type RequestContext,
  type LoggerAdapter,
} from './types';
import { ResponseValidator } from '../http/ResponseValidator';
import { EventDispatcher } from '../infrastructure/EventDispatcher';
import { TokenManager } from '../auth/TokenManager';
import { RetryManager } from '../http/RetryManager';
import { Logger } from '../infrastructure/Logger';
import {
  BigshipApiError,
  BigshipAuthError,
  BigshipValidationError,
} from '../errors';
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
    dataSchema: z.ZodType<T>,
    message: string,
    validationOptions?: { allowNullData?: boolean }
  ): Promise<{ status: true; message: string; status_code: 200; data: T }> {
    const retryContext: RequestContext = { endpoint, method, startTime: Date.now() };
    return this.retryManager.executeWithRetry(async () => {
      await this.tokenManager.getToken();
      const startTime = Date.now();
      const res = await apiCall();
      const context: RequestContext = { endpoint, method, startTime, duration: Date.now() - startTime };
      const data = ResponseValidator.validate(res.data, dataSchema, context, validationOptions);
      const response = { status: true as const, message, status_code: 200 as const, data };
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

  // ==================== PROFILE ====================

  /**
   * Get the authenticated user's profile information.
   * @throws {BigshipApiError} When API request fails
   */
  async getProfile(options?: RequestOptions): Promise<ProfileResponse> {
    return this.executeApiCall('api/outbound/profile', 'GET',
      () => this.axios.get('api/outbound/profile', this.mergeAxiosConfig(options)),
      ProfileDataSchema, 'User profile fetched successfully');
  }

  // ==================== WALLET ====================

  /**
   * Get the current wallet balance.
   * @throws {BigshipApiError} When API request fails
   */
  async getWalletBalance(options?: RequestOptions): Promise<WalletBalanceResponse> {
    return this.executeApiCall('api/outbound/wallet/balance', 'GET',
      () => this.axios.get('api/outbound/wallet/balance', this.mergeAxiosConfig(options)),
      z.string(), 'Wallet balance retrieved successfully');
  }

  // ==================== WAREHOUSE ====================

  /**
   * Save a new warehouse/pickup location.
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async saveWarehouse(payload: SaveWarehouseRequest, options?: RequestOptions): Promise<SaveWarehouseResponse> {
    const validated = this.parseRequest(SaveWarehouseRequestSchema, payload, 'api/outbound/save-warehouse-data');
    return this.executeApiCall('api/outbound/save-warehouse-data', 'POST',
      () => this.axios.post('api/outbound/save-warehouse-data', validated, this.mergeAxiosConfig(options)),
      SaveWarehouseDataSchema, 'Warehouse added successfully');
  }

  /**
   * Get a list of warehouses with optional filtering.
   * @throws {BigshipApiError} When API request fails
   */
  async getWarehouseList(params: GetWarehouseListRequest, options?: RequestOptions): Promise<WarehouseListResponse> {
    const validated = this.parseRequest(GetWarehouseListRequestSchema, params, 'api/outbound/get-warehouse-list');
    const response = await this.executeApiCall('api/outbound/get-warehouse-list', 'GET',
      () => this.axios.get('api/outbound/get-warehouse-list', { params: validated, ...this.mergeAxiosConfig(options) }),
      WarehouseListDataSchema, 'Warehouse list retrieved successfully');
    // Normalize response: API returns empty array [] when no warehouses
    if (Array.isArray(response.data)) {
      return { ...response, data: { warehouse: [], total: 0 } };
    }
    return response as unknown as WarehouseListResponse;
  }

  /**
   * Update an existing warehouse/pickup location.
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async updateWarehouse(payload: UpdateWarehouseRequest, options?: RequestOptions): Promise<UpdateWarehouseResponse> {
    const validated = this.parseRequest(UpdateWarehouseRequestSchema, payload, 'api/outbound/edit-warehouse-data');
    return this.executeApiCall('api/outbound/edit-warehouse-data', 'POST',
      () => this.axios.post('api/outbound/edit-warehouse-data', validated, this.mergeAxiosConfig(options)),
      UpdateWarehouseDataSchema, 'Warehouse updated successfully');
  }

  // ==================== REFERENCE DATA ====================

  /**
   * Get the list of package types for hyperlocal shipments.
   * @throws {BigshipApiError} When API request fails
   */
  async getPackageTypes(options?: RequestOptions): Promise<PackageTypeResponse> {
    return this.executeApiCall('api/outbound/hyperlocal/get-packages-list', 'GET',
      () => this.axios.get('api/outbound/hyperlocal/get-packages-list', this.mergeAxiosConfig(options)),
      z.array(PackageTypeSchema), 'Package types retrieved successfully');
  }

  /**
   * Get the list of payment modes for a segment type.
   * @param segmentType - The shipment segment type: 'hyperlocal', 'domestic_b2c', or 'domestic_b2b'
   * @throws {BigshipApiError} When API request fails
   */
  async getPaymentModes(segmentType: 'hyperlocal' | 'domestic_b2c' | 'domestic_b2b', options?: RequestOptions): Promise<PaymentModeResponse> {
    return this.executeApiCall('api/outbound/get-payment-mode', 'GET',
      () => this.axios.get('api/outbound/get-payment-mode', { params: { segment_type: segmentType }, ...this.mergeAxiosConfig(options) }),
      z.array(PaymentModeSchema), 'Payment modes retrieved successfully');
  }

  /**
   * Get the list of risk types (insurance options).
   * @throws {BigshipApiError} When API request fails
   */
  async getRiskTypes(options?: RequestOptions): Promise<RiskTypeResponse> {
    return this.executeApiCall('api/outbound/domestic/risk-types', 'GET',
      () => this.axios.get('api/outbound/domestic/risk-types', this.mergeAxiosConfig(options)),
      z.array(RiskTypeSchema), 'Risk types retrieved successfully');
  }

  // ==================== RATE CALCULATOR ====================

  /**
   * Calculate shipping rates without creating an order.
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async calculateRate(payload: RateCalculatorRequest, options?: RequestOptions): Promise<RateCalculatorResponse> {
    const validated = this.parseRequest(RateCalculatorRequestSchema, payload, 'api/outbound/user-rate-calculator');
    return this.executeApiCall('api/outbound/user-rate-calculator', 'POST',
      () => this.axios.post('api/outbound/user-rate-calculator', validated, this.mergeAxiosConfig(options)),
      z.array(RateCalculatorItemSchema), 'Rate calculated successfully');
  }

  // ==================== ORDER LIFECYCLE ====================

  /**
   * Create a new order in draft mode.
   * Supports hyperlocal, domestic_b2b, and domestic_b2c segment types.
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async createOrder(payload: CreateOrderRequest, options?: RequestOptions): Promise<CreateOrderResponse> {
    const validated = this.parseRequest(CreateOrderRequestSchema, payload, 'api/outbound/create-order');
    return this.executeApiCall('api/outbound/create-order', 'POST',
      () => this.axios.post('api/outbound/create-order', validated, this.mergeAxiosConfig(options)),
      CreateOrderDataSchema, 'Order created successfully');
  }

  /**
   * Get serviceable couriers and rate quotations for a draft order.
   * Must be called after createOrder() and before placeOrder().
   * @param orderId - The CustomGlobalOrderId returned from createOrder()
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async getServiceableCouriers(orderId: string, options?: RequestOptions): Promise<ServiceableCouriersResponse> {
    const validated = this.parseRequest(ServiceableCouriersRequestSchema, { MasterCustomOrderId: orderId }, 'api/outbound/courier-wise-shipment-cost');
    return this.executeApiCall('api/outbound/courier-wise-shipment-cost', 'POST',
      () => this.axios.post('api/outbound/courier-wise-shipment-cost', validated, this.mergeAxiosConfig(options)),
      ServiceableCouriersDataSchema, 'Serviceable couriers retrieved successfully');
  }

  /**
   * Place/manifest an order with a selected courier.
   * Must be called after getServiceableCouriers().
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async placeOrder(payload: PlaceOrderRequest, options?: RequestOptions): Promise<PlaceOrderResponse> {
    const validated = this.parseRequest(PlaceOrderRequestSchema, payload, 'api/outbound/place-order');
    return this.executeApiCall('api/outbound/place-order', 'POST',
      () => this.axios.post('api/outbound/place-order', validated, this.mergeAxiosConfig(options)),
      PlaceOrderDataSchema, 'Order placed successfully');
  }

  /**
   * Cancel an order by its CustomGlobalOrderId.
   * @param orderId - The CustomGlobalOrderId of the order to cancel
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async cancelOrder(orderId: string, options?: RequestOptions): Promise<CancelOrderResponse> {
    const validated = this.parseRequest(CancelOrderRequestSchema, { CustomGlobalOrderId: orderId }, 'api/outbound/cancel-order');
    return this.executeApiCall('api/outbound/cancel-order', 'POST',
      () => this.axios.post('api/outbound/cancel-order', validated, this.mergeAxiosConfig(options)),
      z.array(z.unknown()), 'Order cancelled successfully');
  }

  // ==================== TRACKING & DETAILS ====================

  /**
   * Track an order by its CustomGlobalOrderId.
   * @param orderId - The CustomGlobalOrderId of the order to track
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async trackOrder(orderId: string, options?: RequestOptions): Promise<TrackOrderResponse> {
    const validated = this.parseRequest(TrackOrderRequestSchema, { CustomGlobalOrderId: orderId }, 'api/outbound/track-order');
    return this.executeApiCall('api/outbound/track-order', 'GET',
      () => this.axios.get('api/outbound/track-order', { params: validated, ...this.mergeAxiosConfig(options) }),
      TrackOrderDataSchema, 'Tracking data retrieved successfully');
  }

  /**
   * Get detailed information about an order.
   * @param orderId - The MasterCustomOrderId of the order
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async getOrderDetail(orderId: string, options?: RequestOptions): Promise<OrderDetailResponse> {
    const validated = this.parseRequest(OrderDetailRequestSchema, { MasterCustomOrderId: orderId }, 'api/outbound/order-shipment-details');
    return this.executeApiCall('api/outbound/order-shipment-details', 'GET',
      () => this.axios.get('api/outbound/order-shipment-details', { params: validated, ...this.mergeAxiosConfig(options) }),
      OrderDetailDataSchema, 'Order details retrieved successfully');
  }

  /**
   * Download a shipment document (invoice, label, ewaybill, or manifest).
   * @param orderId - The CustomGlobalOrderId of the order
   * @param documentType - The type of document to download
   * @throws {BigshipValidationError} When request validation fails
   * @throws {BigshipApiError} When API request fails
   */
  async downloadDocument(orderId: string, documentType: 'invoice' | 'label' | 'ewaybill' | 'manifest', options?: RequestOptions): Promise<DownloadDocumentResponse> {
    const validated = this.parseRequest(DownloadDocumentRequestSchema, { CustomGlobalOrderId: orderId, document_type: documentType }, 'api/outbound/download-shipment-documents');
    return this.executeApiCall('api/outbound/download-shipment-documents', 'GET',
      () => this.axios.get('api/outbound/download-shipment-documents', { params: validated, ...this.mergeAxiosConfig(options) }),
      DownloadDocumentDataSchema, 'Document downloaded successfully');
  }
}
