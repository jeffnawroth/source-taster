import type { AIServiceConfig } from '@source-taster/types'
import process from 'node:process'
import OpenAI from 'openai'

export interface AIService {
  generateText: (prompt: string) => Promise<string>
  verifyMatch: (prompt: string) => Promise<string>
}

// Add retry configuration interface
interface RetryConfig {
  maxRetries: number
  backoffMs: number
  retryableErrors: string[]
}

export class OpenAIService implements AIService {
  private client: OpenAI
  private config: AIServiceConfig
  private retryConfig: RetryConfig

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    })
    this.config = config
    this.retryConfig = {
      maxRetries: 3,
      backoffMs: 1000,
      retryableErrors: ['rate_limit_exceeded', 'server_error', 'timeout'],
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation()
      }
      catch (error: any) {
        lastError = error

        if (attempt === this.retryConfig.maxRetries)
          break

        // Check if error is retryable
        const errorType = error?.error?.type || error?.type || ''
        if (!this.retryConfig.retryableErrors.some(e => errorType.includes(e))) {
          break
        }

        // Exponential backoff
        const delay = this.retryConfig.backoffMs * (2 ** attempt)
        await new Promise(resolve => setTimeout(resolve, delay))

        console.warn(`OpenAI API retry ${attempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms:`, error?.message)
      }
    }

    throw lastError
  }

  async generateText(prompt: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic reference extraction system. Extract bibliographic references with high precision and accuracy. Follow the provided schema exactly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
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
                          date: {
                            type: 'object',
                            properties: {
                              year: { type: ['integer', 'null'] },
                              month: { type: ['string', 'null'] },
                              day: { type: ['integer', 'null'] },
                              yearSuffix: { type: ['string', 'null'] },
                              noDate: { type: 'boolean' },
                              inPress: { type: 'boolean' },
                              approximateDate: { type: 'boolean' },
                              season: { type: ['string', 'null'] },
                              dateRange: { type: 'boolean' },
                              yearEnd: { type: ['integer', 'null'] },
                            },
                            required: ['year', 'month', 'day', 'yearSuffix', 'noDate', 'inPress', 'approximateDate', 'season', 'dateRange', 'yearEnd'],
                          },
                          source: {
                            type: 'object',
                            properties: {
                              containerTitle: { type: ['string', 'null'] },
                              volume: { type: ['string', 'null'] },
                              issue: { type: ['string', 'null'] },
                              pages: { type: ['string', 'null'] },
                              publisher: { type: ['string', 'null'] },
                              location: { type: ['string', 'null'] },
                              url: { type: ['string', 'null'] },
                              sourceType: { type: 'string' },
                            },
                            required: ['containerTitle', 'volume', 'issue', 'pages', 'publisher', 'location', 'url', 'sourceType'],
                          },
                          identifiers: {
                            type: 'object',
                            properties: {
                              doi: { type: ['string', 'null'] },
                              pmid: { type: ['string', 'null'] },
                              pmcid: { type: ['string', 'null'] },
                              isbn: { type: ['string', 'null'] },
                              issn: { type: ['string', 'null'] },
                              arxivId: { type: ['string', 'null'] },
                            },
                            required: ['doi', 'pmid', 'pmcid', 'isbn', 'issn', 'arxivId'],
                          },
                        },
                        required: ['title', 'authors', 'date', 'source', 'identifiers'],
                      },
                    },
                    required: ['originalText', 'metadata'],
                  },
                },
              },
              required: ['references'],
            },
          },
        },
      })

      const content = completion.choices[0]?.message?.content || '{"references":[]}'

      return content
    })
  }

  async verifyMatch(prompt: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert bibliographic data verification system. Compare reference fields with source metadata and provide accurate match scores (0-100) based on semantic similarity, exact matches, and bibliographic standards.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.config.temperature || 0.1,
        max_tokens: this.config.maxTokens || 4000,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'field_verification',
            schema: {
              type: 'object',
              properties: {
                fieldDetails: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        description: 'Field name being compared',
                      },
                      reference_value: {
                        description: 'Value from reference (can be string, number, array, or null)',
                      },
                      source_value: {
                        description: 'Value from source (can be string, number, array, or null)',
                      },
                      match_score: {
                        type: 'integer',
                        description: 'Match score for this field from 0-100',
                        minimum: 0,
                        maximum: 100,
                      },
                    },
                    required: ['field', 'reference_value', 'source_value', 'match_score'],
                  },
                  description: 'Detailed scoring information for each field',
                },
              },
              required: ['fieldDetails'],
            },
          },
        },
      })

      const content = completion.choices[0]?.message?.content || '{"fieldDetails":[]}'

      return content
    })
  }
}

export class AIServiceFactory {
  static create(model?: string): AIService {
    const apiKey = process.env.OPENAI_API_KEY || ''

    // Optimize model selection and parameters based on task
    const selectedModel = model || 'gpt-4o'

    // Different configurations for different models
    const config: AIServiceConfig = {
      apiKey,
      model: selectedModel,
      temperature: this.getOptimalTemperature(selectedModel),
      maxTokens: this.getOptimalMaxTokens(selectedModel),
    }

    return new OpenAIService(config)
  }

  private static getOptimalTemperature(model: string): number {
    // Lower temperature for structured extraction tasks
    if (model.includes('gpt-4o'))
      return 0.0 // Most deterministic for structured output
    return 0.2
  }

  private static getOptimalMaxTokens(model: string): number {
    // Optimize token usage based on model capabilities
    if (model.includes('gpt-4o'))
      return 8000 // gpt-4o has higher context
    return 4000
  }
}
