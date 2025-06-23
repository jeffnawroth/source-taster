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
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'reference_extraction',
            schema: {
              type: 'object',
              properties: {
                references: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      originalText: {
                        type: 'string',
                        description: 'Complete reference as it appears in the text',
                      },
                      metadata: {
                        type: 'object',
                        properties: {
                          title: { type: ['string', 'null'] },
                          authors: {
                            type: ['array', 'null'],
                            items: { type: 'string' },
                          },
                          journal: { type: ['string', 'null'] },
                          year: { type: ['integer', 'null'] },
                          doi: { type: ['string', 'null'] },
                          issn: { type: ['string', 'null'] },
                          isbn: { type: ['string', 'null'] },
                          url: { type: ['string', 'null'] },
                          volume: { type: ['string', 'null'] },
                          issue: { type: ['string', 'null'] },
                          pages: { type: ['string', 'null'] },
                          publisher: { type: ['string', 'null'] },
                          abstract: { type: ['string', 'null'] },
                        },
                        additionalProperties: false,
                      },
                    },
                    required: ['originalText', 'type', 'metadata'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['references'],
              additionalProperties: false,
            },
          },
        },
      })

      return completion.choices[0]?.message?.content || '{"references":[]}'
    }
    catch (error) {
      console.error('OpenAI API error:', error)
      return '{"references":[]}'
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
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              references: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    originalText: {
                      type: 'string',
                      description: 'Complete reference as it appears in the text',
                    },
                    metadata: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', nullable: true },
                        authors: {
                          type: 'array',
                          items: { type: 'string' },
                          nullable: true,
                        },
                        journal: { type: 'string', nullable: true },
                        year: { type: 'integer', nullable: true },
                        doi: { type: 'string', nullable: true },
                        issn: { type: 'string', nullable: true },
                        isbn: { type: 'string', nullable: true },
                        url: { type: 'string', nullable: true },
                        volume: { type: 'string', nullable: true },
                        issue: { type: 'string', nullable: true },
                        pages: { type: 'string', nullable: true },
                        publisher: { type: 'string', nullable: true },
                        abstract: { type: 'string', nullable: true },
                      },
                    },
                  },
                  required: ['originalText', 'type', 'metadata'],
                },
              },
            },
            required: ['references'],
          },
        },
      })

      return response.text || '{"references":[]}'
    }
    catch (error) {
      console.error('Gemini API error:', error)
      return '{"references":[]}'
    }
  }
}

export class AIServiceFactory {
  static create(service: 'openai' | 'gemini', model?: string): AIService {
    const apiKey = process.env[`${service.toUpperCase()}_API_KEY`] || ''

    const config: AIServiceConfig = {
      apiKey,
      model: model || (service === 'openai' ? 'gpt-4o' : 'gemini-2.5-flash'),
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
