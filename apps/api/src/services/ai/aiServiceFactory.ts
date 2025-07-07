import type { AIServiceConfig } from '@source-taster/types'
import process from 'node:process'
import OpenAI from 'openai'

export interface AIService {
  generateText: (prompt: string) => Promise<string>
  verifyMatch: (prompt: string) => Promise<string>
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

      return completion.choices[0]?.message?.content || '{"references":[]}'
    }
    catch (error) {
      console.error('OpenAI API error:', error)
      return '{"references":[]}'
    }
  }

  async verifyMatch(prompt: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
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

      return completion.choices[0]?.message?.content || '{"fieldDetails":[]}'
    }
    catch (error) {
      console.error('OpenAI verification error:', error)
      return '{"fieldDetails":[]}'
    }
  }
}

export class AIServiceFactory {
  static create(model?: string): AIService {
    const apiKey = process.env.OPENAI_API_KEY || ''

    const config: AIServiceConfig = {
      apiKey,
      model: model || 'gpt-4o',
      temperature: 0.1,
      maxTokens: 4000,
    }

    return new OpenAIService(config)
  }
}
