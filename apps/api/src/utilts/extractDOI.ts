import type OpenAI from 'openai'
import { Type } from '@google/genai'
import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

const openAIConfig = {
  instructions: 'First, preprocess the given text by correcting formatting issues, including removing unnecessary line breaks, fixing misplaced spaces, and reconstructing broken words or identifiers. Preserve the original content while ensuring a clean and readable format. Then, extract all Digital Object Identifiers (DOIs) from the cleaned text, regardless of any context suggesting validity or invalidity. A DOI must strictly follow the format starting with \'10.\' and match the pattern \'10.\\d{4,9}/\\S+\'. Ignore any surrounding words such as \'invalid\' or \'not found\' and focus only on extracting the DOI itself. Ensure that only the DOI itself is returned, without any prefixes such as \'https://doi.org/\'. Return the DOIs as an array of unique strings, ensuring no duplicates. If no DOIs are found, return an empty array. Do not modify or add any other content beyond necessary text cleanup and DOI extraction.',
  reponseTextConfig: {
    format: {
      type: 'json_schema',
      name: 'doi_extraction',
      schema: {
        type: 'object',
        properties: {
          dois: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        required: ['dois'],
        additionalProperties: false,
      },
    },
  } as OpenAI.Responses.ResponseTextConfig,
}

const geminiConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      dois: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ['dois'],
    additionalProperties: false,
  },
  systemInstruction: 'First, preprocess the given text by correcting formatting issues, including removing unnecessary line breaks, fixing misplaced spaces, and reconstructing broken words or identifiers. Preserve the original content while ensuring a clean and readable format. Then, extract all Digital Object Identifiers (DOIs) from the cleaned text, regardless of any context suggesting validity or invalidity. A DOI must strictly follow the format starting with \'10.\' and match the pattern \'10.\\d{4,9}/\\S+\'. Ignore any surrounding words such as \'invalid\' or \'not found\' and focus only on extracting the DOI itself. Ensure that only the DOI itself is returned, without any prefixes such as \'https://doi.org/\'. Return the DOIs as an array of unique strings, ensuring no duplicates. If no DOIs are found, return an empty array. Do not modify or add any other content beyond necessary text cleanup and DOI extraction.',
}

export async function extractDOIWithModel(service: string, model: string, input: string) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, openAIConfig.instructions, input, openAIConfig.reponseTextConfig)
    case 'gemini':
      return await extractWithGemini(model, input, geminiConfig)
    default:
      throw new Error('Unsupported service')
  }
}
