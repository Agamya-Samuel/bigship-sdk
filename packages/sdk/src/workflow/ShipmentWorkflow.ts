import { BigshipClient } from '../core/BigshipClient';
import {
  type CreateOrderRequest,
  type CreateOrderResponse,
  type ServiceableCouriersResponse,
  type PlaceOrderRequest,
  type OrderDetailResponse,
} from '../core/types';
import { BigshipApiError } from '../errors';

/**
 * Fluent workflow for the new Unified Outbound API order lifecycle.
 *
 * The new order flow is:
 * 1. create() - Create a draft order
 * 2. getServiceableCouriers() - Get available couriers (called internally)
 * 3. withCourier() - Select a courier
 * 4. place() - Place/manifest the order
 * 5. finalize() - Get order details
 *
 * @example
 * ```ts
 * const result = await client.workflow()
 *   .create({
 *     segment_type: 'domestic_b2c',
 *     MasterOrderPickUpLocation: 123,
 *     MasterOrderPaymentMode: 1,
 *     MasterOrderShippingName: 'John Doe',
 *     // ... other fields
 *   })
 *   .withCourier(25)
 *   .place()
 *   .finalize();
 * ```
 */
export class ShipmentWorkflow {
  private state: 'idle' | 'created' | 'placed' | 'finalized' = 'idle';
  private orderId?: string;
  private courierId?: number;
  private client: BigshipClient;
  private couriers?: ServiceableCouriersResponse['data'];

  constructor(client: BigshipClient) {
    this.client = client;
  }

  /**
   * Create a draft order.
   * @param order - The order creation request
   */
  async create(order: CreateOrderRequest): Promise<this> {
    const response = await this.client.createOrder(order);
    if (!response.data || !response.data.CustomGlobalOrderId) {
      throw new BigshipApiError('Order creation failed: no order ID returned', 500, {
        code: 'NULL_DATA',
        endpoint: 'api/outbound/create-order',
      });
    }
    this.orderId = response.data.CustomGlobalOrderId;
    this.state = 'created';
    return this;
  }

  /**
   * Select a courier for the order.
   * @param courierId - The ID of the courier to use
   */
  withCourier(courierId: number): this {
    this.courierId = courierId;
    return this;
  }

  /**
   * Select a courier from the serviceable couriers response.
   * @param index - Index of the courier in the calculatedRates array (default: 0)
   */
  async withServiceableCourier(index = 0): Promise<this> {
    if (!this.orderId) {
      throw new BigshipApiError('Must create order before selecting courier', 400, {
        code: 'INVALID_STATE',
      });
    }
    const response = await this.client.getServiceableCouriers(this.orderId);
    if (!response.data || !response.data.calculatedRates[index]) {
      throw new BigshipApiError('No serviceable couriers available', 400, {
        code: 'NO_COURIERS',
        endpoint: 'api/outbound/courier-wise-shipment-cost',
      });
    }
    this.couriers = response.data;
    const rate = response.data.calculatedRates[index];
    this.courierId = typeof rate.courierId === 'string' ? parseInt(rate.courierId, 10) : rate.courierId;
    return this;
  }

  /**
   * Place/manifest the order with the selected courier.
   */
  async place(options?: { riskTypeId?: string }): Promise<this> {
    if (!this.orderId || !this.courierId) {
      throw new BigshipApiError('Order ID and Courier ID required before placing order', 400, {
        code: 'INVALID_STATE',
      });
    }
    const payload: PlaceOrderRequest = {
      MasterCustomOrderId: this.orderId,
      courierId: this.courierId,
      riskTypeId: options?.riskTypeId || '2', // Default to Owner Risk
    };
    await this.client.placeOrder(payload);
    this.state = 'placed';
    return this;
  }

  /**
   * Finalize the workflow by fetching order details.
   */
  async finalize(): Promise<{
    orderId: string;
    orderDetail: OrderDetailResponse['data'];
  }> {
    if (this.state !== 'placed') {
      throw new BigshipApiError('Must place order before finalizing', 400, {
        code: 'INVALID_STATE',
      });
    }

    const detail = await this.client.getOrderDetail(this.orderId!);
    this.state = 'finalized';
    return {
      orderId: this.orderId!,
      orderDetail: detail.data,
    };
  }

  /**
   * Execute the complete order workflow.
   * Creates order, selects first available courier, places, and finalizes.
   */
  async execute(order: CreateOrderRequest, courierId?: number): Promise<{
    orderId: string;
    orderDetail: OrderDetailResponse['data'];
  }> {
    await this.create(order);

    if (courierId) {
      this.withCourier(courierId);
    } else {
      await this.withServiceableCourier(0);
    }

    await this.place();
    return this.finalize();
  }
}
