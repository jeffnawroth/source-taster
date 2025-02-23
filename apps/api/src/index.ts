import process from 'node:process'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const schema = {
  description: 'Array of DOIs',
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.STRING,
  },
}

app.post('/generate', async (c) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY ?? ''
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: `“First, preprocess the given text by correcting formatting issues, including removing unnecessary line breaks, fixing misplaced spaces, and reconstructing broken words or identifiers. Preserve the original content while ensuring a clean and readable format. Then, extract all Digital Object Identifiers (DOIs) from the cleaned text, regardless of any context suggesting validity or invalidity. A DOI must strictly follow the format starting with ‘10.’ and match the pattern ‘10.\d{4,9}/\S+’. Ignore any surrounding words such as ‘invalid’ or ‘not found’ and focus only on extracting the DOI itself. Ensure that only the DOI itself is returned, without any prefixes such as ‘https://doi.org/’. Return the DOIs as an array of unique strings, ensuring no duplicates. If no DOIs are found, return an empty array. Do not modify or add any other content beyond necessary text cleanup and DOI extraction.”`, generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    } })

    const prompt = await c.req.text()
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return c.json(text)
  }
  catch (error) {
    throw new HTTPException(500, { message: 'Error generating content', cause: error })
  }
})

const port = Number(process.env.PORT || '') || 8000
// eslint-disable-next-line no-console
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
