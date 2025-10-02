#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_RESULTS_PATH = 'evaluation/out/live-results.crossref.json'
const OUTPUT_DIR = 'evaluation/out'
const FIELDS_TO_COMPARE = [
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

function deepEqual(a, b) {
  if (a === b) {
    return true
  }
  if (typeof a !== typeof b) {
    return false
  }
  if (a === null || b === null) {
    return false
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a).sort()
    const keysB = Object.keys(b).sort()
    if (keysA.length !== keysB.length) {
      return false
    }
    for (let i = 0; i < keysA.length; i += 1) {
      if (keysA[i] !== keysB[i]) {
        return false
      }
      if (!deepEqual(a[keysA[i]], b[keysA[i]])) {
        return false
      }
    }
    return true
  }
  return a === b
}

function hasValue(value) {
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }
  return true
}

function compareField(gold, predicted, field) {
  const goldValue = gold?.[field]
  const predictedValue = predicted?.[field]
  const hasGold = hasValue(goldValue)
  const hasPredicted = hasValue(predictedValue)

  if (!hasGold && !hasPredicted) {
    return { tp: 0, fp: 0, fn: 0 }
  }

  const equal = deepEqual(goldValue, predictedValue)
  if (equal) {
    return { tp: 1, fp: 0, fn: 0 }
  }

  return {
    tp: 0,
    fp: hasPredicted ? 1 : 0,
    fn: hasGold ? 1 : 0,
  }
}

function sumCounts(list) {
  return list.reduce(
    (acc, item) => {
      acc.tp += item.tp
      acc.fp += item.fp
      acc.fn += item.fn
      return acc
    },
    { tp: 0, fp: 0, fn: 0 },
  )
}

function deriveScores({ tp, fp, fn }) {
  const precision = tp + fp === 0 ? null : tp / (tp + fp)
  const recall = tp + fn === 0 ? null : tp / (tp + fn)
  const f1 = precision === null || recall === null || precision + recall === 0
    ? null
    : (2 * precision * recall) / (precision + recall)
  return { precision, recall, f1 }
}

function formatPercent(value) {
  if (value === null) {
    return 'n/a'
  }
  return `${(value * 100).toFixed(2)}%`
}

function formatNumber(value) {
  if (value === null) {
    return 'n/a'
  }
  return value.toFixed(2)
}

function computeExtractionMetrics(entries, predictorKey) {
  const totalsByType = new Map()
  const totalsByStyle = new Map()
  const fieldBreakdown = new Map()
  const missingPredictions = []

  for (const entry of entries) {
    const gold = entry.gold ?? entry.metadata
    const prediction = entry.predictions?.[predictorKey]?.metadata
    if (!gold) {
      continue
    }
    if (!prediction) {
      missingPredictions.push(entry.id ?? entry.referenceId ?? 'unknown')
      continue
    }
    const type = entry.type ?? entry.category ?? 'Unbekannt'
    const totalsForType = totalsByType.get(type) ?? { tp: 0, fp: 0, fn: 0 }
    const style = entry.style ?? entry.formatting?.template ?? entry.predictions?.sourceTaster?.formatting?.template ?? null
    const totalsForStyle = style ? (totalsByStyle.get(style) ?? { tp: 0, fp: 0, fn: 0 }) : null

    for (const field of FIELDS_TO_COMPARE) {
      const counts = compareField(gold, prediction, field)
      totalsForType.tp += counts.tp
      totalsForType.fp += counts.fp
      totalsForType.fn += counts.fn

      if (totalsForStyle) {
        totalsForStyle.tp += counts.tp
        totalsForStyle.fp += counts.fp
        totalsForStyle.fn += counts.fn
      }

      const fieldTotals = fieldBreakdown.get(field) ?? { tp: 0, fp: 0, fn: 0 }
      fieldTotals.tp += counts.tp
      fieldTotals.fp += counts.fp
      fieldTotals.fn += counts.fn
      fieldBreakdown.set(field, fieldTotals)
    }

    totalsByType.set(type, totalsForType)
    if (style && totalsForStyle) {
      totalsByStyle.set(style, totalsForStyle)
    }
  }

  const totalsList = Array.from(totalsByType.entries()).map(([type, counts]) => ({ type, counts }))
  const overallCounts = sumCounts(totalsList.map(entry => entry.counts))

  const perType = totalsList
    .map(({ type, counts }) => ({
      type,
      ...counts,
      ...deriveScores(counts),
    }))
    .sort((a, b) => a.type.localeCompare(b.type, 'de'))

  const overall = { ...overallCounts, ...deriveScores(overallCounts) }

  const fieldDetails = Array.from(fieldBreakdown.entries())
    .map(([field, counts]) => ({ field, ...counts, ...deriveScores(counts) }))
    .sort((a, b) => a.field.localeCompare(b.field, 'de'))

  const perStyle = Array.from(totalsByStyle.entries()).map(([style, counts]) => ({
    style,
    ...counts,
    ...deriveScores(counts),
  })).sort((a, b) => a.style.localeCompare(b.style, 'de'))

  return {
    perType,
    perStyle,
    overall,
    fieldDetails,
    missingPredictions,
  }
}

