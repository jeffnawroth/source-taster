import type {
  ApiAnystyleConvertData,
  ApiAnystyleParseData,
  ApiExtractReference,
} from '@source-taster/types'
import { apiClient } from './apiClient'

export function parseInputText(inputText: string): string[] {
  return inputText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

export async function extractWithAnystyle(text: string): Promise<ApiExtractReference[]> {
  const input = parseInputText(text)
  if (input.length === 0)
    return []

  const parseData = await apiClient('/api/anystyle/parse', {
    method: 'POST',
    body: JSON.stringify({ input }),
  }) as ApiAnystyleParseData
  const convertData = await apiClient('/api/anystyle/convert-to-csl', {
    method: 'POST',
    body: JSON.stringify({
      references: parseData.references.map(r => ({ id: r.id, tokens: r.tokens })),
    }),
  }) as ApiAnystyleConvertData

  return parseData.references.map((ref, i) => ({
    id: ref.id,
    originalText: ref.originalText,
    metadata: { ...(convertData.csl[i] ?? {}), id: ref.id },
  }))
}
