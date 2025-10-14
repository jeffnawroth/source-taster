#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import { constants as fsConstants } from 'node:fs'
import { access, readdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const OUTPUT_DIR = 'evaluation/out'
const INPUT_PREFIX = 'live-input.crossref.'
const INPUT_SUFFIX = '.json'
const DEFAULT_CLIENT_ID = '3870e944-09d9-4b9c-ba0e-9942b8fd7b69'
const SKIP_STYLES = new Set(['acs', 'apa'])

function parseArgs() {
  const options = {
    styles: null,
    force: false,
    clientId: process.env.SOURCE_TASTER_CLIENT_ID ?? DEFAULT_CLIENT_ID,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    switch (arg) {
      case '--styles':
        options.styles = args[++i]?.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) ?? null
        break
      case '--force':
        options.force = true
        break
      case '--client-id':
        options.clientId = args[++i] ?? options.clientId
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        if (!arg.startsWith('-') && !options.styles) {
          options.styles = arg.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        }
        else {
          console.warn(`⚠️  Unbekannte Option ignoriert: ${arg}`)
        }
    }
  }

  if (!options.clientId) {
    console.warn('⚠️  Kein --client-id angegeben; API-Aufrufe könnten fehlschlagen.')
  }

  return options
}

function printHelp() {
  console.log(`Run AnyStyle-only live evaluation for multiple citation styles.

Verwendung:
  node evaluation/run-live-anystyle-batch.js [--styles ama,mla,...] [--client-id <uuid>] [--force]

Ohne --styles werden alle verfügbaren Crossref-Stile (außer acs & apa) verarbeitet.`)
}

async function fileExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK)
    return true
  }
  catch {
    return false
  }
}

async function getAvailableStyles() {
  const dirPath = path.resolve(process.cwd(), OUTPUT_DIR)
  const files = await readdir(dirPath)
  return files
    .filter(name => name.startsWith(INPUT_PREFIX) && name.endsWith(INPUT_SUFFIX))
    .map(name => name.slice(INPUT_PREFIX.length, -INPUT_SUFFIX.length))
    .filter(style => !SKIP_STYLES.has(style))
    .sort((a, b) => a.localeCompare(b, 'de'))
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })

    child.on('error', reject)
  })
}

async function removeIfExists(filePath) {
  if (await fileExists(filePath)) {
    await rm(filePath, { force: true })
  }
}

async function moveSummaryFiles(style) {
  const summaryJsonSrc = path.resolve(process.cwd(), OUTPUT_DIR, 'metrics-summary.json')
  const summaryMdSrc = path.resolve(process.cwd(), OUTPUT_DIR, 'metrics-summary.md')
  const summaryJsonDest = path.resolve(process.cwd(), OUTPUT_DIR, `metrics-summary.crossref.${style}-anystyle.json`)
  const summaryMdDest = path.resolve(process.cwd(), OUTPUT_DIR, `metrics-summary.crossref.${style}-anystyle.md`)

  if (!(await fileExists(summaryJsonSrc)) || !(await fileExists(summaryMdSrc))) {
    throw new Error('Erwarte metrics-summary.{json,md}, aber Dateien wurden nicht gefunden.')
  }

  await removeIfExists(summaryJsonDest)
  await removeIfExists(summaryMdDest)

  await rename(summaryJsonSrc, summaryJsonDest)
  await rename(summaryMdSrc, summaryMdDest)

  return { summaryJsonDest, summaryMdDest }
}

async function processStyle(style, clientId, force) {
  const inputPath = path.resolve(process.cwd(), OUTPUT_DIR, `${INPUT_PREFIX}${style}${INPUT_SUFFIX}`)
  if (!(await fileExists(inputPath))) {
    throw new Error(`Eingabedatei nicht gefunden: ${path.relative(process.cwd(), inputPath)}`)
  }

  const outputPath = path.resolve(process.cwd(), OUTPUT_DIR, `live-results.crossref.${style}-anystyle.json`)
  const summaryJsonDest = path.resolve(process.cwd(), OUTPUT_DIR, `metrics-summary.crossref.${style}-anystyle.json`)
  const summaryMdDest = path.resolve(process.cwd(), OUTPUT_DIR, `metrics-summary.crossref.${style}-anystyle.md`)

  if (!force && await fileExists(summaryJsonDest) && await fileExists(summaryMdDest)) {
    console.log(`⏭️  Überspringe ${style}: Zusammenfassung bereits vorhanden. (--force zum Überschreiben)`)
    return
  }

  console.log(`\n=== ${style.toUpperCase()} ===`)
  console.log(`→ Starte pnpm evaluation:run-live für ${style}`)
  const runLiveArgs = [
    'evaluation:run-live',
    '--anystyle-only',
    '--also-no-doi',
    '--input',
    path.relative(process.cwd(), inputPath),
    '--output',
    path.relative(process.cwd(), outputPath),
  ]
  if (clientId) {
    runLiveArgs.push('--client-id', clientId)
  }

  await runCommand('pnpm', runLiveArgs)

  console.log(`→ Berechne Kennzahlen für ${style}`)
  const evaluationArgs = [
    'evaluation',
    '--input',
    path.relative(process.cwd(), outputPath),
  ]
  await runCommand('pnpm', evaluationArgs)

  const moved = await moveSummaryFiles(style)
  console.log(`✅ Fertig: ${style} → ${path.relative(process.cwd(), moved.summaryJsonDest)}, ${path.relative(process.cwd(), moved.summaryMdDest)}`)
}

async function main() {
  const { styles: requestedStyles, force, clientId } = parseArgs()
  const availableStyles = await getAvailableStyles()

  const targetStyles = requestedStyles ?? availableStyles
  const uniqueTargetStyles = [...new Set(targetStyles)]

  if (!uniqueTargetStyles.length) {
    console.log('Keine Stile zum Verarbeiten gefunden.')
    return
  }

  const unknown = uniqueTargetStyles.filter(style => !availableStyles.includes(style))
  if (unknown.length) {
    throw new Error(`Unbekannte Stile: ${unknown.join(', ')}. Verfügbare Stile: ${availableStyles.join(', ')}`)
  }

  for (const style of uniqueTargetStyles) {
    await processStyle(style, clientId, force)
  }

  console.log('\n🎉 Alle gewünschten Evaluierungen abgeschlossen.')
}

main().catch((error) => {
  console.error('\n❌ Skript abgebrochen.')
  console.error(error)
  process.exitCode = 1
})
