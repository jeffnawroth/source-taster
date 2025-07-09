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
                          title: {
                            type: 'string',
                            description: 'Title of the work',
                          },
                          authors: {
                            type: 'array',
                            items: {
                              oneOf: [
                                { type: 'string' },
                                {
                                  type: 'object',
                                  properties: {
                                    firstName: { type: 'string', description: 'First name of the author' },
                                    lastName: { type: 'string', description: 'Last name of the author' },
                                    role: { type: 'string', description: 'Role of the author (e.g., editor, translator)' },
                                  },
                                  required: ['lastName'],
                                  additionalProperties: false,
                                },
                              ],
                            },
                            description: 'List of author names or author objects',
                          },
                          date: {
                            type: 'object',
                            properties: {
                              year: {
                                type: 'integer',
                                description: 'Publication year',
                              },
                              month: {
                                type: 'string',
                                description: 'Publication month',
                              },
                              day: {
                                type: 'integer',
                                description: 'Publication day',
                              },
                              yearSuffix: {
                                type: 'string',
                                description: 'Year suffix like "a" or "b"',
                              },
                              noDate: {
                                type: 'boolean',
                                description: 'Indicates if no date is available',
                              },
                              inPress: {
                                type: 'boolean',
                                description: 'Indicates if work is in press',
                              },
                              approximateDate: {
                                type: 'boolean',
                                description: 'Indicates if date is approximate',
                              },
                              season: {
                                type: 'string',
                                description: 'Season of publication',
                              },
                              dateRange: {
                                type: 'boolean',
                                description: 'Indicates if this is a date range',
                              },
                              yearEnd: {
                                type: 'integer',
                                description: 'End year for date ranges',
                              },
                            },
                            required: [],
                            additionalProperties: false,
                          },
                          source: {
                            type: 'object',
                            properties: {
                              containerTitle: {
                                type: 'string',
                                description: 'Journal or book title',
                              },
                              subtitle: {
                                type: 'string',
                                description: 'Subtitle of the work',
                              },
                              volume: {
                                type: 'string',
                                description: 'Volume number',
                              },
                              issue: {
                                type: 'string',
                                description: 'Issue number',
                              },
                              pages: {
                                type: 'string',
                                description: 'Page range',
                              },
                              publisher: {
                                type: 'string',
                                description: 'Publisher name',
                              },
                              publicationPlace: {
                                type: 'string',
                                description: 'Place of publication',
                              },
                              location: {
                                type: 'string',
                                description: 'Physical location',
                              },
                              url: {
                                type: 'string',
                                description: 'URL of the source',
                              },
                              sourceType: {
                                type: 'string',
                                description: 'Type of source (e.g., Journal article, Book)',
                                enum: ['Journal article', 'Book', 'Book chapter', 'Conference paper', 'Thesis', 'Report', 'Webpage'],
                              },
                              retrievalDate: {
                                type: 'string',
                                description: 'Date the source was retrieved',
                              },
                              edition: {
                                type: 'string',
                                description: 'Edition information',
                              },
                              pageType: {
                                type: 'string',
                                description: 'Type of page reference',
                              },
                              paragraphNumber: {
                                type: 'string',
                                description: 'Paragraph number',
                              },
                              volumePrefix: {
                                type: 'string',
                                description: 'Volume prefix',
                              },
                              issuePrefix: {
                                type: 'string',
                                description: 'Issue prefix',
                              },
                              supplementInfo: {
                                type: 'string',
                                description: 'Supplement information',
                              },
                              articleNumber: {
                                type: 'string',
                                description: 'Article number',
                              },
                              isStandAlone: {
                                type: 'boolean',
                                description: 'Whether this is a standalone work',
                              },
                              conference: {
                                type: 'string',
                                description: 'Conference name',
                              },
                              institution: {
                                type: 'string',
                                description: 'Institution name',
                              },
                              series: {
                                type: 'string',
                                description: 'Series name',
                              },
                              seriesNumber: {
                                type: 'string',
                                description: 'Series number',
                              },
                              chapterTitle: {
                                type: 'string',
                                description: 'Chapter title',
                              },
                              medium: {
                                type: 'string',
                                description: 'Medium of publication',
                              },
                              originalTitle: {
                                type: 'string',
                                description: 'Original title for translations',
                              },
                              originalLanguage: {
                                type: 'string',
                                description: 'Original language',
                              },
                              degree: {
                                type: 'string',
                                description: 'Academic degree',
                              },
                              advisor: {
                                type: 'string',
                                description: 'Thesis advisor',
                              },
                              department: {
                                type: 'string',
                                description: 'Academic department',
                              },
                              contributors: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    firstName: { type: 'string', description: 'First name of the contributor' },
                                    lastName: { type: 'string', description: 'Last name of the contributor' },
                                    role: { type: 'string', description: 'Role of the contributor (e.g., editor, translator)' },
                                  },
                                  required: ['lastName'],
                                  additionalProperties: false,
                                },
                                description: 'Additional contributors beyond the main authors',
                              },
                            },
                            required: [],
                            additionalProperties: false,
                          },
                          identifiers: {
                            type: 'object',
                            properties: {
                              doi: {
                                type: 'string',
                                description: 'Digital Object Identifier',
                              },
                              pmid: {
                                type: 'string',
                                description: 'PubMed ID',
                              },
                              pmcid: {
                                type: 'string',
                                description: 'PMC ID',
                              },
                              isbn: {
                                type: 'string',
                                description: 'International Standard Book Number',
                              },
                              issn: {
                                type: 'string',
                                description: 'International Standard Serial Number',
                              },
                              arxivId: {
                                type: 'string',
                                description: 'arXiv identifier',
                              },
                            },
                            required: [],
                            additionalProperties: false,
                          },
                        },
                        required: ['originalText', 'metadata'],
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

    // Model selection priority:
    // 1. Function parameter (highest priority)
    // 2. Environment variable OPENAI_MODEL
    // 3. Default fallback to gpt-4o
    const selectedModel = model || process.env.OPENAI_MODEL || 'gpt-4o'

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
