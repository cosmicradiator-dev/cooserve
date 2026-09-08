import { NextRequest } from 'next/server';
import { updateWorkerLocationSchema } from '@/lib/validation/workerSchema';
import { workerService } from '@/lib/services/workerService';
import { getSessionFromRequest } from '@/lib/auth/sessionHelper';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError, AuthenticationRequiredError } from '@/lib/http/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const body = await request.json();
    const validated = updateWorkerLocationSchema.parse(body);

    const result = await workerService.updateLocation(
      session,
      validated.lat,
      validated.lng,
      validated.serviceRadiusKm
    );
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const location = await workerService.getLocation(session);
    return apiSuccess({ location });
  } catch (error) {
    return handleApiError(error);
  }
}

