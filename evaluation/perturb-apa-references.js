#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_INPUT = 'evaluation/raw-references.crossref.txt'
const DEFAULT_OUTPUT = 'evaluation/raw-references.apa-perturbed.txt'
const DEFAULT_REPORT = 'evaluation/perturbation-report.apa.json'

function parseArgs() {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    report: DEFAULT_REPORT,
    profile: 'medium',
    seed: String(Date.now()),
    // Allow overrides via CLI (probabilities 0..1)
    typo: null,
    title: null,
    year: null,
    author: null,
    punct: null,
    doi: null,
    maxOps: null,
  }
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]
    if (a === '--')
      continue
    switch (a) {
      case '--input': options.input = args[++i]
        break
      case '--output': options.output = args[++i]
        break
      case '--report': options.report = args[++i]
        break
      case '--profile': options.profile = args[++i] ?? 'medium'
        break
      case '--seed': options.seed = String(args[++i] ?? options.seed)
        break
      case '--typo': options.typo = Number(args[++i] ?? '')
        break
      case '--title': options.title = Number(args[++i] ?? '')
        break
      case '--year': options.year = Number(args[++i] ?? '')
        break
      case '--author': options.author = Number(args[++i] ?? '')
        break
      case '--punct': options.punct = Number(args[++i] ?? '')
        break
      case '--doi': options.doi = Number(args[++i] ?? '')
        break
      case '--max-ops': options.maxOps = Number(args[++i] ?? '')
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
  console.log(`APA Perturbation Generator\n\nVerwendung:\n  node evaluation/perturb-apa-references.js --input ${DEFAULT_INPUT} --output ${DEFAULT_OUTPUT} --report ${DEFAULT_REPORT}\n\nOptionen:\n  --input <pfad>     Eingabe (APA Rohreferenzen, leerzeilengetrennt)\n  --output <pfad>    Ausgabe modifizierte Referenzen (leerzeilengetrennt)\n  --report <pfad>    JSON-Report mit angewandten Modifikationen\n  --profile <name>   light|medium|heavy (Default medium)\n  --seed <wert>      Seed für Reproduzierbarkeit\n  --typo n           Wahrscheinlichkeit 0..1 für Tippfehler\n  --title n          Wahrscheinlichkeit 0..1 für Titeländerungen\n  --year n           Wahrscheinlichkeit 0..1 für Jahresänderungen\n  --author n         Wahrscheinlichkeit 0..1 für Autorenänderungen\n  --punct n          Wahrscheinlichkeit 0..1 für Zeichensetzung/Format\n  --doi n            Wahrscheinlichkeit 0..1 für DOI-Varianten\n  --max-ops n        Obergrenze Modifikationen pro Eintrag (Default profilabhängig)\n`)
}

function mulberry32(seedStr) {
  let h = 1779033703 ^ seedStr.length
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353)
    h = h << 13 | h >>> 19
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function pickProfile(profile) {
  // Probabilities per operation and max modifications per entry
  switch ((profile || '').toLowerCase()) {
    case 'light': return { typo: 0.35, title: 0.15, year: 0.12, author: 0.12, punct: 0.15, doi: 0.05, maxOps: 2 }
    case 'heavy': return { typo: 0.65, title: 0.35, year: 0.30, author: 0.30, punct: 0.35, doi: 0.15, maxOps: 4 }
    case 'medium':
    default: return { typo: 0.5, title: 0.25, year: 0.2, author: 0.2, punct: 0.2, doi: 0.08, maxOps: 3 }
  }
}

