// utils/MetadataComparator.ts
import _ from 'lodash'

export class MetadataComparator {
  /**
   * Find all paths that exist and have meaningful values in both objects
   */
  static getCommonMeaningfulKeys<T extends Record<string, any>>(
    obj1: T,
    obj2: T,
  ): string[] {
    const getAllPaths = (obj: any, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, value]) => {
        const currentPath = prefix ? `${prefix}.${key}` : key
        const paths = [currentPath]

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          paths.push(...getAllPaths(value, currentPath))
        }

        return paths
      })
    }

    const paths1 = getAllPaths(obj1)
    return paths1.filter((path) => {
      const value1 = _.get(obj1, path)
      const value2 = _.get(obj2, path)

      // Both values must exist and not be null/undefined/empty string
      return _.has(obj2, path)
        && value1 != null && value2 != null
        && value1 !== '' && value2 !== ''
    })
  }

  /**
   * Get field names (without paths) that are available in both objects and enabled in configuration
   */
  static getAvailableFieldNames<T extends Record<string, any>>(
    obj1: T,
    obj2: T,
    fieldConfigurations: Record<string, { enabled?: boolean }>,
  ): string[] {
    const commonPaths = this.getCommonMeaningfulKeys(obj1, obj2)

    return commonPaths
      .map(path => path.split('.').pop() || path) // Extract field name from path
      .filter((fieldName, index, array) => array.indexOf(fieldName) === index) // Remove duplicates
      .filter(fieldName =>
        fieldName in fieldConfigurations
        && fieldConfigurations[fieldName]?.enabled,
      )
  }

  /**
   * Get both paths and field names for advanced use cases
   */
  static getAvailableFieldsWithPaths<T extends Record<string, any>>(
    obj1: T,
    obj2: T,
    fieldConfigurations: Record<string, { enabled?: boolean }>,
  ): Array<{ path: string, fieldName: string }> {
    const commonPaths = this.getCommonMeaningfulKeys(obj1, obj2)

    return commonPaths
      .map(path => ({
        path,
        fieldName: path.split('.').pop() || path,
      }))
      .filter(({ fieldName }) =>
        fieldName in fieldConfigurations
        && fieldConfigurations[fieldName]?.enabled,
      )
  }
}
