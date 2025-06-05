/* eslint-disable style/no-tabs */
import type { GenerateContentConfig } from '@google/genai'
import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You are a system that compares two objects to determine whether they refer to the same scholarly work. You will receive two inputs:
	1. ReferenceMetadata: Metadata extracted from a free-form reference string. This data may be incomplete or slightly inaccurate.
	2. PublicationsMetadata: An array of structured PublicationMetadata objects, containing authoritative bibliographic information.

Your task is to assess whether **any** of the items in the PublicationsMetadata array describes the same publication as ReferenceMetadata.

For each item in publicationsMetadata, follow these steps::
	• Title Comparison: Compare ReferenceMetadata.title with publicationMetadata.title. Use a tolerant matching strategy that accounts for minor formatting differences, punctuation, and capitalization.
	• Author Comparison: Compare referenceMetadata.authors with publicationMetadata.authors (array of author names). Focus on matching surnames, allowing for slight variations or order differences.
	• Year Comparison:
      – If ReferenceMetadata.url is **not** present (i.e., a normal citation), compare ReferenceMetadata.year with publicationMetadata.year strictly: they must match exactly.
      – If ReferenceMetadata.url **is** present (i.e., a webpage/PDF fallback), be more lenient:  
        • If title and authors match strongly, allow a year mismatch (even if off by 1–2 years or one is null).  
        • Only penalize the year if title/authors are weak matches.
	• DOI: If both referenceMetadata.doi and publicationMetadata.doi are present, compare them directly (they should be identical for a perfect match).
	• Journal Comparison: Compare referenceMetadata.journal with publicationMetadata.journal, if available.
	• Volume, Issue, Pages: Volume, Issue, Pages: Compare volume, issue, and pages (from referenceMetadata) with the corresponding fields in publicationMetadata (volume, issue, pages), if present.

Be tolerant of minor mismatches but look for strong agreement across multiple fields. A strong match is sufficient.

At the end of your analysis, return a clear evaluation in the following format:
{
  "match": true | false,
  "reason": "Brief explanation of why the items do or do not represent the same work."
  "publication": The best matching publication object from publicationsMetadata, or null if no suitable match is found.
}
`

// const pageInstruction = `
// You are a system that checks whether the text content of a web page matches
// the bibliographic ReferenceMetadata extracted from a citation string.

// Input:
//   - ReferenceMetadata: an object with title, authors, year, etc.
//   - pageText: the full text of the target page (HTML or PDF).

// Your task:
//   Compare the metadata fields against the pageText. If you find strong
//   confirmation (matching title phrases, author names, year, etc.) return
//   { "match": true, "reason": "...", "confidence": 0.XX }. Otherwise
//   return { "match": false, "reason": "...", "confidence": 0.XX }.
// `

// OpenAI config
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
        publicationMetadata: {
          type: ['object', 'null'],
          description: 'The matched publication object from publicationsMetadata.',
          properties: {
            id: {
              type: 'string',
              description: 'The unique identifier of the publication.',
            },
            title: {
              type: 'string',
              description: 'The title of the publication.',
            },
            authors: {
              type: 'array',
              items: {
                type: 'string',
                description: 'The authors of the publication.',
              },
            },
            journal: {
              type: ['string', 'null'],
              description: 'The journal in which the publication appeared.',
            },
            volume: {
              type: ['string', 'null'],
              description: 'The volume of the journal.',
            },
            issue: {
              type: ['string', 'null'],
              description: 'The issue of the journal.',
            },
            pages: {
              type: ['string', 'null'],
              description: 'The pages on which the publication appears.',
            },
            doi: {
              type: ['string', 'null'],
              description: 'The DOI of the publication.',
            },
            url: {
              type: ['string', 'null'],
              description: 'The URL of the publication.',
            },
          },
          required: ['id', 'title', 'authors', 'journal', 'volume', 'issue', 'pages', 'doi', 'url'],
          additionalProperties: false,
        },
      },
      required: ['match', 'reason', 'publicationMetadata'],
      additionalProperties: false,
    },
  },
}

// Gemini config
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

export async function verifyMetadataMatchWithModel(service: string, model: string, referenceMetadata: any, publicationsMetadata: any) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, instruction, JSON.stringify({ referenceMetadata, publicationsMetadata }), openAIConfig)
    case 'gemini':
      return await extractWithGemini(model, JSON.stringify({ referenceMetadata, publicationsMetadata }), geminiConfig)
    default:
      throw new Error('Unsupported service')
  }
}
