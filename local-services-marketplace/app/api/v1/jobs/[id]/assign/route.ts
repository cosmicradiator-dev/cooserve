import { NextRequest } from 'next/server';
import { assignJobSchema } from '@/lib/validation/jobSchema';
import { jobService } from '@/lib/services/jobService';
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
    const validated = assignJobSchema.parse(body);

    const job = await jobService.assignJob(session, params.id, validated.workerId);
    return apiSuccess({ job });
  } catch (error) {
    return handleApiError(error);
  }
}

