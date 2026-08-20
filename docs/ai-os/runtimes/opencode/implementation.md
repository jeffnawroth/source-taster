# OpenCode Implementation

## Enforcement Status

| Core requirement | OpenCode implementation | Evidence status |
|---|---|---|
| §§23-25, §§47-48 | Project config plus subagent frontmatter define permissions and delegation depth | Runtime-enforced where the resolved rules deny or ask; policy also instructs orchestration behavior |
| §§41-42 | Workspace-scoped filesystem service and external-directory deny rules | Runtime-enforced for configured paths; this is not OS sandboxing |
| §43 | Read-only tier denies web tools; approved research domains are documented | Tool denial is runtime-enforced for that tier; domain policy is instruction-level because no domain filter is configured |
| §44 | Project policy and read boundaries protect secrets | Instruction-level plus configured access prompts; no secret exposure claim is made |
| §§45-50 | Commands, project instructions, review/ADR process, and command prompts | Primarily instruction-level and human-approved; configuration asks for non-allowlisted shell commands |
| §34 | Static checker, CI job, scenario command, and interactive validation | Static checks are deterministic; permission behavior needs resolved-config and interactive evidence |

## Effective Boundary Review

The repository configuration is only one input to the effective OpenCode
configuration. Confirm the merged configuration at runtime before relying on a
control.

| Boundary | Technically enforced by checked-in configuration | Instruction-level or user-owned limit |
|---|---|---|
| Control plane | `AGENTS.md`, `opencode.json`, and `.opencode/**` edits require approval; R-tier agents deny edits | Review, ADR, and no-self-elevation requirements are CORE governance, not a substitute for the permission layer |
| Filesystem | `external_directory` is denied and the checked-in filesystem MCP is rooted at this workspace | Ordinary in-workspace reads, including sensitive files, are not blocked by a checked-in read-deny rule; this is not OS isolation |
| Credentials | No credential is stored in the project OpenCode configuration | Handling of `.env`, `.keystore`, environment variables, and user-level MCP credentials is instruction-level; the effective user configuration can contribute credential-bearing MCP integrations outside repository control |
| Network egress | R-tier agents deny `webfetch` and `websearch`; other configured roles require approval for those tools | Source Taster's approved-domain list is policy only. OpenCode has no checked-in domain allowlist or network sandbox |
| MCP tools | The checked-in filesystem MCP has one workspace root | User-level MCP integrations and their credentials are user-owned. Review necessity, scope, and credential lifetime before enabling or retaining them |
| Human gates | Non-allowlisted shell commands require approval | Commit, push, migration, Docker, install, and release gates are project process requirements; validate prompts interactively |

Do not automatically alter user-level MCP integrations or credentials. A human
must review unused or overbroad integrations and rotate or revoke credentials
when their exposure, scope, or ownership is no longer justified.

## §51. Current Execution Framework

OpenCode is the current runtime used to implement the AI-OS. It must implement
the core without changing the core philosophy to fit its own syntax or
historical behavior.

## §52. Verify the Installed Runtime

Before changing OpenCode configuration, inspect the installed version,
configuration schema, agents, built-in tools, permission model, subagent
behavior, skills, commands, tool-integration and plugin support,
providers/models, and relevant experimental features. Do not rely on stale
examples or invent syntax.

## §53. Configuration

Use project-local OpenCode configuration for project assumptions and avoid
polluting unrelated projects. Derive file layout and syntax from the installed
runtime.

## §54. Agents

Map core roles to OpenCode agents. Reuse a built-in agent when adequate, use a
specialized project agent only where needed, use skills for specialist knowledge,
and use commands for repeated workflows. Do not create duplicate agents merely
to mirror a role list.

## §55. Permissions

Implement least privilege through OpenCode's supported permission system.
Evaluate read, edit, shell, subagent, external-directory, web, MCP/tool,
version-control, and destructive-operation authority. Review roles remain
read-only by default. The effective order of merged rules matters and must be
verified after changes.

## §56. Skills

Use OpenCode skills for reusable specialist knowledge only where they provide
real value, including architecture, security, threat modeling, testing, UX,
accessibility, analytics, growth, data, release management, documentation, and
domain expertise where justified. They are delivery artifacts for the core and
must not override permission or governance rules.

## §57. Commands

Use OpenCode commands for supported, repeatable project workflows. Keep only
commands justified by actual work; command implementation is runtime-specific.

## §58. Tool Integrations

Enable an OpenCode MCP or tool integration only when it materially improves a
concrete workflow, such as source control, issue tracking, documentation,
design, analytics, data, browser/research, deployment, or observability.
Evaluate native alternatives, authorization, credentials, data access, side
effects, context cost, reliability, provenance, maintenance, and update risk
before enabling it.

## §59. Model Strategy

Inspect currently available OpenCode providers and models and apply core §38.
If an available DeepSeek model has appropriate quality and cost characteristics,
it may be used; it is never a permanent architectural dependency. Model
assignments are replaceable runtime configuration.

## §60. Context Management

Map stable instructions, specialist knowledge, repeated workflows, large
references, external capabilities, persistent state, and handoffs to the
corresponding OpenCode mechanisms without duplicating context.

## §61. Memory and Handoffs

Use the current OpenCode-supported project mechanisms to persist decisions,
long-running state, handoffs, unresolved work, and architectural memory. Do not
assume a fixed layout when the runtime changes.

## §62. Validation

Validate actual configuration, startup, agent discovery, delegation,
permissions, read-only review behavior, skill and command discovery, model and
tool configuration, project instructions, memory, evaluation scenarios, and
security boundaries. Do not assume generated configuration works.

## §63. Future-Proofing

When OpenCode changes, preserve the CORE, update only this adapter and its
runtime artifacts deliberately, and rerun relevant evaluations.
