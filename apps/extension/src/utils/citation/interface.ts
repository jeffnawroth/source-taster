/**
 * Represents an author or contributor in a bibliographic reference.
 *
 * @category Citation Components
 */
export interface Author {
  /** The full name of the author (typically in "Last, F. M." format) */
  name: string
  /** Optional role of the author (e.g., "editor", "translator") */
  role: string | null
}

/**
 * Contains all date-related information from a citation.
 *
 * @category Citation Components
 */
export interface DateInfo {
  /** The publication year, or null if not specified */
  year: number | null
  /** The month of publication (e.g., "January", "February") */
  month: string | null
  /** The day of publication */
  day: number | null
  /** Indicates if the reference spans a date range (e.g., "2019–2020") */
  dateRange: boolean
  /** If dateRange is true, specifies the end year */
  yearEnd: number | null
  /** Letter suffix for the year (e.g., "a", "b" in "2020a") */
  yearSuffix: string | null
  /** Indicates if the reference has no date (n.d.) */
  noDate: boolean
  /** Indicates if the work is marked as "in press" */
  inPress: boolean
  /** Indicates if the date is approximate (ca., circa, etc.) */
  approximateDate: boolean
  /** Season information (e.g., "Spring", "Summer") if applicable */
  season: string | null
}

/**
 * Contains information about the title of the work being cited.
 *
 * @category Citation Components
 */
export interface TitleInfo {
  /** The title of the work, or null if not specified */
  title: string | null
}

/**
 * Contains information about the source of the cited work.
 * Following APA style, this represents the "where" information.
 *
 * @category Citation Components
 */
export interface SourceInfo {
  /** Title of the containing work (e.g., journal name, book title) */
  containerTitle: string | null
  /** Volume number (typically for journals) */
  volume: string | null
  /** Issue number (typically for journals) */
  issue: string | null
  /** Page range (e.g., "123-145") */
  pages: string | null
  /** Digital Object Identifier */
  doi: string | null
  /** Publisher name */
  publisher: string | null
  /** URL where the work can be accessed */
  url: string | null
  /** Type of source (e.g., "Journal article", "Book", "Webpage") */
  sourceType: string
  /** Physical location information (e.g., museum location) */
  location: string | null
  /** When the source was retrieved (for online sources) */
  retrievalDate: string | null
  /** Edition information (e.g., "2nd ed.") */
  edition: string | null
  /** Additional contributors beyond the main authors */
  contributors: Author[] | null
  /** Type of page reference (e.g., "p." or "pp.") */
  pageType: string | null
  /** Paragraph number for sources without page numbers */
  paragraphNumber: string | null
  /** Prefix for volume (e.g., "Vol.", "Vols.") */
  volumePrefix: string | null
  /** Prefix for issue (e.g., "No.") */
  issuePrefix: string | null
  /** Supplement information (e.g., "Suppl. 2") */
  supplementInfo: string | null
  /** Article number for electronic journals without page numbers */
  articleNumber: string | null
  /** Indicates if the source is a standalone work */
  isStandAlone: boolean
}

/**
 * Complete metadata structure for an APA reference.
 * Follows APA 7th edition's four components: Who, When, What, Where.
 *
 * @category Citation Structure
 * @example
 * ```typescript
 * // Example of a journal article reference
 * const reference: ReferenceMetadata = {
 *   originalEntry: "Smith, J. D. (2020). The effects of climate change. Journal of Science, 45(2), 234-251.",
 *   author: [{ name: "Smith, J. D.", role: null }],
 *   date: { year: 2020, month: null, day: null, dateRange: false, yearEnd: null, yearSuffix: null,
 *          noDate: false, inPress: false, approximateDate: false, season: null },
 *   title: { title: "The effects of climate change" },
 *   source: { containerTitle: "Journal of Science", volume: "45", issue: "2", pages: "234-251",
 *            sourceType: "Journal article", isStandAlone: false }
 * };
 * ```
 */
export interface ReferenceMetadata {
  /** The original, unmodified reference string */
  originalEntry: string
  /** Authors of the work, or null if no authors are specified */
  author: Author[] | null
  /** Date information */
  date: DateInfo
  /** Title information */
  title: TitleInfo
  /** Source information */
  source: SourceInfo
}
