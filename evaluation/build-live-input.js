#!/usr/bin/env node
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_RAW_PATH = 'evaluation/raw-references.crossref.txt'
const DEFAULT_WORKS_PATH = 'evaluation/crossref-works.json'
const DEFAULT_OUTPUT_PATH = 'evaluation/out/live-input.crossref.json'

function parseArgs() {
  const options = {
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
          options.raw = arg
        }
        else {
          console.warn(`Unbekannte Option: ${arg}`)
        }
    }
  }
  return options
}

function printHelp() {
  console.log(`Live-Input Builder\n\nVerwendung:\n  pnpm evaluation:prepare-input -- --raw evaluation/raw-references.crossref.txt\n\nOptionen:\n  --raw <pfad>     Pfad zur Rohreferenz-Datei (Default ${DEFAULT_RAW_PATH})\n  --works <pfad>   (Optional) Pfad zu crossref-works.json (Default ${DEFAULT_WORKS_PATH})\n  --output <pfad>  Ziel-Datei (Default ${DEFAULT_OUTPUT_PATH})\n  --style <name>   Optionaler Stilname (Default apa)`)
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

function buildEntry({ worksEntry, rawText, index, style }) {
  return {
    id: worksEntry?.doi ?? fallbackId(index),
    category: worksEntry?.category ?? null,
    type: worksEntry?.category ?? null,
    raw: rawText,
    style,
  }
}

async function main() {
  const options = parseArgs()
  const rawContent = await readFile(path.resolve(process.cwd(), options.raw), 'utf8')
  let worksData = null
  try {
    worksData = await loadJson(options.works)
  }
  catch (error) {
    console.warn(`⚠️  Works-Datei konnte nicht geladen werden (${options.works}): ${error.message ?? error}`)
  }
  const rawEntries = splitRawReferences(rawContent)

  const worksItems = Array.isArray(worksData?.items) ? worksData.items : []
  const resolvedStyle = options.style ?? 'apa'
  const total = rawEntries.length
  const entries = []

  for (let index = 0; index < total; index += 1) {
    const worksEntry = worksItems[index] ?? null
    const rawText = rawEntries[index]
    entries.push(buildEntry({ worksEntry, rawText, index, style: resolvedStyle }))
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    style: resolvedStyle,
    total: entries.length,
    meta: {
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
