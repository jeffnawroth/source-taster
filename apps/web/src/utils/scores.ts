export type VerificationStatus = 'verified' | 'partial' | 'not-found'

export function classifyScore(score: number | null): VerificationStatus {
  if (score === null)
    return 'not-found'
  if (score >= 85)
    return 'verified'
  if (score >= 50)
    return 'partial'
  return 'not-found'
}

export function bestScoreOf(evaluations: { matchDetails: { overallScore: number } }[]): number | null {
  if (evaluations.length === 0)
    return null
  return Math.max(...evaluations.map(e => e.matchDetails.overallScore))
}
