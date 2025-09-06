/**
 * AnyStyle-related types and interfaces
 */
import type { CSLItem } from './reference/csl-json.zod'

/**
 * Valid AnyStyle token labels (must match TokenRelabelingEditor options)
 */
export type AnystyleTokenLabel =
  | 'author'
  | 'citation-number'
  | 'collection-title'
  | 'container-title'
  | 'date'
  | 'director'
  | 'doi'
  | 'edition'
  | 'editor'
  | 'genre'
  | 'isbn'
  | 'journal'
  | 'location'
  | 'medium'
  | 'note'
  | 'other'
  | 'pages'
  | 'producer'
  | 'publisher'
  | 'source'
  | 'title'
  | 'translator'
  | 'url'
  | 'volume-issue'

/**
 * A single AnyStyle token as [label, tokenValue] tuple
 */
export type AnystyleToken = [AnystyleTokenLabel, string]

/**
 * A sequence of AnyStyle tokens representing one parsed reference
 */
export type AnystyleTokenSequence = AnystyleToken[]

/**
 * Data returned by the AnyStyle parse endpoint
 */
export interface ParseData {
  /** Model used for parsing (e.g., 'default', 'custom.mod') */
  model_used: string
  /** Array of token sequences, where each sequence is an array of [label, token] pairs */
  tokens: AnystyleTokenSequence[]
}

/**
 * Data returned by the AnyStyle convert-to-csl endpoint
 */
export interface ConvertToCSLData {
  /** Array of CSL (Citation Style Language) formatted references */
  csl: CSLItem[]
}

/**
 * Data returned by the AnyStyle train-model endpoint
 */
export interface TrainModelData {
  /** Path to the trained model file */
  model_path: string
  /** Size of the model file in bytes */
  model_size_bytes: number
  /** Number of training sequences used */
  training_sequences: number
  /** Total number of training tokens */
  training_tokens: number
  /** Training method used (e.g., 'AnyStyle Ruby API with core + good datasets') */
  training_method: string
  /** Human-readable message about the training result */
  message: string
  /** ISO timestamp of when the training completed */
  timestamp: string
}
