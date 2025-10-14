#!/usr/bin/env node
/* eslint-disable no-console */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const STYLES = [
  'acs',
  'ama',
  'apa',
  'chicago',
  'harvard',
  'ieee',
  'mla',
  'nature',
  'oxford',
  'springer',
  'vancouver',
]

const STYLE_LABELS = {
  acs: 'ACS',
  ama: 'AMA',
  apa: 'APA',
  chicago: 'Chicago',
  harvard: 'Harvard',
  ieee: 'IEEE',
  mla: 'MLA',
  nature: 'Nature',
  oxford: 'Oxford',
  springer: 'Springer',
  vancouver: 'Vancouver',
}

function ensureArray(value) {
  if (Array.isArray(value))
    return value
  return value ? [value] : []
}

function average(values) {
  if (!values.length)
    return null
  const sum = values.reduce((acc, value) => acc + value, 0)
  return sum / values.length
}

function msToSeconds(value) {
  if (typeof value !== 'number' || !Number.isFinite(value))
    return null
  return value / 1000
}

function extractTimings(entry, { useNoDoi, sources }) {
  const prediction = entry?.predictions ?? null
  const baseTimings = prediction?.sourceTaster?.timings ?? {}
  const anyStyleTimings = prediction?.anyStyle?.timings ?? {}
  const noDoiTimings = prediction?.sourceTasterNoDoi?.timings ?? null
  const timings = useNoDoi ? (noDoiTimings ?? {}) : baseTimings

  const extractSeconds = msToSeconds(baseTimings.extractionMs)
  const parseSeconds = msToSeconds(anyStyleTimings.parseMs)
  const convertSeconds = msToSeconds(anyStyleTimings.convertMs)
  const matchSeconds = msToSeconds(timings.matchMs)

  let searchSum = 0
  const searchSamples = new Map()
  for (const source of sources) {
    const key = `search:${source}`
    const valueSeconds = msToSeconds(timings[key])
    if (valueSeconds !== null) {
      searchSum += valueSeconds
      if (!searchSamples.has(source))
        searchSamples.set(source, [])
      searchSamples.get(source).push(valueSeconds)
    }
  }

  let totalSeconds = 0
  let hasComponent = false
  if (extractSeconds !== null) {
    totalSeconds += extractSeconds
    hasComponent = true
  }
  if (parseSeconds !== null) {
    totalSeconds += parseSeconds
    hasComponent = true
  }
  if (convertSeconds !== null) {
    totalSeconds += convertSeconds
    hasComponent = true
  }
  if (searchSum > 0) {
    totalSeconds += searchSum
    hasComponent = true
  }
  if (matchSeconds !== null) {
    totalSeconds += matchSeconds
    hasComponent = true
  }

  const hasLlmComponent = extractSeconds !== null || searchSum > 0 || matchSeconds !== null
  const llmPipelineSeconds = hasLlmComponent
    ? (extractSeconds ?? 0) + searchSum + (matchSeconds ?? 0)
    : null

  const hasAnyStyleComponent = parseSeconds !== null || convertSeconds !== null || searchSum > 0 || matchSeconds !== null
  const anyStylePipelineSeconds = hasAnyStyleComponent
    ? (parseSeconds ?? 0) + (convertSeconds ?? 0) + searchSum + (matchSeconds ?? 0)
    : null

  return {
    extractSeconds,
    parseSeconds,
    convertSeconds,
    matchSeconds,
    searchSamples,
    searchSum,
    totalSeconds: hasComponent ? totalSeconds : null,
    llmPipelineSeconds,
    anyStylePipelineSeconds,
  }
}

function aggregateForScenario(entries, { useNoDoi, sources }) {
  const extractSamples = []
  const parseSamples = []
  const convertSamples = []
  const matchSamples = []
  const pipelineTotals = []
  const llmPipelineSamples = []
  const anyStylePipelineSamples = []
  const searchSamples = new Map()

  for (const entry of entries) {
    const timings = extractTimings(entry, { useNoDoi, sources })
    if (!timings)
      continue

    if (timings.extractSeconds !== null)
      extractSamples.push(timings.extractSeconds)
    if (timings.parseSeconds !== null)
      parseSamples.push(timings.parseSeconds)
    if (timings.convertSeconds !== null)
      convertSamples.push(timings.convertSeconds)
    if (timings.matchSeconds !== null)
      matchSamples.push(timings.matchSeconds)
    if (timings.totalSeconds !== null)
      pipelineTotals.push(timings.totalSeconds)
    if (timings.llmPipelineSeconds !== null)
      llmPipelineSamples.push(timings.llmPipelineSeconds)
    if (timings.anyStylePipelineSeconds !== null)
      anyStylePipelineSamples.push(timings.anyStylePipelineSeconds)

    for (const [source, values] of timings.searchSamples.entries()) {
      if (!searchSamples.has(source))
        searchSamples.set(source, [])
      searchSamples.get(source).push(...values)
    }
  }

  const searchAverages = {}
  for (const [source, values] of searchSamples.entries()) {
    const avg = average(values)
    if (avg !== null)
      searchAverages[source] = avg
  }

  return {
    extract: average(extractSamples),
    parse: average(parseSamples),
    convert: average(convertSamples),
    match: average(matchSamples),
    pipelineTotal: average(pipelineTotals),
    pipelineLlm: average(llmPipelineSamples),
    pipelineAnyStyle: average(anyStylePipelineSamples),
    search: searchAverages,
  }
}

