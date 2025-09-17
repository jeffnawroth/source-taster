import { HTTPException } from 'hono/http-exception'

// 4xx
export function httpBadRequest(m = 'Bad request', cause?: unknown) {
  throw new HTTPException(400, { message: m, cause })
}
export function httpUnauthorized(m = 'Unauthorized', cause?: unknown) {
  throw new HTTPException(401, { message: m, cause })
}
export function httpForbidden(m = 'Forbidden', cause?: unknown) {
  throw new HTTPException(403, { message: m, cause })
}
export function httpNotFound(m = 'Not found', cause?: unknown) {
  throw new HTTPException(404, { message: m, cause })
}
export function httpConflict(m = 'Conflict', cause?: unknown) {
  throw new HTTPException(409, { message: m, cause })
}
export function httpUnprocessable(m = 'Unprocessable', cause?: unknown) {
  throw new HTTPException(422, { message: m, cause })
}
export function httpRateLimited(m = 'Rate limited', cause?: unknown) {
  throw new HTTPException(429, { message: m, cause })
}

// 5xx / Upstream
export function httpUpstream(m = 'Upstream error', status: 502 | 503 | 504 = 502, cause?: unknown) {
  throw new HTTPException(status, { message: m, cause })
}
