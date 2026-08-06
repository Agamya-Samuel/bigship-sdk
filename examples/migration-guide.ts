import { BigshipClient, ShipmentDataType } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ============================================================
// BEFORE (v1.x) — Manual multi-step approach
// ============================================================

async function oldWay() {
  // Step 1: Create order
  const order = await client.addSingleOrder({ /* order details */ });
  const orderId = order.data!;

  // Step 2: Manifest
  await client.manifestSingle({ system_order_id: orderId, courier_id: 5 });

  // Step 3: Get AWB (magic number 1)
  const awbResponse = await client.getShipmentData(1, orderId);
  const awb = awbResponse.data?.master_awb;

  // Step 4: Get label (magic number 2)
  const labelResponse = await client.getShipmentData(2, orderId);

  // Step 5: Get manifest (magic number 3)
  const manifestResponse = await client.getShipmentData(3, orderId);
}

// ============================================================
// AFTER (v2.x) — New helper methods
// ============================================================

async function newWay() {
  // Option 1: manifestAndGetAWB (replaces steps 2-3)
  const { awb, courierName } = await client.manifestAndGetAWB('ORDER123', 5);

  // Option 2: getShipmentDetails (replaces steps 3-5)
  const details = await client.getShipmentDetails('ORDER123');

  // Option 3: createAndFinalizeShipment (replaces all steps)
  const result = await client.createAndFinalizeShipment({
    order: { /* order details */ } as any,
    courierId: 5,
  });

  // Option 4: Workflow builder (fluent API)
  const workflowResult = await client.workflow()
    .create({ /* order details */ } as any)
    .withCourier(5)
    .manifest()
    .finalize();

  // Option 5: Old way still works with enum instead of magic numbers
  await client.manifestSingle({ system_order_id: 'ORDER123', courier_id: 5 });
  const awbResp = await client.getShipmentData(ShipmentDataType.AWB, 'ORDER123');
  const labelResp = await client.getShipmentData(ShipmentDataType.LABEL, 'ORDER123');
}
