#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_RESULTS_PATH = 'evaluation/out/live-results.crossref.json'
const OUTPUT_DIR = 'evaluation/out'
const DEFAULT_BUCKET_THRESHOLDS = parseBucketThresholdString(process.env.SOURCE_TASTER_BUCKET_THRESHOLDS) ?? [100, 85, 70]
let MATCH_SCORE_BUCKET_THRESHOLDS = [...DEFAULT_BUCKET_THRESHOLDS]

function pickInputPath() {
  const [, , maybePathArg] = process.argv
  if (maybePathArg && !maybePathArg.startsWith('-')) {
    return maybePathArg
  }
  const flagIndex = process.argv.indexOf('--input')
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1]
  }
  return DEFAULT_RESULTS_PATH
}

function getBucketThresholdsFromArgs() {
  const flagIndex = process.argv.indexOf('--bucket-thresholds')
  if (flagIndex === -1) {
    return null
  }
  const value = process.argv[flagIndex + 1]
  if (!value) {
    return null
  }
  return parseBucketThresholdString(value)
}

function formatNumber(value, fractionDigits = 2) {
  if (value === null || value === undefined) {
    return 'n/a'
  }
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 'n/a'
  }
  return numericValue.toFixed(fractionDigits)
}

function computeMatchingMetricsFor(entries, getMatching) {
  const scoresByType = new Map()
  const scoresByStyle = new Map()
  const missing = []

  for (const entry of entries) {
    const matching = getMatching(entry)
    if (!matching) {
      missing.push(entry.id ?? entry.referenceId ?? 'unknown')
      continue
    }
    const topScore = matching.topScore ?? matching.evaluations?.[0]?.matchDetails?.overallScore ?? null
    if (topScore === null || Number.isNaN(topScore)) {
      missing.push(entry.id ?? entry.referenceId ?? 'unknown')
      continue
    }
    const type = entry.type ?? entry.category ?? 'Unknown'
    const typeList = scoresByType.get(type) ?? []
    typeList.push(topScore)
    scoresByType.set(type, typeList)

    const style = entry.style ?? entry.formatting?.template ?? entry.predictions?.sourceTaster?.formatting?.template ?? null
    if (style) {
      const styleList = scoresByStyle.get(style) ?? []
      styleList.push(topScore)
      scoresByStyle.set(style, styleList)
    }
  }

  const perType = []
  let allScores = []
  for (const [type, scores] of scoresByType.entries()) {
    const stats = computeScoreStats(scores)
    perType.push({ type, ...stats })
    allScores = allScores.concat(scores)
  }

  perType.sort((a, b) => a.type.localeCompare(b.type, 'en'))

  const perStyle = []
  for (const [style, scores] of scoresByStyle.entries()) {
    const stats = computeScoreStats(scores)
    perStyle.push({ style, ...stats })
  }
  perStyle.sort((a, b) => a.style.localeCompare(b.style, 'en'))

  const overallStats = computeScoreStats(allScores)

  return {
    perType,
    perStyle,
    overall: overallStats,
    missing,
    thresholds: [...MATCH_SCORE_BUCKET_THRESHOLDS],
  }
}

function computeMatchingMetrics(entries) {
  return computeMatchingMetricsFor(entries, e => e.predictions?.sourceTaster?.matching)
}

function computeMatchingMetricsAnyStyle(entries) {
  return computeMatchingMetricsFor(entries, e => e.predictions?.anyStyleMatch?.matching)
}

function computeMatchingMetricsAnyStyleNoDoi(entries) {
  return computeMatchingMetricsFor(entries, e => e.predictions?.anyStyleMatchNoDoi?.matching)
}

function calculateStats(samples) {
  if (!samples || samples.length === 0) {
    return { average: null, stdDev: null, throughput: null }
  }
  const average = samples.reduce((sum, value) => sum + value, 0) / samples.length
  const variance = samples.reduce((sum, value) => sum + (value - average) ** 2, 0) / samples.length
  const stdDev = Math.sqrt(variance)
  const throughput = average === 0 ? null : 60 / average
  return { average, stdDev, throughput }
}

