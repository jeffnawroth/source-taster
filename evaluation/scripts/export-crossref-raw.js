#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const CROSSREF_WORKS_ENDPOINT = 'https://api.crossref.org/works'
const DOI_RESOLVER_BASE = 'https://doi.org/'

const DEFAULT_WORKS_FILE = 'evaluation/metadata/crossref-works.json'
const DEFAULT_RAW_FILE = 'evaluation/references/raw-references.crossref.txt'
const DEFAULT_STYLES = ['apa', 'mla', 'chicago', 'harvard', 'vancouver', 'ieee', 'nature', 'acs', 'ama', 'springer', 'oxford']
const DEFAULT_LOCALE = 'en-US'
const DEFAULT_TARGET = 25
const DEFAULT_CONCURRENCY = 5

const BUILTIN_STYLE_ALIASES = [
  { alias: 'apa', id: 'apa' },
  { alias: 'mla', id: 'modern-language-association' },
  { alias: 'chicago', id: 'chicago-author-date' },
  { alias: 'harvard', id: 'harvard-cite-them-right' },
  { alias: 'vancouver', id: 'vancouver' },
  { alias: 'ieee', id: 'ieee' },
  { alias: 'nature', id: 'nature' },
  { alias: 'acs', id: 'american-chemical-society' },
  { alias: 'ama', id: 'american-medical-association' },
  { alias: 'springer', id: 'springer-vancouver-author-date' },
  { alias: 'oxford', id: 'oxford-university-press-note' },
]

const STYLE_LOOKUP = new Map()
for (const style of BUILTIN_STYLE_ALIASES) {
  for (const key of [style.alias, style.id]) {
    STYLE_LOOKUP.set(key.toLowerCase(), style)
  }
}

const CATEGORY_CONFIGS = [
  { label: 'journal-article', filter: 'type:journal-article', sort: 'is-referenced-by-count', order: 'desc' },
  { label: 'proceedings-article', filter: 'type:proceedings-article', sort: 'is-referenced-by-count', order: 'desc' },
  { label: 'book', filter: 'type:book', sort: 'is-referenced-by-count', order: 'desc' },
  { label: 'book-chapter', filter: 'type:book-chapter', sort: 'is-referenced-by-count', order: 'desc' },
  { label: 'monograph', filter: 'type:monograph', sort: 'is-referenced-by-count', order: 'desc' },
  { label: 'report', filter: 'type:report', sort: 'is-referenced-by-count', order: 'desc' },
  { label: 'posted-content', filter: 'type:posted-content', sort: 'published', order: 'desc' },
  { label: 'dissertation', filter: 'type:dissertation', sort: 'is-referenced-by-count', order: 'desc' },
]

const POLITE_MAILTO = process.env.CROSSREF_MAILTO
  || process.env.OPENALEX_MAILTO
  || process.env.OPENALEX_POLITE_MAILTO
  || null

async function main() {
  const options = parseArgs()

  if (!POLITE_MAILTO) {
    console.warn('⚠️  No CROSSREF_MAILTO configured – Crossref requests a contact address in the User-Agent.')
  }

  const styleSummary = options.styles.map(style => style.alias).join(', ')
  console.log(`→ Starting Crossref export (styles: ${styleSummary}, per-category target: ${options.target}, concurrency: ${options.concurrency})`)

  const items = []
  const seenDois = new Set()

  for (const config of CATEGORY_CONFIGS) {
    console.log(`\n== ${config.label} ==`)
    const sample = await collectSample(config, options.target)
    for (const entry of sample) {
      const doi = entry?.DOI
      if (!doi)
        continue
      const key = doi.toLowerCase()
      if (seenDois.has(key))
        continue
      seenDois.add(key)
      items.push({ doi, category: config.label, bibliography: {} })
      if (getCountByCategory(items, config.label) >= options.target)
        break
    }
    console.log(`→ ${getCountByCategory(items, config.label)} DOIs collected`)
  }

  const rawByStyle = new Map()
  for (const style of options.styles) {
    console.log(`\n→ Fetching bibliographies (${style.alias.toUpperCase()})`)
    const segments = await mapWithConcurrency(items, options.concurrency, async (item) => {
      console.log(`   · Fetching ${style.alias.toUpperCase()} format: ${item.doi}`)
      const raw = await fetchBibliography(item.doi, style.id, options.locale)
      item.bibliography[style.alias] = raw
      return raw
    })
    rawByStyle.set(style.alias, segments)
  }

  console.log('\n→ Writing output files …')
  const worksPayload = {
    generatedAt: new Date().toISOString(),
    styles: options.styles,
    locale: options.locale,
    items,
  }

  await ensureDirectory(options.worksFile)

  await writeFile(path.resolve(process.cwd(), options.worksFile), JSON.stringify(worksPayload, null, 2), 'utf8')
  console.log(`✅ Crossref works exported: ${options.worksFile}`)

  for (const style of options.styles) {
    const filePath = buildRawFilePath(options.rawFile, style.alias)
    const segments = rawByStyle.get(style.alias) ?? []
    await ensureDirectory(filePath)
    await writeFile(path.resolve(process.cwd(), filePath), `${segments.join('\n\n')}\n`, 'utf8')
    console.log(`ℹ️ Raw references (${style.alias}) written to: ${filePath}`)
  }
}