function computeMatchingMetrics(entries) {
  const scoresByType = new Map()
  const scoresByStyle = new Map()
  const missing = []

  for (const entry of entries) {
    const matching = entry.predictions?.sourceTaster?.matching
    if (!matching) {
      missing.push(entry.id ?? entry.referenceId ?? 'unknown')
      continue
    }
    const topScore = matching.topScore ?? matching.evaluations?.[0]?.matchDetails?.overallScore ?? null
    if (topScore === null || Number.isNaN(topScore)) {
      missing.push(entry.id ?? entry.referenceId ?? 'unknown')
      continue
    }
    const type = entry.type ?? entry.category ?? 'Unbekannt'
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

  perType.sort((a, b) => a.type.localeCompare(b.type, 'de'))

  const perStyle = []
  for (const [style, scores] of scoresByStyle.entries()) {
    const stats = computeScoreStats(scores)
    perStyle.push({ style, ...stats })
  }
  perStyle.sort((a, b) => a.style.localeCompare(b.style, 'de'))

  const overallStats = computeScoreStats(allScores)

  return {
    perType,
    perStyle,
    overall: overallStats,
    missing,
    thresholds: [...MATCH_SCORE_BUCKET_THRESHOLDS],
  }
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
    const scenarioName = scenario.name ?? 'Unbenanntes Szenario'
    const durations = scenario.durationsSeconds ?? {}
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

function printExtractionSummary(label, summary) {
  console.log(`\n${label}`)
  const rows = summary.perType.map(item => ({
    'Typ': item.type,
    'Precision': formatPercent(item.precision),
    'Recall': formatPercent(item.recall),
    'F1-Score': formatPercent(item.f1),
  }))
  rows.push({
    'Typ': 'Ø gesamt',
    'Precision': formatPercent(summary.overall.precision),
    'Recall': formatPercent(summary.overall.recall),
    'F1-Score': formatPercent(summary.overall.f1),
  })
  console.table(rows)
  if (summary.missingPredictions.length > 0) {
    console.warn(`⚠️  ${summary.missingPredictions.length} Referenzen ohne Vorhersage: ${summary.missingPredictions.join(', ')}`)
  }
}

function printExtractionSummaryByStyle(summary) {
  if (!summary.perStyle || summary.perStyle.length === 0) {
    return
  }
  console.log('\nExtraktionsgüte nach Stil')
  const rows = summary.perStyle.map(item => ({
    'Stil': item.style,
    'Precision': formatPercent(item.precision),
    'Recall': formatPercent(item.recall),
    'F1-Score': formatPercent(item.f1),
  }))
  console.table(rows)
}

function printMatchingSummary(summary) {
  console.log('\nMatching-Score (Source Taster)')
  const rows = summary.perType.map(item => ({
    'Typ': item.type,
    'Ø Score': formatNumber(item.average),
    'Median': formatNumber(item.median),
    'Q1': formatNumber(item.q1),
    'Q3': formatNumber(item.q3),
    'Anzahl': item.count,
  }))
  rows.push({
    'Typ': 'Ø gesamt',
    'Ø Score': formatNumber(summary.overall.average),
    'Median': formatNumber(summary.overall.median),
    'Q1': formatNumber(summary.overall.q1),
    'Q3': formatNumber(summary.overall.q3),
    'Anzahl': summary.overall.count ?? 0,
  })
  console.table(rows)
  if (summary.missing.length > 0) {
    console.warn(`⚠️  ${summary.missing.length} Referenzen ohne Matching-Ergebnis: ${summary.missing.join(', ')}`)
  }
}

function printMatchingSummaryByStyle(summary) {
  if (!summary.perStyle || summary.perStyle.length === 0) {
    return
  }
  console.log('\nMatching-Score nach Stil (Source Taster)')
  const rows = summary.perStyle.map(item => ({
    'Stil': item.style,
    'Ø Score': formatNumber(item.average),
    'Median': formatNumber(item.median),
    'Q1': formatNumber(item.q1),
    'Q3': formatNumber(item.q3),
    'Anzahl': item.count,
  }))
  console.table(rows)
}

function printMatchingBuckets(summary) {
  console.log('\nMatching-Score Verteilung (Source Taster)')
  const labels = getBucketLabels()
  const rows = summary.perType.map(item => ({
    Typ: item.type,
    [labels.exact]: item.buckets?.exact ?? 0,
    [labels.strong]: item.buckets?.strong ?? 0,
    [labels.possible]: item.buckets?.possible ?? 0,
    [labels.none]: item.buckets?.none ?? 0,
  }))
  rows.push({
    Typ: 'Ø gesamt',
    [labels.exact]: summary.overall.buckets?.exact ?? 0,
    [labels.strong]: summary.overall.buckets?.strong ?? 0,
    [labels.possible]: summary.overall.buckets?.possible ?? 0,
    [labels.none]: summary.overall.buckets?.none ?? 0,
  })
  console.table(rows)
}

function printMatchingBucketsByStyle(summary) {
  if (!summary.perStyle || summary.perStyle.length === 0) {
    return
  }
  console.log('\nMatching-Score Verteilung nach Stil (Source Taster)')
  const labels = getBucketLabels()
  const rows = summary.perStyle.map(item => ({
    Stil: item.style,
    [labels.exact]: item.buckets?.exact ?? 0,
    [labels.strong]: item.buckets?.strong ?? 0,
    [labels.possible]: item.buckets?.possible ?? 0,
    [labels.none]: item.buckets?.none ?? 0,
  }))
  console.table(rows)
}

function printPerformanceSummary(summary) {
  if (!summary.scenarios.length) {
    console.log('\nKeine Performance-Daten vorhanden.')
    return
  }
  console.log('\nPerformance (Zeit pro Referenz)')
  const rows = summary.scenarios.map(item => ({
    'Szenario': item.scenario,
    'System': item.system,
    'Ø Zeit (s)': formatNumber(item.average),
    'StdAbw (s)': formatNumber(item.stdDev),
    'Durchsatz (Ref/min)': formatNumber(item.throughput),
  }))
  console.table(rows)
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
    throw new Error('Erwarte Feld "entries" als Array in der Eingabedatei oder eine Array-Datei')
  }

  const sourceTasterExtraction = computeExtractionMetrics(entries, 'sourceTaster')
  const anyStyleExtraction = computeExtractionMetrics(entries, 'anyStyle')
  const matchingSummary = computeMatchingMetrics(entries)
  const performanceSummary = computePerformanceMetrics(data.meta?.performance ?? data.performance)

  printExtractionSummary('Extraktionsgüte – Source Taster (/api/extract)', sourceTasterExtraction)
  printExtractionSummaryByStyle(sourceTasterExtraction)
  printExtractionSummary('Extraktionsgüte – AnyStyle (/api/anystyle)', anyStyleExtraction)
  printExtractionSummaryByStyle(anyStyleExtraction)
  printMatchingSummary(matchingSummary)
  printMatchingSummaryByStyle(matchingSummary)
  printMatchingBuckets(matchingSummary)
  printMatchingBucketsByStyle(matchingSummary)
  printPerformanceSummary(performanceSummary)

  const summaryPayload = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), resolvedPath),
    fields: FIELDS_TO_COMPARE,
    extraction: {
      sourceTaster: sourceTasterExtraction,
      anyStyle: anyStyleExtraction,
    },
    matching: matchingSummary,
    performance: performanceSummary,
    matchingBucketThresholds: MATCH_SCORE_BUCKET_THRESHOLDS,
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  const outputPath = path.join(OUTPUT_DIR, 'metrics-summary.json')
  await writeFile(outputPath, JSON.stringify(summaryPayload, null, 2), 'utf8')
  console.log(`\n→ Zusammenfassung gespeichert unter ${outputPath}`)
}

main().catch((error) => {
  console.error('Evaluation fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})