function computePerformanceMetrics(performance) {
  if (!performance || !Array.isArray(performance.scenarios)) {
    return { scenarios: [] }
  }
  const scenarios = []

  for (const scenario of performance.scenarios) {
    const scenarioName = scenario.name ?? 'Unnamed scenario'
    const durations = scenario.durationsSeconds ? { ...scenario.durationsSeconds } : {}
    if (durations && !('pipeline.total' in durations)) {
      const totals = derivePipelineTotals(durations)
      if (totals.length) {
        durations['pipeline.total'] = totals
      }
    }
    for (const [systemName, samples] of Object.entries(durations)) {
      const stats = calculateStats(samples)
      scenarios.push({
        scenario: scenarioName,
        system: systemName,
        ...stats,
      })
    }
  }

  return { scenarios }
}

function computeScoreStats(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return {
      count: 0,
      average: null,
      median: null,
      q1: null,
      q3: null,
      buckets: { exact: 0, strong: 0, possible: 0, none: 0 },
    }
  }
  const sorted = [...scores].sort((a, b) => a - b)
  const count = sorted.length
  const sum = sorted.reduce((acc, value) => acc + value, 0)
  const average = sum / count
  const median = percentile(sorted, 0.5)
  const q1 = percentile(sorted, 0.25)
  const q3 = percentile(sorted, 0.75)
  const buckets = { exact: 0, strong: 0, possible: 0, none: 0 }
  const [exactThreshold, strongThreshold, possibleThreshold] = MATCH_SCORE_BUCKET_THRESHOLDS
  for (const score of scores) {
    const normalizedScore = normalizeScore(score)
    if (normalizedScore >= exactThreshold) {
      buckets.exact += 1
    }
    else if (normalizedScore >= strongThreshold) {
      buckets.strong += 1
    }
    else if (normalizedScore >= possibleThreshold) {
      buckets.possible += 1
    }
    else {
      buckets.none += 1
    }
  }
  return { count, average, median, q1, q3, buckets }
}

function derivePipelineTotals(durationsBySystem) {
  const entries = Object.entries(durationsBySystem)
    .filter(([key]) => key !== 'pipeline.total')
    .map(([, value]) => (Array.isArray(value) ? value : []))

  if (!entries.length) {
    return []
  }

  const maxLength = Math.max(...entries.map(arr => arr.length))
  const totals = []

  for (let index = 0; index < maxLength; index += 1) {
    let sum = 0
    let hasSample = false
    for (const samples of entries) {
      const sample = samples[index]
      if (typeof sample === 'number' && Number.isFinite(sample)) {
        sum += sample
        hasSample = true
      }
    }
    if (hasSample) {
      totals.push(sum)
    }
  }

  return totals
}

function percentile(sortedArray, percentile) {
  if (!sortedArray.length) {
    return null
  }
  if (sortedArray.length === 1) {
    return sortedArray[0]
  }
  const position = (sortedArray.length - 1) * percentile
  const lowerIndex = Math.floor(position)
  const upperIndex = Math.ceil(position)
  if (lowerIndex === upperIndex) {
    return sortedArray[lowerIndex]
  }
  const lowerValue = sortedArray[lowerIndex]
  const upperValue = sortedArray[upperIndex]
  const weight = position - lowerIndex
  return lowerValue + (upperValue - lowerValue) * weight
}

function getBucketLabels() {
  const [exactThreshold, strongThreshold, possibleThreshold] = MATCH_SCORE_BUCKET_THRESHOLDS
  return {
    exact: `Exact (≥${formatThreshold(exactThreshold)})`,
    strong: `Strong (≥${formatThreshold(strongThreshold)} <${formatThreshold(exactThreshold)})`,
    possible: `Possible (≥${formatThreshold(possibleThreshold)} <${formatThreshold(strongThreshold)})`,
    none: `No (<${formatThreshold(possibleThreshold)})`,
  }
}

function formatThreshold(value) {
  if (value == null) {
    return 'n/a'
  }
  const num = value <= 1 ? value * 100 : value
  return `${num.toFixed(0)}%`
}

function normalizeScore(score) {
  if (score == null || Number.isNaN(score)) {
    return null
  }
  if (score <= 1) {
    return score * 100
  }
  return score
}

function parseBucketThresholdString(raw) {
  if (!raw) {
    return null
  }
  const parts = raw.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length !== 3) {
    return null
  }
  const numbers = []
  for (const part of parts) {
    const value = Number.parseFloat(part)
    if (Number.isNaN(value)) {
      return null
    }
    numbers.push(value <= 1 ? value * 100 : value)
  }
  return numbers.sort((a, b) => b - a)
}

