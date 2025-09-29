#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const OUTPUT_CONFIG_PATH = 'evaluation/openalex-works.json'
const OUTPUT_SUMMARY_PATH = 'evaluation/out/openalex-dataset-summary.json'
const REQUEST_LOG_PATH = 'evaluation/out/openalex-dataset-raw.json'

const CATEGORY_CONFIGS = [
  {
    category: 'Journal',
    target: 40,
    requests: [
      { filter: 'type:article,primary_location.source.type:journal,language:en|de', sort: 'publication_year:desc', perPage: 200 },
      { filter: 'type_crossref:journal-article,language:en|de', sort: 'publication_year:desc', perPage: 200 },
      { filter: 'type_crossref:journal-article', sort: 'cited_by_count:desc', perPage: 200 },
    ],
  },
  {
    category: 'Konferenz',
    target: 40,
    requests: [
      { filter: 'type:article,primary_location.source.type:conference,language:en|de', sort: 'publication_year:desc', perPage: 200 },
      { filter: 'type_crossref:proceedings-article|conference-paper,language:en|de', sort: 'publication_year:desc', perPage: 200 },
      { filter: 'type_crossref:proceedings-article|conference-paper', sort: 'cited_by_count:desc', perPage: 200 },
    ],
  },
  {
    category: 'Buch',
    target: 40,
    requests: [
      { filter: 'type:book,language:en', sort: 'publication_year:desc', target: 20 },
      { filter: 'type:book,language:de', sort: 'publication_year:desc', target: 20 },
      { filter: 'type:book', sort: 'publication_year:desc', target: 40 },
    ],
  },
  {
    category: 'Buchkapitel',
    target: 40,
    requests: [
      { filter: 'type:book-chapter,language:en', sort: 'publication_year:desc', target: 20 },
      { filter: 'type:book-chapter,language:de', sort: 'publication_year:desc', target: 20 },
      { filter: 'type:book-chapter', sort: 'publication_year:desc', target: 40 },
    ],
  },
  {
    category: 'Thesis/Report',
    target: 40,
    requests: [
      { filter: 'type:dissertation,language:en', sort: 'publication_year:desc', target: 20 },
      { filter: 'type:dissertation,language:de', sort: 'publication_year:desc', target: 10 },
      { filter: 'type:report,language:en', sort: 'publication_year:desc', target: 10 },
      { filter: 'type:report,language:de', sort: 'publication_year:desc', target: 10 },
      { filter: 'type:dissertation|type:report', sort: 'publication_year:desc', target: 40 },
    ],
  },
]

const OPENALEX_ENDPOINT = 'https://api.openalex.org/works'
const MAX_PER_PAGE = 200
const MAX_PAGES = 5
const DEFAULT_SELECT_FIELDS = 'id,display_name,type,publication_year,language,primary_location'
const POLITE_MAILTO = process.env.OPENALEX_MAILTO || process.env.OPENALEX_POLITE_MAILTO || null

