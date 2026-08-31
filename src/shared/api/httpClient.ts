import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

export type ApiError = {
  status?: number;
  code: string;
  message: string;
  traceId?: string;
};

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as Partial<ApiError> | undefined;

    return {
      status: error.response?.status,
      code: responseData?.code ?? 'API_ERROR',
      message: responseData?.message ?? error.message,
      traceId: responseData?.traceId,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
