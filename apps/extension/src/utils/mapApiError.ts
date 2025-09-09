import type { ApiHttpError } from '@source-taster/types'

export function mapApiError(err: ApiHttpError): string {
  switch (err.error) {
    case 'bad_request':
      return 'errors.bad_request'
    case 'validation_error':
      return 'errors.validation_error'
    case 'unauthorized':
      return 'errors.unauthorized'
    case 'forbidden':
      return 'errors.forbidden'
    case 'not_found':
      return 'errors.not_found'
    case 'conflict':
      return 'errors.conflict'
    case 'unprocessable':
      return 'errors.unprocessable'
    case 'rate_limited':
      return 'errors.rate_limited'
    case 'server_error':
    case 'internal_error':
      return 'errors.internal'
    case 'upstream_error':
      return 'errors.upstream'
    case 'handler_error':
      return 'errors.handler'
    case 'app_error':
    default:
      return 'errors.unknown'
  }
}
