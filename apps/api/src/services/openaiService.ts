import OpenAI from 'openai'

const client = new OpenAI()
const instructions = 'First, preprocess the given text by correcting formatting issues, including removing unnecessary line breaks, fixing misplaced spaces, and reconstructing broken words or identifiers. Preserve the original content while ensuring a clean and readable format. Then, extract all Digital Object Identifiers (DOIs) from the cleaned text, regardless of any context suggesting validity or invalidity. A DOI must strictly follow the format starting with ‘10.’ and match the pattern ‘10.\d{4,9}/\S+’. Ignore any surrounding words such as ‘invalid’ or ‘not found’ and focus only on extracting the DOI itself. Ensure that only the DOI itself is returned, without any prefixes such as ‘https://doi.org/’. Return the DOIs as an array of unique strings, ensuring no duplicates. If no DOIs are found, return an empty array. Do not modify or add any other content beyond necessary text cleanup and DOI extraction.'

export async function extractWithOpenAI(model: string, text: string) {
  const response = await client.responses.create({
    model,
    instructions,
    input: text,
    text: {
      format: {
        type: 'json_schema',
        name: 'DOI',
        description: 'Array of DOIs',
        schema: {
          type: 'object',
          properties: {
            dois: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of DOIs',
            },
          },
          required: ['dois'],
          additionalProperties: false,
        },
      },
    },
  })

  const event = JSON.parse(response.output_text)
  const dois = event?.dois || []

  return dois
}
