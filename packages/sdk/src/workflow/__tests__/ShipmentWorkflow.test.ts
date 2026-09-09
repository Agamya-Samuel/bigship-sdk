import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShipmentWorkflow } from '../ShipmentWorkflow';
import { BigshipApiError } from '../../errors';
import type { BigshipClient } from '../../core/BigshipClient';
import type { CreateOrderRequest } from '../../core/types';

function createMockClient() {
  return {
    createOrder: vi.fn(),
    getServiceableCouriers: vi.fn(),
    placeOrder: vi.fn(),
    getOrderDetail: vi.fn(),
  } as unknown as BigshipClient;
}

const B2C_ORDER: CreateOrderRequest = {
  segment_type: 'domestic_b2c',
  MasterOrderPickUpLocation: 258,
  MasterOrderReturnLocation: 258,
  MasterOrderDate: '2025-08-28 01:05:15',
  MasterOrderPaymentMode: 1,
  OrderInvoiceNo: 'INV-001',
  MasterOrderInvoiceAmount: 1000,
  MasterOrderShippingName: 'Test User',
  MasterOrderShippingMobileNo: '9876543210',
  MasterOrderShippingAddress: '123 Main Street',
  MasterOrderShippingZipCode: '110001',
  MasterOrderShippingCity: 'DELHI',
  MasterOrderShippingState: 'DELHI',
  MasterOrderShippingCountry: 'India',
  totalNumOfBoxes: 1,
  boxes: [{
    weight_unit: 'kg',
    dimension_unit: 'cm',
    noOfBoxes: 1,
    dimensions: [{ length: 20, breadth: 15, height: 10, weight: 1 }],
    products: [{
      productName: 'Phone',
      qty: '1',
      amount: '1000',
      totalAmount: 1000,
      collectableAmount: 0,
      categoryId: '4',
    }],
  }],
};

describe('ShipmentWorkflow', () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
    (client.createOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: true, message: 'ok', status_code: 200, data: { CustomGlobalOrderId: 'ORDER-123' },
    });
    (client.getServiceableCouriers as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: true, message: 'ok', status_code: 200, data: {
        segment_type: 'domestic_b2c',
        calculatedRates: [{ courierId: 25, courierName: 'Delhivery', total: '100' }],
      },
    });
    (client.placeOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: true, message: 'ok', status_code: 200, data: { reference_number: 123, awb_assigned: 'AWB-123' },
    });
    (client.getOrderDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: true, message: 'ok', status_code: 200, data: {
        segment_type: 'domestic_b2c',
        getOrderDetails: {
          MasterCustomOrderId: 'ORDER-123',
          status: 'Delivered',
          AwbNumber: 'AWB-123',
        },
      },
    });
  });

  describe('state machine', () => {
    it('transitions idle → created → placed → finalized', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      workflow.withCourier(25);
      await workflow.place();
      const result = await workflow.finalize();
      expect(result.orderId).toBe('ORDER-123');
    });

    it('throws BigshipApiError when placing without create', async () => {
      const workflow = new ShipmentWorkflow(client);
      workflow.withCourier(25);
      await expect(workflow.place()).rejects.toThrow(BigshipApiError);
    });

    it('throws BigshipApiError when finalizing without place', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      await expect(workflow.finalize()).rejects.toThrow(BigshipApiError);
    });

    it('throws BigshipApiError when placing without courierId', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      await expect(workflow.place()).rejects.toThrow(BigshipApiError);
    });
  });

  describe('create', () => {
    it('calls createOrder with the order payload', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      expect(client.createOrder).toHaveBeenCalledWith(B2C_ORDER);
    });

    it('throws BigshipApiError when order returns no ID', async () => {
      (client.createOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: true, message: 'ok', status_code: 200, data: null,
      });
      const workflow = new ShipmentWorkflow(client);
      await expect(workflow.create(B2C_ORDER)).rejects.toThrow(BigshipApiError);
    });
  });

  describe('withServiceableCourier', () => {
    it('selects courier from serviceable couriers response', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      await workflow.withServiceableCourier(0);
      expect(client.getServiceableCouriers).toHaveBeenCalledWith('ORDER-123');
    });

    it('throws BigshipApiError when no couriers available', async () => {
      (client.getServiceableCouriers as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: true, message: 'ok', status_code: 200, data: { segment_type: 'domestic_b2c', calculatedRates: [] },
      });
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      await expect(workflow.withServiceableCourier(0)).rejects.toThrow(BigshipApiError);
    });
  });

  describe('execute', () => {
    it('runs the full create → place → finalize flow', async () => {
      const workflow = new ShipmentWorkflow(client);
      const result = await workflow.execute(B2C_ORDER, 25);
      expect(client.createOrder).toHaveBeenCalled();
      expect(client.placeOrder).toHaveBeenCalledWith(expect.objectContaining({
        MasterCustomOrderId: 'ORDER-123',
        courierId: 25,
      }));
      expect(client.getOrderDetail).toHaveBeenCalledWith('ORDER-123');
      expect(result.orderId).toBe('ORDER-123');
    });

    it('auto-selects first courier when no courierId provided', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.execute(B2C_ORDER);
      expect(client.getServiceableCouriers).toHaveBeenCalledWith('ORDER-123');
      expect(client.placeOrder).toHaveBeenCalled();
    });
  });
});
