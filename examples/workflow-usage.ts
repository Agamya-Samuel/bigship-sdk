import { BigshipClient } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

async function main() {
  // All-in-one: Create order → Manifest → Get all details
  const result = await client.createAndFinalizeShipment({
    order: {
      shipment_category: 'b2c',
      warehouse_detail: {
        pickup_location_id: 123456,
        return_location_id: 123456,
      },
      consignee_detail: {
        first_name: 'John',
        last_name: 'Doe',
        contact_number_primary: '9876543210',
        consignee_address: {
          address_line1: '123 Main St',
          pincode: '110001',
        },
      },
      order_detail: {
        invoice_date: new Date().toISOString(),
        invoice_id: 'INV-001',
        payment_type: 'Prepaid',
        total_collectable_amount: 0,
        shipment_invoice_amount: 1000,
        box_details: [{
          each_box_dead_weight: 1,
          each_box_length: 10,
          each_box_width: 10,
          each_box_height: 10,
          each_box_invoice_amount: 1000,
          each_box_collectable_amount: 0,
          box_count: 1,
          product_details: [{
            product_category: 'Electronics',
            product_name: 'Laptop',
            product_quantity: 1,
            each_product_invoice_amount: 1000,
            each_product_collectable_amount: 0,
          }],
        }],
        document_detail: {
          invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
        },
      },
    },
    courierId: 5,
  });

  console.log('Order ID:', result.orderId);
  console.log('AWB:', result.awb);
  console.log('Courier:', result.courierName);

  // Fluent workflow builder
  const workflowResult = await client.workflow()
    .create({ shipment_category: 'b2c' } as any)
    .withCourier(5)
    .manifest()
    .finalize();

  console.log('Workflow AWB:', workflowResult.awb);
}

main().catch(console.error);
