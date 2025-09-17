// // csl-json.ts
// // TypeScript types for CSL-JSON (based on schema v1.0: csl-data.json)
// // Generated for practical use in JS/TS apps. Matches the official keys (kebab-case) and common aliases.
// // Note: TypeScript can't fully enforce "additionalProperties: false", but runtime validation can (see Zod schema).

// /** Allowed CSL item types */
// export type CSLItemType =
//   | "article"
//   | "article-journal"
//   | "article-magazine"
//   | "article-newspaper"
//   | "bill"
//   | "book"
//   | "broadcast"
//   | "chapter"
//   | "classic"
//   | "collection"
//   | "dataset"
//   | "document"
//   | "entry"
//   | "entry-dictionary"
//   | "entry-encyclopedia"
//   | "event"
//   | "figure"
//   | "graphic"
//   | "hearing"
//   | "interview"
//   | "legal_case"
//   | "legislation"
//   | "manuscript"
//   | "map"
//   | "motion_picture"
//   | "musical_score"
//   | "pamphlet"
//   | "paper-conference"
//   | "patent"
//   | "performance"
//   | "periodical"
//   | "personal_communication"
//   | "post"
//   | "post-weblog"
//   | "regulation"
//   | "report"
//   | "review"
//   | "review-book"
//   | "software"
//   | "song"
//   | "speech"
//   | "standard"
//   | "thesis"
//   | "treaty"
//   | "webpage";

// /** Name object as per "name-variable" */
// export interface CSLName {
//   family?: string;
//   given?: string;
//   "dropping-particle"?: string;
//   "non-dropping-particle"?: string;
//   suffix?: string;
//   "comma-suffix"?: string | number | boolean;
//   "static-ordering"?: string | number | boolean;
//   /** Use when names cannot be parsed into family/given */
//   literal?: string;
//   /** Hint to processors that this string should be parsed into names */
//   "parse-names"?: string | number | boolean;
// }

// /** Structured date as per "date-variable".
//  *  Many processors also accept EDTF strings (e.g., "2020-05~").
//  */
// export interface CSLDate {
//   /** One or two date-parts entries:
//    *  [[year, month?, day?]] or [[year, month?, day?], [year, month?, day?]]
//    */
//   "date-parts"?: (Array<string | number>)[];
//   season?: string | number;
//   circa?: string | number | boolean;
//   /** Fully formatted string (e.g., "Spring 2020") */
//   literal?: string;
//   /** Raw, unprocessed input */
//   raw?: string;
// }

// /** Date may be given either as structured object or (commonly) as EDTF string */
// export type CSLDateValue = CSLDate | string;

// /** Core CSL JSON item (single entry). */
// export interface CSLItem {
//   /** REQUIRED */
//   type: CSLItemType;
//   /** REQUIRED */
//   id: string | number;

//   /** Optional common metadata */
//   "citation-key"?: string;
//   categories?: string[];
//   language?: string;
//   journalAbbreviation?: string;
//   shortTitle?: string;

//   /** Contributors */
//   author?: CSLName[];
//   chair?: CSLName[];
//   "collection-editor"?: CSLName[];
//   compiler?: CSLName[];
//   composer?: CSLName[];
//   "container-author"?: CSLName[];
//   contributor?: CSLName[];
//   curator?: CSLName[];
//   director?: CSLName[];
//   editor?: CSLName[];
//   "editorial-director"?: CSLName[];
//   "executive-producer"?: CSLName[];
//   guest?: CSLName[];
//   host?: CSLName[];
//   interviewer?: CSLName[];
//   illustrator?: CSLName[];
//   narrator?: CSLName[];
//   organizer?: CSLName[];
//   "original-author"?: CSLName[];
//   performer?: CSLName[];
//   producer?: CSLName[];
//   recipient?: CSLName[];
//   "reviewed-author"?: CSLName[];
//   "script-writer"?: CSLName[];
//   "series-creator"?: CSLName[];
//   translator?: CSLName[];

//   /** Dates */
//   accessed?: CSLDateValue;
//   "available-date"?: CSLDateValue;
//   "event-date"?: CSLDateValue;
//   issued?: CSLDateValue;
//   "original-date"?: CSLDateValue;
//   submitted?: CSLDateValue;

//   /** Strings & numbers */
//   abstract?: string;
//   annote?: string;
//   archive?: string;
//   archive_collection?: string;
//   archive_location?: string;
//   "archive-place"?: string;
//   authority?: string;
//   "call-number"?: string;
//   "chapter-number"?: string | number;
//   "citation-number"?: string | number;
//   "citation-label"?: string;
//   "collection-number"?: string | number;
//   "collection-title"?: string;
//   "container-title"?: string;
//   "container-title-short"?: string;
//   dimensions?: string;
//   division?: string;
//   DOI?: string;
//   edition?: string | number;
//   /** Deprecated: use "event-title" */
//   event?: string;
//   "event-title"?: string;
//   "event-place"?: string;
//   "first-reference-note-number"?: string | number;
//   genre?: string;
//   ISBN?: string;
//   ISSN?: string;
//   issue?: string | number;
//   jurisdiction?: string;
//   keyword?: string;
//   locator?: string | number;
//   medium?: string;
//   note?: string;
//   number?: string | number;
//   "number-of-pages"?: string | number;
//   "number-of-volumes"?: string | number;
//   "original-publisher"?: string;
//   "original-publisher-place"?: string;
//   "original-title"?: string;
//   page?: string | number;
//   "page-first"?: string | number;
//   part?: string | number;
//   "part-title"?: string;
//   PMCID?: string;
//   PMID?: string;
//   printing?: string | number;
//   publisher?: string;
//   "publisher-place"?: string;
//   references?: string;
//   "reviewed-genre"?: string;
//   "reviewed-title"?: string;
//   scale?: string;
//   section?: string;
//   source?: string;
//   status?: string;
//   supplement?: string | number;
//   title?: string;
//   "title-short"?: string;
//   URL?: string;
//   version?: string;
//   volume?: string | number;
//   "volume-title"?: string;
//   "volume-title-short"?: string;
//   "year-suffix"?: string;

//   /** Free-form metadata that doesn’t fit standard fields.
//    *  Prefer this over "note" for key-value storage.
//    */
//   custom?: Record<string, unknown>;
// }

// /** A CSL JSON document is an array of items */
// export type CSL = CSLItem[];
