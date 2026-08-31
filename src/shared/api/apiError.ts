import { AxiosError } from 'axios';

export type ApiError = {
  status?: number;
  reasonCode: string;
  message: string;
  requestId?: string;
  traceId?: string;
  timestamp?: string;
};

type ErrorResponseBody = Partial<Omit<ApiError, 'status'>>;

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ErrorResponseBody | undefined;

    return {
      status: error.response?.status,
      reasonCode: responseData?.reasonCode ?? 'API_ERROR',
      message: responseData?.message ?? error.message,
      requestId: responseData?.requestId,
      traceId: responseData?.traceId,
      timestamp: responseData?.timestamp,
    };
  }

  return {
    reasonCode: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
