# AGENTS.md

## Greenfield

This repo is a greenfield rebuild. Its sources of truth are the Lastenheft (the requirements spec the user attaches), this repo, and its GitHub issues. Orient within those and derive every decision from them, including the migration of existing users (FA-EIN).

Hard boundary: the predecessor `jeffnawroth/source-taster-legacy` and any local copy of it are out of scope. Leave them unread, uncloned, and out of subagent briefs. When a decision seems to need the old code, ask the user.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues for `jeffnawroth/source-taster` (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
