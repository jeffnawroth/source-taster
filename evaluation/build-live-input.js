#!/usr/bin/env node
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_GOLD_PATH = 'evaluation/gold-set.json'
const DEFAULT_RAW_PATH = 'evaluation/raw-references.txt'
const DEFAULT_META_PATH = 'evaluation/out/openalex-goldset-metadata.json'
const DEFAULT_OUTPUT_PATH = 'evaluation/out/live-input.json'

function parseArgs() {
  const options = {
    gold: DEFAULT_GOLD_PATH,
    raw: DEFAULT_RAW_PATH,
    meta: DEFAULT_META_PATH,
    output: DEFAULT_OUTPUT_PATH,
    style: null,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    switch (arg) {
      case '--gold':
        options.gold = args[++i]
        break
      case '--raw':
        options.raw = args[++i]
        break
      case '--meta':
        options.meta = args[++i]
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
  console.log(`Live-Input Builder\n\nVerwendung:\n  pnpm evaluation:prepare-input -- --gold evaluation/gold-set.json --raw evaluation/raw-references.txt\n\nOptionen:\n  --gold <pfad>    Pfad zur gold-set.json (Default ${DEFAULT_GOLD_PATH})\n  --raw <pfad>     Pfad zur Rohreferenz-Datei (Default ${DEFAULT_RAW_PATH})\n  --meta <pfad>    Pfad zur Metadatendatei (Default ${DEFAULT_META_PATH})\n  --output <pfad>  Ziel-Datei (Default ${DEFAULT_OUTPUT_PATH})\n  --style <name>   Optionaler Stilangabe für Meta-Infos (z.B. apa)\n`)
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

function buildMetadataIndex(metadata) {
  if (!metadata || !Array.isArray(metadata.items)) {
    return new Map()
  }
  const map = new Map()
  for (const item of metadata.items) {
    const key = item.normalizedId ?? item.openAlexId ?? null
    if (key) {
      map.set(key, item)
    }
  }
  return map
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

function fallbackId(index) {
  return `ref-${String(index + 1).padStart(3, '0')}`
}

function normaliseId(id) {
  if (!id) {
    return null
  }
  const match = String(id).match(/W\d+/i)
  if (match) {
    return match[0].toUpperCase()
  }
  return String(id)
}

function buildEntry({ goldItem, rawText, metadataItem, index, fallbackStyle }) {
  const entryId = goldItem?.id ?? metadataItem?.normalizedId ?? fallbackId(index)
  const formatting = metadataItem?.formatting ?? null
  const styleTemplate = formatting?.template ?? fallbackStyle ?? null
  return {
    id: entryId,
    category: metadataItem?.category ?? null,
    type: metadataItem?.category ?? null,
    openAlexId: metadataItem?.openAlexId ?? null,
    raw: rawText,
    gold: goldItem ?? null,
    note: metadataItem?.note ?? null,
    style: styleTemplate,
    formatting,
  }
}

async function main() {
  const options = parseArgs()
  const goldData = await loadJson(options.gold)
  const rawContent = await readFile(path.resolve(process.cwd(), options.raw), 'utf8')
  let metadataData = null
  try {
    metadataData = await loadJson(options.meta)
  }
  catch (error) {
    console.warn(`⚠️  Metadatendatei konnte nicht geladen werden (${options.meta}): ${error.message ?? error}`)
  }

  const goldItems = Array.isArray(goldData.references) ? goldData.references : Array.isArray(goldData) ? goldData : []
  if (!goldItems.length) {
    throw new Error('Keine Referenzen in der Gold-Datei gefunden. Erwarte Feld "references" oder Array.')
  }

  const rawEntries = splitRawReferences(rawContent)
  if (rawEntries.length !== goldItems.length) {
    console.warn(`⚠️  Anzahl Rohreferenzen (${rawEntries.length}) weicht von Gold-Einträgen (${goldItems.length}) ab. Es werden die kürzere Anzahl verwendet.`)
  }

  const metadataIndex = buildMetadataIndex(metadataData)
  const fallbackStyle = options.style ?? metadataData?.style ?? 'apa'
  const total = Math.min(rawEntries.length, goldItems.length)
  const entries = []

  for (let index = 0; index < total; index += 1) {
    const goldItem = goldItems[index]
    const rawText = rawEntries[index]
    const normalizedId = normaliseId(goldItem?.id ?? null)
    const metadataItem = normalizedId ? metadataIndex.get(normalizedId) ?? metadataIndex.get(goldItem?.id ?? '') : null
    entries.push(buildEntry({ goldItem, rawText, metadataItem, index, fallbackStyle }))
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    style: options.style ?? goldData.style ?? 'apa',
    total: entries.length,
    meta: {
      goldFile: path.relative(process.cwd(), path.resolve(process.cwd(), options.gold)),
      rawFile: path.relative(process.cwd(), path.resolve(process.cwd(), options.raw)),
      metaFile: metadataData ? path.relative(process.cwd(), path.resolve(process.cwd(), options.meta)) : null,
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
