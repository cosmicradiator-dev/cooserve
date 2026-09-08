import { NextRequest } from 'next/server';
import { verifyWorkerSchema } from '@/lib/validation/workerSchema';
import { workerService } from '@/lib/services/workerService';
import { getSessionFromRequest } from '@/lib/auth/sessionHelper';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError, AuthenticationRequiredError } from '@/lib/http/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const body = await request.json();
    const validated = verifyWorkerSchema.parse(body);

    const updated = await workerService.verifyWorker(
      session,
      params.id,
      validated.verificationStatus
    );
    return apiSuccess({ worker: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

