import type { CSLItem, CSLVariable, FieldConfigurations } from '@source-taster/types'

/**
 * Simplified metadata comparator optimized for flat CSL-JSON structure
 */
export class MetadataComparator {
  /**
   * Get CSL fields that have meaningful values in both objects
   * Optimized for flat CSL structure - no complex path traversal needed
   */
  static getCommonMeaningfulFields(
    obj1: CSLItem,
    obj2: CSLItem,
  ): CSLVariable[] {
    const fields: CSLVariable[] = []

    // Get all possible CSL field keys from both objects
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]) as Set<CSLVariable>

    for (const field of allKeys) {
      const value1 = obj1[field]
      const value2 = obj2[field]

      // Both values must exist and be meaningful
      if (this.isMeaningfulValue(value1) && this.isMeaningfulValue(value2)) {
        fields.push(field)
      }
    }

    return fields
  }

  /**
   * Get enabled CSL fields that are available in both objects
   */
  static getEnabledFields(
    obj1: CSLItem,
    obj2: CSLItem,
    fieldConfig: FieldConfigurations,
  ): CSLVariable[] {
    const commonFields = this.getCommonMeaningfulFields(obj1, obj2)

    return commonFields.filter((field) => {
      const config = fieldConfig[field]
      return config?.enabled === true
    })
  }

  /**
   * Check if a value is meaningful (not null, undefined, empty string, or empty array)
   */
  private static isMeaningfulValue(value: any): boolean {
    if (value == null)
      return false
    if (value === '')
      return false
    if (Array.isArray(value) && value.length === 0)
      return false

    // For objects (like CSLName, CSLDate), check if they have meaningful content
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).length > 0
    }

    return true
  }
}
