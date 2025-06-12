// src/utils/extractMetadataWebsite.ts
import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You receive a single string as input called "pageText", 
which represents either the HTML body innerText of a webpage or the plain text 
of a PDF page.

Your task is to extract exactly these three fields and wrap them in a single 
top-level JSON property "metadata". Return only this JSON object—no extra text:

{
  "metadata": {
    "title": string | null,
    "authors": string[] | null,
    "year": number | null
  }
}

- **title**: the main title (from the first heading or the <title> tag).  
- **authors**: list of author names if present (e.g. from "<meta name="author">" or page header).  
- **year**: the four-digit publication year if you can find it (e.g. “© 2021” in the header/footer).  

If a field cannot be found, set it to "null". Do **not** output any additional fields or explanations.`

const openAIConfig: OpenAI.Responses.ResponseTextConfig = {
  format: {
    type: 'json_schema',
    name: 'website_metadata',
    schema: {
      type: 'object',
      properties: {
        metadata: {
          type: 'object',
          properties: {
            title: { type: ['string', 'null'] },
            authors: {
              type: ['array', 'null'],
              items: { type: 'string' },
            },
            year: { type: ['integer', 'null'] },
          },
          required: ['title', 'authors', 'year'],
          additionalProperties: false,
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
      url: {
        type: Type.STRING,
        description: 'The URL of the webpage.',
      },
      metaTags: {
        type: Type.OBJECT,
        description: 'Meta tags extracted from the webpage as key–value pairs.',
        additionalProperties: { type: Type.STRING },
      },
      jsonLd: {
        type: Type.OBJECT,
        description: 'JSON-LD data found in <script type="application/ld+json"> blocks, or null.',
        nullable: true,
        additionalProperties: false,
      },
      pageTitle: {
        type: Type.STRING,
        description: 'Content of <title> or og:title.',
        nullable: true,
      },
      description: {
        type: Type.STRING,
        description: 'Content of meta[name="description"] or og:description.',
        nullable: true,
      },
      authors: {
        type: Type.ARRAY,
        description: 'List of authors from citation_author meta-tags or JSON-LD.',
        items: { type: Type.STRING },
        nullable: true,
      },
      datePublished: {
        type: Type.STRING,
        description: 'Publication date from meta-tags or JSON-LD.',
        nullable: true,
      },
      doi: {
        type: Type.STRING,
        description: 'DOI from citation_doi meta-tag or JSON-LD.',
        nullable: true,
      },
      containerTitle: {
        type: Type.STRING,
        description: 'Container title (e.g., journal title) from meta-tags or JSON-LD.',
        nullable: true,
      },
      pages: {
        type: Type.STRING,
        description: 'Page numbers or sections from meta-tags or JSON-LD.',
        nullable: true,
      },
      pageText: {
        type: Type.STRING,
        description: 'Visible text content of the page for context.',
        nullable: true,
      },
    },
    required: [
      'url',
      'metaTags',
      'jsonLd',
      'pageTitle',
      'description',
      'authors',
      'datePublished',
      'doi',
      'containerTitle',
      'pages',
      'pageText',
    ],
    additionalProperties: false,
  },
  systemInstruction: instruction,
}

export async function extractWebsiteMetadataWithModel(service: string, model: string, input: string) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, instruction, input, openAIConfig)
    case 'gemini':
      return await extractWithGemini(model, input, geminiConfig)
    default:
      throw new Error('Unsupported service')
  }
}
