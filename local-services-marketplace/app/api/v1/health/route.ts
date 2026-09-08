import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/http/apiResponse';

export async function GET(_request: NextRequest) {
  return apiSuccess({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Cooperative Gig Services Platform API v1',
    uptime: process.uptime(),
  });
}

