#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_INPUT = 'evaluation/metadata/perturbation-report.apa.json'
const DEFAULT_OUTPUT = 'evaluation/out/perturbation-summary.md'

function parseArgs() {
  const options = { input: DEFAULT_INPUT, output: DEFAULT_OUTPUT, samples: 3 }
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]
    switch (a) {
      case '--input': options.input = args[++i]
        break
      case '--output': options.output = args[++i]
        break
      case '--samples': options.samples = Math.max(0, Number.parseInt(args[++i] ?? '3', 10) || 3)
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        if (!a.startsWith('-'))
          options.input = a
        else console.warn(`Unbekannte Option: ${a}`)
    }
  }
  return options
}

function printHelp() {
  console.log(`Perturbation Summary (Markdown)\n\nVerwendung:\n  node evaluation/summarize-perturbation-report.js --input ${DEFAULT_INPUT} --output ${DEFAULT_OUTPUT}\n\nOptionen:\n  --input <pfad>     Pfad zur JSON-Reportdatei\n  --output <pfad>    Pfad zur Markdown-Zusammenfassung\n  --samples <n>      Beispiele je Operationstyp (Default 3)\n`)
}

function escapePipes(s) {
  return String(s).replace(/\|/g, '\\|')
}

function toTable(headers, rows) {
  const head = `| ${headers.map(escapePipes).join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map(r => `| ${r.map(escapePipes).join(' | ')} |`)
  return [head, sep, ...body].join('\n')
}

async function ensureDir(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

function summarize(report, samplesPerType) {
  const counts = {}
  const examples = {}
  const perEntry = []
  for (const e of report.entries || []) {
    perEntry.push(e.operations?.length || 0)
    for (const op of e.operations || []) {
      counts[op.type] = (counts[op.type] || 0) + 1
      if (!examples[op.type])
        examples[op.type] = []
      if (examples[op.type].length < samplesPerType) {
        examples[op.type].push({ index: e.index, op, original: e.original, modified: e.modified })
      }
    }
  }
  const totalOps = Object.values(counts).reduce((a, b) => a + b, 0)
  const hist = perEntry.reduce((acc, n) => {
    acc[n] = (acc[n] || 0) + 1
    return acc
  }, {})
  return { counts, totalOps, examples, hist, totalEntries: report.entries?.length || 0 }
}

function buildMarkdown(report, summary) {
  const lines = []
  lines.push('# Perturbation Summary')
  lines.push('')
  lines.push(`- Generated: ${report.generatedAt ?? 'n/a'}`)
  lines.push(`- Seed: ${report.seed ?? 'n/a'}`)
  lines.push(`- Profile: ${report.profile ?? 'n/a'}`)
  lines.push(`- Input: ${report.input ?? 'n/a'}`)
  lines.push(`- Output: ${report.output ?? 'n/a'}`)
  lines.push(`- Entries: ${summary.totalEntries}`)
  lines.push(`- Total operations: ${summary.totalOps}`)
  lines.push('')

  // Rates table
  const rateRows = Object.entries(report.rates || {}).map(([k, v]) => [k, typeof v === 'number' ? v.toFixed(2) : String(v)])
  if (rateRows.length) {
    lines.push('## Rates')
    lines.push(toTable(['Operation', 'Rate/Value'], rateRows))
    lines.push('')
  }

  // Counts table
  const countRows = Object.entries(summary.counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, String(v)])
  lines.push('## Operation Counts')
  lines.push(countRows.length ? toTable(['Operation', 'Count'], countRows) : '_Keine Operationen gefunden_')
  lines.push('')

  // Histogram operations per entry
  const histRows = Object.entries(summary.hist).sort((a, b) => Number(a[0]) - Number(b[0])).map(([ops, cnt]) => [ops, String(cnt)])
  lines.push('## Operations pro Eintrag (Histogramm)')
  lines.push(toTable(['#Ops', '#Entries'], histRows))
  lines.push('')

  // Examples per operation type
  for (const [type, arr] of Object.entries(summary.examples)) {
    lines.push(`## Beispiele – ${type}`)
    if (!arr.length) {
      lines.push('_Keine Beispiele_')
      continue
    }
    for (const ex of arr) {
      lines.push(`### Index ${ex.index}`)
      lines.push('Details:')
      const detailRows = Object.entries(ex.op).map(([k, v]) => [k, String(v)])
      lines.push(toTable(['Key', 'Value'], detailRows))
      lines.push('')
      lines.push('Original:')
      lines.push('')
      lines.push('```')
      lines.push(ex.original || '')
      lines.push('```')
      lines.push('')
      lines.push('Modifiziert:')
      lines.push('')
      lines.push('```')
      lines.push(ex.modified || '')
      lines.push('```')
      lines.push('')
    }
  }

  return `${lines.join('\n')}\n`
}

async function main() {
  const options = parseArgs()
  const raw = await readFile(path.resolve(process.cwd(), options.input), 'utf8')
  const report = JSON.parse(raw)
  const summary = summarize(report, options.samples)
  const md = buildMarkdown(report, summary)
  await ensureDir(options.output)
  await writeFile(path.resolve(process.cwd(), options.output), md, 'utf8')
  console.log(`✅ Markdown gespeichert → ${options.output}`)
}

main().catch((err) => {
  console.error('Zusammenfassung fehlgeschlagen:')
  console.error(err)
  process.exitCode = 1
})
