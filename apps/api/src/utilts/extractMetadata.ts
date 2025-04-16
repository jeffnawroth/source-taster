import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `Extract metadata from the following bibliographic reference or paragraph. 
Return it as a JSON object with keys: title (required), authors (array of strings), journal (optional), year (optional). 
Return also the corresponding text snippet.`

const openAIConfig: OpenAI.Responses.ResponseTextConfig = {
  format: {
    type: 'json_schema',
    name: 'metadata_extraction',
    schema: {
      type: 'object',
      properties: {
        metadata: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
              },
              authors: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              journal: {
                type: 'string',
              },
              year: {
                type: 'string',
              },
              snippet: {
                type: 'string',
              },
            },
            required: ['title', 'authors', 'journal', 'year', 'snippet'],
            additionalProperties: false,
          },
        },
      },
      required: ['metadata'],
      additionalProperties: false,
    },
    strict: true,
  },
}

const geminiConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      metadata: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
            },
            authors: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            journal: {
              type: Type.STRING,
            },
            year: {
              type: Type.STRING,
            },
            snippet: {
              type: Type.STRING,
            },
          },
          required: ['title', 'authors', 'journal', 'year', 'snippet'],
        },
      },
    },
    required: ['metadata'],
    additionalProperties: false,
  },
  systemInstruction: instruction,
}

export async function extractMetadataWithModel(service: string, model: string, input: string) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, instruction, input, openAIConfig)
    case 'gemini':
      return await extractWithGemini(model, input, geminiConfig)
    default:
      throw new Error('Unsupported service')
  }
}
