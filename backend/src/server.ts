import process from 'node:process'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const apiKey = process.env.GEMINI_API_KEY ?? ''

const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: 'You are a system that extracts valid DOIs from a given input text. Your sole purpose is to find all valid DOIs. Return the DOIs as an array of strings without duplicates. If no DOIs are found, return an empty array. Do not include any additional information or explanations.' })

app.post('/generate', async (c) => {
  try {
    const prompt = await c.req.text()
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return c.json({ text })
  }
  catch (error) {
    throw new HTTPException(500, { message: 'Error generating content', cause: error })
  }
})

const port = process.env.PORT as number | undefined || 8000
// eslint-disable-next-line no-console
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
