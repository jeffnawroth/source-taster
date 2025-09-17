/**
 * Generates a random UUID (v4)
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}
