#!/usr/bin/env node
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-fallthrough */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'

const DEFAULT_INPUT = 'evaluation/out/live-input.crossref.json'
const DEFAULT_OUTPUT = 'evaluation/out/live-results.crossref.json'
const DEFAULT_API_URL = 'http://localhost:8000'
const DEFAULT_SOURCES = ['crossref', 'openalex', 'semanticscholar', 'europepmc', 'arxiv']
const DEFAULT_AI_PROVIDER = process.env.SOURCE_TASTER_AI_PROVIDER ?? 'openai'
const DEFAULT_AI_MODEL = process.env.SOURCE_TASTER_AI_MODEL ?? 'gpt-5.6-terra'
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
  // 'editor',
]
const DEFAULT_EARLY_TERMINATION = process.env.SOURCE_TASTER_EARLY_TERMINATION
  ? process.env.SOURCE_TASTER_EARLY_TERMINATION === 'true'
  : true
const DEFAULT_EARLY_THRESHOLD = process.env.SOURCE_TASTER_EARLY_THRESHOLD ? Number(process.env.SOURCE_TASTER_EARLY_THRESHOLD) : 90
const MATCHING_FIELD_CONFIG = {
  'title': { enabled: true, weight: 20 },
  'author': { enabled: true, weight: 18 },
  // 'editor': { enabled: true, weight: 6 },
  'issued': { enabled: true, weight: 10 },
  'container-title': { enabled: true, weight: 12 },
  'publisher': { enabled: true, weight: 5 },
  'volume': { enabled: true, weight: 6 },
  'issue': { enabled: true, weight: 3 },
  'page': { enabled: true, weight: 6 },
  'DOI': { enabled: true, weight: 16 },
  'URL': { enabled: true, weight: 4 },
}

function formatMs(ms) {
  if (!Number.isFinite(ms))
    return '—'
  return `${(ms / 1000).toFixed(2)}s (${Math.round(ms)}ms)`
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds))
    return '—'
  return `${seconds.toFixed(2)}s`
}

function summarizeSeconds(samples) {
  if (!samples?.length)
    return null
  const min = Math.min(...samples)
  const max = Math.max(...samples)
  const sum = samples.reduce((acc, value) => acc + value, 0)
  const avg = sum / samples.length
  return {
    count: samples.length,
    avg: formatSeconds(avg),
    min: formatSeconds(min),
    max: formatSeconds(max),
  }
}

function logSection(title) {
  console.log(`\n\n📊 ${title}`)
}

function logEntryHeader(index, total, entryId) {
  console.log(`\n🔎 Entry ${index}/${total}: ${entryId}`)
}

function logStep(message) {
  console.log(`   → ${message}`)
}

function logDetail(message) {
  console.log(`      • ${message}`)
}

function logSuccess(message) {
  console.log(`     ✅ ${message}`)
}

function logWarn(message) {
  console.warn(`     ⚠️  ${message}`)
}

function logError(message, error) {
  console.error(`     ❌ ${message}`)
  if (error)
    console.error(error)
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
    anyStyleOnly: false,
    alsoAnyStyle: false,
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
      case '--anystyle-only':
        options.anyStyleOnly = true
        break
      case '--also-anystyle':
        options.alsoAnyStyle = true
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
          logWarn(`Unknown option: ${arg}`)
        }
    }
  }

  if (!options.clientId) {
    logWarn('No X-Client-Id provided via --client-id or SOURCE_TASTER_CLIENT_ID. /api/extract will likely fail.')
  }

  if (!options.sources.length) {
    options.sources = [...DEFAULT_SOURCES]
  }

  return options
}

