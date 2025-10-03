#!/usr/bin/env node
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'

const DEFAULT_INPUT = 'evaluation/out/live-input.crossref.json'
const DEFAULT_OUTPUT = 'evaluation/out/live-results.crossref.json'
const DEFAULT_API_URL = 'http://localhost:8000'
const DEFAULT_SOURCES = ['crossref', 'openalex', 'semanticscholar']
const DEFAULT_AI_PROVIDER = process.env.SOURCE_TASTER_AI_PROVIDER ?? 'openai'
const DEFAULT_AI_MODEL = process.env.SOURCE_TASTER_AI_MODEL ?? 'gpt-4.1'
const EXTRACT_FIELDS = [
  'author',
  'title',
  'issued',
  'container-title',
  'publisher',
  'volume',
  'issue',
  'page',
  'DOI',
  'URL',
]
const DEFAULT_EARLY_TERMINATION = process.env.SOURCE_TASTER_EARLY_TERMINATION === 'true'
const DEFAULT_EARLY_THRESHOLD = process.env.SOURCE_TASTER_EARLY_THRESHOLD ? Number(process.env.SOURCE_TASTER_EARLY_THRESHOLD) : 90
const MATCHING_FIELD_CONFIG = {
  'title': { enabled: true, weight: 20 },
  'author': { enabled: true, weight: 18 },
  'issued': { enabled: true, weight: 10 },
  'container-title': { enabled: true, weight: 12 },
  'publisher': { enabled: true, weight: 5 },
  'volume': { enabled: true, weight: 6 },
  'issue': { enabled: true, weight: 3 },
  'page': { enabled: true, weight: 6 },
  'DOI': { enabled: true, weight: 16 },
  'URL': { enabled: true, weight: 4 },
}

function parseArgs() {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    apiUrl: DEFAULT_API_URL,
    clientId: process.env.SOURCE_TASTER_CLIENT_ID ?? null,
    aiProvider: DEFAULT_AI_PROVIDER,
    aiModel: DEFAULT_AI_MODEL,
    sources: [...DEFAULT_SOURCES],
    skipSearch: false,
    earlyTermination: DEFAULT_EARLY_TERMINATION,
    earlyThreshold: DEFAULT_EARLY_THRESHOLD,
    noDoiOnly: false,
    alsoNoDoi: false,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--') {
      continue
    }
    switch (arg) {
      case '--input':
        options.input = args[++i]
        break
      case '--output':
        options.output = args[++i]
        break
      case '--api-url':
        options.apiUrl = args[++i]
        break
      case '--client-id':
        options.clientId = args[++i]
        break
      case '--ai-provider':
        options.aiProvider = args[++i] ?? DEFAULT_AI_PROVIDER
        break
      case '--ai-model':
        options.aiModel = args[++i] ?? DEFAULT_AI_MODEL
        break
      case '--sources':
        options.sources = args[++i].split(',').map(s => s.trim()).filter(Boolean)
        break
      case '--skip-search':
        options.skipSearch = true
        break
      case '--early-termination':
        options.earlyTermination = true
        break
      case '--early-threshold':
        options.earlyThreshold = Number(args[++i] ?? '') || DEFAULT_EARLY_THRESHOLD
        break
      case '--no-doi':
        options.noDoiOnly = true
        break
      case '--also-no-doi':
        options.alsoNoDoi = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (!arg.startsWith('-')) {
          options.input = arg
        }
        else {
          console.warn(`Unbekannte Option: ${arg}`)
        }
    }
  }

  if (!options.clientId) {
    console.warn('⚠️  Kein X-Client-Id über --client-id oder SOURCE_TASTER_CLIENT_ID gesetzt. /api/extract wird wahrscheinlich scheitern.')
  }

  if (!options.sources.length) {
    options.sources = [...DEFAULT_SOURCES]
  }

  return options
}