function formatSeconds(value) {
  if (value === null || Number.isNaN(value))
    return '—'
  return value.toFixed(3)
}

function buildTableRows(withDoi, withoutDoi) {
  const rows = []
  rows.push(['Pipeline gesamt', formatSeconds(withDoi?.pipelineTotal ?? null), formatSeconds(withoutDoi?.pipelineTotal ?? null)])
  rows.push(['LLM-Extraktion', formatSeconds(withDoi?.extract ?? null), formatSeconds(withoutDoi?.extract ?? null)])
  rows.push(['AnyStyle parse', formatSeconds(withDoi?.parse ?? null), formatSeconds(withoutDoi?.parse ?? null)])
  rows.push(['AnyStyle convert', formatSeconds(withDoi?.convert ?? null), formatSeconds(withoutDoi?.convert ?? null)])

  const searchKeys = new Set([
    ...Object.keys(withDoi?.search ?? {}),
    ...Object.keys(withoutDoi?.search ?? {}),
  ])
  const sortedSearchKeys = [...searchKeys].sort((a, b) => a.localeCompare(b))
  for (const key of sortedSearchKeys) {
    const label = key ? key.replace(/^search:/, '') : key
    rows.push([
      `Suche: ${label}`,
      formatSeconds(withDoi?.search?.[key] ?? null),
      formatSeconds(withoutDoi?.search?.[key] ?? null),
    ])
  }

  rows.push(['Matching', formatSeconds(withDoi?.match ?? null), formatSeconds(withoutDoi?.match ?? null)])
  rows.push(['Pipeline (LLM-Pfad)', formatSeconds(withDoi?.pipelineLlm ?? null), formatSeconds(withoutDoi?.pipelineLlm ?? null)])
  rows.push(['Pipeline (AnyStyle-Pfad)', formatSeconds(withDoi?.pipelineAnyStyle ?? null), formatSeconds(withoutDoi?.pipelineAnyStyle ?? null)])

  return rows
}

async function buildSummary() {
  let markdown = '# Pipeline-Durchschnittszeiten (11 Zitierstile)\n\n'
  markdown += 'Mit und ohne DOI, gemittelt pro Referenz. Werte in Sekunden (Durchschnitt).\n\n'

  for (const style of STYLES) {
    const label = STYLE_LABELS[style] ?? style
    const inputPath = path.join('evaluation', 'out', `live-results.crossref.${style}.json`)
    let parsed
    try {
      const raw = await readFile(inputPath, 'utf8')
      parsed = JSON.parse(raw)
    }
    catch (error) {
      console.error(`⚠️  Konnte ${inputPath} nicht laden:`, error.message)
      continue
    }

    const entries = ensureArray(parsed.entries)
    const sources = ensureArray(parsed.sources)
    const withDoiMetrics = aggregateForScenario(entries, { useNoDoi: false, sources })
    const withoutDoiMetrics = aggregateForScenario(entries, { useNoDoi: true, sources })

    const rows = buildTableRows(withDoiMetrics, withoutDoiMetrics)
    markdown += `## ${label}\n\n`
    markdown += '| Kennzahl | Mit DOI (s) | Ohne DOI (s) |\n'
    markdown += '| --- | ---: | ---: |\n'
    for (const [labelText, withValue, withoutValue] of rows) {
      markdown += `| ${labelText} | ${withValue} | ${withoutValue} |\n`
    }
    markdown += '\n'
  }

  const targetPath = path.join('evaluation', 'out', 'pipeline-times-summary.md')
  await writeFile(targetPath, markdown)
  console.log(`✅ Zusammenfassung geschrieben: ${targetPath}`)
}

buildSummary().catch((error) => {
  console.error('❌ Fehler beim Erstellen der Pipeline-Zusammenfassung:', error)
  process.exitCode = 1
})
