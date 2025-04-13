import OpenAI from 'openai'

// Create OpenAI client once
const client = new OpenAI()

/**
 * Extracts data using OpenAI's API based on the provided model, instructions, input, and text configuration.
 *
 * @param model - The name of the OpenAI model to use for the extraction.
 * @param instructions - Optional instructions to guide the model's behavior. Can be null or undefined.
 * @param input - The input string to be processed by the OpenAI model.
 * @param text - Optional configuration for the response text, defining how the output should be structured.
 *
 * @returns A promise that resolves to the parsed result from the OpenAI response.
 *
 * @throws Will throw an error if the response output cannot be parsed as JSON.
 */
export async function extractWithOpenAI(model: string, instructions: string | null | undefined, input: string, text: OpenAI.Responses.ResponseTextConfig | undefined) {
  const response = await client.responses.create({
    model,
    instructions,
    input,
    text,
  })

  const result = JSON.parse(response.output_text)
  return result
}
