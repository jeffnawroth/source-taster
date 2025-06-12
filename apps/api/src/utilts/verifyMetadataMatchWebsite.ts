import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You are an AI system that determines whether a given scholarly reference matches the metadata extracted from a scientific web page. 
Input: a ReferenceMetadata object and a WebsiteMetadata object.

Your task is to compare these two objects field by field:
- Title: check if websiteMetadata.title matches or closely paraphrases referenceMetadata.title.
- Authors: check if at least one surname from referenceMetadata.authors appears in websiteMetadata.authors.
- Year: check if websiteMetadata.year equals referenceMetadata.year.

Based on this, output **only** this JSON object:

{
  "match": boolean,
  "reason": string,
  "confidence": number
}

where:
- "match" is true if you find strong agreement on title, authors, and year; otherwise false.
- "reason" briefly explains which checks passed or failed.
- "confidence" is a number between 0.0 and 1.0 indicating your certainty.

Do **not** include any other fields or commentary.`

const openAIConfig: OpenAI.Responses.ResponseTextConfig = {
  format: {
    type: 'json_schema',
    name: 'website_metadata_match',
    schema: {
      type: 'object',
      properties: {
        match: {
          type: 'boolean',
          description: 'Whether the webpage matches the reference.',
        },
        reason: {
          type: 'string',
          description: 'Explanation of the decision.',
        },
        confidence: {
          type: 'number',
          description: 'Confidence score between 0 and 1.',
        },
      },
      required: ['match', 'reason', 'confidence'],
      additionalProperties: false,
    },
  },
}

const geminiConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      match: {
        type: Type.BOOLEAN,
        description: 'Whether the webpage matches the reference.',
      },
      reason: {
        type: Type.STRING,
        description: 'Explanation of the decision.',
      },
      confidence: {
        type: Type.NUMBER,
        description: 'Confidence score between 0 and 1.',
      },
    },
    required: ['match', 'reason', 'confidence'],
    additionalProperties: false,
  },
  systemInstruction: instruction,
}

/**
 * Verifies a ReferenceMetadata against WebsiteMetadata via AI.
 */
export async function verifyMetadataMatchWebsiteWithModel(
  service: 'openai' | 'gemini',
  model: string,
  referenceMetadata: any,
  websiteMetadata: any,
) {
  const payload = JSON.stringify({ referenceMetadata, websiteMetadata })

  switch (service) {
    case 'openai':
      return await extractWithOpenAI(
        model,
        instruction,
        payload,
        openAIConfig,
      )
    case 'gemini':
      return await extractWithGemini(
        model,
        payload,
        geminiConfig,
      )
    default:
      throw new Error('Unsupported service')
  }
}
