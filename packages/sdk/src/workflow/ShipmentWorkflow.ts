import { BigshipClient } from '../core/BigshipClient';
import {
  AddSingleOrderRequest,
  AddHeavyOrderRequest,
} from '../core/types';
import { BigshipApiError } from '../errors';

export class ShipmentWorkflow {
  private state: 'idle' | 'created' | 'manifested' | 'finalized' = 'idle';
  private orderId?: string;
  private courierId?: number;
  private client: BigshipClient;

  constructor(client: BigshipClient) {
    this.client = client;
  }

  async create(order: AddSingleOrderRequest | AddHeavyOrderRequest): Promise<this> {
    let response;
    if (order.shipment_category === 'b2b') {
      response = await this.client.addHeavyOrder(order as AddHeavyOrderRequest);
    } else {
      response = await this.client.addSingleOrder(order as AddSingleOrderRequest);
    }
    if (!response.data) {
      throw new BigshipApiError('Order creation failed: no order ID returned', 500, {
        code: 'NULL_DATA',
        endpoint: '/api/order/add/single',
      });
    }
    this.orderId = response.data;
    this.state = 'created';
    return this;
  }

  withCourier(courierId: number): this {
    this.courierId = courierId;
    return this;
  }

  async manifest(): Promise<this> {
    if (!this.orderId || !this.courierId) {
      throw new BigshipApiError('Order ID and Courier ID required before manifesting', 400, {
        code: 'INVALID_STATE',
      });
    }
    await this.client.manifestSingle({
      system_order_id: this.orderId,
      courier_id: this.courierId,
    });
    this.state = 'manifested';
    return this;
  }

  async finalize(): Promise<{
    awb: string;
    courierName: string;
    labelData: string;
    manifestData: string;
  }> {
    if (this.state !== 'manifested') {
      throw new BigshipApiError('Must manifest before finalizing', 400, {
        code: 'INVALID_STATE',
      });
    }

    const details = await this.client.getShipmentDetails(this.orderId!);
    this.state = 'finalized';
    return {
      awb: details.awb,
      courierName: details.courierName,
      labelData: details.labelData,
      manifestData: details.manifestData,
    };
  }

  async execute(order: AddSingleOrderRequest | AddHeavyOrderRequest, courierId: number): Promise<{
    awb: string;
    courierName: string;
    labelData: string;
    manifestData: string;
  }> {
    await this.create(order);
    this.withCourier(courierId);
    await this.manifest();
    return this.finalize();
  }
}
