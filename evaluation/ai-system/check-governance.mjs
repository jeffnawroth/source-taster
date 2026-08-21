#!/usr/bin/env node
/**
 * Deterministic AI-governance checks. Covers the runtime-neutral canonical
 * source graph, OpenCode regressions, and statically verifiable namespace and
 * control-plane protections. Interactive runtime behavior remains separately
 * evidenced in evaluation scenarios.
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
const check = (name, cond, detail = '') => (cond ? ok(name, detail) : fail(name, detail))

const coreSectionFiles = {
  'docs/ai-os/core/principles.md': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 75, 76],
  'docs/ai-os/core/operating-model.md': [12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 38, 39, 40, 64, 65, 66, 67, 68, 69, 70, 71, 72],
  'docs/ai-os/core/evaluation-and-evidence.md': [31, 32, 33, 34, 35, 36, 73, 74],
  'docs/ai-os/core/governance-and-audit.md': [19, 20, 37, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
  'docs/ai-os/runtimes/opencode/implementation.md': [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
}
const expectedSections = new Set(Object.values(coreSectionFiles).flat())
const coreFiles = Object.keys(coreSectionFiles).filter(f => f.includes('/core/'))
const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'opencode.json',
  '.opencode/bootstrap.md',
  '.opencode/OPENCODE_IMPLEMENTATION.md',
  '.github/copilot-instructions.md',
  '.github/COPILOT_ADAPTER.md',
  'docs/ai-os/ARCHITECTURE.md',
  'docs/ai-os/core/README.md',
  ...Object.keys(coreSectionFiles),
  'docs/ai-os/runtimes/opencode/README.md',
  'docs/ai-os/runtimes/copilot/README.md',
  'docs/ai-os/runtimes/copilot/implementation.md',
  'docs/ai-os/runtimes/claude/README.md',
  'docs/ai-os/runtimes/claude/implementation.md',
  '.claude/CLAUDE_IMPLEMENTATION.md',
  'evaluation/ai-system/claude-eval-results.md',
  'evaluation/ai-system/GOVERNANCE_SPEC.md',
  '.opencode/memory/handoff.md',
  '.opencode/memory/ai-eval-results.md',
  '.opencode/command/ai-eval.md',
  'evaluation/ai-system/eval-scenarios.md',
  'evaluation/ai-system/fixture-injection.md',
]

function markdownFiles(directory) {
  if (!existsSync(rel(directory)))
    return []
  const result = []
  for (const entry of readdirSync(rel(directory), { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory())
      result.push(...markdownFiles(path))
    else if (entry.isFile() && entry.name.endsWith('.md'))
      result.push(path)
  }
  return result
}

output('Source Taster — AI governance static checks')

output('\n[1] Canonical source graph')
for (const f of requiredFiles) check(`exists ${f}`, existsSync(rel(f)))
const architecture = read('docs/ai-os/ARCHITECTURE.md')
for (let number = 1; number <= 76; number += 1) {
  check(`architecture map contains §${number}`, architecture.includes(`| §${number} `))
}

const canonicalSections = new Map()
for (const [file, expected] of Object.entries(coreSectionFiles)) {
  const found = [...read(file).matchAll(/^## §(\d+)\./gm)].map(m => Number(m[1]))
  check(`canonical sections ${file}`, JSON.stringify(found) === JSON.stringify(expected), `found ${found.join(',')}`)
  for (const number of found) {
    const previous = canonicalSections.get(number)
    if (previous)
      fail(`section §${number} unique canonical source`, `${previous} and ${file}`)
    else canonicalSections.set(number, file)
  }
}
check('all 76 canonical sections found exactly once', canonicalSections.size === 76 && expectedSections.size === 76 && [...expectedSections].every(n => canonicalSections.has(n)), `${canonicalSections.size} found`)

const bootstrap = read('.opencode/bootstrap.md')
check('bootstrap is not a second AI-OS copy', !/^#+\s+\d+\.\s/m.test(bootstrap) && bootstrap.includes('docs/ai-os/core/') && bootstrap.includes('runtimes/opencode/implementation.md'), 'no numbered duplicate sections')
const agentsMd = read('AGENTS.md')
check('AGENTS.md points to canonical CORE', agentsMd.includes('docs/ai-os/core/') && agentsMd.includes('sole runtime-neutral AI-OS authority'))
check('AGENTS.md keeps generic AI-OS governance in the CORE', !/\*\*(?:Control plane|Untrusted content|Runtime isolation|Rollback)\*\*/.test(agentsMd))
check('AGENTS.md identifies runtime adapters as implementation entry points', agentsMd.includes('docs/ai-os/runtimes/opencode/implementation.md') && agentsMd.includes('docs/ai-os/runtimes/copilot/implementation.md'))

