import { AxiosError } from 'axios';

export type ApiError = {
  status?: number;
  errorCode: string;
  message: string;
  requestId?: string;
  traceId?: string;
};

type ErrorResponseBody = Partial<Omit<ApiError, 'status'>> & {
  reasonCode?: string;
  timestamp?: string;
};

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ErrorResponseBody | undefined;

    return {
      status: error.response?.status,
      errorCode: responseData?.errorCode ?? responseData?.reasonCode ?? 'API_ERROR',
      message: responseData?.message ?? error.message,
      requestId: responseData?.requestId,
      traceId: responseData?.traceId,
    };
  }

  return {
    errorCode: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