function printHelp() {
  console.log(`Live pipeline evaluation

Usage:
  pnpm evaluation:run-live -- --input evaluation/out/live-input.crossref.json --client-id <uuid>

Options:
  --input <path>        Path to the input file (default ${DEFAULT_INPUT})
  --output <path>       Output file for predictions (default ${DEFAULT_OUTPUT})
  --api-url <url>       Base URL of the API (default ${DEFAULT_API_URL})
  --client-id <uuid>    X-Client-Id header for /api/extract (required)
  --ai-provider <name>  AI provider (optional)
  --ai-model <name>     AI model (optional)
  --sources a,b,c       Comma-separated list of search providers (default ${DEFAULT_SOURCES.join(',')})
  --skip-search         Skip /api/search and /api/match (extraction only)
  --early-termination   Enable early termination in matching (default ${DEFAULT_EARLY_TERMINATION})
  --early-threshold n   Threshold 0-100 (default ${DEFAULT_EARLY_THRESHOLD})
  --no-doi              Run search/matching without DOI instead of the default mode
  --also-no-doi         Run the default mode and an additional pass without DOI
  --anystyle-only       Only run matching with AnyStyle metadata
  --also-anystyle       Run default matching plus an additional AnyStyle pass
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
  throw new Error('Dataset must be an array or an object with an "entries" field')
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

async function performMatching({ apiUrl, entry, entryId, sourceTasterResult, aggregatedCandidates, candidateIndex, durationStats, label }) {
  try {
    logStep(`[${label}] Matching with ${aggregatedCandidates.length} candidates`)
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
    const topCandidateMeta = matchSummary.candidateId ? candidateIndex.get(matchSummary.candidateId) ?? null : null
    const titleCandidate = Array.isArray(topCandidateMeta?.title) ? topCandidateMeta.title[0] : topCandidateMeta?.title
    logSuccess(`[${label}] Matching finished in ${formatMs(matchDuration)} (top score: ${matchSummary.topScore !== null ? matchSummary.topScore.toFixed(1) : '—'})`)
    logDetail(`[${label}] Evaluated candidates: ${matchSummary.scores.length}`)
    if (topCandidateMeta) {
      logDetail(`[${label}] Top candidate: ${titleCandidate ?? '—'} (${matchSummary.candidateId})`)
    }
    else if (matchSummary.candidateId) {
      logDetail(`[${label}] Top candidate ID: ${matchSummary.candidateId}`)
    }
    sourceTasterResult.matching = payload
    return payload
  }
  catch (error) {
    logError(`Matching failed (${entryId}) [${label}]`, error)
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
        name: `Single pass (n=${entryCount})`,
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

  logSection('Pipeline setup')
  logDetail(`Input: ${options.input}`)
  logDetail(`Output: ${options.output}`)
  logDetail(`API: ${options.apiUrl}`)
  logDetail(`Client-Id: ${options.clientId ?? '—'}`)
  logDetail(`AI: ${options.aiProvider ?? '—'} / ${options.aiModel ?? '—'}`)
  logDetail(`Search providers: ${options.sources.join(', ')}`)
  logDetail(`Search enabled: ${options.skipSearch ? 'no (--skip-search)' : 'yes'}`)
  logDetail(`Early termination: ${options.earlyTermination ? `yes (>= ${options.earlyThreshold})` : 'no'}`)
  if (options.noDoiOnly)
    logDetail('Mode: without DOI only')
  else if (options.alsoNoDoi)
    logDetail('Mode: include additional pass without DOI')

  logSection('Dataset')
  logDetail(`Total entries: ${entries.length}`)
  const metaKeys = Object.keys(meta ?? {})
  if (metaKeys.length)
    logDetail(`Meta fields: ${metaKeys.join(', ')}`)

  const outputEntries = []
  const durationStats = createDurationStats()
  const durationStatsNoDoi = (options.alsoNoDoi || options.noDoiOnly) ? createDurationStats() : null
  const durationStatsAnyStyle = (options.alsoAnyStyle || options.anyStyleOnly) ? createDurationStats() : null
  const durationStatsAnyStyleNoDoi = ((options.alsoAnyStyle || options.anyStyleOnly) && (options.alsoNoDoi || options.noDoiOnly)) ? createDurationStats() : null

  for (const [idx, entry] of entries.entries()) {
    const entryId = entry.id ?? `entry-${idx + 1}`
    const rawText = entry.raw ?? entry.originalText ?? entry.text

    if (!rawText || typeof rawText !== 'string') {
      logWarn(`Entry ${entryId}: No "raw" text found, skipped`)
      continue
    }

    logEntryHeader(idx + 1, entries.length, entryId)

    const sourceTasterResult = { metadata: null, timings: {}, errors: [] }
    const anyStyleResult = { metadata: null, tokens: null, timings: {}, errors: [] }

    // --- Source Taster Extraction ---
    if (!options.anyStyleOnly) {
      logStep('Extraktion via /api/extract')
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
        const extractedFields = sourceTasterResult.metadata ? Object.entries(sourceTasterResult.metadata).filter(([, value]) => value !== null && value !== undefined && value !== '').length : 0
        logSuccess(`Extraktion abgeschlossen in ${formatMs(sourceTasterResult.timings.extractionMs)} (${extractedFields} Felder)`)
        if (!sourceTasterResult.metadata)
          logWarn('Extraktion lieferte kein strukturierter Metadata-Objekt')
      }
      catch (error) {
        sourceTasterResult.errors.push(error.message ?? String(error))
        logError(`Extraction failed (${entryId})`, error)
      }
    }
    else {
      logDetail('AnyStyle-only mode: LLM extraction skipped')
    }

    // --- AnyStyle parse & convert ---
    logStep('AnyStyle.parse')
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
      if (durationStatsAnyStyle)
        durationStatsAnyStyle.anystyleParse.push(parseSec)
      if (durationStatsAnyStyleNoDoi)
        durationStatsAnyStyleNoDoi.anystyleParse.push(parseSec)
      anyStyleResult.tokens = parseResponse?.data?.references?.[0]?.tokens ?? null
      logSuccess(`AnyStyle.parse abgeschlossen in ${formatMs(anyStyleResult.timings.parseMs)}`)

      if (anyStyleResult.tokens) {
        logStep('AnyStyle.convert-to-csl')
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
        if (durationStatsAnyStyle)
          durationStatsAnyStyle.anystyleConvert.push(convertSec)
        if (durationStatsAnyStyleNoDoi)
          durationStatsAnyStyleNoDoi.anystyleConvert.push(convertSec)
        anyStyleResult.metadata = convertResponse?.data?.csl?.[0] ?? null
        anyStyleResult.rawResponse = { parse: parseResponse, convert: convertResponse }
        logSuccess(`AnyStyle.convert abgeschlossen in ${formatMs(anyStyleResult.timings.convertMs)}`)
        if (!anyStyleResult.metadata)
          logWarn('AnyStyle.convert lieferte kein CSL-Objekt')
      }
      else {
        logWarn('AnyStyle.parse returned no tokens; conversion skipped')
      }
    }
    catch (error) {
      anyStyleResult.errors.push(error.message ?? String(error))
      logError(`AnyStyle failed (${entryId})`, error)
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
        if (options.skipSearch)
          logWarn(`[${label}] Search disabled (--skip-search)`)
        else
          logWarn(`[${label}] No metadata available – skipping search`)
        return matchingResultLocal
      }
      const aggregatedCandidates = []
      const candidateIndex = new Map()

      logStep(`[${label}] Search & matching started`)

      for (const source of options.sources) {
        try {
          logStep(`[${label}] Searching @${source}`)
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

          logDetail(`[${label}] ${source}: ${candidates.length} candidates (${formatMs(duration)})`)
          if (!candidates.length)
            logWarn(`[${label}] ${source}: no candidates`)

          if (options.earlyTermination && aggregatedCandidates.length) {
            const currentMatch = await performMatching({
              apiUrl: options.apiUrl,
              entry,
              entryId,
              sourceTasterResult: resultTarget,
              aggregatedCandidates,
              candidateIndex,
              durationStats: statsTarget,
              label,
            })
            matchingResultLocal = currentMatch
            if (currentMatch) {
              resultTarget.matching = currentMatch
            }
            if ((currentMatch?.topScore ?? 0) >= options.earlyThreshold) {
              logSuccess(`[${label}] Early stop after hit from ${source} (score ${currentMatch.topScore?.toFixed(1) ?? '—'})`)
              break
            }
            else {
              logDetail(`[${label}] Score below threshold ${options.earlyThreshold}, continuing search`)
            }
          }
        }
        catch (error) {
          resultTarget.timings[`search:${source}`] = null
          logError(`Search (${source}) failed (${entryId}) [${label}]`, error)
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
          label,
        })
        if (matchingResultLocal) {
          resultTarget.matching = matchingResultLocal
        }
      }

      if (!aggregatedCandidates.length) {
        logWarn(`No candidates found for ${entryId} (sources: ${options.sources.join(', ')}) [${label}]`)
      }

      return matchingResultLocal
    }

    // Default mode (with DOI) unless only-no-doi
    if (!options.noDoiOnly && !options.anyStyleOnly) {
      const matchWithDoi = await runSearchAndMatch({
        metadata: sourceTasterResult.metadata,
        resultTarget: sourceTasterResult,
        statsTarget: durationStats,
        label: 'with DOI',
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
        logDetail(`[with DOI] pipeline.total: ${formatSeconds(totalSeconds)}`)
      }
    }

    // No-DOI mode
    if ((options.alsoNoDoi || options.noDoiOnly) && !options.anyStyleOnly) {
      const sourceTasterNoDoi = { metadata: stripDoiFromMetadata(sourceTasterResult.metadata), timings: {}, errors: [] }
      outputPrediction.sourceTasterNoDoi = sourceTasterNoDoi
      const matchNoDoi = await runSearchAndMatch({
        metadata: sourceTasterNoDoi.metadata,
        resultTarget: sourceTasterNoDoi,
        statsTarget: durationStatsNoDoi,
        label: 'without DOI',
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
        logDetail(`[without DOI] pipeline.total: ${formatSeconds(totalNoDoiSeconds)}`)
      }
    }

    // AnyStyle-only / additional mode
    if (options.anyStyleOnly || options.alsoAnyStyle) {
      if (anyStyleResult.metadata) {
        if (!options.noDoiOnly) {
          const anyStyleMatchResult = { metadata: anyStyleResult.metadata, timings: {}, errors: [] }
          outputPrediction.anyStyleMatch = anyStyleMatchResult
          const statsTargetForAnyStyle = options.anyStyleOnly ? durationStats : durationStatsAnyStyle
          const matchAnyStyle = await runSearchAndMatch({
            metadata: anyStyleMatchResult.metadata,
            resultTarget: anyStyleMatchResult,
            statsTarget: statsTargetForAnyStyle,
            label: 'AnyStyle',
          })
          if (matchAnyStyle) {
            anyStyleMatchResult.matching = matchAnyStyle
          }

          const totalAnyStyleSeconds = computeTotalDurationSeconds({
            extractionMs: undefined,
            parseMs: anyStyleResult.timings.parseMs,
            convertMs: anyStyleResult.timings.convertMs,
            matchMs: anyStyleMatchResult.timings.matchMs,
            searchTimings: anyStyleMatchResult.timings,
            sources: options.skipSearch ? [] : options.sources,
          })
          if (statsTargetForAnyStyle) {
            statsTargetForAnyStyle.total.push(totalAnyStyleSeconds)
          }
          logDetail(`[AnyStyle] pipeline.total: ${formatSeconds(totalAnyStyleSeconds)}`)
        }

        if (options.alsoNoDoi || options.noDoiOnly) {
          const metadataNoDoi = stripDoiFromMetadata(anyStyleResult.metadata)
          if (metadataNoDoi) {
            const anyStyleMatchNoDoiResult = { metadata: metadataNoDoi, timings: {}, errors: [] }
            outputPrediction.anyStyleMatchNoDoi = anyStyleMatchNoDoiResult
            const statsTargetForAnyStyleNoDoi = durationStatsAnyStyleNoDoi
              ?? (options.anyStyleOnly ? durationStats : durationStatsAnyStyle)
            const matchAnyStyleNoDoi = await runSearchAndMatch({
              metadata: anyStyleMatchNoDoiResult.metadata,
              resultTarget: anyStyleMatchNoDoiResult,
              statsTarget: statsTargetForAnyStyleNoDoi,
              label: 'AnyStyle without DOI',
            })
            if (matchAnyStyleNoDoi) {
              anyStyleMatchNoDoiResult.matching = matchAnyStyleNoDoi
            }

            const totalAnyStyleNoDoiSeconds = computeTotalDurationSeconds({
              extractionMs: undefined,
              parseMs: anyStyleResult.timings.parseMs,
              convertMs: anyStyleResult.timings.convertMs,
              matchMs: anyStyleMatchNoDoiResult.timings.matchMs,
              searchTimings: anyStyleMatchNoDoiResult.timings,
              sources: options.skipSearch ? [] : options.sources,
            })
            if (statsTargetForAnyStyleNoDoi) {
              statsTargetForAnyStyleNoDoi.total.push(totalAnyStyleNoDoiSeconds)
            }
            if (durationStatsAnyStyleNoDoi && statsTargetForAnyStyleNoDoi !== durationStatsAnyStyleNoDoi) {
              durationStatsAnyStyleNoDoi.total.push(totalAnyStyleNoDoiSeconds)
            }
            if (options.noDoiOnly && statsTargetForAnyStyleNoDoi !== durationStats) {
              durationStats.total.push(totalAnyStyleNoDoiSeconds)
            }
            logDetail(`[AnyStyle without DOI] pipeline.total: ${formatSeconds(totalAnyStyleNoDoiSeconds)}`)
          }
          else {
            logWarn('[AnyStyle without DOI] Metadata without DOI not available – skipping matching')
          }
        }
      }
      else {
        logWarn('[AnyStyle] No CSL metadata available – skipping matching')
      }
    }

    outputEntries.push({
      ...entry,
      predictions: outputPrediction,
    })
  }

  const summaryRows = []
  const collectSummary = (label, samples) => {
    const stats = summarizeSeconds(samples)
    if (stats) {
      summaryRows.push({
        Step: label,
        Samples: stats.count,
        Average: stats.avg,
        Minimum: stats.min,
        Maximum: stats.max,
      })
    }
  }

  collectSummary('sourceTaster.extract', durationStats.extraction)
  collectSummary('anyStyle.parse', durationStats.anystyleParse)
  collectSummary('anyStyle.convert', durationStats.anystyleConvert)
  for (const [source, samples] of Object.entries(durationStats.search)) {
    collectSummary(`search.${source}`, samples)
  }
  collectSummary('sourceTaster.match', durationStats.match)
  collectSummary('pipeline.total', durationStats.total)

  if (durationStatsNoDoi) {
    collectSummary('without DOI → sourceTaster.extract', durationStatsNoDoi.extraction)
    collectSummary('without DOI → anyStyle.parse', durationStatsNoDoi.anystyleParse)
    collectSummary('without DOI → anyStyle.convert', durationStatsNoDoi.anystyleConvert)
    for (const [source, samples] of Object.entries(durationStatsNoDoi.search)) {
      collectSummary(`without DOI → search.${source}`, samples)
    }
    collectSummary('without DOI → sourceTaster.match', durationStatsNoDoi.match)
    collectSummary('without DOI → pipeline.total', durationStatsNoDoi.total)
  }
  if (durationStatsAnyStyle && options.alsoAnyStyle) {
    collectSummary('AnyStyle → anyStyle.parse', durationStatsAnyStyle.anystyleParse)
    collectSummary('AnyStyle → anyStyle.convert', durationStatsAnyStyle.anystyleConvert)
    for (const [source, samples] of Object.entries(durationStatsAnyStyle.search)) {
      collectSummary(`AnyStyle → search.${source}`, samples)
    }
    collectSummary('AnyStyle → matching', durationStatsAnyStyle.match)
    collectSummary('AnyStyle → pipeline.total', durationStatsAnyStyle.total)
  }
  if (durationStatsAnyStyleNoDoi && (options.alsoAnyStyle || options.anyStyleOnly)) {
    collectSummary('AnyStyle without DOI → anyStyle.parse', durationStatsAnyStyleNoDoi.anystyleParse)
    collectSummary('AnyStyle without DOI → anyStyle.convert', durationStatsAnyStyleNoDoi.anystyleConvert)
    for (const [source, samples] of Object.entries(durationStatsAnyStyleNoDoi.search)) {
      collectSummary(`AnyStyle without DOI → search.${source}`, samples)
    }
    collectSummary('AnyStyle without DOI → matching', durationStatsAnyStyleNoDoi.match)
    collectSummary('AnyStyle without DOI → pipeline.total', durationStatsAnyStyleNoDoi.total)
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
          ? [{ name: `Single pass without DOI (n=${outputEntries.length})`, durationsSeconds: (() => {
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
        ...(durationStatsAnyStyle && options.alsoAnyStyle
          ? [{ name: `Single pass AnyStyle (n=${outputEntries.length})`, durationsSeconds: (() => {
              const durationsSeconds = {}
              if (durationStatsAnyStyle.anystyleParse.length)
                durationsSeconds['anyStyle.parse'] = [...durationStatsAnyStyle.anystyleParse]
              if (durationStatsAnyStyle.anystyleConvert.length)
                durationsSeconds['anyStyle.convert'] = [...durationStatsAnyStyle.anystyleConvert]
              if (durationStatsAnyStyle.total.length)
                durationsSeconds['pipeline.total'] = [...durationStatsAnyStyle.total]
              for (const [source, samples] of Object.entries(durationStatsAnyStyle.search)) {
                if (samples.length)
                  durationsSeconds[`search.${source}`] = [...samples]
              }
              if (durationStatsAnyStyle.match.length)
                durationsSeconds.matching = [...durationStatsAnyStyle.match]
              return durationsSeconds
            })() }]
          : []),
        ...(durationStatsAnyStyleNoDoi && (options.alsoAnyStyle || options.anyStyleOnly)
          ? [{ name: `Single pass AnyStyle without DOI (n=${outputEntries.length})`, durationsSeconds: (() => {
              const durationsSeconds = {}
              if (durationStatsAnyStyleNoDoi.anystyleParse.length)
                durationsSeconds['anyStyle.parse'] = [...durationStatsAnyStyleNoDoi.anystyleParse]
              if (durationStatsAnyStyleNoDoi.anystyleConvert.length)
                durationsSeconds['anyStyle.convert'] = [...durationStatsAnyStyleNoDoi.anystyleConvert]
              if (durationStatsAnyStyleNoDoi.total.length)
                durationsSeconds['pipeline.total'] = [...durationStatsAnyStyleNoDoi.total]
              for (const [source, samples] of Object.entries(durationStatsAnyStyleNoDoi.search)) {
                if (samples.length)
                  durationsSeconds[`search.${source}`] = [...samples]
              }
              if (durationStatsAnyStyleNoDoi.match.length)
                durationsSeconds.matching = [...durationStatsAnyStyleNoDoi.match]
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

  logSection('Runtime summary')
  if (summaryRows.length)
    console.table(summaryRows)
  else
    logDetail('No samples recorded')

  logSection('Output')
  logDetail(`File: ${options.output}`)
  logSuccess('Live pipeline finished')
}

main().catch((error) => {
  console.error('Live evaluation failed:')
  console.error(error)
  process.exitCode = 1
})
