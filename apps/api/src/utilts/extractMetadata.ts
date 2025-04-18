import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `Extract metadata from the following bibliographic reference or paragraph. Do not invent data, only extract what is present.`

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
              originalEntry: {
                type: 'string',
                description: 'The original entry from which the metadata was extracted.',
              },
              authors: {
                type: 'array',
                items: {
                  type: ['string', 'null'],
                },
                description: 'List of authors of the work.',
              },
              year: {
                type: ['string', 'null'],
                description: 'Year of publication.',
              },
              title: {
                type: ['string', 'null'],
                description: 'Title of the work.',
              },
              journal: {
                type: ['string', 'null'],
                description: 'Name of the journal in which the work was published.',
              },
              volume: {
                type: ['string', 'null'],
                description: 'Volume number of the journal.',
              },
              issue: {
                type: ['string', 'null'],
                description: 'Issue number of the journal.',
              },
              pages: {
                type: ['string', 'null'],
                description: 'Page range of the work.',
              },
              doi: {
                type: ['string', 'null'],
                description: 'Digital Object Identifier (DOI) of the work.',
              },
              publisher: {
                type: ['string', 'null'],
                description: 'Publisher of the work.',
              },
              url: {
                type: ['string', 'null'],
                description: 'URL where the work can be accessed.',
              },
            },
            required: ['originalEntry', 'authors', 'year', 'title', 'journal', 'volume', 'issue', 'pages', 'doi', 'publisher', 'url'],
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
