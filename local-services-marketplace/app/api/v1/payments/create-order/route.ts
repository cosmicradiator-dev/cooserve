import { NextRequest } from 'next/server';
import { z } from 'zod';
import { paymentService } from '@/lib/services/paymentService';
import { getSessionFromRequest } from '@/lib/auth/sessionHelper';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError, AuthenticationRequiredError } from '@/lib/http/errors';

const createOrderSchema = z.object({
  jobId: z.string().uuid('Valid Job UUID required'),
  idempotencyKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const order = await paymentService.createPaymentOrder(
      session,
      validated.jobId,
      validated.idempotencyKey
    );

    return apiSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

