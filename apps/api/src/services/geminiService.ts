import process from 'node:process'
import { GoogleGenAI, Type } from '@google/genai'

// Define identifier types and their instructions
type IdentifierType = 'doi' | 'issn'

interface InstructionConfig {
  systemInstruction: string
  propertyName: string
  description: string
}

const IDENTIFIER_CONFIGS: Record<IdentifierType, InstructionConfig> = {
  doi: {
    systemInstruction: 'First, preprocess the given text by correcting formatting issues, including removing unnecessary line breaks, fixing misplaced spaces, and reconstructing broken words or identifiers. Preserve the original content while ensuring a clean and readable format. Then, extract all Digital Object Identifiers (DOIs) from the cleaned text, regardless of any context suggesting validity or invalidity. A DOI must strictly follow the format starting with \'10.\' and match the pattern \'10.\\d{4,9}/\\S+\'. Ignore any surrounding words such as \'invalid\' or \'not found\' and focus only on extracting the DOI itself. Ensure that only the DOI itself is returned, without any prefixes such as \'https://doi.org/\'. Return the DOIs as an array of unique strings, ensuring no duplicates. If no DOIs are found, return an empty array. Do not modify or add any other content beyond necessary text cleanup and DOI extraction',
    propertyName: 'dois',
    description: 'Array of DOIs',
  },
  issn: {
    systemInstruction: 'Extract all ISSN ',
    propertyName: 'issns',
    description: 'Array of ISSNs',
  },
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Extracts identifiers (DOI or ISSN) from text using Gemini
 *
 * @param model - The Gemini model to use
 * @param text - The text to extract identifiers from
 * @param type - The type of identifier to extract ('doi' or 'issn')
 * @returns An array of the extracted identifiers
 */
export async function extractWithGemini(model: string, text: string, type: IdentifierType): Promise<string[]> {
  const config = IDENTIFIER_CONFIGS[type]

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      [config.propertyName]: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
    required: [config.propertyName],
    additionalProperties: false,
  }

  const response = await ai.models.generateContent({
    model,
    contents: text,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      systemInstruction: config.systemInstruction,
    },
  })

  const result = response.text ? JSON.parse(response.text) : {}
  return result[config.propertyName] || []
}
