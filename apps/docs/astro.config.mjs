import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Bigship SDK',
      description: 'TypeScript SDK for the Bigship.in External Outbound API',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Agamya-Samuel/bigship-sdk',
        },
        {
          icon: 'external',
          label: 'NPM',
          href: 'https://www.npmjs.com/package/@agamya/bigship-sdk',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Authentication', slug: 'getting-started/authentication' },
            { label: 'First Request', slug: 'getting-started/first-request' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Architecture', slug: 'concepts/architecture' },
            { label: 'B2C vs B2B', slug: 'concepts/b2c-vs-b2b' },
            { label: 'Orders & Shipments', slug: 'concepts/orders-and-shipments' },
            { label: 'AWB & LRN', slug: 'concepts/awb-and-lrn' },
            { label: 'Manifestation', slug: 'concepts/manifestation' },
            { label: 'Documents', slug: 'concepts/documents' },
            { label: 'COD & Prepaid', slug: 'concepts/cod-and-prepaid' },
            { label: 'Response Model', slug: 'concepts/response-model' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'B2C Shipment', slug: 'guides/b2c-shipment' },
            { label: 'B2B Shipment', slug: 'guides/b2b-shipment' },
            { label: 'Orders', slug: 'guides/orders' },
            { label: 'Rates', slug: 'guides/rates' },
            { label: 'Warehouses', slug: 'guides/warehouses' },
            { label: 'Shipments', slug: 'guides/shipments' },
            { label: 'Tracking', slug: 'guides/tracking' },
            { label: 'Cancellation', slug: 'guides/cancellation' },
            { label: 'Error Handling', slug: 'guides/error-handling' },
            { label: 'Retries & Timeouts', slug: 'guides/retries-and-timeouts' },
            { label: 'Logging & Hooks', slug: 'guides/logging-and-hooks' },
            { label: 'Next.js', slug: 'guides/nextjs' },
          ],
        },
        {
          label: 'API Reference',
          items: [{ autogenerate: { directory: 'api' } }],
        },
        {
          label: 'Troubleshooting',
          items: [
            { label: 'Authentication', slug: 'troubleshooting/authentication' },
            { label: 'Validation Errors', slug: 'troubleshooting/validation-errors' },
            { label: 'Rate Limits', slug: 'troubleshooting/rate-limits' },
            { label: 'Network Errors', slug: 'troubleshooting/network-errors' },
          ],
        },
      ],
    }),
  ],
});
