#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const OUT_MD = 'evaluation/out/technical-evaluation.md'
const REAL_STYLES = ['acs', 'ama', 'apa', 'chicago', 'harvard', 'ieee', 'mla', 'nature', 'springer', 'vancouver']

function fmt(n, fractionDigits = 2, forceDecimals = false) {
  if (n === null || n === undefined)
    return 'n/a'
  if (!Number.isFinite(n))
    return String(n)
  if (!forceDecimals && n % 1 === 0)
    return String(n)
  return Number(n).toFixed(fractionDigits)
}
function pct(n, total) {
  if (!total)
    return '0%'
  const v = (n / total) * 100
  return `${v.toFixed(1)}%`
}
function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map(r => `| ${r.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |`).join('\n')
  return [head, sep, body].filter(Boolean).join('\n')
}

async function loadJson(file) {
  const p = path.resolve(process.cwd(), file)
  const raw = await readFile(p, 'utf8')
  return JSON.parse(raw)
}

async function ensureDir(filePath) {
  const dir = path.dirname(path.resolve(process.cwd(), filePath))
  await mkdir(dir, { recursive: true })
}

async function build() {
  const lines = []

  // Real styles summary
  const realSummaries = []
  for (const style of REAL_STYLES) {
    const file = `evaluation/out/metrics-summary.${style}.json`
    try {
      const data = await loadJson(file)
      const ov = data?.matching?.overall
      if (ov) {
        realSummaries.push({ style, count: ov.count, avg: ov.average, median: ov.median, q1: ov.q1, q3: ov.q3, buckets: ov.buckets })
      }
    }
    catch {
      // ignore missing styles
    }
  }

  // Fake APA
  let fake = null
  try {
    fake
      = await loadJson('evaluation/out/metrics-summary.fake-apa.json')
  }
  catch {}

  // Perturbed APA
  let pert = null
  try {
    pert
      = await loadJson('evaluation/out/metrics-summary.apa-perturbed.json')
  }
  catch {}

  lines.push('# Technische Evaluation')
  lines.push('')
  lines.push('- Ziel: Wie gut erkennt und zuordnet die Pipeline echte Quellen – auch bei unordentlichen Eingaben – und wie schnell arbeitet sie?')
  lines.push('- Datensätze: Reale Referenzen (verschiedene Zitationsstile), synthetische (Fake) APA-Referenzen und APA-Referenzen mit realistischen Störungen (Tippfehler etc.).')

  // Real styles
  if (realSummaries.length) {
    lines.push('\n## Reale Referenzen – Gesamt nach Stil')
    const headers = ['Stil', 'N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
    const rows = realSummaries.map(s => [
      s.style,
      fmt(s.count),
      fmt(s.avg),
      fmt(s.median),
      fmt(s.q1),
      fmt(s.q3),
      `${s.buckets?.exact ?? 0} (${pct(s.buckets?.exact ?? 0, s.count)})`,
      `${s.buckets?.strong ?? 0} (${pct(s.buckets?.strong ?? 0, s.count)})`,
      `${s.buckets?.possible ?? 0} (${pct(s.buckets?.possible ?? 0, s.count)})`,
      `${s.buckets?.none ?? 0} (${pct(s.buckets?.none ?? 0, s.count)})`,
    ])
    lines.push(table(headers, rows))
  }

  // Fake APA
  if (fake) {
    lines.push('\n## Synthetische (Fake) APA-Referenzen')
    const ov = fake.matching?.overall
    if (ov) {
      const hdr = ['N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
      const row = [[
        fmt(ov.count),
        fmt(ov.average),
        fmt(ov.median),
        fmt(ov.q1),
        fmt(ov.q3),
        `${ov.buckets?.exact ?? 0} (${pct(ov.buckets?.exact ?? 0, ov.count)})`,
        `${ov.buckets?.strong ?? 0} (${pct(ov.buckets?.strong ?? 0, ov.count)})`,
        `${ov.buckets?.possible ?? 0} (${pct(ov.buckets?.possible ?? 0, ov.count)})`,
        `${ov.buckets?.none ?? 0} (${pct(ov.buckets?.none ?? 0, ov.count)})`,
      ]]
      lines.push('### Gesamt')
      lines.push(table(hdr, row))
    }
    if (Array.isArray(fake.matching?.perType)) {
      const headers = ['Typ', 'N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
      const rows = fake.matching.perType.map(t => [
        t.type,
        fmt(t.count),
        fmt(t.average),
        fmt(t.median),
        fmt(t.q1),
        fmt(t.q3),
        t.buckets?.exact ?? 0,
        t.buckets?.strong ?? 0,
        t.buckets?.possible ?? 0,
        t.buckets?.none ?? 0,
      ])
      lines.push('\n### Nach Publikationstyp')
      lines.push(table(headers, rows))
    }
  }

  // Perturbed APA
  if (pert) {
    lines.push('\n## APA-Referenzen mit realistischen Störungen')
    const ov = pert.matching?.overall
    if (ov) {
      const hdr = ['N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
      const row = [[
        fmt(ov.count),
        fmt(ov.average),
        fmt(ov.median),
        fmt(ov.q1),
        fmt(ov.q3),
        `${ov.buckets?.exact ?? 0} (${pct(ov.buckets?.exact ?? 0, ov.count)})`,
        `${ov.buckets?.strong ?? 0} (${pct(ov.buckets?.strong ?? 0, ov.count)})`,
        `${ov.buckets?.possible ?? 0} (${pct(ov.buckets?.possible ?? 0, ov.count)})`,
        `${ov.buckets?.none ?? 0} (${pct(ov.buckets?.none ?? 0, ov.count)})`,
      ]]
      lines.push('### Gesamt (mit DOI)')
      lines.push(table(hdr, row))
    }
    if (Array.isArray(pert.matching?.perType)) {
      const headers = ['Typ', 'N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
      const rows = pert.matching.perType.map(t => [
        t.type,
        fmt(t.count),
        fmt(t.average),
        fmt(t.median),
        fmt(t.q1),
        fmt(t.q3),
        t.buckets?.exact ?? 0,
        t.buckets?.strong ?? 0,
        t.buckets?.possible ?? 0,
        t.buckets?.none ?? 0,
      ])
      lines.push('\n### Nach Publikationstyp (mit DOI)')
      lines.push(table(headers, rows))
    }
    const ovND = pert.matchingNoDoi?.overall
    if (ovND) {
      const hdr = ['N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
      const row = [[
        fmt(ovND.count),
        fmt(ovND.average),
        fmt(ovND.median),
        fmt(ovND.q1),
        fmt(ovND.q3),
        `${ovND.buckets?.exact ?? 0} (${pct(ovND.buckets?.exact ?? 0, ovND.count)})`,
        `${ovND.buckets?.strong ?? 0} (${pct(ovND.buckets?.strong ?? 0, ovND.count)})`,
        `${ovND.buckets?.possible ?? 0} (${pct(ovND.buckets?.possible ?? 0, ovND.count)})`,
        `${ovND.buckets?.none ?? 0} (${pct(ovND.buckets?.none ?? 0, ovND.count)})`,
      ]]
      lines.push('\n### Gesamt (ohne DOI)')
      lines.push(table(hdr, row))
    }
    if (Array.isArray(pert.matchingNoDoi?.perType)) {
      const headers = ['Typ', 'N', 'Ø', 'Median', 'Q1', 'Q3', 'Exact', 'Strong', 'Possible', 'No']
      const rows = pert.matchingNoDoi.perType.map(t => [
        t.type,
        fmt(t.count),
        fmt(t.average),
        fmt(t.median),
        fmt(t.q1),
        fmt(t.q3),
        t.buckets?.exact ?? 0,
        t.buckets?.strong ?? 0,
        t.buckets?.possible ?? 0,
        t.buckets?.none ?? 0,
      ])
      lines.push('\n### Nach Publikationstyp (ohne DOI)')
      lines.push(table(headers, rows))
    }

    // Performance (from perturbed dataset)
    if (Array.isArray(pert.performance?.scenarios)) {
      lines.push('\n## Performance (APA-perturbiert)')
      const headers = ['Szenario', 'System', 'Ø Zeit (s)', 'StdAbw (s)', 'Durchsatz (Ref/min)']
      const rows = pert.performance.scenarios.map(s => [
        s.scenario,
        s.system,
        fmt(s.average, 3, true),
        fmt(s.stdDev, 3, true),
        fmt(s.throughput, 3, true),
      ])
      lines.push(table(headers, rows))
    }
  }

  await ensureDir(OUT_MD)
  await writeFile(path.resolve(process.cwd(), OUT_MD), `${lines.join('\n')}\n`, 'utf8')
  console.log(`✅ Kapitel gespeichert → ${OUT_MD}`)
}

build().catch((err) => {
  console.error('Fehler beim Erstellen des Kapitels:')
  console.error(err)
  process.exitCode = 1
})
