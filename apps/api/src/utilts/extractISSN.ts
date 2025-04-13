import type OpenAI from 'openai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const openAIConfig = {
  instructions: 'Extract all Issns',
  reponseTextConfig: {
    format: {
      type: 'json_schema',
      name: 'issn_extraction',
      schema: {
        type: 'object',
        properties: {
          issns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        required: ['issns'],
        additionalProperties: false,
      },
    },
  } as OpenAI.Responses.ResponseTextConfig,
}

export async function extractISSNWithModel(service: string, model: string, input: string) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, openAIConfig.instructions, input, openAIConfig.reponseTextConfig)
    case 'gemini':
      return await extractWithGemini(model, input, 'issn')
    default:
      throw new Error('Unsupported service')
  }
}
