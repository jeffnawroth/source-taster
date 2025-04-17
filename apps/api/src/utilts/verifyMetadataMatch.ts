import type { GenerateContentConfig } from '@google/genai'
import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You are a helpful assistant that compares bibliographic data. You will be given two data sources: one manually extracted (possibly noisy or incomplete) and one from Crossref (well-structured). Your task is to say whether they refer to the same publication. Return 'true' if they refer to the same work, otherwise 'false'. Optionally, include a short reason.`

const openAIConfig: OpenAI.Responses.ResponseTextConfig = {
  format: {
    type: 'json_schema',
    name: 'metadata_match_verification',
    schema: {
      type: 'object',
      properties: {
        match: {
          type: 'boolean',
          description: 'Indicates whether the two sources refer to the same publication.',
        },
        reason: {
          type: 'string',
          description: 'A short explanation of the match result.',
        },
      },
      required: ['match', 'reason'],
      additionalProperties: false,
    },
  },
}

const geminiConfig: GenerateContentConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      match: {
        type: Type.BOOLEAN,
        description: 'Indicates whether the two sources refer to the same publication.',
      },
      reason: {
        type: Type.STRING,
        description: 'A short explanation of the match result.',
      },
    },
    required: ['match', 'reason'],
  },
  systemInstruction: instruction,
}

export async function verifyMetadataMatchWithModel(service: string, model: string, sourceMetadata: any, crossrefItem: any) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, instruction, JSON.stringify(sourceMetadata, crossrefItem), openAIConfig)
    case 'gemini':
      return await extractWithGemini(model, JSON.stringify(sourceMetadata, crossrefItem), geminiConfig)
    default:
      throw new Error('Unsupported service')
  }
}