function printHelp() {
  console.log(`Live-Pipeline Evaluation

Verwendung:
  pnpm evaluation:run-live -- --input evaluation/out/live-input.crossref.json --client-id <uuid>

Parameter:
  --input <pfad>        Pfad zur Input-Datei (Default ${DEFAULT_INPUT})
  --output <pfad>       Ausgabe-Datei für Vorhersagen (Default ${DEFAULT_OUTPUT})
  --api-url <url>       Basis-URL der API (Default ${DEFAULT_API_URL})
  --client-id <uuid>    X-Client-Id Header für /api/extract (erforderlich)
  --ai-provider <name>  AI Provider (optional)
  --ai-model <name>     AI Modell (optional)
  --sources a,b,c       Liste der Such-Datenbanken (Default ${DEFAULT_SOURCES.join(',')})
  --skip-search         Überspringt /api/search & /api/match (nur Extraktion)
  --early-termination   Aktiviert Early Termination im Matching (Default ${DEFAULT_EARLY_TERMINATION})
  --early-threshold n   Schwellenwert 0-100 (Default ${DEFAULT_EARLY_THRESHOLD})
  --no-doi              Suche/Matching ohne DOI (anstelle der Standard-Variante)
  --also-no-doi         Zusätzlich zur Standard-Variante auch ohne DOI ausführen
`)
}

async function loadDataset(inputPath) {
  const absolute = path.resolve(process.cwd(), inputPath)
  const content = await readFile(absolute, 'utf8')
  const parsed = JSON.parse(content)
  if (Array.isArray(parsed.entries)) {
    return { meta: pickedMeta(parsed), entries: parsed.entries }
  }
  if (Array.isArray(parsed)) {
    return { meta: {}, entries: parsed }
  }
  throw new Error('Datensatz muss ein Array oder Objekt mit Feld "entries" sein')
}

function pickedMeta(data) {
  const meta = { ...data }
  delete meta.entries
  return meta
}

async function callApi({ apiUrl, path: apiPath, method = 'POST', body, headers = {}, clientId }) {
  const url = `${apiUrl.replace(/\/$/, '')}${apiPath}`
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }
  if (clientId) {
    requestHeaders['X-Client-Id'] = clientId
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`[${method} ${apiPath}] status ${response.status}: ${text}`)
  }
  return response.json()
}

function chooseExtractedReference(extracted, fallbackId) {
  if (Array.isArray(extracted) && extracted.length > 0) {
    return extracted[0]
  }
  return { id: fallbackId, metadata: null }
}

function buildExtractRequest(raw, options) {
  const request = {
    text: raw,
    extractionSettings: {
      extractionConfig: {
        variables: EXTRACT_FIELDS,
      },
    },
  }
  if (options.aiProvider || options.aiModel) {
    request.aiSettings = {
      ...(options.aiProvider ? { provider: options.aiProvider } : {}),
      ...(options.aiModel ? { model: options.aiModel } : {}),
    }
  }
  return request
}

function normalizeString(value) {
  return (value ?? '').toString().trim().toLowerCase()
}
function deriveMatchingSummary(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    return {
      top1Correct: false,
      candidateId: null,
      scores: [],
      topScore: null,
    }
  }
  const scores = evaluations.map(evalItem => ({
    candidateId: evalItem.candidateId,
    score: evalItem.matchDetails?.overallScore ?? null,
  }))
  const topCandidate = evaluations[0]
  const top1Correct = null

  return {
    top1Correct,
    candidateId: topCandidate.candidateId,
    scores,
    topScore: topCandidate.matchDetails?.overallScore ?? null,
  }
}

function attachMetadataToEvaluations(evaluations, candidatesIndex) {
  return evaluations.map(evalItem => ({
    ...evalItem,
    metadata: candidatesIndex.get(evalItem.candidateId) ?? null,
  }))
}

async function performMatching({ apiUrl, entry, entryId, sourceTasterResult, aggregatedCandidates, candidateIndex, durationStats }) {
  try {
    const matchStart = performance.now()
    const matchResponse = await callApi({
      apiUrl,
      path: '/api/match',
      body: {
        reference: {
          id: sourceTasterResult.metadata.id ?? entryId,
          metadata: sourceTasterResult.metadata,
        },
        candidates: aggregatedCandidates,
        matchingSettings: {
          matchingConfig: {
            fieldConfigurations: MATCHING_FIELD_CONFIG,
          },
        },
      },
    })
    const matchDuration = Math.round(performance.now() - matchStart)
    sourceTasterResult.timings.matchMs = matchDuration
    durationStats.match.push(matchDuration / 1000)

    const evaluations = Array.isArray(matchResponse?.data?.evaluations)
      ? [...matchResponse.data.evaluations].sort((a, b) => (b.matchDetails?.overallScore ?? 0) - (a.matchDetails?.overallScore ?? 0))
      : []
    const evaluationsWithMetadata = attachMetadataToEvaluations(evaluations, candidateIndex)
    const matchSummary = deriveMatchingSummary(evaluationsWithMetadata)

    const payload = {
      evaluations: evaluationsWithMetadata,
      ...matchSummary,
    }
    sourceTasterResult.matching = payload
    return payload
  }
  catch (error) {
    console.error(`Matching fehlgeschlagen (${entryId}):`, error.message ?? error)
    return null
  }
}

