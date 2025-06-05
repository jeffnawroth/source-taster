import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You receive a single string as input, which is either
1. a free-form bibliographic reference (e.g., "Smith, J. (2020). Deep Learning…, IEEE Transactions on Neural Networks…") OR
2. the full text of a webpage or PDF page (e.g., HTML or plain text).

1. If it is a free-form bibliographic reference (identifiable by typical author-year structures, DOI, journal names, etc.), then apply the existing logic exactly:
- Extract "authors", "year", "title", "journal", "volume", "issue", "pages", "doi", "url", "publisher" (etc.) from the citation.
- At the end, return only the JSON object in this form:

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
    url?: string | null
    publisher?: string | null
  }

2. If it is the raw webpage/PDF text (identifiable, for example, by:
- multiple lines, paragraphs, or the presence of HTML tags ("<div>", "<p>", "<body>" etc.)
- OR by typical PDF paragraph structures without clearly recognizable "author – title – journal" patterns),
then extract from this plain text as best as possible:
- "title": the title of the webpage (e.g., from the <title> tag or a heading)
- "authors": author names if present in the page header or metadata (e.g., "<meta name="author" content="…">")
- "year": the publication year (e.g., "© 2021" in the footer)
- "url": if the URL is included in the input or mentioned in "<meta>" tags
- "publisher": if mentioned in the footer or metadata
- "doi": if a DOI appears in the text

Again, return at the end a JSON object of type ReferenceMetadata. Fields that cannot be reliably found in the text should be set to null or omitted.

You must first determine whether the input is a citation string ("Author + Year + Title" etc.) or a plain text document (webpage/PDF). Depending on that, invoke either the citation extraction logic or the webpage metadata logic.

In the end, the output must be exactly a JSON object of type ReferenceMetadata—without any additional explanations, only the raw metadata.`

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
