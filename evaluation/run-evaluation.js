#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_RESULTS_PATH = 'evaluation/sample-evaluation.json'
const OUTPUT_DIR = 'evaluation/out'
const FIELDS_TO_COMPARE = [
  'author',
  'title',
  'issued',
  'container-title',
  'publisher',
  'publisher-place',
  'volume',
  'issue',
  'page',
  'DOI',
  'URL',
]

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

function normaliseString(value) {
  if (value === undefined || value === null) {
    return ''
  }
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\u2013\u2014]/g, '-')
}

function normaliseName(name) {
  if (typeof name === 'string') {
    return normaliseString(name)
  }
  if (!name || typeof name !== 'object') {
    return ''
  }
  if (name.literal) {
    return normaliseString(name.literal)
  }
  const parts = [name['non-dropping-particle'], name.family, name.given, name.suffix]
    .filter(Boolean)
    .map(part => normaliseString(part))
  return parts.join(' ').trim()
}

function normaliseDate(value) {
  if (!value) {
    return ''
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return normaliseString(value)
  }
  if (value.literal) {
    return normaliseString(value.literal)
  }
  if (value.raw) {
    return normaliseString(value.raw)
  }
  const parts = Array.isArray(value['date-parts'])
    ? value['date-parts'][0] ?? []
    : []
  if (parts.length === 0) {
    return ''
  }
  return parts
    .map((part, index) => {
      const str = String(part)
      if (index === 0) {
        return str.padStart(4, '0')
      }
      return str.padStart(2, '0')
    })
    .join('-')
}

function valueToArray(entity, field) {
  if (!entity) {
    return []
  }
  const value = entity[field]
  if (value === undefined || value === null) {
    return []
  }
  if (Array.isArray(value)) {
    if (field === 'author' || field === 'editor' || field === 'translator' || field === 'container-author') {
      return value.map(normaliseName).filter(Boolean)
    }
    return value.map(entry => normaliseString(entry)).filter(Boolean)
  }
  if (typeof value === 'object') {
    if (field === 'issued' || field === 'event-date' || field === 'submitted' || field === 'accessed') {
      const normalised = normaliseDate(value)
      return normalised ? [normalised] : []
    }
    if ('value' in value) {
      return normaliseString(value.value) ? [normaliseString(value.value)] : []
    }
  }
  const normalised = normaliseString(value)
  return normalised ? [normalised] : []
}

function compareField(gold, predicted, field) {
  const goldValues = valueToArray(gold, field)
  const predictedValues = valueToArray(predicted, field)

  if (goldValues.length === 0 && predictedValues.length === 0) {
    return { tp: 0, fp: 0, fn: 0 }
  }

  const remainingGold = [...goldValues]
  let truePositives = 0
  let falsePositives = 0

  for (const predictedValue of predictedValues) {
    const matchIndex = remainingGold.indexOf(predictedValue)
    if (matchIndex >= 0) {
      remainingGold.splice(matchIndex, 1)
      truePositives += 1
    }
    else {
      falsePositives += 1
    }
  }

  const falseNegatives = remainingGold.length
  return { tp: truePositives, fp: falsePositives, fn: falseNegatives }
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
  const fieldBreakdown = new Map()
  const missingPredictions = []

  for (const entry of entries) {
    const gold = entry.gold
    const prediction = entry.predictions?.[predictorKey]?.metadata
    if (!prediction) {
      missingPredictions.push(entry.id)
      continue
    }
    const type = entry.type ?? 'Unbekannt'
    const totalsForType = totalsByType.get(type) ?? { tp: 0, fp: 0, fn: 0 }

    for (const field of FIELDS_TO_COMPARE) {
      const counts = compareField(gold, prediction, field)
      totalsForType.tp += counts.tp
      totalsForType.fp += counts.fp
      totalsForType.fn += counts.fn

      const fieldTotals = fieldBreakdown.get(field) ?? { tp: 0, fp: 0, fn: 0 }
      fieldTotals.tp += counts.tp
      fieldTotals.fp += counts.fp
      fieldTotals.fn += counts.fn
      fieldBreakdown.set(field, fieldTotals)
    }

    totalsByType.set(type, totalsForType)
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

  return {
    perType,
    overall,
    fieldDetails,
    missingPredictions,
  }
}

function computeMatchingMetrics(entries) {
  const totalsByType = new Map()
  const missing = []

  for (const entry of entries) {
    const matching = entry.predictions?.sourceTaster?.matching
    if (!matching) {
      missing.push(entry.id)
      continue
    }
    const type = entry.type ?? 'Unbekannt'
    const totals = totalsByType.get(type) ?? { total: 0, top1: 0, top3: 0 }
    totals.total += 1
    if (matching.top1Correct) {
      totals.top1 += 1
    }
    if (matching.top3Correct) {
      totals.top3 += 1
    }
    totalsByType.set(type, totals)
  }

  const perType = Array.from(totalsByType.entries())
    .map(([type, { total, top1, top3 }]) => ({
      type,
      total,
      top1Accuracy: total === 0 ? null : top1 / total,
      top3Accuracy: total === 0 ? null : top3 / total,
    }))
    .sort((a, b) => a.type.localeCompare(b.type, 'de'))

  const overallTotals = Array.from(totalsByType.values()).reduce(
    (acc, { total, top1, top3 }) => {
      acc.total += total
      acc.top1 += top1
      acc.top3 += top3
      return acc
    },
    { total: 0, top1: 0, top3: 0 },
  )

  const overall = {
    total: overallTotals.total,
    top1Accuracy: overallTotals.total === 0 ? null : overallTotals.top1 / overallTotals.total,
    top3Accuracy: overallTotals.total === 0 ? null : overallTotals.top3 / overallTotals.total,
  }

  return { perType, overall, missing }
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

function printMatchingSummary(summary) {
  console.log('\nMatching-Genauigkeit (Source Taster)')
  const rows = summary.perType.map(item => ({
    'Typ': item.type,
    'Top-1': formatPercent(item.top1Accuracy),
    'Top-3': formatPercent(item.top3Accuracy),
    'Anzahl': item.total,
  }))
  rows.push({
    'Typ': 'Ø gesamt',
    'Top-1': formatPercent(summary.overall.top1Accuracy),
    'Top-3': formatPercent(summary.overall.top3Accuracy),
    'Anzahl': summary.overall.total,
  })
  console.table(rows)
  if (summary.missing.length > 0) {
    console.warn(`⚠️  ${summary.missing.length} Referenzen ohne Matching-Ergebnis: ${summary.missing.join(', ')}`)
  }
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
  const resolvedPath = path.resolve(process.cwd(), inputPath)
  const rawContent = await readFile(resolvedPath, 'utf8')
  const data = JSON.parse(rawContent)

  if (!Array.isArray(data.entries)) {
    throw new TypeError('Erwarte Feld "entries" als Array in der Eingabedatei')
  }

  const sourceTasterExtraction = computeExtractionMetrics(data.entries, 'sourceTaster')
  const anyStyleExtraction = computeExtractionMetrics(data.entries, 'anyStyle')
  const matchingSummary = computeMatchingMetrics(data.entries)
  const performanceSummary = computePerformanceMetrics(data.performance)

  printExtractionSummary('Extraktionsgüte – Source Taster', sourceTasterExtraction)
  printExtractionSummary('Extraktionsgüte – AnyStyle CLI', anyStyleExtraction)
  printMatchingSummary(matchingSummary)
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
