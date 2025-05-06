/* eslint-disable style/no-tabs */
import type { GenerateContentConfig } from '@google/genai'
import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You are a system that compares two objects to determine whether they refer to the same scholarly work. You will receive two inputs:
	1.	ReferenceMetadata: Metadata extracted from a free-form reference string. This data may be incomplete or slightly inaccurate.
	2.	Works: An array of structured objects retrieved from the Crossref API and Semantic Scholar API, containing authoritative bibliographic information.

Your task is to assess whether **any** of the items in the Works array describes the same publication as ReferenceMetadata. Follow these steps for each item in Works:
	•	Title Comparison: Compare ReferenceMetadata.title with crossrefWork.title[0] and semanticScholarWork.title. Use a tolerant matching strategy that accounts for minor formatting differences, punctuation, and capitalization.
	•	Author Comparison: Compare ReferenceMetadata.authors with crossrefWork.author and semanticScholarWork.authors (array of author objects). Focus on matching surnames, allowing for slight variations or order differences.
	•	Year Comparison: Compare ReferenceMetadata.year with the publication year in crossrefWork.issued.date-parts[0][0] (or another available date field such as published, publishedPrint, or publishedOnline) and semanticScholarWork.year (or another available date field such as publicationDate).
	•	DOI: If both ReferenceMetadata.doi and crossrefWork.dOI are present, compare them directly (they should be identical for a perfect match).
	•	Journal Comparison: Compare ReferenceMetadata.journal with crossrefWork.containerTitle[0] and semanticScholarWork.journal.name, if available.
	•	Volume, Issue, Pages: Compare volume, issue, and pages (from ReferenceMetadata) with the corresponding fields in crossrefWork (volume, issue, page) and semanticScholarWork.journal, if present.

Be tolerant of minor mismatches but look for strong agreement across multiple fields.

At the end of your analysis, return a clear evaluation in the following format:
{
  "match": true | false,
  "confidence": 0.0 - 1.0,
  "reason": "Brief explanation of why the items do or do not represent the same work."
}
`

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
        confidence: {
          type: 'number',
          description: 'A confidence score between 0.0 and 1.0 indicating the strength of the match.',
        },
      },
      required: ['match', 'reason', 'confidence'],
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

export async function verifyMetadataMatchWithModel(service: string, model: string, referenceMetadata: any, works: any) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, instruction, JSON.stringify({ extractedMetadata: referenceMetadata, works }), openAIConfig)
    case 'gemini':
      return await extractWithGemini(model, JSON.stringify({ extractedMetadata: referenceMetadata, works }), geminiConfig)
    default:
      throw new Error('Unsupported service')
  }
}
