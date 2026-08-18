import { NextRequest, NextResponse } from 'next/server';
import {
  BigshipApiError,
  BigshipAuthError,
  BigshipDuplicateInvoiceError,
  BigshipNetworkError,
  BigshipValidationError,
  isBigshipApiError,
  isBigshipAuthError,
  isBigshipDuplicateInvoiceError,
  isBigshipNetworkError,
  isBigshipValidationError,
} from '@agamya/bigship-sdk';
import { z } from 'zod';

const SimulateRequestSchema = z.object({
  errorType: z.enum(['validation', 'duplicateInvoice', 'auth', 'network', 'api']),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof SimulateRequestSchema>;
  try {
    body = SimulateRequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request. Provide errorType: validation | duplicateInvoice | auth | network | api' }, { status: 400 });
  }

  try {
    switch (body.errorType) {
      case 'validation':
        throw new BigshipValidationError('Simulated validation error', {
          pincode: ['Must be exactly 6 digits'],
          'consignee_detail.first_name': ['Required'],
        });
      case 'duplicateInvoice':
        throw new BigshipDuplicateInvoiceError('INV-12345');
      case 'auth':
        throw new BigshipAuthError('Simulated authentication failure');
      case 'network':
        throw new BigshipNetworkError('Simulated network timeout');
      case 'api':
        throw new BigshipApiError('Insufficient wallet balance', 400, {
          code: 'LOW_BALANCE',
          endpoint: '/api/Wallet/balance/get',
          requestId: 'sim-req-001',
        });
    }
  } catch (err: any) {
    return NextResponse.json({
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
      validationErrors: err.validationErrors,
      invoiceId: err.invoiceId,
      requestId: err.requestId,
      endpoint: err.endpoint,
      responseBody: err.responseBody,
      apiResponse: err.apiResponse,
      typeGuards: {
        isBigshipApiError: isBigshipApiError(err),
        isBigshipValidationError: isBigshipValidationError(err),
        isBigshipDuplicateInvoiceError: isBigshipDuplicateInvoiceError(err),
        isBigshipAuthError: isBigshipAuthError(err),
        isBigshipNetworkError: isBigshipNetworkError(err),
      },
      helpers: {
        isValidationError: err.isValidationError?.() ?? false,
        isRateLimitError: err.isRateLimitError?.() ?? false,
        isAuthError: err.isAuthError?.() ?? false,
      },
    });
  }
}
