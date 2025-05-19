import type { ReferenceMetadata } from '../interface'
import {
  extractApaBookApproximateDateReference, // Neu
  extractApaBookChapterReference,
  extractApaBookReference,
  extractApaBookWithAuthorRoleReference,
  extractApaBookWithEditionReference,
} from './bookExtractors'
import { extractApaDictionaryEntryReference } from './dictionaryExtractors'
import {
  extractApaInPressJournalReference, // Neu
  extractApaJournalArticleNumberReference, // Neu
  extractApaJournalReference,
  extractApaJournalSupplementReference,
  extractApaJournalWithPrefixReference,
  extractApaJournalWithSeasonReference, // Neu
} from './journalExtractors'
import { extractApaArtworkReference, extractApaMediaReference } from './mediaExtractors'
import {
  extractApaNewspaperArticleReference,
  extractApaPrintNewspaperArticleReference,
  extractApaPrintNewspaperNoAuthorNoDateReference,
  extractApaPrintNewspaperNoAuthorReference,
  extractApaPrintNewspaperNoDateReference,
} from './newspaperExtractors'
import {
  extractApaBlogPostReference,
  extractApaNoAuthorReference,
  extractApaOrganizationWebpageReference,
  extractApaSourceWithParagraphReference,
  extractApaWebpageNoAuthorNoDateReference,
  extractApaWebpageNoDateReference,
  extractApaWebpageRetrievalReference,
  extractApaWebpageWithUnknownAuthorReference,
} from './webExtractors'

/**
 * Extracts metadata from APA 7 references of various types
 * Example: Andreff, W. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 * Example (2 authors): Andreff, W., & Staudohar, P. D. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 * Example (3 authors): Andreff, W., Staudohar, P. D., & Streefkerk, R. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 * Example (URL): Andreff, W., Staudohar, P. D., & Streefkerk, R. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://www.journal-of-sports-economics.com/european-model-finance
 * Example (Organization): Deloitte. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 * Example (Author with infix): Van der Molen, R. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 * Example (Author with suffix): Brown, A. T. W., Jr. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 * Example (Author with username): Trump, D. J. [@RealDonaldTrump]. (2020). The evolving model of social media. Journal of Digital Media, 1(3), 257–276. https://doi.org
 * Example (Username only): @pewdiepie. (2020). The evolving model of social media. Journal of Digital Media, 1(3), 257–276. https://doi.org
 * Example (Same author, same year): Cole, A. J. (2016a). Adoption of contactless payment solutions. Journal of Payment Research, 8(3), 157–173. https://doi.org/10.1177/152700250000100304
 * Example (Same author, same year, second reference): Cole, A. J. (2016b). Trust differences between payment providers. Journal of Payment Research, 8(4), 213–229. https://doi.org/10.1177/152700250000100305
 * Example (Unknown publication date): Scribbr. (n.d.). An introduction to research methods. Journal of Academic Research, 10(2), 45-60. https://www.scribbr.com/category/methodology/
 * Example (Book): Voss, C., & Raz, T. (2017). Never split the difference: Negotiating as if your life depended on it. Harper Business.
 * Example (Book with edition): Coghlan, D. (2019). Doing action research in your own organization (5th ed.). SAGE Publications.
 * Example (Book with revised edition): Smith, J. (2020). Research methods handbook (Rev. ed.). Oxford University Press.
 * Example (Book chapter): Gaffney, D., & Puschmann, C. (2014). Data collection on Twitter. In K. Weller, A. Bruns, J. Burgess, M. Mahrt, & C. Puschmann (Eds.), Twitter and society (pp. 55–67). Peter Lang Publishing.
 * Example (Book chapter with translator): Garcia, M. (2018). Modern poetry techniques. In R. Williams (Trans.), Contemporary literature studies (pp. 112-145). Academic Press.
 * Example (YouTube video): Bloomberg QuickTake. (2020, July 1). How to build a city around bikes, fast [Video]. YouTube. https://youtu.be/h-I6HFQXquU
 * Example (Artwork): Van Gogh, V. (1878–1882). [Portrait of a woman] [Painting]. Rijksmuseum, Amsterdam, The Netherlands.
 * Example (Unknown author): King James Bible. (2017). King James Bible Online. https://www.kingjamesbibleonline.org/
 * Example (Webpage with retrieval date): Worldometer. (n.d.). World population clock. Retrieved October 20, 2020, from https://www.worldometers.info/world-population/
 * Example (Blog post): McCombes, S. (2020, June 19). How to write a problem statement. Scribbr. https://www.scribbr.com/research-process/problem-statement/
 * Example (Newspaper article): Wakabayashi, D. (2020, October 21). Google antitrust fight thrusts low-key C.E.O. into the line of fire. The New York Times. https://www.nytimes.com/2020/10/21/technology/google-antitrust-sundar-pichai.html
 * Example (Print newspaper article): Popkin, G. (2020, August 12). Global warming could unlock carbon from tropical soil. The New York Times, D3.
 * Example (Journal article with volume prefix): Smith, P. (2018). Analysis of urban development. Journal of Urban Studies, Vol. 12(3), pp. 45-67. https://doi.org/10.1177/123456789
 * Example (Article with paragraph number): Smith, P. (2019). How to cite with paragraph numbers. Research Guide. https://example.com/citing-guide (para. 5)
 * Example (Journal supplement): Jones, R. (2020). Special analysis. Journal of Research, 15(Suppl. 2), S123-S135. https://doi.org/10.1177/12345678
 */
