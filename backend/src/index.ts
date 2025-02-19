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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: 'You are a system that extracts valid DOIs from a given input text. Your sole purpose is to find all valid DOIs. Return the DOIs as an array of strings without duplicates. If no DOIs are found, return an empty array. Do not include any additional information or explanations.', generationConfig: {
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