function printMatchingSummary(summary, title = 'Matching Score (Source Taster)') {
  console.log(`\n${title}`)
  const rows = summary.perType.map(item => ({
    'Type': item.type,
    'Avg score': formatNumber(item.average),
    'Median': formatNumber(item.median),
    'Q1': formatNumber(item.q1),
    'Q3': formatNumber(item.q3),
    'Count': item.count,
  }))
  rows.push({
    'Type': 'All entries',
    'Avg score': formatNumber(summary.overall.average),
    'Median': formatNumber(summary.overall.median),
    'Q1': formatNumber(summary.overall.q1),
    'Q3': formatNumber(summary.overall.q3),
    'Count': summary.overall.count ?? 0,
  })
  console.table(rows)
  if (summary.missing.length > 0) {
    console.warn(`⚠️  ${summary.missing.length} references without matching results: ${summary.missing.join(', ')}`)
  }
}

function printMatchingSummaryByStyle(summary, title = 'Matching Score by style (Source Taster)') {
  if (!summary.perStyle || summary.perStyle.length === 0) {
    return
  }
  console.log(`\n${title}`)
  const rows = summary.perStyle.map(item => ({
    'Style': item.style,
    'Avg score': formatNumber(item.average),
    'Median': formatNumber(item.median),
    'Q1': formatNumber(item.q1),
    'Q3': formatNumber(item.q3),
    'Count': item.count,
  }))
  console.table(rows)
}

function printMatchingBuckets(summary, title = 'Matching score distribution (Source Taster)') {
  console.log(`\n${title}`)
  const labels = getBucketLabels()
  const rows = summary.perType.map(item => ({
    Type: item.type,
    [labels.exact]: item.buckets?.exact ?? 0,
    [labels.strong]: item.buckets?.strong ?? 0,
    [labels.possible]: item.buckets?.possible ?? 0,
    [labels.none]: item.buckets?.none ?? 0,
  }))
  rows.push({
    Type: 'All entries',
    [labels.exact]: summary.overall.buckets?.exact ?? 0,
    [labels.strong]: summary.overall.buckets?.strong ?? 0,
    [labels.possible]: summary.overall.buckets?.possible ?? 0,
    [labels.none]: summary.overall.buckets?.none ?? 0,
  })
  console.table(rows)
}

function printMatchingBucketsByStyle(summary, title = 'Matching score distribution by style (Source Taster)') {
  if (!summary.perStyle || summary.perStyle.length === 0) {
    return
  }
  console.log(`\n${title}`)
  const labels = getBucketLabels()
  const rows = summary.perStyle.map(item => ({
    Style: item.style,
    [labels.exact]: item.buckets?.exact ?? 0,
    [labels.strong]: item.buckets?.strong ?? 0,
    [labels.possible]: item.buckets?.possible ?? 0,
    [labels.none]: item.buckets?.none ?? 0,
  }))
  console.table(rows)
}

function printPerformanceSummary(summary) {
  if (!summary.scenarios.length) {
    console.log('\nNo performance data available.')
    return
  }
  console.log('\nPerformance (time per reference)')
  const rows = summary.scenarios.map(item => ({
    'Scenario': item.scenario,
    'System': item.system,
    'Avg time (s)': formatNumber(item.average, 3),
    'StdDev (s)': formatNumber(item.stdDev, 3),
    'Throughput (ref/min)': formatNumber(item.throughput, 3),
  }))
  console.table(rows)
}

function hasMatchingData(summary) {
  if (!summary) {
    return false
  }
  if (summary.overall && (summary.overall.count ?? 0) > 0) {
    return true
  }
  return Array.isArray(summary.perType) && summary.perType.some(item => (item.count ?? 0) > 0)
}