function buildPerformanceSummary(durationStats, entryCount) {
  const durationsSeconds = {}

  if (durationStats.extraction.length) {
    durationsSeconds['sourceTaster.extract'] = [...durationStats.extraction]
  }
  if (durationStats.anystyleParse.length) {
    durationsSeconds['anyStyle.parse'] = [...durationStats.anystyleParse]
  }
  if (durationStats.anystyleConvert.length) {
    durationsSeconds['anyStyle.convert'] = [...durationStats.anystyleConvert]
  }
  if (durationStats.total.length) {
    durationsSeconds['pipeline.total'] = [...durationStats.total]
  }
  for (const [source, samples] of Object.entries(durationStats.search)) {
    if (samples.length) {
      durationsSeconds[`search.${source}`] = [...samples]
    }
  }
  if (durationStats.match.length) {
    durationsSeconds['sourceTaster.match'] = [...durationStats.match]
  }

  if (Object.keys(durationsSeconds).length === 0) {
    return { scenarios: [] }
  }

  return {
    scenarios: [
      {
        name: `Einzelprüfung (n=${entryCount})`,
        durationsSeconds,
      },
    ],
  }
}

function createDurationStats() {
  return {
    extraction: [],
    anystyleParse: [],
    anystyleConvert: [],
    search: {},
    match: [],
    total: [],
  }
}

function stripDoiFromMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object')
    return metadata
  const clone = { ...metadata }
  if ('DOI' in clone) {
    delete clone.DOI
  }
  return clone
}

function computeTotalDurationSeconds({
  extractionMs,
  parseMs,
  convertMs,
  matchMs,
  searchTimings,
  sources,
}) {
  let totalMs = 0

  if (typeof extractionMs === 'number' && Number.isFinite(extractionMs)) {
    totalMs += extractionMs
  }
  if (typeof parseMs === 'number' && Number.isFinite(parseMs)) {
    totalMs += parseMs
  }
  if (typeof convertMs === 'number' && Number.isFinite(convertMs)) {
    totalMs += convertMs
  }
  if (typeof matchMs === 'number' && Number.isFinite(matchMs)) {
    totalMs += matchMs
  }

  if (searchTimings && Array.isArray(sources)) {
    for (const source of sources) {
      const key = `search:${source}`
      const value = searchTimings[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        totalMs += value
      }
    }
  }

  return totalMs / 1000
}

async function ensureDirectory(targetFile) {
  const dir = path.dirname(path.resolve(process.cwd(), targetFile))
  await mkdir(dir, { recursive: true })
}

