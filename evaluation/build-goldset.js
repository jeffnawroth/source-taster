#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import Cite from 'citation-js'

const OPENALEX_BASE_URL = 'https://api.openalex.org/works/'
const DEFAULT_INPUT_PATH = 'evaluation/openalex-works.json'
const DEFAULT_GOLD_PATH = 'evaluation/gold-set.json'
const DEFAULT_RAW_PATH = 'evaluation/raw-references.txt'
const DEFAULT_META_PATH = 'evaluation/out/openalex-goldset-metadata.json'
const DEFAULT_CONCURRENCY = 3
const POLITE_MAILTO = process.env.OPENALEX_MAILTO || process.env.OPENALEX_POLITE_MAILTO || null

const TYPE_MAP = new Map([
  ['journal-article', 'article-journal'],
  ['journal-issue', 'article'],
  ['journal-volume', 'article'],
  ['book-chapter', 'chapter'],
  ['chapter', 'chapter'],
  ['book', 'book'],
  ['edited-book', 'book'],
  ['reference-entry', 'entry-encyclopedia'],
  ['report', 'report'],
  ['standard', 'standard'],
  ['dissertation', 'thesis'],
  ['dataset', 'dataset'],
  ['software', 'software'],
  ['preprint', 'manuscript'],
  ['posted-content', 'manuscript'],
  ['proceedings-article', 'paper-conference'],
  ['conference-proceeding', 'paper-conference'],
  ['other', 'document'],
])

function parseArgs() {
  const options = {
    input: DEFAULT_INPUT_PATH,
    gold: DEFAULT_GOLD_PATH,
    raw: DEFAULT_RAW_PATH,
    meta: DEFAULT_META_PATH,
    concurrency: DEFAULT_CONCURRENCY,
    style: 'apa',
    styleFormat: 'text',
    styleLang: 'en-US',
    mailto: POLITE_MAILTO,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--input') {
      options.input = args[++i]
    }
    else if (arg === '--gold') {
      options.gold = args[++i]
    }
    else if (arg === '--raw') {
      options.raw = args[++i]
    }
    else if (arg === '--meta') {
      options.meta = args[++i]
    }
    else if (arg === '--concurrency') {
      options.concurrency = Number.parseInt(args[++i] ?? '', 10) || DEFAULT_CONCURRENCY
    }
    else if (arg === '--style') {
      options.style = args[++i] ?? 'apa'
    }
    else if (arg === '--style-format') {
      options.styleFormat = args[++i] ?? 'text'
    }
    else if (arg === '--style-lang') {
      options.styleLang = args[++i] ?? 'en-US'
    }
    else if (arg === '--mailto') {
      options.mailto = args[++i] ?? POLITE_MAILTO
    }
    else if (!arg.startsWith('--') && i === 0) {
      options.input = arg
    }
  }

  return options
}

function normaliseOpenAlexId(value) {
  if (!value) {
    throw new Error('OpenAlex ID darf nicht leer sein')
  }
  const idMatch = String(value).match(/W\d+/i)
  if (!idMatch) {
    throw new Error(`Konnte OpenAlex-ID nicht erkennen: ${value}`)
  }
  return idMatch[0].toUpperCase()
}

async function readWorkConfig(inputPath) {
  const resolved = path.resolve(process.cwd(), inputPath)
  const content = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(content)

  if (Array.isArray(parsed)) {
    return {
      works: parsed.map(item => normaliseWorkEntry(item)),
      style: 'apa',
    }
  }

  if (!parsed || !Array.isArray(parsed.works)) {
    throw new Error('Eingabedatei muss entweder ein Array oder ein Objekt mit Feld "works" sein')
  }

  const style = parsed.style ?? 'apa'
  return {
    works: parsed.works.map(item => normaliseWorkEntry(item)),
    style,
  }
}

function normaliseWorkEntry(entry) {
  if (typeof entry === 'string') {
    return {
      id: normaliseOpenAlexId(entry),
      category: null,
      note: null,
    }
  }
  if (!entry || typeof entry !== 'object') {
    throw new Error('Ungültiger Eintrag in der Work-Liste')
  }
  return {
    id: normaliseOpenAlexId(entry.id ?? entry.openAlexId ?? entry.openalexId ?? entry.openAlex ?? entry.work ?? entry.url),
    category: entry.category ?? entry.type ?? entry.label ?? null,
    note: entry.note ?? null,
  }
}

