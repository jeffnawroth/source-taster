import z from 'zod'

// export type NormalizationRuleType =
//   | 'spelling'
//   | 'typography'
//   | 'title-case'
//   | 'identifiers'
//   | 'characters'
//   | 'whitespace'

// export interface NormalizationRule {
//   id: NormalizationRuleType
//   enabled: boolean
//   // Optional: Weitere Konfigurationsparameter für die Regel
//   // z.B.: config: { preferredQuoteStyle: 'single' | 'double' };
// }

export const NormalizationRuleSchema = z.enum([
  'normalize-typography',
  'normalize-title-case',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
  'normalize-accents',
  'normalize-umlauts',
  'normalize-punctuation',
  'normalize-unicode',
]).describe('Normalization rule action type')

export type NormalizationRule = z.infer<typeof NormalizationRuleSchema>
