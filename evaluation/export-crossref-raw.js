#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const CROSSREF_WORKS_ENDPOINT = 'https://api.crossref.org/works'
const DOI_RESOLVER_BASE = 'https://doi.org/'

const DEFAULT_WORKS_FILE = 'evaluation/crossref-works.json'
const DEFAULT_RAW_FILE = 'evaluation/raw-references.crossref.txt'
const DEFAULT_STYLE = 'apa'
const DEFAULT_LOCALE = 'en-US'
const DEFAULT_TARGET = 2
const DEFAULT_CONCURRENCY = 5

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
    console.warn('⚠️  Kein CROSSREF_MAILTO gesetzt – Crossref bittet um eine Kontaktadresse im User-Agent.')
  }

  console.log(`→ Starte Crossref-Export (Stil: ${options.style}, Ziel pro Kategorie: ${options.target}, Concurrency: ${options.concurrency})`)

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
      items.push({ doi, category: config.label })
      if (getCountByCategory(items, config.label) >= options.target)
        break
    }
    console.log(`→ ${getCountByCategory(items, config.label)} DOIs gesammelt`)
  }

  const rawSegments = await mapWithConcurrency(items, options.concurrency, async (item) => {
    console.log(`   · APA-Format abrufen: ${item.doi}`)
    const raw = await fetchBibliography(item.doi, options.style, options.locale)
    item.raw = raw
    return raw
  })

  console.log('\n→ Schreibe Ausgabedateien …')
  const worksPayload = {
    generatedAt: new Date().toISOString(),
    style: options.style,
    locale: options.locale,
    items,
  }

  await ensureDirectory(options.worksFile)
  await ensureDirectory(options.rawFile)

  await writeFile(path.resolve(process.cwd(), options.worksFile), JSON.stringify(worksPayload, null, 2), 'utf8')
  await writeFile(path.resolve(process.cwd(), options.rawFile), `${rawSegments.join('\n\n')}\n`, 'utf8')

  console.log(`✅ Crossref-Werke exportiert: ${options.worksFile}`)
  console.log(`ℹ️ Rohreferenzen gesammelt in: ${options.rawFile}`)
}

function parseArgs() {
  const options = {
    worksFile: DEFAULT_WORKS_FILE,
    rawFile: DEFAULT_RAW_FILE,
    style: DEFAULT_STYLE,
    locale: DEFAULT_LOCALE,
    target: DEFAULT_TARGET,
    concurrency: DEFAULT_CONCURRENCY,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--works') {
      options.worksFile = args[++i]
    }
    else if (arg === '--raw') {
      options.rawFile = args[++i]
    }
    else if (arg === '--style') {
      options.style = args[++i]
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

  return options
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
    throw new TypeError(`Unerwartete Antwort für DOI ${doi}`)
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
          const error = new Error(`Nicht gefunden (${url})`)
          error.status = response.status
          error.noRetry = true
          throw error
        }
        if (response.status === 429 || response.status === 503) {
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : backoffMs * (attempt + 1)
          console.warn(`   · Rate-Limit (${response.status}). Warte ${delay} ms`)
          await sleep(delay)
          attempt += 1
          continue
        }
        const text = await response.text()
        const error = new Error(`Fehler ${response.status}: ${text.slice(0, 200)}`)
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
      console.warn(`   · Fehler (${error?.message ?? error}). Neuer Versuch in ${delay} ms`)
      await sleep(delay)
      attempt += 1
    }
  }

  throw lastError ?? new Error(`Abruf fehlgeschlagen (${url})`)
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
  console.error('Export fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})