function rgx(re, text) {
  const m = re.exec(text)
  return m ? { m, i: m.index } : null
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function splitEntries(content) {
  return content.split(/\r?\n\s*\n/).map(s => s.trim()).filter(Boolean)
}

function toTitleSection(text) {
  // Heuristic: title between ") " and the next ". "
  const afterYear = text.indexOf('). ')
  if (afterYear === -1)
    return { start: -1, end: -1 }
  const start = afterYear + 3
  let end = text.indexOf('. ', start)
  if (end === -1)
    end = text.indexOf('.', start)
  if (end === -1)
    return { start: -1, end: -1 }
  return { start, end }
}

const NEIGHBORS = {
  q: 'qwsa',
  w: 'wqesad',
  e: 'ewsdr',
  r: 'retdf',
  t: 'trygf',
  y: 'ytuhg',
  u: 'uyijh',
  i: 'iujko',
  o: 'oipkl',
  p: 'poölü',
  a: 'aqwsz',
  s: 'sweradx',
  d: 'dfrewsxc',
  f: 'fgtrdcv',
  g: 'ghyftvb',
  h: 'hjuygbn',
  j: 'jkuihnm',
  k: 'kjiolm,',
  l: 'löökmp.',
  z: 'zasx',
  x: 'xzsdc',
  c: 'cvxdf',
  v: 'vbcfg',
  b: 'bnvgh',
  n: 'nbmhj',
  m: 'mnjk,',
}

function randChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function randomTypo(rng, text) {
  const letters = [...text].map((ch, idx) => ({ ch, idx })).filter(c => /[A-ZÄÖÜß]/i.test(c.ch))
  if (!letters.length)
    return { text, op: null }
  const pick = randChoice(rng, letters)
  const lower = pick.ch.toLowerCase()
  const pool = NEIGHBORS[lower] || 'abcdefghijklmnopqrstuvwxyz'
  const repl = randChoice(rng, pool.split(''))
  const newCh = pick.ch === lower ? repl : repl.toUpperCase()
  const out = text.slice(0, pick.idx) + newCh + text.slice(pick.idx + 1)
  return { text: out, op: { type: 'typo', index: pick.idx, from: pick.ch, to: newCh } }
}

function randomYearChange(rng, text) {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const m = /(\()(\d{4})(\))/.exec(text)
  if (!m)
    return { text, op: null }
  const year = Number(m[2])
  let offset = Math.floor(rng() * 5) - 2 // -2..+2
  if (offset === 0)
    offset = 1
  const newYear = clamp(year + offset, 1900, new Date().getFullYear())
  const out = text.replace(/\(\d{4}\)/, `(${newYear})`)
  return { text: out, op: { type: 'year', from: year, to: newYear, offset } }
}

function randomAuthorChange(rng, text) {
  const paren = text.indexOf(' (')
  if (paren === -1)
    return { text, op: null }
  const authors = text.slice(0, paren)
  const rest = text.slice(paren)
  const parts = authors.split(/,\s+|\s+&\s+/)
  if (parts.length < 1)
    return { text, op: null }

  const mode = rng() < 0.4 && parts.length >= 3 ? 'etal' : rng() < 0.7 ? 'initial' : 'connector'
  let newAuthors = authors
  let detail = null
  if (mode === 'etal' && parts.length >= 3) {
    const first = parts[0]
    newAuthors = `${first}, et al.`
    detail = { mode: 'etal', removed: parts.length - 1 }
  }
  else if (mode === 'initial') {
    // drop one dot or one initial
    const m = authors.match(/([A-ZÄÖÜ]\.)+/)
    if (m) {
      const from = m[0]
      const to = from.replace(/\./, '')
      newAuthors = authors.replace(from, to)
      detail = { mode: 'initial-dot-removed', from, to }
    }
    else {
      // as fallback, remove last initial letter
      newAuthors = authors.replace(/([A-ZÄÖÜ])\./, '$1')
      detail = { mode: 'initial-dot-removed-fallback' }
    }
  }
  else {
    newAuthors = authors.replace(/\s+&\s+/g, ' and ')
    detail = { mode: 'connector-and' }
  }
  return { text: `${newAuthors}${rest}`, op: { type: 'author', ...detail } }
}

function randomPunctuationChange(rng, text) {
  // Several small APA-format nudges
  if (rng() < 0.33) {
    // Replace en dash with hyphen or vice versa in page range
    const out = text.replace(/(\d)–(\d)/, (_, a, b) => `${a}-${b}`)
    if (out !== text)
      return { text: out, op: { type: 'punct', mode: 'page-dash-to-hyphen' } }
  }
  if (rng() < 0.33) {
    // Remove parentheses around issue: 12(3) -> 12, 3
    const out = text.replace(/,\s*(\d+)\((\d+)\),/, (_, v, i) => `, ${v}, ${i},`)
    if (out !== text)
      return { text: out, op: { type: 'punct', mode: 'issue-parens-removed' } }
  }
  // Replace ": " with " —  " occasionally
  if (rng() < 0.5) {
    const out = text.replace(/: /, ' —  ')
    if (out !== text)
      return { text: out, op: { type: 'punct', mode: 'colon-to-dash' } }
  }
  // Drop a comma after journal if present
  const out = text.replace(/\. ([^.,]+), (\d)/, '. $1 $2')
  if (out !== text)
    return { text: out, op: { type: 'punct', mode: 'drop-comma-after-journal' } }
  return { text, op: null }
}

function randomTitleChange(rng, text) {
  const { start, end } = toTitleSection(text)
  if (start === -1)
    return { text, op: null }
  const title = text.slice(start, end)
  const words = title.split(/\s+/).filter(Boolean)
  if (words.length < 2)
    return { text, op: null }
  const mode = rng() < 0.4 ? 'swap' : (rng() < 0.7 ? 'drop-hyphen' : 'lower-first')
  let newTitle = title
  let detail = null
  if (mode === 'swap' && words.length >= 2) {
    const i = Math.floor(rng() * (words.length - 1))
    const tmp = words[i]
    words[i] = words[i + 1]
    words[i + 1] = tmp
    newTitle = words.join(' ')
    detail = { mode: 'swap-words', index: i }
  }
  else if (mode === 'drop-hyphen') {
    newTitle = title.replace(/\s*—\s*|\s*-\s*/g, ' ')
    if (newTitle === title)
      return { text, op: null }
    detail = { mode: 'remove-dash' }
  }
  else {
    newTitle = title.replace(/^([A-ZÄÖÜ])/, (m, c) => c.toLowerCase())
    if (newTitle === title)
      return { text, op: null }
    detail = { mode: 'lowercase-initial' }
  }
  return { text: text.slice(0, start) + newTitle + text.slice(end), op: { type: 'title', ...detail } }
}

function randomDoiChange(rng, text) {
  const m = rgx(/https?:\/\/doi\.org\/(\S+)/, text)
  if (!m)
    return { text, op: null }
  const full = m.m[0]
  const suffix = m.m[1]
  const mode = rng() < 0.5 ? 'drop-prefix' : 'mutate-char'
  if (mode === 'drop-prefix') {
    const out = text.replace(full, suffix)
    return { text: out, op: { type: 'doi', mode } }
  }
  // mutate one char in suffix
  const idx = Math.floor(rng() * suffix.length)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789./-'
  const newCh = chars[Math.floor(rng() * chars.length)]
  const newSuffix = suffix.slice(0, idx) + newCh + suffix.slice(idx + 1)
  const out = text.replace(full, `https://doi.org/${newSuffix}`)
  return { text: out, op: { type: 'doi', mode, index: idx } }
}

function buildRates(options) {
  const base = pickProfile(options.profile)
  const rates = { ...base }
  for (const k of ['typo', 'title', 'year', 'author', 'punct', 'doi']) {
    if (typeof options[k] === 'number' && options[k] >= 0 && options[k] <= 1) {
      rates[k] = options[k]
    }
  }
  if (typeof options.maxOps === 'number' && options.maxOps > 0) {
    rates.maxOps = Math.floor(options.maxOps)
  }
  return rates
}

function shouldApply(rng, p) {
  return rng() < p
}

async function ensureDir(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

async function main() {
  const options = parseArgs()
  const rng = mulberry32(options.seed)
  const rates = buildRates(options)

  const inputText = await readFile(path.resolve(process.cwd(), options.input), 'utf8')
  const entries = splitEntries(inputText)

  const outEntries = []
  const reportEntries = []

  for (let i = 0; i < entries.length; i += 1) {
    const original = entries[i]
    let modified = original
    const operations = []

    const candidates = []
    if (shouldApply(rng, rates.typo))
      candidates.push(randomTypo)
    if (shouldApply(rng, rates.title))
      candidates.push(randomTitleChange)
    if (shouldApply(rng, rates.year))
      candidates.push(randomYearChange)
    if (shouldApply(rng, rates.author))
      candidates.push(randomAuthorChange)
    if (shouldApply(rng, rates.punct))
      candidates.push(randomPunctuationChange)
    if (shouldApply(rng, rates.doi))
      candidates.push(randomDoiChange)

    // Randomize order
    for (let j = candidates.length - 1; j > 0; j -= 1) {
      const k = Math.floor(rng() * (j + 1))
      const tmp = candidates[j]
      candidates[j] = candidates[k]
      candidates[k] = tmp
    }

    const maxOps = Math.min(rates.maxOps, candidates.length)
    const opCount = Math.max(1, Math.min(maxOps, 1 + Math.floor(rng() * maxOps)))
    for (let j = 0; j < opCount; j += 1) {
      const fn = candidates[j]
      if (!fn)
        break
      const res = fn(rng, modified)
      if (res?.op)
        operations.push(res.op)
      modified = res.text ?? modified
    }

    outEntries.push(modified)
    reportEntries.push({ index: i, original, modified, operations })
  }

  await ensureDir(options.output)
  await ensureDir(options.report)
  await writeFile(path.resolve(process.cwd(), options.output), `${outEntries.join('\n\n')}\n`, 'utf8')
  const reportPayload = {
    generatedAt: new Date().toISOString(),
    seed: options.seed,
    profile: options.profile,
    rates,
    input: path.relative(process.cwd(), path.resolve(process.cwd(), options.input)),
    output: path.relative(process.cwd(), path.resolve(process.cwd(), options.output)),
    entries: reportEntries,
  }
  await writeFile(path.resolve(process.cwd(), options.report), JSON.stringify(reportPayload, null, 2), 'utf8')
  console.log(`✅ Perturbation abgeschlossen → ${options.output}`)
  console.log(`ℹ️ Report → ${options.report}`)
}

main().catch((err) => {
  console.error('Perturbation fehlgeschlagen:')
  console.error(err)
  process.exitCode = 1
})