output('\n[2] CORE portability')
const prohibitedCorePatterns = [
  ['OpenCode', /\bOpenCode\b/],
  ['GitHub Copilot', /\bGitHub Copilot\b/],
  ['opencode.json', /opencode\.json/],
  ['.opencode path', /\.opencode\//],
  ['subagent_depth', /subagent_depth/],
  ['webfetch', /webfetch/],
  ['websearch', /websearch/],
  ['subagent frontmatter', /mode:\s*subagent/],
  ['command argument syntax', /\$ARGUMENTS/],
  ['OpenCode run syntax', /opencode run/],
  ['runtime model pin', /(?:openai|opencode)\/[\w.-]+/],
  ['worktree implementation', /git worktree/],
  ['CLAUDE.md', /CLAUDE\.md/],
  ['permissionMode', /permissionMode/],
  ['disallowedTools', /disallowedTools/],
  ['.claude path', /\.claude\//],
  ['maxTurns', /maxTurns/],
]
for (const file of coreFiles) {
  const content = read(file)
  for (const [name, pattern] of prohibitedCorePatterns) {
    check(`CORE ${file} has no ${name}`, !pattern.test(content))
  }
}
const openCodeAdapter = read('docs/ai-os/runtimes/opencode/implementation.md')
const copilotAdapter = read('docs/ai-os/runtimes/copilot/implementation.md')
const claudeAdapter = read('docs/ai-os/runtimes/claude/implementation.md')
check('OpenCode adapter distinguishes evidence status', openCodeAdapter.includes('Runtime-enforced') && openCodeAdapter.includes('instruction-level'))
check('Copilot adapter documents absent technical controls', copilotAdapter.includes('Not technically implemented here') && /instruction-level/i.test(copilotAdapter))
check('Claude adapter distinguishes evidence status', /TECHNICALLY ENFORCED/i.test(claudeAdapter) && /instruction-level/i.test(claudeAdapter))

output('\n[3] Agent contracts and OpenCode control-plane protection')
const agentDir = rel('.opencode/agent')
const agentFiles = readdirSync(agentDir).filter(f => f.endsWith('.md')).sort()
check('12 agent files', agentFiles.length === 12, `${agentFiles.length} found`)
for (const f of agentFiles) {
  const content = readFileSync(join(agentDir, f), 'utf8')
  const sections = (content.match(/^## /gm) || []).length
  const frontmatter = content.match(/^---\n[\s\S]*?\n---/)?.[0] || ''
  check(`agent ${f}: 9 sections and frontmatter`, sections === 9 && /^mode: subagent$/m.test(frontmatter) && /^description: .+/m.test(frontmatter), `${sections} sections`)
  check(`agent ${f}: references CORE`, content.includes('docs/ai-os/core/'))
}
const opencodeConfig = JSON.parse(read('opencode.json'))
const editRules = opencodeConfig.permission?.edit || {}
check('granular control-plane edit rules preserved', editRules['*'] === 'allow' && editRules['AGENTS.md'] === 'ask' && editRules['opencode.json'] === 'ask' && editRules['.opencode/**'] === 'ask' && editRules['docs/ai-os/**'] === 'ask', JSON.stringify(editRules))
check('subagent depth preserved at 2', opencodeConfig.subagent_depth === 2, `subagent_depth=${opencodeConfig.subagent_depth}`)
const filesystemCommand = opencodeConfig.mcp?.filesystem?.command || []
const expandConfig = value => value.replace(/\{env:([^}]+)\}/g, (_, name) => process.env[name] ?? '')
const workspaceRoots = filesystemCommand
  .map(expandConfig)
  .filter(arg => arg.startsWith('/') || arg === '.' || arg.startsWith('./') || arg.startsWith('../'))
  .map(p => resolve(root, p))
const workspaceScoped = workspaceRoots.length > 0 && workspaceRoots.every(p => p === root || p.startsWith(`${root}/`))
check('filesystem MCP remains workspace-scoped', workspaceScoped, filesystemCommand.join(' '))
const rTier = new Set(['architect', 'reviewer', 'security-reviewer'])
for (const f of agentFiles) {
  const name = f.replace(/\.md$/, '')
  const frontmatter = readFileSync(join(agentDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
  const edit = frontmatter.match(/^\s*edit:\s*(allow|deny|ask)\s*$/m)?.[1] || null
  const steps = frontmatter.match(/^\s*steps:\s*(\d+)\s*$/m)?.[1] || null
  check(`agent ${name}: expected edit declaration`, rTier.has(name) ? edit === 'deny' : edit === null, `edit=${edit}`)
  check(`agent ${name}: steps cap`, steps !== null && Number(steps) === 150, `steps=${steps}`)
}

output('\n[4] Skills, commands, and references')
const skillDir = rel('.opencode/skill')
const skillFiles = readdirSync(skillDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(skillDir, entry.name, 'SKILL.md')))
  .map(entry => `.opencode/skill/${entry.name}/SKILL.md`)
  .sort()
check('8 skill files', skillFiles.length === 8, `${skillFiles.length} found`)
for (const f of skillFiles) check(`skill ${f}: canonical reference`, read(f).includes('Canonical') || f.includes('domain-academic-references'))
const boundarySkill = read('.opencode/skill/boundaries-and-runtime/SKILL.md')
check('boundary skill matches external-directory deny', opencodeConfig.permission?.external_directory?.['*'] === 'deny' && boundarySkill.includes('denies `external_directory` access'))
const commandFiles = readdirSync(rel('.opencode/command')).filter(f => f.endsWith('.md')).map(f => `.opencode/command/${f}`).sort()
check('9 command files', commandFiles.length === 9, `${commandFiles.length} found`)
for (const f of commandFiles) check(`command ${f}: canonical reference`, read(f).includes('Canonical'))

const claudeSkillDir = rel('.claude/skills')
const claudeSkillFiles = readdirSync(claudeSkillDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(claudeSkillDir, entry.name, 'SKILL.md')))
  .map(entry => `.claude/skills/${entry.name}/SKILL.md`)
  .sort()
const claudeAgentDir = rel('.claude/agents')
const claudeAgentFiles = readdirSync(claudeAgentDir).filter(f => f.endsWith('.md')).sort()

const referenceDocs = [
  'AGENTS.md',
  ...markdownFiles('.opencode'),
  ...markdownFiles('.github'),
  ...markdownFiles('docs'),
  ...markdownFiles('evaluation'),
]
const unresolved = []
for (const file of referenceDocs) {
  for (const match of read(file).matchAll(/§(\d+)/g)) {
    const number = Number(match[1])
    if (!canonicalSections.has(number))
      unresolved.push(`${file}:§${number}`)
  }
}
check('all §N references resolve to canonical sections', unresolved.length === 0, unresolved.join(', ') || 'all resolve')

output('\n[5] Namespace, boundaries, and active instructions')
const activeDocs = [
  'AGENTS.md',
  'README.md',
  '.github/copilot-instructions.md',
  '.opencode/bootstrap.md',
  ...coreFiles,
  'docs/ai-os/runtimes/opencode/implementation.md',
  'docs/ai-os/runtimes/copilot/implementation.md',
  'docs/ai-os/runtimes/claude/implementation.md',
  'CLAUDE.md',
  '.claude/CLAUDE_IMPLEMENTATION.md',
  ...agentFiles.map(f => `.opencode/agent/${f}`),
  ...skillFiles,
  ...commandFiles,
  ...claudeAgentFiles.map(f => `.claude/agents/${f}`),
  ...claudeSkillFiles,
]
const apiRefs = []
for (const file of activeDocs) {
  read(file).split('\n').forEach((line, index) => {
    if (/\/api\//.test(line) && !line.includes('apps/api/') && !/never[^\n]*\/api\/\*/i.test(line))
      apiRefs.push(`${file}:${index + 1}`)
  })
}
check('no stale /api/ in active policy and documentation', apiRefs.length === 0, apiRefs.join(', '))
check('AGENTS.md mandates /v1/*', /\/v1\/\*.*never.*\/api\/\*/s.test(agentsMd))
const affirmativeSandbox = /(?:is|are|runs|run) sandboxed|provides? (?:OS )?sandboxing|execution (?:is|was) sandboxed/i.test(agentsMd)
check('no affirmative OS-sandboxing claim in AGENTS.md', !affirmativeSandbox)
check('OpenCode adapter honestly limits OS isolation', /not OS sandboxing/i.test(openCodeAdapter))
const approvedDomains = ['openalex.org', 'doi.org', 'crossref.org', 'api.semanticscholar.org', 'europepmc.org', 'ebi.ac.uk', 'arxiv.org', 'github.com', 'mcp.context7.com', 'sourcetaster.com', 'opencode.ai']
check('AGENTS.md lists all approved egress domains', approvedDomains.every(d => agentsMd.includes(d)))
const researcher = read('.opencode/agent/researcher.md')
check('derived artifacts reference AGENTS.md domain list', boundarySkill.includes('AGENTS.md') && researcher.includes('AGENTS.md'))

output('\n[6] Claude runtime adapter')
const claudeMd = read('CLAUDE.md')
const claudeMdFirstLine = claudeMd.split('\n').find(line => line.trim().length > 0) || ''
check('CLAUDE.md imports AGENTS.md as its first line', claudeMdFirstLine.trim() === '@AGENTS.md', claudeMdFirstLine)
check('8 Claude skill files', claudeSkillFiles.length === 8, `${claudeSkillFiles.length} found`)
for (const f of claudeSkillFiles) check(`Claude skill ${f}: canonical reference`, read(f).includes('Canonical') || f.includes('domain-academic-references'))
const claudeSkillContents = claudeSkillFiles.map(f => read(f))
check('no obsolete §58 reference under .claude/skills/**', !claudeSkillContents.some(content => content.includes('§58')))
check('no dangling OpenCode ui-agent handoff reference under .claude/skills/**', !claudeSkillContents.some(content => content.includes('Hand off to `ui`')))
check('2 Claude agent files', claudeAgentFiles.length === 2, `${claudeAgentFiles.length} found`)
for (const f of claudeAgentFiles) {
  const frontmatter = readFileSync(join(claudeAgentDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
  const disallowed = frontmatter.match(/^disallowedTools:(.*)$/m)?.[1]?.trim() || ''
  const tools = disallowed.split(',').map(t => t.trim())
  const requiredExcluded = ['Edit', 'Write', 'Bash', 'Agent']
  check(`Claude agent ${f}: disallowedTools excludes required tools`, requiredExcluded.every(t => tools.includes(t)), disallowed)
}

output(`\n${failures.length === 0 ? 'ALL GOVERNANCE CHECKS PASSED' : `${failures.length} CHECK(S) FAILED: ${failures.join(', ')}`}`)
process.exit(failures.length === 0 ? 0 : 1)
