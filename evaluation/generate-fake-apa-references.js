#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_RAW_OUT = 'evaluation/raw-references.fake-apa.txt'
const DEFAULT_WORKS_OUT = 'evaluation/crossref-works.fake.json'
const PER_CATEGORY = 25
const CATEGORIES = [
  'journal-article',
  'proceedings-article',
  'book',
  'book-chapter',
  'monograph',
  'report',
  'posted-content',
  'dissertation',
]

function parseArgs() {
  const options = { raw: DEFAULT_RAW_OUT, works: DEFAULT_WORKS_OUT, perCategory: PER_CATEGORY }
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]
    switch (a) {
      case '--raw':
        options.raw = args[++i]
        break
      case '--works':
        options.works = args[++i]
        break
      case '--per-category':
        options.perCategory = Math.max(1, Math.min(200, Number.parseInt(args[++i] ?? '', 10) || PER_CATEGORY))
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        console.warn(`Unbekannte Option: ${a}`)
    }
  }
  return options
}

function printHelp() {
  console.log(`Fake APA Generator\n\nVerwendung:\n  node evaluation/generate-fake-apa-references.js --raw ${DEFAULT_RAW_OUT} --works ${DEFAULT_WORKS_OUT}\n\nOptionen:\n  --raw <pfad>           Ausgabe-Datei für Rohreferenzen (Default ${DEFAULT_RAW_OUT})\n  --works <pfad>         Ausgabe-Datei für Works JSON (Default ${DEFAULT_WORKS_OUT})\n  --per-category <anz>   Anzahl pro Kategorie (Default ${PER_CATEGORY})\n`)
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function choice(arr) {
  return arr[randInt(0, arr.length - 1)]
}
function randString(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i += 1) out += chars[randInt(0, chars.length - 1)]
  return out
}
function titleCaseFirst(sentence) {
  const s = sentence.trim()
  if (!s)
    return s
  return s[0].toUpperCase() + s.slice(1)
}

const LAST_NAMES = [
  'Müller',
  'Meier',
  'Schmidt',
  'Schneider',
  'Weber',
  'Fischer',
  'Wagner',
  'Becker',
  'Hoffmann',
  'Schäfer',
  'Klein',
  'Wolf',
  'Neumann',
  'Braun',
  'Krüger',
  'Zimmermann',
  'Hofmann',
  'Hartmann',
  'König',
  'Krause',
  'Richter',
  'Vogel',
  'Stein',
  'Jansen',
  'Bauer',
  'Schröder',
  'Schultz',
  'Lange',
  'Haas',
  'Peters',
  'Fuchs',
  'Schmitt',
  'Brandt',
  'Kühn',
  'Schreiber',
  'Sommer',
  'Arnold',
  'Busch',
  'Keller',
  'Seidel',
  'Weiß',
  'Ott',
  'Dietrich',
  'Ulrich',
  'Heinrich',
  'Lorenz',
  'Graf',
  'Link',
  'Roth',
  'Weißmann',
  'Stahl',
  'Heinze',
  'Beck',
  'Franke',
  'Novák',
  'Nowak',
  'Kowalski',
  'Łukasiewicz',
  'Ivić',
  'Gruber',
  'O’Connor',
  'D’Amico',
  'García',
  'González',
  'Fernández',
  'Núñez',
  'Tavares',
  'Silva',
  'Ünal',
  'Öztürk',
  'Åström',
  'Sørensen',
  'Håkansson',
  'Nielsen',
  'Löfgren',
  'Järvinen',
  'López-García',
  'Smith-Jones',
]
const FIRST_NAMES = [
  'Anna',
  'Max',
  'Lukas',
  'Lea',
  'Paul',
  'Mia',
  'Jonas',
  'Lena',
  'Finn',
  'Emma',
  'Ben',
  'Marie',
  'Luis',
  'Sofia',
  'Leon',
  'Hannah',
  'Elias',
  'Amelie',
  'Noah',
  'Lara',
  'Nina',
  'Felix',
  'Philipp',
  'Clara',
  'David',
  'Oliver',
  'Charlotte',
  'Henry',
  'Ava',
  'Isabella',
  'James',
  'Lucas',
  'Mateo',
  'Elijah',
  'Emily',
  'Mila',
  'Sophie',
  'Liam',
  'Noelia',
  'Aarav',
  'Isha',
  'Kenji',
  'Yuna',
  'Bao',
  'Min',
  'Lucía',
  'Héloïse',
  'Zoë',
  'Renée',
  'Łukasz',
  'Søren',
  'Björn',
  'Iñigo',
  'María-José',
]
const SUFFIXES = ['Jr.', 'Sr.', 'III', 'II']
const JOURNALS = [
  'Journal of Computational Studies',
  'Advances in Data Science',
  'International Review of Systems',
  'European Journal of Applied Methods',
  'Transactions on Information Theory and Practice',
  'Journal of Modern Research',
  'Computational Methods and Applications',
  'Annals of Empirical Analytics',
  'Journal of Information Retrieval',
  'ACM Computing Surveys',
  'IEEE Transactions on Knowledge and Data Engineering',
  'Pattern Recognition Letters',
  'Neural Processing Letters',
  'Information Systems Journal',
  'Journal of Statistical Computation',
  'Data Mining and Knowledge Discovery',
]
const PUBLISHERS = ['Springwell Press', 'Northbridge Academic', 'Westlake University Press', 'Fintree Publishing', 'Oakridge Science', 'Broadview Academic']
const UNIVERSITIES = ['Universität Nordstadt', 'Technische Universität Westtal', 'Hochschule Ostbrück', 'Universität Südstadt', 'Freie Universität Bergheim']
const CONFERENCES = ['International Conference on Emerging Analytics (ICEA)', 'Symposium on Computational Methods (SCM)', 'European Conference on Applied Informatics (ECAI)', 'Workshop on Data-centric Systems (WDCS)']
const REPOSITORIES = ['OSF Preprints', 'Zenodo Preprints', 'Open Science Repository', 'Research Archives']