async function main() {
  const options = parseArgs()
  const { meta, entries } = await loadDataset(options.input)

  const outputEntries = []
  const durationStats = createDurationStats()
  const durationStatsNoDoi = (options.alsoNoDoi || options.noDoiOnly) ? createDurationStats() : null

  for (const [idx, entry] of entries.entries()) {
    const entryId = entry.id ?? `entry-${idx + 1}`
    const rawText = entry.raw ?? entry.originalText ?? entry.text

    if (!rawText || typeof rawText !== 'string') {
      console.warn(`⚠️  Eintrag ${entryId}: Kein "raw" Text gefunden, übersprungen`)
      continue
    }

    console.log(`\n#${idx + 1}/${entries.length} – ${entryId}`)

    const sourceTasterResult = { metadata: null, timings: {}, errors: [] }
    const anyStyleResult = { metadata: null, tokens: null, timings: {}, errors: [] }

    // --- Source Taster Extraction ---
    try {
      const extractStart = performance.now()
      const extractPayload = buildExtractRequest(rawText, options)
      const extractResponse = await callApi({
        apiUrl: options.apiUrl,
        path: '/api/extract',
        body: extractPayload,
        clientId: options.clientId,
      })
      sourceTasterResult.timings.extractionMs = Math.round(performance.now() - extractStart)
      const extractSec = sourceTasterResult.timings.extractionMs / 1000
      durationStats.extraction.push(extractSec)
      if (durationStatsNoDoi)
        durationStatsNoDoi.extraction.push(extractSec)
      const extractedReference = chooseExtractedReference(extractResponse?.data?.references ?? [], entryId)
      sourceTasterResult.metadata = extractedReference?.metadata ?? null
      sourceTasterResult.rawResponse = extractResponse
    }
    catch (error) {
      sourceTasterResult.errors.push(error.message ?? String(error))
      console.error(`Extraction fehlgeschlagen (${entryId}):`, error)
    }

    // --- AnyStyle parse & convert ---
    try {
      const parseStart = performance.now()
      const parseResponse = await callApi({
        apiUrl: options.apiUrl,
        path: '/api/anystyle/parse',
        body: { input: [rawText] },
      })
      anyStyleResult.timings.parseMs = Math.round(performance.now() - parseStart)
      const parseSec = anyStyleResult.timings.parseMs / 1000
      durationStats.anystyleParse.push(parseSec)
      if (durationStatsNoDoi)
        durationStatsNoDoi.anystyleParse.push(parseSec)
      anyStyleResult.tokens = parseResponse?.data?.references?.[0]?.tokens ?? null

      if (anyStyleResult.tokens) {
        const convertStart = performance.now()
        const convertResponse = await callApi({
          apiUrl: options.apiUrl,
          path: '/api/anystyle/convert-to-csl',
          body: { references: [{ id: parseResponse.data.references[0].id, tokens: anyStyleResult.tokens }] },
        })
        anyStyleResult.timings.convertMs = Math.round(performance.now() - convertStart)
        const convertSec = anyStyleResult.timings.convertMs / 1000
        durationStats.anystyleConvert.push(convertSec)
        if (durationStatsNoDoi)
          durationStatsNoDoi.anystyleConvert.push(convertSec)
        anyStyleResult.metadata = convertResponse?.data?.csl?.[0] ?? null
        anyStyleResult.rawResponse = { parse: parseResponse, convert: convertResponse }
      }
    }
    catch (error) {
      anyStyleResult.errors.push(error.message ?? String(error))
      console.error(`AnyStyle fehlgeschlagen (${entryId}):`, error)
    }

    // --- Search & Match (optional) ---
    const outputPrediction = {
      sourceTaster: sourceTasterResult,
      anyStyle: anyStyleResult,
    }

    // Helper to execute search+match for a given metadata/result/stats tuple
    const runSearchAndMatch = async ({ metadata, resultTarget, statsTarget, label }) => {
      let matchingResultLocal = null
      if (options.skipSearch || !metadata) {
        return matchingResultLocal
      }
      const aggregatedCandidates = []
      const candidateIndex = new Map()

      for (const source of options.sources) {
        try {
          const searchStart = performance.now()
          const searchResponse = await callApi({
            apiUrl: options.apiUrl,
            path: `/api/search/${source}`,
            body: {
              references: [
                {
                  id: metadata.id ?? entryId,
                  metadata,
                },
              ],
            },
          })
          const duration = Math.round(performance.now() - searchStart)
          resultTarget.timings[`search:${source}`] = duration
          if (!statsTarget.search[source]) {
            statsTarget.search[source] = []
          }
          statsTarget.search[source].push(duration / 1000)

          const candidates = searchResponse?.data?.results?.[0]?.candidates ?? []
          candidates.forEach((candidate) => {
            aggregatedCandidates.push({ id: candidate.id, metadata: candidate.metadata })
            candidateIndex.set(candidate.id, candidate.metadata)
          })

          if (options.earlyTermination && aggregatedCandidates.length) {
            const currentMatch = await performMatching({
              apiUrl: options.apiUrl,
              entry,
              entryId,
              sourceTasterResult: resultTarget,
              aggregatedCandidates,
              candidateIndex,
              durationStats: statsTarget,
            })
            matchingResultLocal = currentMatch
            if (currentMatch) {
              resultTarget.matching = currentMatch
            }
            if ((currentMatch?.topScore ?? 0) >= options.earlyThreshold) {
              break
            }
          }
        }
        catch (error) {
          resultTarget.timings[`search:${source}`] = null
          console.error(`Search (${source}) fehlgeschlagen (${entryId}) [${label}]:`, error.message ?? error)
        }
      }

      if (!matchingResultLocal && aggregatedCandidates.length) {
        matchingResultLocal = await performMatching({
          apiUrl: options.apiUrl,
          entry,
          entryId,
          sourceTasterResult: resultTarget,
          aggregatedCandidates,
          candidateIndex,
          durationStats: statsTarget,
        })
        if (matchingResultLocal) {
          resultTarget.matching = matchingResultLocal
        }
      }

      if (!aggregatedCandidates.length) {
        console.warn(`⚠️  Keine Kandidaten für ${entryId} gefunden (Quellen: ${options.sources.join(', ')}) [${label}]`)
      }

      return matchingResultLocal
    }

    // Default mode (with DOI) unless only-no-doi
    if (!options.noDoiOnly) {
      const matchWithDoi = await runSearchAndMatch({
        metadata: sourceTasterResult.metadata,
        resultTarget: sourceTasterResult,
        statsTarget: durationStats,
        label: 'mit DOI',
      })
      // matchWithDoi already stored in sourceTasterResult inside performMatching

      if (typeof sourceTasterResult.timings.extractionMs === 'number') {
        const totalSeconds = computeTotalDurationSeconds({
          extractionMs: sourceTasterResult.timings.extractionMs,
          parseMs: anyStyleResult.timings.parseMs,
          convertMs: anyStyleResult.timings.convertMs,
          matchMs: sourceTasterResult.timings.matchMs,
          searchTimings: sourceTasterResult.timings,
          sources: options.skipSearch ? [] : options.sources,
        })
        durationStats.total.push(totalSeconds)
      }
    }

    // No-DOI mode
    if (options.alsoNoDoi || options.noDoiOnly) {
      const sourceTasterNoDoi = { metadata: stripDoiFromMetadata(sourceTasterResult.metadata), timings: {}, errors: [] }
      outputPrediction.sourceTasterNoDoi = sourceTasterNoDoi
      const matchNoDoi = await runSearchAndMatch({
        metadata: sourceTasterNoDoi.metadata,
        resultTarget: sourceTasterNoDoi,
        statsTarget: durationStatsNoDoi,
        label: 'ohne DOI',
      })
      // matchNoDoi stored in timings via performMatching; attach full result for clarity
      if (matchNoDoi) {
        sourceTasterNoDoi.matching = matchNoDoi
      }

      if (typeof sourceTasterResult.timings.extractionMs === 'number') {
        const totalNoDoiSeconds = computeTotalDurationSeconds({
          extractionMs: sourceTasterResult.timings.extractionMs,
          parseMs: anyStyleResult.timings.parseMs,
          convertMs: anyStyleResult.timings.convertMs,
          matchMs: sourceTasterNoDoi.timings.matchMs,
          searchTimings: sourceTasterNoDoi.timings,
          sources: options.skipSearch ? [] : options.sources,
        })
        if (durationStatsNoDoi) {
          durationStatsNoDoi.total.push(totalNoDoiSeconds)
        }
        if (options.noDoiOnly) {
          durationStats.total.push(totalNoDoiSeconds)
        }
      }
    }

    outputEntries.push({
      ...entry,
      predictions: outputPrediction,
    })
  }

  const outputPayload = {
    generatedAt: new Date().toISOString(),
    apiUrl: options.apiUrl,
    sources: options.sources,
    skipSearch: options.skipSearch,
    meta,
    performance: {
      scenarios: [
        ...buildPerformanceSummary(durationStats, outputEntries.length).scenarios,
        ...(durationStatsNoDoi
          ? [{ name: `Einzelprüfung ohne DOI (n=${outputEntries.length})`, durationsSeconds: (() => {
              const durationsSeconds = {}
              if (durationStatsNoDoi.extraction.length)
                durationsSeconds['sourceTaster.extract'] = [...durationStatsNoDoi.extraction]
              if (durationStatsNoDoi.anystyleParse.length)
                durationsSeconds['anyStyle.parse'] = [...durationStatsNoDoi.anystyleParse]
              if (durationStatsNoDoi.anystyleConvert.length)
                durationsSeconds['anyStyle.convert'] = [...durationStatsNoDoi.anystyleConvert]
              if (durationStatsNoDoi.total.length)
                durationsSeconds['pipeline.total'] = [...durationStatsNoDoi.total]
              for (const [source, samples] of Object.entries(durationStatsNoDoi.search)) {
                if (samples.length)
                  durationsSeconds[`search.${source}`] = [...samples]
              }
              if (durationStatsNoDoi.match.length)
                durationsSeconds['sourceTaster.match'] = [...durationStatsNoDoi.match]
              return durationsSeconds
            })() }]
          : []),
      ],
    },
    entries: outputEntries,
  }

  const outputPath = path.resolve(process.cwd(), options.output)
  await ensureDirectory(outputPath)
  await writeFile(outputPath, JSON.stringify(outputPayload, null, 2), 'utf8')
  console.log(`\n✅ Live-Pipeline Ergebnisse gespeichert unter ${options.output}`)
}

main().catch((error) => {
  console.error('Live-Evaluation fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})
