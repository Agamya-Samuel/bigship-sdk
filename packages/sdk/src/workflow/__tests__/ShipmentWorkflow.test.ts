import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShipmentWorkflow } from '../ShipmentWorkflow';
import { BigshipApiError } from '../../errors';
import type { BigshipClient } from '../../core/BigshipClient';

function createMockClient() {
  return {
    addSingleOrder: vi.fn(),
    addHeavyOrder: vi.fn(),
    manifestSingle: vi.fn(),
    getShipmentDetails: vi.fn(),
    getShipmentData: vi.fn(),
  } as unknown as BigshipClient;
}

const B2C_ORDER = {
  shipment_category: 'b2c' as const,
  warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
  consignee_detail: {
    first_name: 'Test',
    last_name: 'User',
    contact_number_primary: '9876543210',
    consignee_address: { address_line1: '123 Main Street', pincode: '110001' },
  },
  order_detail: {
    invoice_date: '2024-01-01T00:00:00Z',
    invoice_id: 'INV-001',
    payment_type: 'Prepaid' as const,
    total_collectable_amount: 0,
    shipment_invoice_amount: 1000,
    box_details: [{
      each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10,
      each_box_invoice_amount: 1000, each_box_collectable_amount: 0, box_count: 1 as const,
      product_details: [{
        product_category: 'Electronics', product_name: 'Phone', product_quantity: 1,
        each_product_invoice_amount: 1000, each_product_collectable_amount: 0,
      }],
    }],
    document_detail: { invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK' },
  },
};

describe('ShipmentWorkflow', () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
    (client.addSingleOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true, message: 'ok', responseCode: 200, data: 'ORDER-123',
    });
    (client.manifestSingle as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true, message: 'ok', responseCode: 200, data: null,
    });
    (client.getShipmentDetails as ReturnType<typeof vi.fn>).mockResolvedValue({
      awb: 'AWB-123', courierName: 'Delhivery', courierId: '1', labelData: 'data:...', manifestData: 'data:...',
    });
  });

  describe('state machine', () => {
    it('transitions idle → created → manifested → finalized', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      workflow.withCourier(5);
      await workflow.manifest();
      const result = await workflow.finalize();
      expect(result.awb).toBe('AWB-123');
    });

    it('throws BigshipApiError when manifesting without create', async () => {
      const workflow = new ShipmentWorkflow(client);
      workflow.withCourier(5);
      await expect(workflow.manifest()).rejects.toThrow(BigshipApiError);
    });

    it('throws BigshipApiError when finalizing without manifest', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      await expect(workflow.finalize()).rejects.toThrow(BigshipApiError);
    });

    it('throws BigshipApiError when manifesting without courierId', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      await expect(workflow.manifest()).rejects.toThrow(BigshipApiError);
    });
  });

  describe('create', () => {
    it('dispatches to addSingleOrder for b2c', async () => {
      const workflow = new ShipmentWorkflow(client);
      await workflow.create(B2C_ORDER);
      expect(client.addSingleOrder).toHaveBeenCalledWith(B2C_ORDER);
    });

    it('dispatches to addHeavyOrder for b2b', async () => {
      (client.addHeavyOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true, message: 'ok', responseCode: 200, data: 'HEAVY-123',
      });
      const workflow = new ShipmentWorkflow(client);
      const b2bOrder = { ...B2C_ORDER, shipment_category: 'b2b' as const };
      await workflow.create(b2bOrder);
      expect(client.addHeavyOrder).toHaveBeenCalled();
    });

    it('throws BigshipApiError when order returns no ID', async () => {
      (client.addSingleOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true, message: 'ok', responseCode: 200, data: null,
      });
      const workflow = new ShipmentWorkflow(client);
      await expect(workflow.create(B2C_ORDER)).rejects.toThrow(BigshipApiError);
    });
  });

  describe('execute', () => {
    it('runs the full create → manifest → finalize flow', async () => {
      const workflow = new ShipmentWorkflow(client);
      const result = await workflow.execute(B2C_ORDER, 5);
      expect(client.addSingleOrder).toHaveBeenCalled();
      expect(client.manifestSingle).toHaveBeenCalledWith({
        system_order_id: 'ORDER-123',
        courier_id: 5,
      });
      expect(client.getShipmentDetails).toHaveBeenCalledWith('ORDER-123');
      expect(result.awb).toBe('AWB-123');
      expect(result.courierName).toBe('Delhivery');
    });
  });
});