function parseArgs() {
  const options = {
    worksFile: DEFAULT_WORKS_FILE,
    rawFile: DEFAULT_RAW_FILE,
    locale: DEFAULT_LOCALE,
    target: DEFAULT_TARGET,
    concurrency: DEFAULT_CONCURRENCY,
  }

  const args = process.argv.slice(2)
  let styleInputs = [...DEFAULT_STYLES]
  let stylesExplicitlySet = false
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--works') {
      options.worksFile = args[++i]
    }
    else if (arg === '--raw') {
      options.rawFile = args[++i]
    }
    else if (arg === '--style') {
      const value = args[++i]
      if (value) {
        if (!stylesExplicitlySet) {
          styleInputs = []
          stylesExplicitlySet = true
        }
        styleInputs.push(value)
      }
    }
    else if (arg === '--styles') {
      const collected = []
      if (i + 1 < args.length) {
        collected.push(args[++i])
        while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          collected.push(args[++i])
        }
      }
      const parts = collected
        .flatMap(entry => (entry ?? '').split(','))
        .map(part => part.trim())
        .filter(Boolean)
      if (parts.length > 0) {
        if (!stylesExplicitlySet) {
          styleInputs = []
          stylesExplicitlySet = true
        }
        styleInputs.push(...parts)
      }
    }
    else if (arg === '--locale') {
      options.locale = args[++i]
    }
    else if (arg === '--target') {
      options.target = Math.max(1, Math.min(100, Number.parseInt(args[++i] ?? '', 10) || DEFAULT_TARGET))
    }
    else if (arg === '--concurrency') {
      options.concurrency = Math.max(1, Number.parseInt(args[++i] ?? '', 10) || DEFAULT_CONCURRENCY)
    }
  }

  options.styles = resolveStyleList(styleInputs)
  if (options.styles.length === 0) {
    throw new Error('At least one style must be provided (--style/--styles).')
  }

  return options
}

function resolveStyleList(inputs) {
  const resolved = []
  const seen = new Set()
  for (const rawInput of inputs) {
    if (!rawInput)
      continue
    const value = String(rawInput).trim()
    if (!value)
      continue
    const match = STYLE_LOOKUP.get(value.toLowerCase())
    const alias = match?.alias ?? slugifyStyle(value)
    const id = match?.id ?? value
    if (!alias || seen.has(alias))
      continue
    resolved.push({ alias, id })
    seen.add(alias)
  }
  return resolved
}

function slugifyStyle(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function collectSample(config, target) {
  const sampleSize = Math.max(1, Math.min(target * 3, 100))
  const params = new URLSearchParams()
  params.set('sample', String(sampleSize))
  if (config.filter)
    params.set('filter', config.filter)
  if (config.sort)
    params.set('sort', config.sort)
  if (config.order)
    params.set('order', config.order)

  const url = `${CROSSREF_WORKS_ENDPOINT}?${params.toString()}`
  const response = await fetchWithRetry(url)
  return response?.message?.items ?? []
}

async function fetchBibliography(doi, style, locale) {
  const params = [`style=${style}`]
  if (locale)
    params.push(`locale=${locale}`)
  const headers = { Accept: `text/x-bibliography; ${params.join('; ')}` }
  const url = `${DOI_RESOLVER_BASE}${encodeURIComponent(doi)}`
  const text = await fetchWithRetry(url, headers, 'text')
  if (typeof text !== 'string') {
    throw new TypeError(`Unexpected response for DOI ${doi}`)
  }
  return text.trim()
}

async function fetchWithRetry(url, headers = {}, mode = 'json', retries = 4, backoffMs = 1000) {
  let attempt = 0
  let lastError = null

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': formatUserAgent(),
          'Accept': headers.Accept ?? 'application/json',
        },
      })
      if (!response.ok) {
        if (response.status === 404) {
          const error = new Error(`Not found (${url})`)
          error.status = response.status
          error.noRetry = true
          throw error
        }
        if (response.status === 429 || response.status === 503) {
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : backoffMs * (attempt + 1)
          console.warn(`   · Rate limited (${response.status}). Waiting ${delay} ms`)
          await sleep(delay)
          attempt += 1
          continue
        }
        const text = await response.text()
        const error = new Error(`Error ${response.status}: ${text.slice(0, 200)}`)
        error.status = response.status
        error.body = text
        if (response.status >= 400 && response.status < 500)
          error.noRetry = true
        throw error
      }

      if (mode === 'json') {
        return response.json()
      }
      return response.text()
    }
    catch (error) {
      lastError = error
      if (error?.noRetry || attempt >= retries) {
        throw lastError
      }
      const delay = backoffMs * (attempt + 1)
      console.warn(`   · Error (${error?.message ?? error}). Retrying in ${delay} ms`)
      await sleep(delay)
      attempt += 1
    }
  }

  throw lastError ?? new Error(`Request failed (${url})`)
}

function getCountByCategory(items, category) {
  return items.filter(item => item.category === category).length
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = Array.from({ length: items.length })
  let index = 0

  async function worker() {
    while (true) {
      const currentIndex = index
      if (currentIndex >= items.length)
        break
      index += 1
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

function buildRawFilePath(baseFile, styleAlias) {
  const styleSlug = slugifyStyle(styleAlias) || 'style'
  const parsed = path.parse(baseFile)
  const suffix = styleSlug ? `.${styleSlug}` : ''
  const baseName = `${parsed.name}${suffix}${parsed.ext}`
  return parsed.dir ? path.join(parsed.dir, baseName) : baseName
}

function formatUserAgent() {
  const parts = ['Source-Taster-Crossref-Export']
  if (POLITE_MAILTO) {
    parts.push(`(mailto:${POLITE_MAILTO})`)
  }
  return parts.join(' ')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error('Export failed:')
  console.error(error)
  process.exitCode = 1
})
