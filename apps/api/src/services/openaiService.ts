import OpenAI from 'openai'

// Define identifier types and their instructions
type IdentifierType = 'doi' | 'issn'

interface InstructionConfig {
  instructions: string
  propertyName: string
  description: string
}

const IDENTIFIER_CONFIGS: Record<IdentifierType, InstructionConfig> = {
  doi: {
    instructions: 'First, preprocess the given text by correcting formatting issues, including removing unnecessary line breaks, fixing misplaced spaces, and reconstructing broken words or identifiers. Preserve the original content while ensuring a clean and readable format. Then, extract all Digital Object Identifiers (DOIs) from the cleaned text, regardless of any context suggesting validity or invalidity. A DOI must strictly follow the format starting with \'10.\' and match the pattern \'10.\\d{4,9}/\\S+\'. Ignore any surrounding words such as \'invalid\' or \'not found\' and focus only on extracting the DOI itself. Ensure that only the DOI itself is returned, without any prefixes such as \'https://doi.org/\'. Return the DOIs as an array of unique strings, ensuring no duplicates. If no DOIs are found, return an empty array. Do not modify or add any other content beyond necessary text cleanup and DOI extraction.',
    propertyName: 'dois',
    description: 'Array of DOIs',
  },
  issn: {
    instructions: 'Extract all Issns',
    propertyName: 'issns',
    description: 'Array of ISSNs',
  },
}

// Create OpenAI client once
const client = new OpenAI()

/**
 * Extracts identifiers (DOI or ISSN) from text using OpenAI
 *
 * @param model - The OpenAI model to use
 * @param text - The text to extract identifiers from
 * @param type - The type of identifier to extract ('doi' or 'issn')
 * @returns An array of the extracted identifiers
 */
export async function extractWithOpenAI(model: string, text: string, type: IdentifierType): Promise<string[]> {
  const config = IDENTIFIER_CONFIGS[type]

  const response = await client.responses.create({
    model,
    instructions: config.instructions,
    input: text,
    text: {
      format: {
        type: 'json_schema',
        name: 'Identifier',
        description: config.description,
        schema: {
          type: 'object',
          properties: {
            [config.propertyName]: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: config.description,
            },
          },
          required: [config.propertyName],
          additionalProperties: false,
        },
      },
    },
  })

  const result = JSON.parse(response.output_text)
  return result[config.propertyName] || []
}
