#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const TARGET_GROUPS = [
  {
    title: '# Pipeline-Durchschnittszeiten – AnyStyle',
    description: 'Mit und ohne DOI, gemittelt pro Referenz. Werte in Sekunden (Durchschnitt).',
    output: 'evaluation/out/pipeline-times-summary-anystyle.md',
    targets: [
      { file: 'evaluation/out/live-results.crossref.acs-anystyle.json', label: 'ACS – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.ama-anystyle.json', label: 'AMA – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.apa-anystyle.json', label: 'APA – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.chicago-anystyle.json', label: 'Chicago – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.harvard-anystyle.json', label: 'Harvard – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.ieee-anystyle.json', label: 'IEEE – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.mla-anystyle.json', label: 'MLA – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.nature-anystyle.json', label: 'Nature – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.oxford-anystyle.json', label: 'Oxford – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.springer-anystyle.json', label: 'Springer – AnyStyle' },
      { file: 'evaluation/out/live-results.crossref.vancouver-anystyle.json', label: 'Vancouver – AnyStyle' },
    ],
  },
  {
    title: '# Pipeline-Durchschnittszeiten – APA Varianten (AnyStyle)',
    description: 'Mit und ohne DOI, gemittelt pro Referenz. Werte in Sekunden (Durchschnitt).',
    output: 'evaluation/out/pipeline-times-summary-anystyle-apa-variants.md',
    targets: [
      { file: 'evaluation/out/live-results.crossref.apa-anystyle.json', label: 'APA – AnyStyle' },
      { file: 'evaluation/out/live-results.apa-anystyle-perturbed.json', label: 'APA Perturbed – AnyStyle' },
      { file: 'evaluation/out/live-results.fake-apa-anystyle.json', label: 'Fake APA – AnyStyle' },
    ],
  },
]

function ensureArray(value) {
  if (Array.isArray(value))
    return value
  return value ? [value] : []
}

function msToSeconds(value) {
  if (typeof value !== 'number' || !Number.isFinite(value))
    return null
  return value / 1000
}

function average(values) {
  if (!values.length)
    return null
  const sum = values.reduce((acc, value) => acc + value, 0)
  return sum / values.length
}

function extractAnyStyleTimings(entry, { matchKey, sources }) {
  const prediction = entry?.predictions ?? {}
  const anyStyle = prediction.anyStyle ?? {}
  const matchContainer = matchKey ? prediction[matchKey] ?? null : null

  const parseSeconds = msToSeconds(anyStyle.timings?.parseMs)
  const convertSeconds = msToSeconds(anyStyle.timings?.convertMs)

  const matchSeconds = msToSeconds(matchContainer?.timings?.matchMs)

  const searchSamples = new Map()
  let searchSum = 0
  if (matchContainer?.timings && Array.isArray(sources)) {
    for (const source of sources) {
      const key = `search:${source}`
      const rawValue = matchContainer.timings[key]
      const seconds = msToSeconds(rawValue)
      if (seconds !== null) {
        searchSum += seconds
        if (!searchSamples.has(source))
          searchSamples.set(source, [])
        searchSamples.get(source).push(seconds)
      }
    }
  }

  let pipelineTotal = 0
  let hasComponent = false
  if (parseSeconds !== null) {
    pipelineTotal += parseSeconds
    hasComponent = true
  }
  if (convertSeconds !== null) {
    pipelineTotal += convertSeconds
    hasComponent = true
  }
  if (searchSum > 0) {
    pipelineTotal += searchSum
    hasComponent = true
  }
  if (matchSeconds !== null) {
    pipelineTotal += matchSeconds
    hasComponent = true
  }

  const pipelineAnyStyle = hasComponent ? pipelineTotal : null

  return {
    parseSeconds,
    convertSeconds,
    matchSeconds,
    searchSamples,
    pipelineTotal: hasComponent ? pipelineTotal : null,
    pipelineAnyStyle,
  }
}

