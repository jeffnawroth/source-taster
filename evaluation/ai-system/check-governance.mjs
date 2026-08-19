#!/usr/bin/env node
/**
 * Deterministic AI-governance checks (M-3, 2026-08-19).
 * Runs without LLM or network; suitable for CI. Covers the statically
 * checkable eval scenarios plus regression checks for audit fixes
 * (H-2 control-plane ask-gate, M-2 /v1/* namespace, M-5 canonical sources).
 *
 * Usage: node evaluation/ai-system/check-governance.mjs
 * Exit code 0 = all checks pass; 1 = at least one failed check.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rel = p => join(root, p)
const read = p => readFileSync(rel(p), 'utf8')

const failures = []
const output = message => process.stdout.write(`${message}\n`)
const ok = (name, detail = '') => output(`  ok   ${name}${detail ? ` — ${detail}` : ''}`)
function fail(name, detail = '') {
  failures.push(name)
  process.stderr.write(`  FAIL ${name}${detail ? ` — ${detail}` : ''}\n`)
}

const check = (name, cond, detail) => (cond ? ok(name, detail) : fail(name, detail))

output('Source Taster — AI governance static checks (M-3)')

// ---------------------------------------------------------------------------
// Core governance files exist (eval 5/16 prerequisites)
// ---------------------------------------------------------------------------
output('\n[1] Core governance files')
for (const f of [
  'AGENTS.md',
  'opencode.json',
  '.opencode/master-prompt.md',
  '.opencode/memory/handoff.md',
  '.opencode/memory/ai-eval-results.md',
  '.opencode/command/ai-eval.md',
  'evaluation/ai-system/eval-scenarios.md',
  'evaluation/ai-system/fixture-injection.md',
]) {
  check(`exists ${f}`, existsSync(rel(f)))
}

// ---------------------------------------------------------------------------
// Eval 6: agent contract completeness — 12 agents, 9 "## " sections each
// ---------------------------------------------------------------------------
output('\n[2] Agent contracts (§22, eval 6)')
const agentDir = rel('.opencode/agent')
const agentFiles = readdirSync(agentDir).filter(f => f.endsWith('.md'))
check('12 agent files', agentFiles.length === 12, `${agentFiles.length} found`)
for (const f of agentFiles) {
  const content = readFileSync(join(agentDir, f), 'utf8')
  const sections = (content.match(/^## /gm) || []).length
  const frontmatter = content.match(/^---\n[\s\S]*?\n---/)?.[0] || ''
  const hasMode = /^mode: subagent$/m.test(frontmatter)
  const hasDesc = /^description: .+/m.test(frontmatter)
  check(`agent ${f}: 9 sections, frontmatter`, sections === 9 && hasMode && hasDesc, `${sections} sections, mode=${hasMode}, desc=${hasDesc}`)
}

// ---------------------------------------------------------------------------
// H-2 regression: no agent may carry edit: allow/deny shorthand that would
// override the global control-plane ask-gate (last-match-wins defeats it).
// R tier uses edit: deny (strictest, correct); D/T tier must have no edit key.
// ---------------------------------------------------------------------------
output('\n[3] Control-plane edit protection (H-2 regression)')
const opencodeConfig = JSON.parse(read('opencode.json'))
const editRules = opencodeConfig.permission?.edit || {}
check('opencode.json has granular edit rules', typeof editRules === 'object' && !Array.isArray(editRules)
&& editRules['*'] === 'allow' && editRules['AGENTS.md'] === 'ask'
&& editRules['opencode.json'] === 'ask' && editRules['.opencode/**'] === 'ask', JSON.stringify(editRules))

const rTier = ['architect', 'reviewer', 'security-reviewer']
for (const f of agentFiles) {
  const name = f.replace(/\.md$/, '')
  const frontmatter = readFileSync(join(agentDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
  const editLine = frontmatter.match(/^\s*edit:\s*(allow|deny|ask)\s*$/m)?.[1] || null
  if (rTier.includes(name)) {
    check(`agent ${name}: edit deny`, editLine === 'deny', `edit=${editLine}`)
  }
  else {
    check(`agent ${name}: no edit shorthand`, editLine === null, editLine ? `has "edit: ${editLine}" (would override global ask-gate)` : 'inherits global rules')
  }
}

// ---------------------------------------------------------------------------
// M-4 regression: recursion cap + iteration limits
// subagent_depth hard-caps subagent nesting; every role agent must carry
// a steps cap so a runaway loop cannot burn unbounded iterations (§25/§39).
// ---------------------------------------------------------------------------
output('\n[3b] Recursion + iteration limits (M-4 regression)')
check('subagent_depth set to 2', opencodeConfig.subagent_depth === 2, `subagent_depth=${opencodeConfig.subagent_depth}`)
for (const f of agentFiles) {
  const frontmatter = readFileSync(join(agentDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
  const steps = frontmatter.match(/^\s*steps:\s*(\d+)\s*$/m)?.[1] || null
  check(`agent ${f}: steps cap`, steps !== null && Number(steps) > 0, `steps=${steps}`)
}

// ---------------------------------------------------------------------------
// M-2 regression: API namespace is /v1/* — no /api/ references in governance docs
// (path references like apps/api/ are legitimate and allowed)
// ---------------------------------------------------------------------------
output('\n[4] API namespace /v1/* (M-2 regression)')
const govDocs = [
  'AGENTS.md',
  '.opencode/master-prompt.md',
  ...agentFiles.map(f => `.opencode/agent/${f}`),
  '.opencode/skill/domain-academic-references/SKILL.md',
  '.opencode/skill/security-engineering/SKILL.md',
  '.opencode/skill/target-state-first/SKILL.md',
  '.opencode/skill/boundaries-and-runtime/SKILL.md',
  '.opencode/skill/product-operating-model/SKILL.md',
  '.opencode/skill/growth-operating-model/SKILL.md',
  '.opencode/skill/ux-target-state/SKILL.md',
  '.opencode/skill/delegation-and-trust/SKILL.md',
  ...readdirSync(rel('.opencode/command')).filter(f => f.endsWith('.md')).map(f => `.opencode/command/${f}`),
  'evaluation/ai-system/eval-scenarios.md',
]
const badRefs = {}
for (const f of govDocs) {
  if (!existsSync(rel(f))) {
    continue
  }
  const lines = read(f).split('\n')
  lines.forEach((line, i) => {
    // Intentional fixtures: AGENTS.md mandate text ("never /api/*") and
    // eval scenarios that deliberately quote the stale /api/extract term.
    if (/never .*\/api\/\*/.test(line))
      return
    if (f.includes('eval-scenarios') && /\/api\/extract/.test(line))
      return
    const m = line.match(/([^\w.-])\/api\//)
    if (m && !line.includes('apps/api/') && !line.includes('packages/types/') && !line.includes('/v1/api')) {
      badRefs[f] = badRefs[f] || []
      badRefs[f].push(i + 1)
    }
  })
}
check('no /api/ references in governance docs', Object.keys(badRefs).length === 0, Object.keys(badRefs).map(f => `${f}:${badRefs[f].join(',')}`).join(' | '))
check('AGENTS.md mandates /v1/*', /\/v1\/\*.*never.*\/api\/\*/s.test(read('AGENTS.md')))