function toMarkdownTable(headers, rows) {
  if (!rows.length) {
    return '_No data available_'
  }

  const headerRow = `| ${headers.join(' | ')} |`
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`
  const bodyRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n')
  return `${headerRow}\n${separatorRow}\n${bodyRows}`
}

function buildMatchingMarkdown(summary, label) {
  const lines = [`## Matching – ${label}`]

  if (!hasMatchingData(summary)) {
    lines.push('_No data available_')
    return lines.join('\n\n')
  }

  const typeHeaders = ['Type', 'Avg score', 'Median', 'Q1', 'Q3', 'Count']
  const typeRows = summary.perType.map(item => [
    item.type,
    formatNumber(item.average),
    formatNumber(item.median),
    formatNumber(item.q1),
    formatNumber(item.q3),
    String(item.count ?? 0),
  ])
  typeRows.push([
    'All entries',
    formatNumber(summary.overall.average),
    formatNumber(summary.overall.median),
    formatNumber(summary.overall.q1),
    formatNumber(summary.overall.q3),
    String(summary.overall.count ?? 0),
  ])

  lines.push('### Avg score by type')
  lines.push(toMarkdownTable(typeHeaders, typeRows))

  if (summary.perStyle && summary.perStyle.length > 0) {
    const styleHeaders = ['Style', 'Avg score', 'Median', 'Q1', 'Q3', 'Count']
    const styleRows = summary.perStyle.map(item => [
      item.style,
      formatNumber(item.average),
      formatNumber(item.median),
      formatNumber(item.q1),
      formatNumber(item.q3),
      String(item.count ?? 0),
    ])
    lines.push('### Avg score by style')
    lines.push(toMarkdownTable(styleHeaders, styleRows))
  }

  const labels = getBucketLabels()
  const bucketHeaders = ['Type', labels.exact, labels.strong, labels.possible, labels.none]
  const bucketRows = summary.perType.map(item => [
    item.type,
    String(item.buckets?.exact ?? 0),
    String(item.buckets?.strong ?? 0),
    String(item.buckets?.possible ?? 0),
    String(item.buckets?.none ?? 0),
  ])
  bucketRows.push([
    'All entries',
    String(summary.overall.buckets?.exact ?? 0),
    String(summary.overall.buckets?.strong ?? 0),
    String(summary.overall.buckets?.possible ?? 0),
    String(summary.overall.buckets?.none ?? 0),
  ])
  lines.push('### Score distribution by type')
  lines.push(toMarkdownTable(bucketHeaders, bucketRows))

  if (summary.perStyle && summary.perStyle.length > 0) {
    const bucketStyleRows = summary.perStyle.map(item => [
      item.style,
      String(item.buckets?.exact ?? 0),
      String(item.buckets?.strong ?? 0),
      String(item.buckets?.possible ?? 0),
      String(item.buckets?.none ?? 0),
    ])
    lines.push('### Score distribution by style')
    lines.push(toMarkdownTable(['Style', labels.exact, labels.strong, labels.possible, labels.none], bucketStyleRows))
  }

  if (summary.missing.length > 0) {
    lines.push(`> ⚠️ ${summary.missing.length} references without matching results: ${summary.missing.join(', ')}`)
  }

  return lines.join('\n\n')
}

function buildPerformanceMarkdown(summary) {
  if (!summary || !Array.isArray(summary.scenarios) || summary.scenarios.length === 0) {
    return '## Performance\n\n_No performance data available._'
  }

  const headers = ['Scenario', 'System', 'Avg time (s)', 'StdDev (s)', 'Throughput (ref/min)']
  const rows = summary.scenarios.map(item => [
    item.scenario,
    item.system,
    formatNumber(item.average, 3),
    formatNumber(item.stdDev, 3),
    formatNumber(item.throughput, 3),
  ])

  return ['## Performance', toMarkdownTable(headers, rows)].join('\n\n')
}

function buildMarkdownReport({ generatedAt, input, thresholds, matching, matchingNoDoi, matchingAnyStyle, matchingAnyStyleNoDoi, performance }) {
  const lines = ['# Evaluation Summary', '', `- Generated: ${generatedAt}`, `- Input: ${input}`, `- Matching bucket thresholds: ${thresholds.map(formatThreshold).join(' / ')}`]

  if (hasMatchingData(matching)) {
    lines.push('', buildMatchingMarkdown(matching, 'Source Taster'))
  }
  else {
    lines.push('', '## Matching – Source Taster', '', '_No data available_')
  }

  if (hasMatchingData(matchingNoDoi)) {
    lines.push('', buildMatchingMarkdown(matchingNoDoi, 'Source Taster without DOI'))
  }
  if (hasMatchingData(matchingAnyStyle)) {
    lines.push('', buildMatchingMarkdown(matchingAnyStyle, 'AnyStyle'))
  }
  else {
    lines.push('', '## Matching – AnyStyle', '', '_No data available_')
  }
  lines.push('', buildMatchingMarkdown(matchingAnyStyleNoDoi, 'AnyStyle without DOI'))

  lines.push('', buildPerformanceMarkdown(performance))

  return `${lines.join('\n')}\n`
}

