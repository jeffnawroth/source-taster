import { randomBytes } from 'node:crypto'

export function generateId(): string {
  return randomBytes(16).toString('hex')
}

export function generateJobId(): string {
  return `job_${Date.now()}_${randomBytes(8).toString('hex')}`
}