async function fetchWithRetry(url, options = {}, retries = 4, backoffMs = 800, mailto = POLITE_MAILTO) {
  let attempt = 0
  let lastError = null
  while (attempt <= retries) {
    try {
      const headers = {
        Accept: 'application/json',
        ...(options.headers ?? {}),
      }
      if (mailto) {
        headers['User-Agent'] = `Source-Taster-Eval (mailto:${mailto})`
      }
      const response = await fetch(url, {
        ...options,
        headers,
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`OpenAlex-Eintrag nicht gefunden (${url})`)
        }
        if (response.status === 429 || response.status === 503) {
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : backoffMs * (attempt + 1)
          await sleep(delay)
          attempt += 1
          continue
        }
        const text = await response.text()
        throw new Error(`Fehler ${response.status} beim Abruf von ${url}: ${text}`)
      }
      return response.json()
    }
    catch (error) {
      lastError = error
      if (attempt >= retries) {
        throw lastError
      }
      await sleep(backoffMs * (attempt + 1))
    }
    attempt += 1
  }
  throw lastError ?? new Error(`Unbekannter Fehler beim Abruf von ${url}`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWork(id, mailto = POLITE_MAILTO) {
  let url = `${OPENALEX_BASE_URL}${id}`
  if (mailto) {
    url += url.includes('?') ? `&mailto=${encodeURIComponent(mailto)}` : `?mailto=${encodeURIComponent(mailto)}`
  }
  return fetchWithRetry(url, {}, 4, 800, mailto)
}

async function fetchAllWorks(workEntries, concurrency, mailto = POLITE_MAILTO) {
  const results = Array.from({ length: workEntries.length })
  let index = 0

  async function worker(workerIndex) {
    while (true) {
      const currentIndex = index
      if (currentIndex >= workEntries.length) {
        break
      }
      index += 1
      const { id } = workEntries[currentIndex]
      const work = await fetchWork(id, mailto)
      results[currentIndex] = work
      console.log(`[#${workerIndex + 1}] ${id} – ${work.display_name || work.title || 'ohne Titel'}`)
    }
  }

  const workerCount = Math.max(1, concurrency)
  await Promise.all(Array.from({ length: workerCount }, (_, workerIndex) => worker(workerIndex)))
  return results
}

function asCslDateParts(work) {
  if (work.publication_date) {
    const segments = work.publication_date.split('-').map(segment => Number.parseInt(segment, 10)).filter(Boolean)
    if (segments.length) {
      return [segments]
    }
  }
  if (work.publication_year) {
    return [[Number.parseInt(work.publication_year, 10)]]
  }
  return undefined
}

function mapTypeToCsl(workType) {
  if (!workType) {
    return 'article'
  }
  return TYPE_MAP.get(workType) ?? 'article'
}

function extractDoi(work) {
  const doi = work.doi ?? work.ids?.doi
  if (!doi) {
    return undefined
  }
  return doi.replace(/^https?:\/\/doi\.org\//i, '')
}

function extractPages(work) {
  const first = work.biblio?.first_page
  const last = work.biblio?.last_page
  if (first && last) {
    return `${first}-${last}`
  }
  return first ?? last ?? undefined
}

function toCSL(work) {
  const id = work.id?.split('/').pop() ?? work.id
  const type = mapTypeToCsl(work.type)
  const doi = extractDoi(work)
  const containerTitle = work.primary_location?.source?.display_name
    ?? work.host_venue?.display_name
    ?? work.journal?.display_name
    ?? undefined
  const landingUrl = work.primary_location?.landing_page_url
    ?? work.open_access?.oa_url
    ?? work.id
  const publisher = work.primary_location?.source?.publisher
    ?? work.host_venue?.publisher
    ?? work.primary_location?.source?.display_name
    ?? undefined
  const publisherPlace = work.primary_location?.source?.country_code
    ?? work.host_venue?.publisher_location
    ?? undefined

  return {
    id,
    type,
    'title': work.display_name ?? work.title ?? '',
    'author': extractAuthors(work),
    'issued': asCslDateParts(work) ? { 'date-parts': asCslDateParts(work) } : undefined,
    'language': work.language ?? undefined,
    'container-title': containerTitle,
    'volume': work.biblio?.volume ?? undefined,
    'issue': work.biblio?.issue ?? undefined,
    'page': extractPages(work),
    'DOI': doi,
    'URL': landingUrl,
    publisher,
    'publisher-place': publisherPlace,
    'citation-label': work.cited_by_count ? `C${work.cited_by_count}` : undefined,
    'source': 'OpenAlex',
    'original-title': work.original_title ?? undefined,
  }
}

function extractAuthors(work) {
  if (!Array.isArray(work.authorships) || work.authorships.length === 0) {
    return undefined
  }
  const authors = []
  for (const authorship of work.authorships) {
    const authorName = authorship.author?.display_name?.trim()
    const orcid = authorship.author?.orcid
    if (!authorName) {
      continue
    }
    const parsed = splitName(authorName)
    if (parsed.literal) {
      authors.push({ literal: parsed.literal })
    }
    else {
      const authorEntry = {
        family: parsed.family,
        given: parsed.given,
      }
      if (orcid) {
        authorEntry.ORCID = orcid
      }
      authors.push(authorEntry)
    }
  }
  return authors.length ? authors : undefined
}

function splitName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { literal: undefined }
  }
  if (fullName.includes(',')) {
    const [familyPart, givenPart] = fullName.split(',').map(part => part.trim()).filter(Boolean)
    if (familyPart && givenPart) {
      return { family: familyPart, given: givenPart }
    }
    return { literal: fullName }
  }
  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return { literal: parts[0] }
  }
  const family = parts.pop()
  const given = parts.join(' ')
  return { family, given }
}

