import { NextResponse } from 'next/server';

export interface ApiResponseSuccess<T> {
  data: T;
}

export interface ApiResponseError {
  error: {
    code: string;
    message: string;
  };
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponseSuccess<T>>({ data }, { status });
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json<ApiResponseError>(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

