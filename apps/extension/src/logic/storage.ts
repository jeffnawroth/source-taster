import type { ExtractionMode, ExtractionSettings, FieldWeights } from '@source-taster/types'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'

export const themeOption = useWebExtensionStorage('theme-option', 'system')
export const localeOption = useWebExtensionStorage('locale-option', 'en')
export const fieldWeights = useWebExtensionStorage('field-weights', {
  title: 25,
  authors: 20,
  year: 5,
  doi: 15,
  containerTitle: 10,
  volume: 5,
  issue: 3,
  pages: 2,
  arxivId: 8,
  pmid: 3,
  pmcid: 2,
  isbn: 1,
  issn: 1,
} as FieldWeights)

const defaultExtractionSettings: ExtractionSettings = {
  extractionMode: 'balanced' as ExtractionMode,
  enabledFields: {
    // Core fields
    title: true,
    authors: true,
    year: true,

    // Date fields
    month: false,
    day: false,
    yearSuffix: false,
    dateRange: false,
    noDate: false,
    inPress: false,
    approximateDate: false,
    season: false,

    // Identifiers
    doi: true,
    isbn: false,
    issn: false,
    pmid: false,
    pmcid: false,
    arxivId: false,

    // Publication details
    containerTitle: true,
    subtitle: false,
    volume: false,
    issue: false,
    pages: true,
    publisher: false,
    publicationPlace: false,
    url: false,
    sourceType: false,
    location: false,
    retrievalDate: false,
    edition: false,
    medium: false,
    originalTitle: false,
    originalLanguage: false,
    chapterTitle: false,

    // Academic/Institutional
    conference: false,
    institution: false,
    series: false,
    seriesNumber: false,
    degree: false,
    advisor: false,
    department: false,

    // Technical details
    pageType: false,
    paragraphNumber: false,
    volumePrefix: false,
    issuePrefix: false,
    supplementInfo: false,
    articleNumber: false,
    contributors: false,
    isStandAlone: false,
    yearEnd: false,
  },
}

export const extractionSettings = useWebExtensionStorage('extraction-settings', defaultExtractionSettings)

declare let chrome: any

// Utility to handle storing and retrieving data in chrome.storage

// Fetch the display option from storage
export function getDisplayOption(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('displayOption', (result: { displayOption: string }) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }
      else {
        resolve(result.displayOption || 'sidepanel') // Default to 'sidepanel' if no value is stored
      }
    })
  })
}

// Save the display option to storage
export function setDisplayOption(newValue: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ displayOption: newValue }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }
      else {
        resolve()
      }
    })
  })
}
