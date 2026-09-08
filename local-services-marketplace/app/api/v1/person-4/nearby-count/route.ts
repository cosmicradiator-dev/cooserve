import { NextRequest } from 'next/server';
import { nearbyWorkersQuerySchema } from '@/lib/validation/workerSchema';
import { nearbyWorkersService } from '@/lib/services/nearbyWorkersService';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError } from '@/lib/http/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const validated = nearbyWorkersQuerySchema.parse(searchParams);

    const result = await nearbyWorkersService.getNearbyWorkersCount(
      validated.lat,
      validated.lng,
      validated.radiusKm,
      validated.skillType
    );

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

