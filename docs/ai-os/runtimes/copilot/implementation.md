# GitHub Copilot Implementation

## Capability Status

| Core area | Repository implementation | Status |
|---|---|---|
| Principles, product/domain context, terminology | `.github/copilot-instructions.md` links to the CORE and project policy | Instruction-level |
| Target-state reasoning, scope, evidence, security | Instructions direct this behavior | Instruction-level |
| Role separation and independent review | No checked-in Copilot role configuration | Not technically implemented here |
| Permissions and control-plane protection | No checked-in Copilot permission configuration | Not technically implemented here |
| Delegation depth and step caps | No checked-in Copilot configuration | Not technically implemented here |
| Isolation and filesystem/network/tool boundaries | No checked-in Copilot configuration | Not technically implemented here |
| Human approval gates | Project instructions require them | Instruction-level |
| Static governance checks | Repository CI runs independently of the assistant runtime | Runtime-independent CI evidence |
| Recovery and audit evidence | Version control, ADRs, audits, and project records | Process-level |

## Required Behavior

Copilot contexts must follow the CORE and `AGENTS.md`, retain the `/v1/*`
namespace and Source Taster terminology, treat untrusted content as data, avoid
self-elevation, and request human approval for the project-gated operations.

## Limitations

This repository cannot demonstrate technical enforcement of role permissions,
delegation limits, isolation, network egress restrictions, tool boundaries, or
human approval prompts for Copilot. These limitations must remain visible in
reviews and migration evidence; they must not be described as enforced controls.