function aggregateSamples(entries, { matchKey, sources }) {
  const parseSamples = []
  const convertSamples = []
  const matchSamples = []
  const pipelineTotals = []
  const pipelineAnyStyleSamples = []
  const searchSamples = new Map()

  for (const entry of entries) {
    const timings = extractAnyStyleTimings(entry, { matchKey, sources })
    if (timings.parseSeconds !== null)
      parseSamples.push(timings.parseSeconds)
    if (timings.convertSeconds !== null)
      convertSamples.push(timings.convertSeconds)
    if (timings.matchSeconds !== null)
      matchSamples.push(timings.matchSeconds)
    if (timings.pipelineTotal !== null)
      pipelineTotals.push(timings.pipelineTotal)
    if (timings.pipelineAnyStyle !== null)
      pipelineAnyStyleSamples.push(timings.pipelineAnyStyle)
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
    parse: average(parseSamples),
    convert: average(convertSamples),
    match: average(matchSamples),
    pipelineTotal: average(pipelineTotals),
    pipelineAnyStyle: average(pipelineAnyStyleSamples),
    search: searchAverages,
  }
}

function formatSeconds(value) {
  if (value === null || Number.isNaN(value))
    return '—'
  return value.toFixed(3)
}

function buildRows(withDoi, withoutDoi) {
  const rows = []
  rows.push(['Pipeline gesamt', formatSeconds(withDoi.pipelineTotal), formatSeconds(withoutDoi.pipelineTotal)])
  rows.push(['AnyStyle parse', formatSeconds(withDoi.parse), formatSeconds(withoutDoi.parse)])
  rows.push(['AnyStyle convert', formatSeconds(withDoi.convert), formatSeconds(withoutDoi.convert)])

  const searchKeys = new Set([
    ...Object.keys(withDoi.search ?? {}),
    ...Object.keys(withoutDoi.search ?? {}),
  ])
  const sortedKeys = [...searchKeys].sort()
  for (const key of sortedKeys) {
    rows.push([
      `Suche: ${key}`,
      formatSeconds(withDoi.search?.[key] ?? null),
      formatSeconds(withoutDoi.search?.[key] ?? null),
    ])
  }

  rows.push(['Matching', formatSeconds(withDoi.match), formatSeconds(withoutDoi.match)])
  rows.push(['Pipeline (AnyStyle-Pfad)', formatSeconds(withDoi.pipelineAnyStyle), formatSeconds(withoutDoi.pipelineAnyStyle)])
  return rows
}

function buildMarkdown(group) {
  let markdown = `${group.title}\n\n`
  if (group.description)
    markdown += `${group.description}\n\n`

  for (const target of group.targets) {
    let parsed
    try {
      const raw = readFileSync(path.resolve(process.cwd(), target.file), 'utf8')
      parsed = JSON.parse(raw)
    }
    catch (error) {
      console.error(`⚠️  Konnte ${target.file} nicht lesen: ${error.message}`)
      continue
    }
    const entries = ensureArray(parsed.entries)
    const sources = ensureArray(parsed.sources)
    const withDoi = aggregateSamples(entries, { matchKey: 'anyStyleMatch', sources })
    const withoutDoi = aggregateSamples(entries, { matchKey: 'anyStyleMatchNoDoi', sources })

    const rows = buildRows(withDoi, withoutDoi)
    markdown += `## ${target.label}\n\n`
    markdown += '| Kennzahl | Mit DOI (s) | Ohne DOI (s) |\n'
    markdown += '| --- | ---: | ---: |\n'
    for (const [label, withValue, withoutValue] of rows) {
      markdown += `| ${label} | ${withValue} | ${withoutValue} |\n`
    }
    markdown += '\n'
  }

  return markdown
}

function main() {
  for (const group of TARGET_GROUPS) {
    const markdown = buildMarkdown(group)
    const targetPath = path.resolve(process.cwd(), group.output)
    writeFileSync(targetPath, markdown, 'utf8')
    console.log(`✅ Zusammenfassung geschrieben: ${path.relative(process.cwd(), targetPath)}`)
  }
}

main()
