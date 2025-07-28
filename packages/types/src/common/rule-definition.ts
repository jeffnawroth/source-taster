/**
 * Generic rule definition for AI-based extraction
 * Used across extraction and matching domains
 */
export interface RuleDefinition<TActionType> {
  actionType: TActionType
  aiInstruction: {
    prompt: string
    example: string
  }
}
