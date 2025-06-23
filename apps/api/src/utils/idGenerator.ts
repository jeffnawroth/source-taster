import { randomBytes } from 'node:crypto'

export function generateId(): string {
  return randomBytes(16).toString('hex')
}