function initials(name) {
  const parts = name.split(/\s+/)
  // optionally add middle name initial
  if (Math.random() < 0.25) {
    parts.push(choice(FIRST_NAMES))
  }
  return parts.map(n => `${n[0]?.toUpperCase()}.`).join(' ')
}

function maybeSuffix() {
  return Math.random() < 0.08 ? ` ${choice(SUFFIXES)}` : ''
}

function formatAuthors(n = randInt(1, 7)) {
  const authors = []
  for (let i = 0; i < n; i += 1) {
    const first = choice(FIRST_NAMES)
    const last = choice(LAST_NAMES)
    const composedLast = Math.random() < 0.05 ? `${last}-${choice(LAST_NAMES)}` : last
    authors.push(`${composedLast}, ${initials(first)}${maybeSuffix()}`)
  }
  if (authors.length === 1)
    return authors[0]
  return `${authors.slice(0, -1).join(', ')} & ${authors.slice(-1)[0]}`
}

function randomYear() {
  return randInt(1993, new Date().getFullYear())
}
function randomPages() {
  const start = randInt(1, 200)
  const end = start + randInt(1, 20)
  return `${start}–${end}`
}
function randomVolume() {
  return String(randInt(1, 40))
}
function randomIssue() {
  return String(randInt(1, 12))
}
function randomTitle() {
  const ADJ = ['robust', 'adaptive', 'context-aware', 'probabilistic', 'approximate', 'neural', 'graph-based', 'hybrid', 'interpretable', 'scalable', 'efficient', 'modular', 'generalized', 'multi-modal', 'adversarial', 'semi-supervised', 'self-supervised']
  const NOUNS = ['evidence aggregation', 'sampling', 'representation learning', 'optimization', 'structured prediction', 'search', 'inference', 'evaluation', 'model selection', 'hyperparameter tuning', 'feature extraction', 'time series modeling', 'graph mining', 'language modeling']
  const METHODS = ['an empirical study', 'a simulation-based analysis', 'a practical guide', 'a multi-site comparison', 'a case study', 'foundations and applications', 'design and evaluation', 'a randomized benchmark', 'theory and practice', 'challenges and opportunities']
  const FIELD = ['computer vision', 'natural language processing', 'genomics', 'healthcare', 'recommender systems', 'social networks', 'climate modeling', 'robotics', 'education']
  const sep = Math.random() < 0.6 ? ':' : ' — '
  const base = `${choice(ADJ)} ${choice(NOUNS)}`
  const tail = Math.random() < 0.3 ? ` in ${choice(FIELD)}` : ''
  const full = `${base}${sep} ${choice(METHODS)}${tail}`
  // sentence case
  return titleCaseFirst(full)
}
function randomBookTitle() {
  const topics = ['Foundations of Modern Analytics', 'Principles of Data-Centric AI', 'Methods in Empirical Computing', 'Advances in Applied Statistics', 'Contemporary Topics in Information Systems', 'Design Patterns for Research Software', 'Practical Graph Algorithms', 'Modern Time Series Analysis', 'Learning-based Optimization']
  return choice(topics)
}