async function main() {
  const inputPath = pickInputPath()
  const bucketThresholdsArg = getBucketThresholdsFromArgs()
  MATCH_SCORE_BUCKET_THRESHOLDS = bucketThresholdsArg ?? [...DEFAULT_BUCKET_THRESHOLDS]
  const resolvedPath = path.resolve(process.cwd(), inputPath)
  const rawContent = await readFile(resolvedPath, 'utf8')
  const data = JSON.parse(rawContent)

  const entries = Array.isArray(data.entries) ? data.entries : Array.isArray(data) ? data : []
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Expected field "entries" to be an array or the file itself to be an array')
  }

  const matchingSummary = computeMatchingMetrics(entries)
  const matchingSummaryNoDoi = computeMatchingMetricsFor(entries, e => e.predictions?.sourceTasterNoDoi?.matching)
  const matchingSummaryAnyStyle = computeMatchingMetricsAnyStyle(entries)
  const matchingSummaryAnyStyleNoDoi = computeMatchingMetricsAnyStyleNoDoi(entries)
  const performanceSummary = computePerformanceMetrics(data.meta?.performance ?? data.performance)

  printMatchingSummary(matchingSummary)
  printMatchingSummaryByStyle(matchingSummary)
  printMatchingBuckets(matchingSummary)
  printMatchingBucketsByStyle(matchingSummary)

  if ((matchingSummaryNoDoi?.overall?.count ?? 0) > 0 || (matchingSummaryNoDoi?.perType?.some(t => t.count > 0) ?? false)) {
    printMatchingSummary(matchingSummaryNoDoi, 'Matching Score (Source Taster – without DOI)')
    printMatchingSummaryByStyle(matchingSummaryNoDoi, 'Matching Score by style (Source Taster – without DOI)')
    printMatchingBuckets(matchingSummaryNoDoi, 'Matching score distribution (Source Taster – without DOI)')
    printMatchingBucketsByStyle(matchingSummaryNoDoi, 'Matching score distribution by style (Source Taster – without DOI)')
  }
  if (hasMatchingData(matchingSummaryAnyStyle)) {
    printMatchingSummary(matchingSummaryAnyStyle, 'Matching Score (AnyStyle)')
    printMatchingSummaryByStyle(matchingSummaryAnyStyle, 'Matching Score by style (AnyStyle)')
    printMatchingBuckets(matchingSummaryAnyStyle, 'Matching score distribution (AnyStyle)')
    printMatchingBucketsByStyle(matchingSummaryAnyStyle, 'Matching score distribution by style (AnyStyle)')
  }
  if (hasMatchingData(matchingSummaryAnyStyleNoDoi)) {
    printMatchingSummary(matchingSummaryAnyStyleNoDoi, 'Matching Score (AnyStyle – without DOI)')
    printMatchingSummaryByStyle(matchingSummaryAnyStyleNoDoi, 'Matching Score by style (AnyStyle – without DOI)')
    printMatchingBuckets(matchingSummaryAnyStyleNoDoi, 'Matching score distribution (AnyStyle – without DOI)')
    printMatchingBucketsByStyle(matchingSummaryAnyStyleNoDoi, 'Matching score distribution by style (AnyStyle – without DOI)')
  }
  printPerformanceSummary(performanceSummary)

  const summaryPayload = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), resolvedPath),
    matching: matchingSummary,
    matchingNoDoi: matchingSummaryNoDoi,
    matchingAnyStyle: matchingSummaryAnyStyle,
    matchingAnyStyleNoDoi: matchingSummaryAnyStyleNoDoi,
    performance: performanceSummary,
    matchingBucketThresholds: MATCH_SCORE_BUCKET_THRESHOLDS,
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  const outputPath = path.join(OUTPUT_DIR, 'metrics-summary.json')
  await writeFile(outputPath, JSON.stringify(summaryPayload, null, 2), 'utf8')
  console.log(`\n→ Summary saved to ${outputPath}`)

  const markdownPath = path.join(OUTPUT_DIR, 'metrics-summary.md')
  // Debug output removed
  const markdownReport = buildMarkdownReport({
    generatedAt: summaryPayload.generatedAt,
    input: summaryPayload.input,
    thresholds: MATCH_SCORE_BUCKET_THRESHOLDS,
    matching: matchingSummary,
    matchingNoDoi: matchingSummaryNoDoi,
    matchingAnyStyle: matchingSummaryAnyStyle,
    matchingAnyStyleNoDoi: matchingSummaryAnyStyleNoDoi,
    performance: performanceSummary,
  })
  await writeFile(markdownPath, markdownReport, 'utf8')
  console.log(`→ Markdown report saved to ${markdownPath}`)
}

main().catch((error) => {
  console.error('Evaluation failed:')
  console.error(error)
  process.exitCode = 1
})
