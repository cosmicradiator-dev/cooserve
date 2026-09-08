import { NextRequest } from 'next/server';
import { updateCostParameterSchema } from '@/lib/validation/costParameterSchema';
import { costEngineService } from '@/lib/services/costEngineService';
import { getSessionFromRequest } from '@/lib/auth/sessionHelper';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError, AuthenticationRequiredError } from '@/lib/http/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    const parameters = await costEngineService.getParameters(session);
    return apiSuccess({ parameters });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const body = await request.json();
    const validated = updateCostParameterSchema.parse(body);

    const updated = await costEngineService.updateParameter(
      session,
      validated.key,
      validated.value
    );
    return apiSuccess({ parameter: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