function formatRawReference(csl, { template, format, lang } = {}) {
  const citationTemplate = template ?? 'apa'
  const outputFormat = format ?? 'text'
  const language = lang ?? 'en-US'

  try {
    const cite = new Cite(csl)
    const rendered = cite.format('bibliography', {
      template: citationTemplate,
      format: outputFormat,
      lang: language,
    })
    return normaliseBibliographyOutput(rendered)
  }
  catch (error) {
    console.warn(`⚠️  Konnte Referenz nicht im Stil "${citationTemplate}" ausgeben: ${error?.message ?? error}`)
    try {
      const citeFallback = new Cite(csl)
      const renderedFallback = citeFallback.format('bibliography', {
        template: 'apa',
        format: 'text',
        lang: language,
      })
      return normaliseBibliographyOutput(renderedFallback)
    }
    catch (fallbackError) {
      console.warn(`⚠️  Fallback auf einfache Formatierung: ${fallbackError?.message ?? fallbackError}`)
      return formatApaReference(csl)
    }
  }
}

function normaliseBibliographyOutput(output) {
  if (Array.isArray(output)) {
    return output.join('\n').trim()
  }
  return String(output ?? '').trim()
}

function formatApaReference(csl) {
  const authors = formatAuthorsApa(csl.author)
  const year = extractYear(csl)
  const title = csl.title ?? '[Ohne Titel]'
  const container = csl['container-title']
  const volume = csl.volume
  const issue = csl.issue
  const pages = csl.page
  const publisher = csl.publisher
  const doi = csl.DOI ? `https://doi.org/${csl.DOI}` : undefined
  const url = !doi && csl.URL ? csl.URL : undefined

  let reference = ''
  if (authors) {
    reference += `${authors} `
  }
  reference += year ? `(${year}). ` : '(o. J.). '
  reference += `${title}.`

  if (csl.type === 'book') {
    if (publisher) {
      reference += ` ${publisher}.`
    }
    if (doi || url) {
      reference += ` ${doi ?? url}`
    }
    return reference.trim()
  }

  if (csl.type === 'chapter') {
    if (container) {
      reference += ` In ${container}`
      if (pages) {
        reference += ` (S. ${pages}).`
      }
      else {
        reference += '. '
      }
    }
    if (publisher) {
      reference += ` ${publisher}.`
    }
    if (doi || url) {
      reference += ` ${doi ?? url}`
    }
    return reference.trim()
  }

  if (container) {
    reference += ` ${container}`
    const volumeIssue = buildVolumeIssue(volume, issue)
    if (volumeIssue) {
      reference += `, ${volumeIssue}`
    }
    if (pages) {
      reference += `, ${pages}`
    }
    reference += '. '
  }
  else if (publisher) {
    reference += ` ${publisher}. `
  }

  if (doi || url) {
    reference += `${doi ?? url}`
  }

  return reference.trim()
}

function buildVolumeIssue(volume, issue) {
  if (volume && issue) {
    return `${volume}(${issue})`
  }
  if (volume) {
    return volume
  }
  if (issue) {
    return `(${issue})`
  }
  return ''
}

