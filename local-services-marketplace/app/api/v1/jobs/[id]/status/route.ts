import { NextRequest } from 'next/server';
import { updateJobStatusSchema } from '@/lib/validation/jobSchema';
import { jobService } from '@/lib/services/jobService';
import { getSessionFromRequest } from '@/lib/auth/sessionHelper';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError, AuthenticationRequiredError } from '@/lib/http/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const body = await request.json();
    const validated = updateJobStatusSchema.parse(body);

    const job = await jobService.updateStatus(session, params.id, validated.status);
    return apiSuccess({ job });
  } catch (error) {
    return handleApiError(error);
  }
}

