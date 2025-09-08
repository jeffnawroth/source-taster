// // src/errors/AppError.ts
// export class AppError extends Error {
//   constructor(
//     message: string,
//     public status = 400,
//     public code?: string,
//   ) {
//     super(message)
//     this.name = 'AppError'
//   }
// }

// export function isAppError(e: unknown): e is AppError {
//   return e instanceof AppError
//     || (typeof e === 'object'
//       && e !== null
//       && 'message' in e
//       && 'status' in e
//       && typeof (e as any).status === 'number')
// }

// /** 400 */
// export function BadRequest(msg: string, code = 'bad_request') {
//   return new AppError(msg, 400, code)
// }

// /** 401 */
// export function Unauthorized(msg: string, code = 'unauthorized') {
//   return new AppError(msg, 401, code)
// }

// /** 403 */
// export function Forbidden(msg: string, code = 'forbidden') {
//   return new AppError(msg, 403, code)
// }

// /** 404 */
// export function NotFound(msg: string, code = 'not_found') {
//   return new AppError(msg, 404, code)
// }

// /** 409 */
// export function Conflict(msg: string, code = 'conflict') {
//   return new AppError(msg, 409, code)
// }

// /** 422 */
// export function Unprocessable(msg: string, code = 'unprocessable') {
//   return new AppError(msg, 422, code)
// }

// /** 429 */
// export function TooManyRequests(msg: string, code = 'rate_limited') {
//   return new AppError(msg, 429, code)
// }

// /** 5xx */
// export function ServerError(msg: string, code = 'server_error') {
//   return new AppError(msg, 500, code)
// }
// export function UpstreamError(msg: string, status = 502, code = 'upstream_error') {
//   return new AppError(msg, status, code)
// }
