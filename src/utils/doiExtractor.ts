// src/utils/doiExtractor.ts
export function extractDOIs(text: string): string[] {
  const extractedDOIs: string[] = []

  const doiPatterns = [
    /10\.\d{4,9}\/[-.\w;()/:]+/g, // Modern Crossref DOIs
    /10\.1002\/\S+/g, // Early Crossref DOIs
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group, regexp/optimal-quantifier-concatenation
    /10\.\d{4}\/\d+-\d+X?(\d+)\d+<\w+:\w*>\d+\.\d+\.\w+;\d/gi, // Rare DOI type 1
    /10\.1021\/\w\w\d+/g, // Rare DOI type 2
    /10\.1207\/\w+&\d+_\d+/g, // Rare DOI type 3
  ]

  // Extended pattern for URLs containing DOIs (global flag 'g' to match multiple occurrences)
  const urlPattern = /https?:\/\/[\w.]+\/doi\/(10\.\d{4,9}\/[-.\w;()/:]+)/gi

  // Check for embedded DOIs in URLs (using global flag 'g')
  let urlMatches
  // eslint-disable-next-line no-cond-assign
  while ((urlMatches = urlPattern.exec(text)) !== null) {
    extractedDOIs.push(urlMatches[1].replace(/\.$/, '')) // Remove any trailing period
  }

  // Check for normal DOIs based on the defined patterns
  doiPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      extractedDOIs.push(
        ...matches.map(match => match.replace(/\.$/, '')), // Remove any trailing period if present
      )
    }
  })

  // Remove duplicates
  return [...new Set(extractedDOIs)]
}
