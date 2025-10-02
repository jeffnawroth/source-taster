#!/usr/bin/env node
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_GOLD_PATH = 'evaluation/gold-set.crossref.json'
const DEFAULT_RAW_PATH = 'evaluation/raw-references.crossref.txt'
const DEFAULT_WORKS_PATH = 'evaluation/crossref-works.json'
const DEFAULT_OUTPUT_PATH = 'evaluation/out/live-input.crossref.json'

function parseArgs() {
  const options = {
    gold: DEFAULT_GOLD_PATH,
    raw: DEFAULT_RAW_PATH,
    works: DEFAULT_WORKS_PATH,
    output: DEFAULT_OUTPUT_PATH,
    style: null,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--') {
      continue
    }
    switch (arg) {
      case '--gold':
        options.gold = args[++i]
        break
      case '--raw':
        options.raw = args[++i]
        break
      case '--works':
        options.works = args[++i]
        break
      case '--output':
        options.output = args[++i]
        break
      case '--style':
        options.style = args[++i]
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (!arg.startsWith('-') && !options._input) {
          options.gold = arg
        }
        else {
          console.warn(`Unbekannte Option: ${arg}`)
        }
    }
  }
  return options
}

function printHelp() {
  console.log(`Live-Input Builder\n\nVerwendung:\n  pnpm evaluation:prepare-input -- --gold evaluation/gold-set.crossref.json --raw evaluation/raw-references.crossref.txt\n\nOptionen:\n  --gold <pfad>    Pfad zur gold-set.json (Default ${DEFAULT_GOLD_PATH})\n  --raw <pfad>     Pfad zur Rohreferenz-Datei (Default ${DEFAULT_RAW_PATH})\n  --works <pfad>   (Optional) Pfad zu crossref-works.json (Default ${DEFAULT_WORKS_PATH})\n  --output <pfad>  Ziel-Datei (Default ${DEFAULT_OUTPUT_PATH})\n  --style <name>   Optionaler Stilname (Default apa)\n`)
}

async function loadJson(filePath) {
  const absolute = path.resolve(process.cwd(), filePath)
  const content = await readFile(absolute, 'utf8')
  return JSON.parse(content)
}

function splitRawReferences(content) {
  return content
    .split(/\r?\n\s*\n/)
    .map(entry => entry.trim())
    .filter(Boolean)
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

function fallbackId(index) {
  return `ref-${String(index + 1).padStart(3, '0')}`
}

function buildEntry({ goldItem, worksEntry, rawText, index, style }) {
  return {
    id: worksEntry?.doi ?? goldItem?.DOI ?? goldItem?.id ?? fallbackId(index),
    category: worksEntry?.category ?? goldItem?.type ?? null,
    type: worksEntry?.category ?? goldItem?.type ?? null,
    raw: rawText,
    gold: goldItem ?? null,
    style,
  }
}

async function main() {
  const options = parseArgs()
  const goldData = await loadJson(options.gold)
  const rawContent = await readFile(path.resolve(process.cwd(), options.raw), 'utf8')
  let worksData = null
  try {
    worksData = await loadJson(options.works)
  }
  catch (error) {
    console.warn(`⚠️  Works-Datei konnte nicht geladen werden (${options.works}): ${error.message ?? error}`)
  }

  const goldItems = Array.isArray(goldData.references) ? goldData.references : Array.isArray(goldData) ? goldData : []
  if (!goldItems.length) {
    throw new Error('Keine Referenzen in der Gold-Datei gefunden. Erwarte Feld "references" oder Array.')
  }

  const rawEntries = splitRawReferences(rawContent)
  if (rawEntries.length !== goldItems.length) {
    console.warn(`⚠️  Anzahl Rohreferenzen (${rawEntries.length}) weicht von Gold-Einträgen (${goldItems.length}) ab. Es werden die kürzere Anzahl verwendet.`)
  }

  const worksIndex = buildWorksIndex(worksData)
  const resolvedStyle = options.style ?? goldData.style ?? 'apa'
  const total = Math.min(rawEntries.length, goldItems.length)
  const entries = []

  for (let index = 0; index < total; index += 1) {
    const goldItem = goldItems[index]
    const worksEntry = findWorksEntry(worksIndex, goldItem)
    const rawText = rawEntries[index]
    entries.push(buildEntry({ goldItem, worksEntry, rawText, index, style: resolvedStyle }))
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    style: resolvedStyle,
    total: entries.length,
    meta: {
      goldFile: path.relative(process.cwd(), path.resolve(process.cwd(), options.gold)),
      rawFile: path.relative(process.cwd(), path.resolve(process.cwd(), options.raw)),
    },
    entries,
  }

  await ensureDirectory(options.output)
  await writeFile(path.resolve(process.cwd(), options.output), JSON.stringify(payload, null, 2), 'utf8')
  console.log(`✅ Live-Input erstellt (${entries.length} Einträge) → ${options.output}`)
}

main().catch((error) => {
  console.error('Erstellung der Input-Datei fehlgeschlagen:')
  console.error(error)
  process.exitCode = 1
})

function buildWorksIndex(worksData) {
  if (!worksData || !Array.isArray(worksData.items)) {
    return new Map()
  }
  const map = new Map()
  for (const item of worksData.items) {
    if (!item?.doi) {
      continue
    }
    map.set(item.doi.toLowerCase(), item)
  }
  return map
}

function findWorksEntry(worksIndex, goldItem) {
  if (!worksIndex || worksIndex.size === 0) {
    return null
  }
  const doi = goldItem?.DOI ?? goldItem?.id
  if (!doi) {
    return null
  }
  return worksIndex.get(String(doi).toLowerCase()) ?? null
}