export function extractApaReference(reference: string): ReferenceMetadata[] | null {
  // Try each type of reference pattern in order from most specific to most general
  // Check for sources with specific formatting first

  // Die aproximativen und In-Press-Referenzen haben eine hohe Priorität
  const approximateDateResult = extractApaBookApproximateDateReference(reference)
  if (approximateDateResult)
    return approximateDateResult

  const inPressResult = extractApaInPressJournalReference(reference)
  if (inPressResult)
    return inPressResult

  // Artikel mit Artikelnummer oder Jahreszeit
  const articleNumberResult = extractApaJournalArticleNumberReference(reference)
  if (articleNumberResult)
    return articleNumberResult

  const seasonResult = extractApaJournalWithSeasonReference(reference)
  if (seasonResult)
    return seasonResult

  const sourceWithParagraphResult = extractApaSourceWithParagraphReference(reference)
  if (sourceWithParagraphResult)
    return sourceWithParagraphResult

  const journalSupplementResult = extractApaJournalSupplementReference(reference)
  if (journalSupplementResult)
    return journalSupplementResult

  const journalWithPrefixResult = extractApaJournalWithPrefixReference(reference)
  if (journalWithPrefixResult)
    return journalWithPrefixResult

  // Check for standard journal articles
  const journalResult = extractApaJournalReference(reference)
  if (journalResult)
    return journalResult

  // Check for online sources and blog posts BEFORE books to avoid misidentification
  // Prüfe zuerst Webseiten ohne Autor und ohne Datum mit Retrieval-Datum
  const webpageNoAuthorNoDateResult = extractApaWebpageNoAuthorNoDateReference(reference)
  if (webpageNoAuthorNoDateResult)
    return webpageNoAuthorNoDateResult

  // Prüfe dann Webseiten mit Autor aber ohne Datum
  const webpageNoDateResult = extractApaWebpageNoDateReference(reference)
  if (webpageNoDateResult)
    return webpageNoDateResult

  const organizationWebpageResult = extractApaOrganizationWebpageReference(reference)
  if (organizationWebpageResult)
    return organizationWebpageResult

  const webpageWithUnknownAuthorResult = extractApaWebpageWithUnknownAuthorReference(reference)
  if (webpageWithUnknownAuthorResult)
    return webpageWithUnknownAuthorResult

  const blogPostResult = extractApaBlogPostReference(reference)
  if (blogPostResult)
    return blogPostResult

  const webpageRetrievalResult = extractApaWebpageRetrievalReference(reference)
  if (webpageRetrievalResult)
    return webpageRetrievalResult

  // Check for news articles
  // Prüfe zuerst Print-Zeitungsartikel
  const printNewspaperResult = extractApaPrintNewspaperArticleReference(reference)
  if (printNewspaperResult)
    return printNewspaperResult

  // Prüfe Print-Zeitungsartikel ohne Datum
  const printNewspaperNoDateResult = extractApaPrintNewspaperNoDateReference(reference)
  if (printNewspaperNoDateResult)
    return printNewspaperNoDateResult

  // Prüfe Print-Zeitungsartikel ohne Autor
  const printNewspaperNoAuthorResult = extractApaPrintNewspaperNoAuthorReference(reference)
  if (printNewspaperNoAuthorResult)
    return printNewspaperNoAuthorResult

  // Prüfe Print-Zeitungsartikel ohne Autor UND ohne Datum
  const printNewspaperNoAuthorNoDateResult = extractApaPrintNewspaperNoAuthorNoDateReference(reference)
  if (printNewspaperNoAuthorNoDateResult)
    return printNewspaperNoAuthorNoDateResult

  // Dann Online-Zeitungsartikel
  const newspaperResult = extractApaNewspaperArticleReference(reference)
  if (newspaperResult)
    return newspaperResult

  const noAuthorResult = extractApaNoAuthorReference(reference)
  if (noAuthorResult)
    return noAuthorResult

  // Check for book chapters and books with specific formatting
  const bookChapterResult = extractApaBookChapterReference(reference)
  if (bookChapterResult)
    return bookChapterResult

  // Bücher mit Autorenrollen (wie Editor, Übersetzer) haben eine hohe Priorität
  const bookWithAuthorRoleResult = extractApaBookWithAuthorRoleReference(reference)
  if (bookWithAuthorRoleResult)
    return bookWithAuthorRoleResult

  const bookWithEditionResult = extractApaBookWithEditionReference(reference)
  if (bookWithEditionResult)
    return bookWithEditionResult

  // Wörterbuch-Einträge
  const dictionaryEntryResult = extractApaDictionaryEntryReference(reference)
  if (dictionaryEntryResult)
    return dictionaryEntryResult

  // Check for standard books
  const bookResult = extractApaBookReference(reference)
  if (bookResult)
    return bookResult

  // Check for media and artwork
  const mediaResult = extractApaMediaReference(reference)
  if (mediaResult)
    return mediaResult

  const artworkResult = extractApaArtworkReference(reference)
  if (artworkResult)
    return artworkResult

  // If none of the patterns match, return null
  return null
}
