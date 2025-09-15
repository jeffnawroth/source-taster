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
