import type { ApiMatchNormalizationRule } from '@source-taster/types'

function extractIntegers(input: string): number[] {
  const m = input.match(/\d+/g)
  return m ? m.map(n => Number.parseInt(n, 10)).filter(n => Number.isFinite(n)) : []
}

export function containsNumericToken(
  referenceValue: unknown,
  sourceValue: unknown,
  rules: ApiMatchNormalizationRule[],
  normalizeValue: (v: unknown, r: ApiMatchNormalizationRule[]) => string,
): boolean {
  const refStr = normalizeValue(referenceValue, rules)
  const srcStr = normalizeValue(sourceValue, rules)
  const refNums = extractIntegers(refStr)
  const srcNums = extractIntegers(srcStr)

  // Preserve previous behavior: match if the first src number occurs in ref numbers
  if (refNums.length > 0 && srcNums.length > 0) {
    return refNums.includes(srcNums[0]!)
  }
  return false
}

interface PageRange { start: number, end: number }

function expandEndIfShorthand(start: number, end: number, rawEndToken: string): number {
  if (end >= start)
    return end
  const startStr = String(start)
  const endStr = rawEndToken
  if (endStr.length < startStr.length) {
    const prefix = startStr.slice(0, startStr.length - endStr.length)
    const expanded = Number.parseInt(prefix + endStr, 10)
    if (Number.isFinite(expanded))
      return expanded
  }
  return end
}

function parsePageRange(input: string): PageRange | null {
  const numbers = input.match(/\d+/g)
  if (!numbers || numbers.length === 0)
    return null
  if (numbers.length === 1) {
    const n = Number.parseInt(numbers[0]!, 10)
    return Number.isFinite(n) ? { start: n, end: n } : null
  }
  const start = Number.parseInt(numbers[0]!, 10)
  let end = Number.parseInt(numbers[1]!, 10)
  if (!Number.isFinite(start) || !Number.isFinite(end))
    return null
  end = expandEndIfShorthand(start, end, numbers[1]!)
  // Ensure start <= end
  if (end < start) {
    const t = start

    // swap
    return { start: end, end: t }
  }
  return { start, end }
}

function rangeOverlapRatio(a: PageRange, b: PageRange): number {
  const inter = Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start) + 1)
  if (inter <= 0)
    return 0
  const lenA = a.end - a.start + 1
  const lenB = b.end - b.start + 1
  const union = lenA + lenB - inter
  return union > 0 ? inter / union : 0
}

export function pageSimilarity(
  referenceValue: unknown,
  sourceValue: unknown,
  rules: ApiMatchNormalizationRule[],
  normalizeValue: (v: unknown, r: ApiMatchNormalizationRule[]) => string,
): number | null {
  const refStr = normalizeValue(referenceValue, rules)
  const srcStr = normalizeValue(sourceValue, rules)
  const refRange = parsePageRange(refStr)
  const srcRange = parsePageRange(srcStr)
  if (!refRange || !srcRange)
    return null
  const lenRef = refRange.end - refRange.start + 1
  const lenSrc = srcRange.end - srcRange.start + 1

  // If one side is a single page and the other a range, treat presence as full match
  if (lenRef === 1 && lenSrc > 1) {
    const p = refRange.start
    return (p >= srcRange.start && p <= srcRange.end) ? 1 : 0
  }
  if (lenSrc === 1 && lenRef > 1) {
    const p = srcRange.start
    return (p >= refRange.start && p <= refRange.end) ? 1 : 0
  }
  // Both single pages
  if (lenRef === 1 && lenSrc === 1) {
    return refRange.start === srcRange.start ? 1 : 0
  }
  // Both ranges: use overlap ratio
  return rangeOverlapRatio(refRange, srcRange)
}