const CATEGORY_CODES = {
  'journal-article': 'ja',
  'proceedings-article': 'pa',
  'book': 'bk',
  'book-chapter': 'bc',
  'monograph': 'mo',
  'report': 'rp',
  'posted-content': 'pc',
  'dissertation': 'ds',
}

function generateFakeDoi(seq, category, year) {
  const prefixes = ['10.55555', '10.12345', '10.54321', '10.42424', '10.99999', '10.1101', '10.1007', '10.1137']
  const prefix = choice(prefixes)
  const code = CATEGORY_CODES[category] ?? 'xx'
  const partA = randString(randInt(3, 5))
  const partB = randString(randInt(4, 7))
  const patterns = [
    `${prefix}/${code}.${year}.${seq}.${partA}-${partB}`,
    `${prefix}/${code}-${randString(3)}.${seq}${year}${randString(2)}`,
    `${prefix}/${randString(2)}.${randString(4)}.${year}.${seq}`,
    `${prefix}/${code}/${year}/${seq}${randString(3)}`,
    `${prefix}/${code}.${randString(2)}.${year}.${String(randInt(1, 12)).padStart(2, '0')}.${String(randInt(1, 9999)).padStart(4, '0')}`,
  ]
  return choice(patterns)
}

function makeJournalArticle(doi, year) {
  const authors = formatAuthors()
  year = year ?? randomYear()
  const title = randomTitle()
  const journal = choice(JOURNALS)
  const volume = randomVolume()
  const includeIssue = Math.random() < 0.8
  const issue = includeIssue ? `(${randomIssue()})` : ''
  const pages = Math.random() < 0.7 ? randomPages() : `e${randInt(1000, 99999)}`
  const afterJournal = issue ? `${volume}${issue}` : `${volume}`
  const base = `${authors} (${year}). ${title}. ${journal}, ${afterJournal}, ${pages}.`
  return `${base} https://doi.org/${doi}`
}

function makeProceedingsArticle(doi, year) {
  const authors = formatAuthors()
  year = year ?? randomYear()
  const title = randomTitle()
  const conf = choice(CONFERENCES)
  const pages = randomPages()
  const publisher = choice(PUBLISHERS)
  const styleA = `${authors} (${year}). ${title}. In ${conf} (pp. ${pages}). ${publisher}.`
  const styleB = `${authors} (${year}). ${title}. In Proceedings of the ${conf} (pp. ${pages}). ${publisher}.`
  const base = Math.random() < 0.5 ? styleA : styleB
  return `${base} https://doi.org/${doi}`
}

function makeBook(doi, year) {
  const authors = formatAuthors(randInt(1, 3))
  year = year ?? randomYear()
  const title = randomBookTitle()
  const edition = Math.random() < 0.25 ? ` (${randInt(2, 5)}nd ed.).` : '.'
  const publisher = choice(PUBLISHERS)
  const base = `${authors} (${year}). ${title}.${edition} ${publisher}.`.replace(/\.\./g, '.')
  return `${base} https://doi.org/${doi}`
}

