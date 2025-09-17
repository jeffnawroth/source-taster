// Alle bekannten Fehlercodes aus dem Backend

interface ApiSuccess<T> { success: true, data: T }

export const ApiErrorCodes = {
  bad_request: 'bad_request',
  validation_error: 'validation_error',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  not_found: 'not_found',
  conflict: 'conflict',
  unprocessable: 'unprocessable',
  rate_limited: 'rate_limited',
  server_error: 'server_error',
  upstream_error: 'upstream_error',
  app_error: 'app_error',
  internal_error: 'internal_error',
  handler_error: 'handler_error',
} as const

export type ApiErrorCode = keyof typeof ApiErrorCodes

export interface ApiHttpError {
  success: false
  error: ApiErrorCode
  message: string
}

export type ApiResult<T> = ApiSuccess<T> | ApiHttpError
