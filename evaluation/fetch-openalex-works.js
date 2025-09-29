#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-fallthrough */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const OPENALEX_BASE_URL = 'https://api.openalex.org/works'
const DEFAULT_OUTPUT_PATH = 'evaluation/out/openalex-works-result.json'
const DEFAULT_SELECT = 'id,display_name,type,publication_year,language,primary_location'

function parseArgs() {
  const options = {
    filter: [],
    search: null,
    sample: null,
    perPage: 25,
    page: 1,
    select: DEFAULT_SELECT,
    output: DEFAULT_OUTPUT_PATH,
    category: null,
    append: null,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--') {
      continue
    }
    switch (arg) {
      case '--filter':
      case '-f':
        options.filter.push(args[++i])
        break
      case '--search':
        options.search = args[++i]
        break
      case '--sample':
        options.sample = Number.parseInt(args[++i] ?? '', 10) || null
        break
      case '--per-page':
      case '--perPage':
        options.perPage = Number.parseInt(args[++i] ?? '', 10) || 25
        break
      case '--page':
        options.page = Number.parseInt(args[++i] ?? '', 10) || 1
        break
      case '--select':
        options.select = args[++i] ?? DEFAULT_SELECT
        break
      case '--output':
      case '-o':
        options.output = args[++i]
        break
      case '--category':
      case '-c':
        options.category = args[++i]
        break
      case '--append':
        options.append = args[++i]
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (!arg.startsWith('-') && !options.unknown) {
          options.unknown = arg
        }
        else {
          console.warn(`Unbekannte Option: ${arg}`)
        }
    }
  }

  if (options.unknown) {
    options.filter.push(options.unknown)
  }

  return options
}

function printHelp() {
  console.log(`OpenAlex Works Fetcher

Verwendung:
  pnpm evaluation:fetch-works -- --filter type:journal-article --per-page 50 --category Journal

Optionen:
  --filter, -f     Filter (mehrfach nutzbar, z.B. type:journal-article)
  --search         Volltextsuche (title_and_abstract.search:...)
  --sample         Random Sample Größe (schließt Paging aus)
  --per-page       Anzahl Ergebnisse pro Seite (Default 25, max 200)
  --page           Seite (Default 1)
  --select         OpenAlex Select-Felder (Default ${DEFAULT_SELECT})
  --category       Kategorie die in Ausgabe übernommen wird
  --output, -o     Ziel-Datei (Default ${DEFAULT_OUTPUT_PATH})
  --append         Optional: bestehende Config (evaluation/openalex-works.json) erweitern
  --help, -h       Hilfe anzeigen
`)
}

function buildRequestUrl(options) {
  const params = new URLSearchParams()
  params.set('per-page', String(options.perPage))
  params.set('page', String(options.page))
  if (options.filter.length) {
    params.set('filter', options.filter.join(','))
  }
  if (options.search) {
    params.set('search', options.search)
  }
  if (options.sample) {
    params.set('sample', String(options.sample))
  }
  if (options.select) {
    params.set('select', options.select)
  }
  return `${OPENALEX_BASE_URL}?${params.toString()}`
}

async function fetchWithRetry(url, retries = 4, backoffMs = 800) {
  let attempt = 0
  let lastError = null
  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
          const retryAfter = Number(response.headers.get('retry-after'))
          const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : backoffMs * (attempt + 1)
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
      await sleep(backoffMs * (attempt + 1))
      attempt += 1
    }
  }
  throw lastError ?? new Error('Unbekannter Fehler beim Abruf')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function mapResult(result, category) {
  return {
    openAlexId: result.id,
    id: result.id?.split('/').pop() ?? null,
    title: result.display_name ?? result.title ?? null,
    publicationYear: result.publication_year ?? null,
    language: result.language ?? null,
    type: result.type ?? null,
    source: result.primary_location?.source?.display_name ?? null,
    sourceType: result.primary_location?.source?.type ?? null,
    category,
  }
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(filePath)
  await mkdir(dir, { recursive: true })
}

async function writeOutput(outputPath, payload) {
  await ensureDirectory(outputPath)
  await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8')
}

async function appendToConfig(configPath, entries) {
  const resolved = path.resolve(process.cwd(), configPath)
  let config
  try {
    const raw = await readFile(resolved, 'utf8')
    config = JSON.parse(raw)
  }
  catch (error) {
    if (error.code === 'ENOENT') {
      config = { style: 'apa', works: [] }
    }
    else {
      throw error
    }
  }
  if (!Array.isArray(config.works)) {
    config.works = []
  }
  const existingIds = new Set(config.works.map(entry => entry.id ?? entry.openAlexId ?? entry.openalexId).filter(Boolean))
  for (const entry of entries) {
    const id = entry.id ?? entry.openAlexId
    if (!id || existingIds.has(id)) {
      continue
    }
    config.works.push({ openAlexId: entry.openAlexId, category: entry.category })
    existingIds.add(id)
  }
  await writeOutput(resolved, config)
}

async function main() {
  const options = parseArgs()
  const url = buildRequestUrl(options)
  console.log(`→ Anfrage an OpenAlex: ${url}`)
  const response = await fetchWithRetry(url)
  const results = Array.isArray(response.results) ? response.results : []

  if (!results.length) {
    console.warn('⚠️  Keine Ergebnisse erhalten. Prüfe Filter oder Paging.')
  }

  const entries = results.map(result => mapResult(result, options.category))

  const outputPath = path.resolve(process.cwd(), options.output)
  await writeOutput(outputPath, {
    meta: response.meta ?? null,
    query: {
      url,
      filter: options.filter,
      search: options.search,
      sample: options.sample,
      perPage: options.perPage,
      page: options.page,
      select: options.select,
      category: options.category,
    },
    results: entries,
  })
  console.log(`→ Ergebnisse gespeichert unter ${options.output}`)

  if (options.append) {
    await appendToConfig(options.append, entries)
    console.log(`→ ${entries.length} IDs in ${options.append} übernommen (Duplikate werden übersprungen).`)
  }
}

main().catch((error) => {
  console.error('Abruf fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})
