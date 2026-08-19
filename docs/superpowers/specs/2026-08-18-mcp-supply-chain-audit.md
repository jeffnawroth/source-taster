# MCP Supply-Chain Audit (AI Operating Model)

Audit date: 2026-08-19
Method: `opencode debug config` (global + project config inspection)
Master-prompt references: §37 (supply chain), §42 (filesystem scope), §58 (MCP governance)

## Findings

| MCP | Typ | Zweck | Bewertung | Empfehlung |
|---|---|---|---|---|
| context7 | remote (Key) | Library-Docs | Gerechtfertigt (§56-Doku), Key in globaler Config | Behalten |
| github | remote (PAT) | Repo-Arbeit | Gerechtfertigt, PAT global | Behalten; nie ins Repo |
| penpot | remote (Token) | Design-System | Gerechtfertigt (UI-Arbeit) | Behalten |
| exa | remote | Web-Search | Gerechtfertigt (Research) | Behalten |
| playwright | local | E2E-Tests | Gerechtfertigt | Behalten |
| chrome-devtools | local | Browser-Dev | Gerechtfertigt | Behalten |
| **filesystem** | local, **Root `$HOME`** | Datei-Zugriff | **§42-Verstoß-Risiko: übermäßiger Root; MCP-Tools umgehen Repo-`external_directory deny` potenziell** | **Befund an Nutzer: Root auf Workspace einschränken oder deaktivieren (globale Config = Nutzerentscheid, §53)** |

## Rules applied

- MCP servers with secrets (context7, github, penpot): keys live in the global config, never in repo files, never copied into docs or commits.
- §42: filesystem access must be scoped; a `$HOME` root exceeds the workspace boundary and can bypass the repo-level `external_directory: deny` permission.
- §53: changing the global config (disabling/scoping the filesystem MCP) is a user decision — no global config was changed from this repository.
- Re-audit required when servers are added/removed or when OpenCode changes MCP capabilities.