function makeBookChapter(doi, year) {
  const authors = formatAuthors(randInt(1, 3))
  year = year ?? randomYear()
  const chapterTitle = randomTitle()
  const editorCount = randInt(1, 3)
  const editors = formatAuthors(editorCount)
  const edLabel = editorCount === 1 ? '(Ed.)' : '(Eds.)'
  const bookTitle = randomBookTitle()
  const pages = randomPages()
  const publisher = choice(PUBLISHERS)
  const base = `${authors} (${year}). ${chapterTitle}. In ${editors} ${edLabel}, ${bookTitle} (pp. ${pages}). ${publisher}.`
  return `${base} https://doi.org/${doi}`
}

function makeMonograph(doi, year) {
  // Similar to book
  return makeBook(doi, year)
}

function makeReport(doi, year) {
  const authors = formatAuthors(randInt(1, 3))
  year = year ?? randomYear()
  const title = randomTitle()
  const label = choice(['Technical Report', 'Working Paper', 'White Paper', 'Research Report'])
  const number = `${choice(['TR', 'WP', 'RP'])}-${year}-${randInt(100, 999)}`
  const org = choice(PUBLISHERS)
  const base = `${authors} (${year}). ${title} (${label} No. ${number}). ${org}.`
  return `${base} https://doi.org/${doi}`
}

function makePostedContent(doi, year) {
  const authors = formatAuthors(randInt(1, 4))
  year = year ?? randomYear()
  const title = randomTitle()
  const repo = choice(REPOSITORIES)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const withDate = Math.random() < 0.5
  const datePart = withDate ? `, ${choice(months)} ${randInt(1, 28)}` : ''
  const url = `https://example.org/preprint/${year}/${randInt(1000, 9999)}`
  const base = `${authors} (${year}${datePart}). ${title}. ${repo}. ${url}`
  return `${base} https://doi.org/${doi}`
}

function makeDissertation(doi, year) {
  const authors = formatAuthors(1)
  year = year ?? randomYear()
  const title = randomTitle()
  const uni = choice(UNIVERSITIES)
  const base = `${authors} (${year}). ${title} (Doctoral dissertation, ${uni}).`
  return `${base} https://doi.org/${doi}`
}

const GENERATORS = {
  'journal-article': makeJournalArticle,
  'proceedings-article': makeProceedingsArticle,
  'book': makeBook,
  'book-chapter': makeBookChapter,
  'monograph': makeMonograph,
  'report': makeReport,
  'posted-content': makePostedContent,
  'dissertation': makeDissertation,
}

async function ensureDir(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

async function main() {
  const options = parseArgs()
  const items = []
  const rawSegments = []

  let seq = 0
  for (const category of CATEGORIES) {
    const gen = GENERATORS[category]
    for (let i = 0; i < options.perCategory; i += 1) {
      // Generate a year first for DOI consistency
      const year = randomYear()
      const doi = generateFakeDoi(++seq, category, year)
      // Rebuild the text using a small wrapper that injects year again
      // Since our generators call randomYear internally, we accept minor drift; DOI remains unique.
      const text = gen(doi, year)
      items.push({ doi, category, bibliography: { apa: text } })
      rawSegments.push(text)
    }
  }

  const worksPayload = {
    generatedAt: new Date().toISOString(),
    styles: [{ alias: 'apa', id: 'apa' }],
    locale: 'en-US',
    items,
  }

  await ensureDir(options.works)
  await ensureDir(options.raw)
  await writeFile(path.resolve(process.cwd(), options.works), JSON.stringify(worksPayload, null, 2), 'utf8')
  await writeFile(path.resolve(process.cwd(), options.raw), `${rawSegments.join('\n\n')}\n`, 'utf8')

  console.log(`✅ Fake-Works exportiert: ${options.works}`)
  console.log(`✅ Fake-Rohreferenzen exportiert: ${options.raw} (gesamt ${rawSegments.length})`)
}

main().catch((err) => {
  console.error('Erzeugung der Fake-Referenzen fehlgeschlagen:')
  console.error(err)
  process.exitCode = 1
})
