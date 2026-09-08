import { NextRequest } from 'next/server';
import { createJobSchema } from '@/lib/validation/jobSchema';
import { jobService } from '@/lib/services/jobService';
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
    const validated = createJobSchema.parse(body);

    const job = await jobService.createJob(session, validated);
    return apiSuccess({ job }, 201);
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

    const jobs = await jobService.listJobs(session);
    return apiSuccess({ jobs });
  } catch (error) {
    return handleApiError(error);
  }
}

