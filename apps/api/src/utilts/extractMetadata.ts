/* eslint-disable style/no-tabs */
import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You are an AI assistant that extracts structured bibliographic metadata from a free-text reference string. Your goal is to identify and extract as much accurate information as possible about the cited work.

You will receive one input: a single reference entry as a plain text string, written in a typical citation format (e.g., APA, MLA, Chicago, etc.). The format may be incomplete, inconsistent, or contain minor errors.

Your task is to extract the following metadata and return it in a structured JSON object using this format:

export interface ReferenceMetadata {
  originalEntry: string
  authors?: string[]
  year?: number
  title?: string
  journal?: string | null
  volume?: string | null
  issue?: string | null
  pages?: string | null
  doi?: string | null
  publisher?: string | null
  url?: string | null
}

Guidelines:
	•	originalEntry: Always return the original input string here.
	•	Authors: Extract a list of author names in "Firstname Lastname" or "Lastname, Firstname" format. Include all authors if possible.
	•	Year: Extract the publication year as a 4-digit number.
	•	Title: Extract the title of the article, book, or chapter.
	•	Journal: If it’s a journal article, extract the name of the journal.
	•	Volume, Issue, Pages: Extract volume and issue numbers (if available) and page range in the format "123–130".
	•	DOI and URL: Extract any DOI or URL if present.
	•	Publisher: If it’s a book or conference proceeding, extract the publisher name.

If any field cannot be confidently extracted, return it as null or leave it undefined.

At the end, return only the JSON object in the exact format specified—no explanation or additional text.
`

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
                type: ['array', 'null'],
                items: {
                  type: 'string',
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
            originalEntry: {
              type: Type.STRING,
              description: 'The original entry from which the metadata was extracted.',
            },
            authors: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'List of authors of the work.',
              nullable: true,
            },
            year: {
              type: Type.STRING,
              description: 'Year of publication.',
              nullable: true,
            },
            title: {
              type: Type.STRING,
              description: 'Title of the work.',
              nullable: true,
            },
            journal: {
              type: Type.STRING,
              description: 'Name of the journal in which the work was published.',
              nullable: true,
            },
            volume: {
              type: Type.STRING,
              description: 'Volume number of the journal.',
              nullable: true,
            },
            issue: {
              type: Type.STRING,
              description: 'Issue number of the journal.',
              nullable: true,
            },
            pages: {
              type: Type.STRING,
              description: 'Page range of the work.',
              nullable: true,
            },
            doi: {
              type: Type.STRING,
              description: 'Digital Object Identifier (DOI) of the work.',
              nullable: true,
            },
            publisher: {
              type: Type.STRING,
              description: 'Publisher of the work.',
              nullable: true,
            },
            url: {
              type: Type.STRING,
              description: 'URL where the work can be accessed.',
              nullable: true,
            },
          },
          required: ['originalEntry', 'authors', 'year', 'title', 'journal', 'volume', 'issue', 'pages', 'doi', 'publisher', 'url'],
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