function extractYear(csl) {
  const dateParts = csl.issued?.['date-parts']
  if (Array.isArray(dateParts) && dateParts.length > 0 && Array.isArray(dateParts[0]) && dateParts[0].length > 0) {
    return dateParts[0][0]
  }
  return undefined
}

function formatAuthorsApa(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return undefined
  }
  const formatted = authors.map((author) => {
    if (author.literal) {
      return author.literal
    }
    const family = author.family ?? ''
    const initials = author.given ? author.given.split(/[\s-]+/).filter(Boolean).map(part => `${part[0].toUpperCase()}.`).join(' ') : ''
    if (family && initials) {
      return `${family}, ${initials}`
    }
    return family || author.given || '[Unbekannt]'
  })

  if (formatted.length === 1) {
    return formatted[0]
  }
  if (formatted.length === 2) {
    return `${formatted[0]} & ${formatted[1]}`
  }
  return `${formatted.slice(0, -1).join(', ')}, & ${formatted.at(-1)}`
}

async function ensureDirectory(targetPath) {
  const dir = path.dirname(targetPath)
  await mkdir(dir, { recursive: true })
}

async function writeOutputs({ goldPath, rawPath, metaPath }, cslItems, rawReferences, metadata) {
  await ensureDirectory(goldPath)
  await ensureDirectory(rawPath)
  if (metaPath) {
    await ensureDirectory(metaPath)
  }

  await writeFile(goldPath, JSON.stringify({ references: cslItems }, null, 2), 'utf8')
  await writeFile(rawPath, rawReferences.join('\n\n'), 'utf8')
  if (metaPath) {
    await writeFile(metaPath, JSON.stringify({ items: metadata }, null, 2), 'utf8')
  }
}

function buildMetadataEntry(workEntry, work, cslItem, rawReference, formattingOptions = {}) {
  return {
    openAlexId: work.id,
    normalizedId: workEntry.id,
    category: workEntry.category,
    note: workEntry.note,
    title: work.display_name ?? work.title ?? null,
    type: work.type ?? null,
    cslType: cslItem.type,
    publicationYear: work.publication_year ?? null,
    language: work.language ?? null,
    rawReference,
    doi: cslItem.DOI ?? null,
    formatting: {
      template: formattingOptions.template ?? null,
      format: formattingOptions.format ?? null,
      lang: formattingOptions.lang ?? null,
    },
  }
}

async function main() {
  const options = parseArgs()
  const { works: workEntries, style: configStyle } = await readWorkConfig(options.input)
  const styleTemplate = options.style ?? configStyle ?? 'apa'

  if (!options.mailto) {
    console.warn('⚠️  Kein OPENALEX_MAILTO gesetzt – Anfragen an OpenAlex laufen im common pool. Für stabilere Antwortzeiten empfiehlt sich eine Kontakt-Adresse (mailto).')
  }

  console.log(`→ Lade ${workEntries.length} OpenAlex-Werke (Konfiguration: ${options.input})`)
  const works = await fetchAllWorks(workEntries, options.concurrency, options.mailto)

  const cslItems = []
  const rawReferences = []
  const metadata = []

  works.forEach((work, index) => {
    const workEntry = workEntries[index]
    const cslItem = toCSL(work)
    const rawReference = formatRawReference(cslItem, {
      template: styleTemplate,
      format: options.styleFormat,
      lang: options.styleLang,
    })
    cslItems.push({ ...cslItem, 'source': 'OpenAlex', 'original-id': work.id })
    rawReferences.push(rawReference)
    metadata.push(buildMetadataEntry(workEntry, work, cslItem, rawReference, {
      template: styleTemplate,
      format: options.styleFormat,
      lang: options.styleLang,
    }))
  })

  await writeOutputs({
    goldPath: path.resolve(process.cwd(), options.gold),
    rawPath: path.resolve(process.cwd(), options.raw),
    metaPath: options.meta ? path.resolve(process.cwd(), options.meta) : null,
  }, cslItems, rawReferences, metadata)

  console.log(`
✅ Fertig. ${cslItems.length} Referenzen exportiert.`)
  console.log(`• CSL-JSON: ${options.gold}`)
  console.log(`• Raw Text: ${options.raw}`)
  if (options.meta) {
    console.log(`• Metadaten: ${options.meta}`)
  }
}

main().catch((error) => {
  console.error('Gold-Set-Erstellung fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})
