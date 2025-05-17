/**
 * Interface representing metadata of a bibliographic reference.
 *
 * This interface provides a comprehensive structure for storing citation information
 * extracted from various sources, supporting multiple citation formats.
 *
 * @interface ReferenceMetadata
 *
 * @property {string} originalEntry - The original reference text
 * @property {string[] | null} [authors] - List of authors
 * @property {number | null} [year] - Publication year
 * @property {string | null} [month] - Month name (e.g., "January")
 * @property {number | null} [day] - Day of the month
 * @property {boolean} dateRange - Indicates if the reference has a date range
 * @property {number | null} [yearEnd] - End year for date ranges
 * @property {string | null} [yearSuffix] - Alphabetic identifiers for the year (a, b, c, etc.)
 * @property {boolean} [noDate] - Flag indicating if the reference uses "n.d." (no date)
 * @property {string | null} [title] - Title of the work
 * @property {string | null} [containerTitle] - Title of the containing work (e.g., journal, book, website)
 * @property {string | null} [volume] - Volume number
 * @property {string | null} [issue] - Issue number
 * @property {string | null} [pages] - Page references
 * @property {string | null} [doi] - Digital Object Identifier
 * @property {string | null} [publisher] - Publisher name
 * @property {string | null} [url] - Web URL
 * @property {string | null} [sourceType] - Type of source (e.g., "Video", "Painting")
 * @property {string | null} [location] - Location information (e.g., museum location)
 * @property {string | null} [retrievalDate] - Date when the reference was accessed or retrieved
 * @property {string | null} [edition] - Edition information (e.g., "5th ed.", "Rev. ed.")
 * @property {{ name: string, role: string }[] | null} [contributors] - Additional contributors with roles (editors, translators)
 * @property {string | null} [pageType] - Type of page reference (p./pp.)
 * @property {string | null} [paragraphNumber] - Paragraph reference information (para.)
 * @property {string | null} [volumePrefix] - Explicit volume designation (Vol./Vols.)
 * @property {string | null} [issuePrefix] - Explicit issue designation (No.)
 * @property {string | null} [supplementInfo] - Supplementary information (Suppl.)
 */
export interface ReferenceMetadata {
  originalEntry: string
  authors?: string[] | null
  year?: number | null
  month?: string | null
  day?: number | null
  dateRange: boolean
  yearEnd?: number | null
  yearSuffix?: string | null
  noDate?: boolean
  title?: string | null
  containerTitle?: string | null
  volume?: string | null
  issue?: string | null
  pages?: string | null
  doi?: string | null
  publisher?: string | null
  url?: string | null
  sourceType?: string | null
  location?: string | null
  retrievalDate?: string | null
  edition?: string | null
  contributors?: { name: string, role: string }[] | null
  pageType?: string | null
  paragraphNumber?: string | null
  volumePrefix?: string | null
  issuePrefix?: string | null
  supplementInfo?: string | null
}
