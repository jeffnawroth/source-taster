import type { ApiMatchNormalizationRule } from '@source-taster/types'
import levenshtein from 'damerau-levenshtein'
import { NormalizationService } from '../services/matching/normalizationService'

const normalizationService = new NormalizationService()

interface DateParts {
  year?: number | null
  month?: number | null
  day?: number | null
}

function toInt(n: unknown): number | null {
  const num = typeof n === 'string' ? Number.parseInt(n, 10) : typeof n === 'number' ? Math.trunc(n) : Number.NaN
  return Number.isFinite(num) ? num : null
}

function parseDateFromCSL(value: any): DateParts | null {
  if (!value || typeof value !== 'object')
    return null

  // date-parts: [[YYYY, MM?, DD?]]
  if ('date-parts' in value && Array.isArray(value['date-parts']) && value['date-parts'][0]) {
    const parts = value['date-parts'][0]
    return {
      year: toInt(parts[0]),
      month: toInt(parts[1]),
      day: toInt(parts[2]),
    }
  }

  // raw / literal may contain a year-like string
  const rawLike = (value.raw ?? value.literal ?? '')
  if (typeof rawLike === 'string' && rawLike.trim()) {
    return parseDateFromString(rawLike)
  }

  // season / circa without other info → not enough to compare
  return null
}

function parseDateFromString(input: string): DateParts | null {
  const s = input.trim().toLowerCase()
  if (!s)
    return null

  // Try ISO-like first: YYYY, YYYY-MM, YYYY-MM-DD (allow separators -/. )
  const iso = s.match(/^\s*(?:ca\.?\s*)?(\d{4})(?:[\-/.](\d{1,2})(?:[\-/.](\d{1,2}))?)?\s*$/i)
  if (iso) {
    const [, y, m, d] = iso
    return {
      year: toInt(y),
      month: toInt(m),
      day: toInt(d),
    }
  }

  // Common European numeric formats with year present (e.g., 29.01.2020)
  const nums = s.match(/\d{1,4}/g)
  if (nums) {
    const yearIdx = nums.findIndex(n => n.length === 4)
    if (yearIdx !== -1) {
      const year = toInt(nums[yearIdx])
      // Try to infer month/day from remaining two numbers if plausible
      const rest = nums.filter((_, i) => i !== yearIdx).map(toInt).filter(v => v !== null) as number[]
      let month: number | null = null
      let day: number | null = null
      if (rest.length >= 2) {
        const [a, b] = rest
        // Heuristic: values <=12 likely month; <=31 likely day
        if (a != null && b != null) {
          if (a >= 1 && a <= 12 && b >= 1 && b <= 31) {
            month = a
            day = b
          }
          else if (b >= 1 && b <= 12 && a >= 1 && a <= 31) {
            day = a
            month = b
          }
        }
      }
      return { year, month, day }
    }
  }

  // Month name + year (English/German)
  const monthMap: Record<string, number> = {
    jan: 1,
    january: 1,
    januar: 1,
    feb: 2,
    february: 2,
    februar: 2,
    mar: 3,
    march: 3,
    märz: 3,
    maerz: 3,
    mrz: 3,
    apr: 4,
    april: 4,
    may: 5,
    mai: 5,
    jun: 6,
    june: 6,
    juni: 6,
    jul: 7,
    july: 7,
    juli: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    oktober: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    dezember: 12,
    december: 12,
    dez: 12,
  }
  const monthRegex = new RegExp(`\\b(${Object.keys(monthMap).join('|')})\\b`, 'i')
  const mMatch = s.match(monthRegex)
  const yMatch = s.match(/(?:^|\D)(\d{4})(?:\D|$)/)
  if (mMatch && yMatch) {
    const month = monthMap[mMatch[1]!.toLowerCase()]
    const year = toInt(yMatch[1])
    return { year, month }
  }

  // Fallback: just a bare year anywhere
  const yOnly = s.match(/(?:^|\D)(\d{4})(?:\D|$)/)
  if (yOnly) {
    return { year: toInt(yOnly[1]) }
  }

  return null
}

function extractDateParts(value: unknown): DateParts | null {
  if (typeof value === 'string')
    return parseDateFromString(value)
  if (typeof value === 'object' && value !== null)
    return parseDateFromCSL(value)
  return null
}

function dateSimilarity(a: unknown, b: unknown): number | null {
  const da = extractDateParts(a)
  const db = extractDateParts(b)
  if (!da || !db || !da.year || !db.year)
    return null

  const weights = { year: 0.8, month: 0.15, day: 0.05 }

  let considered = 0
  let score = 0

  // Year: strong weight, allow small tolerance of ±1 year at half credit
  considered += weights.year
  if (da.year === db.year) {
    score += weights.year
  }
  else if (Math.abs(da.year - db.year) === 1) {
    score += weights.year * 0.5
  }

  // Month: only if both present
  if (da.month && db.month) {
    considered += weights.month
    if (da.month === db.month) {
      score += weights.month
    }
  }

  // Day: only if both present
  if (da.day && db.day) {
    considered += weights.day
    if (da.day === db.day) {
      score += weights.day
    }
  }

  // Normalize by considered weights. If only year is compared, this returns 1.0 on year match.
  return considered > 0 ? score / considered : null
}

export function similarity(
  a: unknown, // Changed: now accepts CSL objects too!
  b: unknown, // Changed: now accepts CSL objects too!
  rules: ApiMatchNormalizationRule[],
): number {
  // Date-aware path: compare structured date components first
  const ds = dateSimilarity(a, b)
  if (ds !== null) {
    return ds
  }

  // Convert CSL to strings AND normalize in one step for generic comparison
  const s1 = normalizationService.normalizeValue(a, rules)
  const s2 = normalizationService.normalizeValue(b, rules)

  return levenshtein(s1, s2).similarity
}
