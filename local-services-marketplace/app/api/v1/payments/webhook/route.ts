import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/services/paymentService';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError } from '@/lib/http/errors';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    const result = await paymentService.handleWebhook(rawBody, signature);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

