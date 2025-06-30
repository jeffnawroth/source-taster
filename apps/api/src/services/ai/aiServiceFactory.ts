import type { AIServiceConfig } from '@source-taster/types'
import process from 'node:process'
import { GoogleGenAI } from '@google/genai'
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
                              noDate: { type: ['boolean', 'null'] },
                              inPress: { type: ['boolean', 'null'] },
                              approximateDate: { type: ['boolean', 'null'] },
                              season: { type: ['string', 'null'] },
                              dateRange: { type: ['boolean', 'null'] },
                              yearEnd: { type: ['integer', 'null'] },
                            },
                            required: [],
                            additionalProperties: false,
                          },
                          source: {
                            type: 'object',
                            properties: {
                              containerTitle: { type: ['string', 'null'] },
                              subtitle: { type: ['string', 'null'] },
                              volume: { type: ['string', 'null'] },
                              issue: { type: ['string', 'null'] },
                              pages: { type: ['string', 'null'] },
                              publisher: { type: ['string', 'null'] },
                              publicationPlace: { type: ['string', 'null'] },
                              url: { type: ['string', 'null'] },
                              sourceType: { type: ['string', 'null'] },
                              location: { type: ['string', 'null'] },
                              retrievalDate: { type: ['string', 'null'] },
                              edition: { type: ['string', 'null'] },
                              pageType: { type: ['string', 'null'] },
                              paragraphNumber: { type: ['string', 'null'] },
                              volumePrefix: { type: ['string', 'null'] },
                              issuePrefix: { type: ['string', 'null'] },
                              supplementInfo: { type: ['string', 'null'] },
                              articleNumber: { type: ['string', 'null'] },
                              isStandAlone: { type: ['boolean', 'null'] },
                              conference: { type: ['string', 'null'] },
                              institution: { type: ['string', 'null'] },
                              series: { type: ['string', 'null'] },
                              seriesNumber: { type: ['string', 'null'] },
                              chapterTitle: { type: ['string', 'null'] },
                              medium: { type: ['string', 'null'] },
                              originalTitle: { type: ['string', 'null'] },
                              originalLanguage: { type: ['string', 'null'] },
                              degree: { type: ['string', 'null'] },
                              advisor: { type: ['string', 'null'] },
                              department: { type: ['string', 'null'] },
                            },
                            required: [],
                            additionalProperties: false,
                          },
                          identifiers: {
                            type: ['object', 'null'],
                            properties: {
                              doi: { type: ['string', 'null'] },
                              isbn: { type: ['string', 'null'] },
                              issn: { type: ['string', 'null'] },
                              pmid: { type: ['string', 'null'] },
                              pmcid: { type: ['string', 'null'] },
                              arxivId: { type: ['string', 'null'] },
                            },
                            required: [],
                            additionalProperties: false,
                          },
                        },
                        required: ['date', 'source'],
                        additionalProperties: false,
                      },
                    },
                    required: ['originalText', 'metadata'],
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
            name: 'verification_result',
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
                        description: 'Name of the field',
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
                    additionalProperties: false,
                  },
                  description: 'Detailed scoring information for each field',
                },
              },
              required: ['fieldDetails'],
              additionalProperties: false,
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
                        date: {
                          type: 'object',
                          properties: {
                            year: { type: 'integer', nullable: true },
                            month: { type: 'string', nullable: true },
                            day: { type: 'integer', nullable: true },
                            yearSuffix: { type: 'string', nullable: true },
                            noDate: { type: 'boolean', nullable: true },
                            inPress: { type: 'boolean', nullable: true },
                            approximateDate: { type: 'boolean', nullable: true },
                            season: { type: 'string', nullable: true },
                            dateRange: { type: 'boolean', nullable: true },
                            yearEnd: { type: 'integer', nullable: true },
                          },
                        },
                        source: {
                          type: 'object',
                          properties: {
                            containerTitle: { type: 'string', nullable: true },
                            subtitle: { type: 'string', nullable: true },
                            volume: { type: 'string', nullable: true },
                            issue: { type: 'string', nullable: true },
                            pages: { type: 'string', nullable: true },
                            publisher: { type: 'string', nullable: true },
                            publicationPlace: { type: 'string', nullable: true },
                            url: { type: 'string', nullable: true },
                            sourceType: { type: 'string', nullable: true },
                            location: { type: 'string', nullable: true },
                            retrievalDate: { type: 'string', nullable: true },
                            edition: { type: 'string', nullable: true },
                            pageType: { type: 'string', nullable: true },
                            paragraphNumber: { type: 'string', nullable: true },
                            volumePrefix: { type: 'string', nullable: true },
                            issuePrefix: { type: 'string', nullable: true },
                            supplementInfo: { type: 'string', nullable: true },
                            articleNumber: { type: 'string', nullable: true },
                            isStandAlone: { type: 'boolean', nullable: true },
                            conference: { type: 'string', nullable: true },
                            institution: { type: 'string', nullable: true },
                            series: { type: 'string', nullable: true },
                            seriesNumber: { type: 'string', nullable: true },
                            chapterTitle: { type: 'string', nullable: true },
                            medium: { type: 'string', nullable: true },
                            originalTitle: { type: 'string', nullable: true },
                            originalLanguage: { type: 'string', nullable: true },
                            degree: { type: 'string', nullable: true },
                            advisor: { type: 'string', nullable: true },
                            department: { type: 'string', nullable: true },
                          },
                        },
                        identifiers: {
                          type: 'object',
                          properties: {
                            doi: { type: 'string', nullable: true },
                            isbn: { type: 'string', nullable: true },
                            issn: { type: 'string', nullable: true },
                            pmid: { type: 'string', nullable: true },
                            pmcid: { type: 'string', nullable: true },
                            arxivId: { type: 'string', nullable: true },
                          },
                          nullable: true,
                        },
                      },
                      required: ['date', 'source'],
                    },
                  },
                  required: ['originalText', 'metadata'],
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

  async verifyMatch(prompt: string): Promise<string> {
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
              fieldDetails: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      description: 'Name of the field',
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
      })

      return response.text || '{"fieldDetails":[]}'
    }
    catch (error) {
      console.error('Gemini verification error:', error)
      return '{"fieldDetails":[]}'
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
