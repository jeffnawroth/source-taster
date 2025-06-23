import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const instruction = `You are an AI system that determines whether the bibliographic reference metadata extracted from a citation matches the full text of a target web page (HTML or PDF).
Input:
- ReferenceMetadata: an object containing fields like title, authors, year, etc.
- pageText: the complete textual content of the web page or PDF.

Your task is to analyze the pageText to verify if:
- Title phrases from ReferenceMetadata appear or are closely paraphrased.
- At least one author surname from ReferenceMetadata appears.
- The publication year from ReferenceMetadata is present.

Based on this, output **only** this JSON object:

{
  "match": boolean,
  "reason": string,
  "confidence": number
}

where 
"match" is true if all fields are strongly confirmed, otherwise false;
"reason" explains which checks passed or failed;
"confidence" is a 0.0–1.0 score indicating certainty. Do not include any additional commentary.
`

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
 *
 * @param service The AI service to use ('openai' or 'gemini').
 * @param model The model name to use.
 * @param referenceMetadata The bibliographic reference metadata object.
 * @param pageText The full text content of the website or PDF to verify against.
 */
export async function verifyMetadataMatchWebsiteWithModel(
  service: 'openai' | 'gemini',
  model: string,
  referenceMetadata: any,
  pageText: string,
) {
  const payload = JSON.stringify({ referenceMetadata, pageText })

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