async function main() {
  console.log('→ Starte automatisierten OpenAlex-Batch (6 × 40)')
  if (!POLITE_MAILTO) {
    console.warn('⚠️  Kein OPENALEX_MAILTO gesetzt – Anfragen laufen im common pool. Für stabilere Antwortzeiten empfiehlt sich eine Kontakt-Adresse (mailto).')
  }
  const fetchLog = []
  const dataset = []
  const summary = []
  const warnings = []

  for (const categoryConfig of CATEGORY_CONFIGS) {
    const { category, target } = categoryConfig
    console.log(`\n== ${category} ==`)
    const collected = new Map()
    const requestStats = []

    for (const request of categoryConfig.requests) {
      if (collected.size >= target) {
        break
      }
      const desired = request.target ?? (target - collected.size)
      const remaining = target - collected.size
      const requestTarget = Math.min(desired, remaining)
      if (requestTarget <= 0) {
        continue
      }
      console.log(`→ Hole bis zu ${requestTarget} Einträge mit Filter: ${request.filter}`)

      const response = await collectWithPaging(request, requestTarget)
      fetchLog.push({ category, filter: request.filter, sort: request.sort, entries: response.entries })
      requestStats.push({ filter: request.filter, count: response.entries.length, pagesUsed: response.pagesUsed })

      for (const entry of response.entries) {
        if (collected.has(entry.id)) {
          continue
        }
        collected.set(entry.id, { ...entry, category })
        if (collected.size >= target) {
          break
        }
      }
    }

    if (collected.size < target) {
      warnings.push(`Kategorie ${category}: Nur ${collected.size}/${target} Einträge gefunden. Bitte Filter anpassen.`)
    }

    const collectedArray = Array.from(collected.values()).slice(0, target)
    dataset.push(...collectedArray.map(entry => ({ openAlexId: entry.openAlexId, category: entry.category })))
    summary.push({ category, target, actual: collectedArray.length, requests: requestStats })

    console.log(`→ ${collectedArray.length}/${target} Einträge für ${category} übernommen`)
  }

  const configPayload = {
    style: 'apa',
    works: dataset,
  }

  const summaryPayload = {
    generatedAt: new Date().toISOString(),
    categories: summary,
    warnings,
  }

  await ensureDirectory(OUTPUT_CONFIG_PATH)
  await ensureDirectory(OUTPUT_SUMMARY_PATH)
  await ensureDirectory(REQUEST_LOG_PATH)

  await writeFile(path.resolve(process.cwd(), OUTPUT_CONFIG_PATH), JSON.stringify(configPayload, null, 2), 'utf8')
  await writeFile(path.resolve(process.cwd(), OUTPUT_SUMMARY_PATH), JSON.stringify(summaryPayload, null, 2), 'utf8')
  await writeFile(path.resolve(process.cwd(), REQUEST_LOG_PATH), JSON.stringify(fetchLog, null, 2), 'utf8')

  console.log('\n✅ Dataset-Konfiguration aktualisiert: evaluation/openalex-works.json')
  console.log(`ℹ️  Zusammenfassung: ${OUTPUT_SUMMARY_PATH}`)
  if (warnings.length) {
    console.warn('\n⚠️  Hinweise:')
    for (const warning of warnings) {
      console.warn(`- ${warning}`)
    }
  }
}

async function collectWithPaging(request, target) {
  const entries = []
  let page = 1
  let pagesUsed = 0

  while (entries.length < target && page <= (request.maxPages ?? MAX_PAGES)) {
    const perPage = request.perPage ?? MAX_PER_PAGE
    const url = buildUrl({ filter: request.filter, sort: request.sort, perPage, page })
    pagesUsed += 1
    console.log(`   · Anfrage ${pagesUsed}: ${url}`)
    const response = await fetchWithRetry(url)
    const mapped = mapResults(response.results ?? [])
    for (const entry of mapped) {
      entries.push(entry)
      if (entries.length >= target) {
        break
      }
    }
    if (!response.results || response.results.length < perPage) {
      break
    }
    page += 1
  }

  return { entries, pagesUsed }
}

function buildUrl({ filter, sort, perPage, page }) {
  const params = new URLSearchParams()
  if (filter) {
    params.set('filter', filter)
  }
  if (sort) {
    params.set('sort', sort)
  }
  params.set('per-page', String(perPage))
  params.set('page', String(page))
  params.set('select', DEFAULT_SELECT_FIELDS)
  if (POLITE_MAILTO) {
    params.set('mailto', POLITE_MAILTO)
  }
  return `${OPENALEX_ENDPOINT}?${params.toString()}`
}

async function fetchWithRetry(url, retries = 4, backoffMs = 800) {
  let attempt = 0
  let lastError = null
  while (attempt <= retries) {
    try {
      const headers = { Accept: 'application/json' }
      if (POLITE_MAILTO) {
        headers['User-Agent'] = `Source-Taster-Eval (mailto:${POLITE_MAILTO})`
      }
      const response = await fetch(url, { headers })
      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : backoffMs * (attempt + 1)
          console.warn(`   · Rate-Limit (${response.status}). Warte ${delay} ms`)
          await sleep(delay)
          attempt += 1
          continue
        }
        const text = await response.text()
        throw new Error(`Fehler ${response.status}: ${text.slice(0, 200)}`)
      }
      return response.json()
    }
    catch (error) {
      lastError = error
      if (attempt >= retries) {
        throw lastError
      }
      const delay = backoffMs * (attempt + 1)
      console.warn(`   · Fehler beim Abruf (${error?.message ?? error}). Neuer Versuch in ${delay} ms`)
      await sleep(delay)
      attempt += 1
    }
  }
  throw lastError ?? new Error('Unbekannter Abruffehler')
}

function mapResults(results) {
  return results.map(result => ({
    openAlexId: result.id,
    id: result.id?.split('/').pop() ?? null,
    title: result.display_name ?? null,
    type: result.type ?? null,
    publicationYear: result.publication_year ?? null,
    language: result.language ?? null,
    source: result.primary_location?.source?.display_name ?? null,
    sourceType: result.primary_location?.source?.type ?? null,
  }))
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error('\n❌ Batch-Erstellung fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})