// ---------------------------------------------------------------------------
// M-2: copilot-instructions.md must document /v1/*
// ---------------------------------------------------------------------------
output('\n[5] copilot-instructions.md (M-2)')
const copilot = existsSync(rel('.github/copilot-instructions.md')) ? read('.github/copilot-instructions.md') : ''
if (copilot) {
  // strip legitimate apps/api/ path references and the mandate text before
  // testing the namespace
  const stripped = copilot.replace(/apps\/api\//g, '').replace(/never .*\/api\/\*/g, '')
  check('mentions /v1/* without /api/', stripped.includes('/v1/') && !stripped.includes('/api/'), /\/api\//.test(stripped) ? 'still contains /api/' : 'clean')
}
else {
  ok('no copilot-instructions.md present', 'nothing to sync')
}

// ---------------------------------------------------------------------------
// M-5: canonical sources — handoff must exist (see [1]); master-prompt and
// AGENTS.md must both exist and agree on core terms (spot checks)
// ---------------------------------------------------------------------------
output('\n[6] Canonical sources (M-5 spot checks)')
const master = existsSync(rel('.opencode/master-prompt.md')) ? read('.opencode/master-prompt.md') : ''
const agentsMd = existsSync(rel('AGENTS.md')) ? read('AGENTS.md') : ''
for (const term of ['reference', 'hallucination', 'X-Client-Id', '/v1/*', 'BYOK']) {
  check(`term "${term}" in AGENTS.md`, agentsMd.includes(term))
}
check('master-prompt exists and is non-trivial', master.length > 1000, `${master.length} chars`)

// ---------------------------------------------------------------------------
// §41: no sandbox claim; §43: egress domains govern
// ---------------------------------------------------------------------------
output('\n[7] Runtime isolation + egress (§41/§43)')
// The honest position is a *denial* of sandboxing — require the denial and
// reject affirmative claims (e.g. "agents run sandboxed", "provides sandboxing")
const affirmative = /(?:is|are|runs|run) sandboxed|provides? (?:OS )?sandboxing|execution (?:is|was) sandboxed/i.test(agentsMd)
check('no affirmative OS-sandboxing claim in AGENTS.md', !affirmative)
check('AGENTS.md denies sandboxing honestly', /(?:does )?NOT claim (?:OS )?sandboxing|not sandboxed/i.test(agentsMd))
check('approved egress domains listed', /\bopenalex\.org\b/.test(agentsMd) && /\bdoi\.org\b/.test(agentsMd))

// ---------------------------------------------------------------------------
// M-5: §-reference resolution + canonical sources sync
// Every §N reference in governance docs must resolve to a "# N." section in
// the master prompt (76 §§). Skills/agents/commands may restate but not
// contradict; unresolved § refs indicate drift.
// ---------------------------------------------------------------------------
output('\n[8] Canonical sources + §-references (M-5)')
const masterSections = new Set()
for (const m of (master.match(/^#+\s+(\d+)\.\s/gm) || [])) {
  masterSections.add(Number(m.match(/\d+/)[0]))
}
const syncDocs = [
  'AGENTS.md',
  ...agentFiles.map(f => `.opencode/agent/${f}`),
  ...readdirSync(rel('.opencode/command')).filter(f => f.endsWith('.md')).map(f => `.opencode/command/${f}`),
  ...readdirSync(rel('.opencode/skill')).filter(f => f.endsWith('.md')).map(f => `.opencode/skill/${f}/SKILL.md`),
  'evaluation/ai-system/eval-scenarios.md',
]
const unresolved = {}
for (const f of syncDocs) {
  if (!existsSync(rel(f))) {
    continue
  }
  for (const m of read(f).matchAll(/§(\d+)/g)) {
    const n = Number(m[1])
    if (!masterSections.has(n)) {
      unresolved[f] = unresolved[f] || []
      unresolved[f].push(n)
    }
  }
}
check('76 master-prompt sections found', masterSections.size === 76, `${masterSections.size} found`)
check('all §N references resolve to master-prompt sections', Object.keys(unresolved).length === 0, Object.keys(unresolved).map(f => `${f}: §${unresolved[f].join(',§')}`).join(' | ') || 'all resolve')
check('AGENTS.md documents canonical sources (M-5)', agentsMd.includes('Canonical sources (M-5)'))

// ---------------------------------------------------------------------------
output(`\n${failures.length === 0 ? 'ALL GOVERNANCE CHECKS PASSED' : `${failures.length} CHECK(S) FAILED: ${failures.join(', ')}`}`)
process.exit(failures.length === 0 ? 0 : 1)
