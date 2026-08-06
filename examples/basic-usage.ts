import { BigshipClient, ShipmentDataType } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

async function main() {
  // Old way: manual multi-step approach
  // Step 1: Manifest
  await client.manifestSingle({ system_order_id: 'ORDER123', courier_id: 5 });
  // Step 2: Get AWB
  const awbResponse = await client.getShipmentData(ShipmentDataType.AWB, 'ORDER123');
  console.log('AWB (old way):', awbResponse.data?.master_awb);

  // New way: one call
  const { awb, courierName } = await client.manifestAndGetAWB('ORDER456', 5);
  console.log(`AWB (new way): ${awb}, Courier: ${courierName}`);

  // Get all shipment details at once
  const details = await client.getShipmentDetails('ORDER456');
  console.log('AWB:', details.awb);
  console.log('Courier:', details.courierName);
  console.log('Label:', details.labelData ? 'available' : 'not ready');
  console.log('Manifest:', details.manifestData ? 'available' : 'not ready');
}

main().catch(console.error);
