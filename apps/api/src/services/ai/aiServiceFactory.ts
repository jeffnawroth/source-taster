import type { AIServiceConfig } from '@source-taster/types'
import process from 'node:process'
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'

export interface AIService {
  generateText: (prompt: string) => Promise<string>
}

export class OpenAIService implements AIService {
  private client: OpenAI
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    })
    this.config = config
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature || 0.1,
        max_tokens: this.config.maxTokens || 4000,
      })

      return completion.choices[0]?.message?.content || '[]'
    }
    catch (error) {
      console.error('OpenAI API error:', error)
      return '[]'
    }
  }
}

export class GeminiService implements AIService {
  private client: GoogleGenAI
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey })
    this.config = config
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: prompt,
        config: {
          temperature: this.config.temperature || 0.1,
          maxOutputTokens: this.config.maxTokens || 4000,
        },
      })

      return response.text || '[]'
    }
    catch (error) {
      console.error('Gemini API error:', error)
      return '[]'
    }
  }
}

export class AIServiceFactory {
  static create(service: 'openai' | 'gemini', model?: string): AIService {
    const apiKey = process.env[`${service.toUpperCase()}_API_KEY`] || ''

    const config: AIServiceConfig = {
      apiKey,
      model: model || (service === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro'),
      temperature: 0.1,
      maxTokens: 4000,
    }

    switch (service) {
      case 'openai':
        return new OpenAIService(config)
      case 'gemini':
        return new GeminiService(config)
      default:
        throw new Error(`Unsupported AI service: ${service}`)
    }
  }
}
