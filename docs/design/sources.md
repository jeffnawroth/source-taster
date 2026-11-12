# Design decisions and primary sources

Collected for #206 on 10 November 2026. Accepted by the owner on 10 November 2026 in [#206](https://github.com/jeffnawroth/source-taster/issues/206#issuecomment-6770556807). Closed design tickets record the owner's choices; their prototypes and check seeds are primary evidence, not implemented behaviour or production acceptance. The consolidated public specifications live beside this file. Full private specifications remain in `source-taster-service`.

## Decision coverage

| Decision | Outcome carried forward |
| --- | --- |
| [#182 — 2026 product UI](https://github.com/jeffnawroth/source-taster/issues/182) | Quiet content hierarchy and evidence-first results; source limitations remain recorded in that research |
| [#183 — foundation comparison](https://github.com/jeffnawroth/source-taster/issues/183) | Retain RAC/Tailwind rather than migrate frameworks |
| [#184 — typefaces](https://github.com/jeffnawroth/source-taster/issues/184) | OFL candidates; static TTF/PDF and missing-glyph fallback obligations |
| [#185 — colour system](https://github.com/jeffnawroth/source-taster/issues/185) | WCAG ratio as gate, APCA advisory; later glyph/label decision replaces the proposed greyscale lightness ladder |
| [#186 — sharing research](https://github.com/jeffnawroth/source-taster/issues/186) | Narrow token contract, resolved concretely in #189 |
| [#187 — inventory](https://github.com/jeffnawroth/source-taster/issues/187) | Baseline problems: long pages, weak scan path/hierarchy, inconsistent surfaces and raw data |
| [#188 — UI foundation](https://github.com/jeffnawroth/source-taster/issues/188) | Starter-derived owned primitives, stable styling helpers, Lucide and CSS-native motion |
| [#189 — distribution](https://github.com/jeffnawroth/source-taster/issues/189) | Option A, token-only dual licence, one full contracts SHA, independent private primitives, explicit legal questions |
| [#190 — positioning](https://github.com/jeffnawroth/source-taster/issues/190) | Calm professional examination, evidence over alarmist certainty |
| [#191 — identity](https://github.com/jeffnawroth/source-taster/issues/191) | Two-drop Glass identity, Atkinson/Plex, six shapes; later calm amendments prevail |
| [#192 — voice](https://github.com/jeffnawroth/source-taster/issues/192) | Sie/Befund/Prüfpaket, sentence-case English, voice by surface; no factual drift |
| [#193 — tokens](https://github.com/jeffnawroth/source-taster/issues/193) | Semantic role interface, sRGB gamut/contrast gate, type/shape/motion values |
| [#194 — checking structure](https://github.com/jeffnawroth/source-taster/issues/194) | D feed + sticky strip, web push detail / narrow full view |
| [#195 — components](https://github.com/jeffnawroth/source-taster/issues/195) | Layer/ownership rules, neutral evidence, compact strip, bounded Toast exception; correction convenience originally pending, now accepted in ADR-0027 |
| [#196 — private surfaces](https://github.com/jeffnawroth/source-taster/issues/196) | KA + KC Plan/Quota; OC Operator; one-product continuity |
| [#197 — media](https://github.com/jeffnawroth/source-taster/issues/197) | Email A / PDF C; opaque sRGB and medium-specific semantics |
| [#198 — website](https://github.com/jeffnawroth/source-taster/issues/198) | A with C docs index; A article navigation |
| [#199 — brand applications](https://github.com/jeffnawroth/source-taster/issues/199) | Store A / social B; common optical/full/monochrome family and sRGB asset mapping |

## Pinned source specifications and evidence

| Source branch | Full source commit | Relevant path |
| --- | --- | --- |
| `design/192-voice` | `786cd6311aa2fcd08052cd80777c55dbca70c42a` | `docs/design/voice-and-tone.md` |
| `design/193-tokens` | `9296ae1b63093754ab8a8cb3899d209a7f827de2` | `docs/design/tokens.md`, `tokens-check/` (already amended by #195) |
| `design/195-components` | `a32a1f4f9773384adcadfe6f423fd9d75ea372a6` | `docs/design/components.md` |
| `prototype/194-structure` | `f6db1f512255bd404428212ade37abf5ea26f4a3` | `apps/web/prototype/structure/` — D, calm, compact strip a |
| `prototype/197-email-report` (public) | `267624a0de0b7e4b7e877aaf87990d53b0fb4f53` | `docs/design/email-and-pdf.md`, `apps/server/prototype/report/` |
| `prototype/198-website` | `b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022` | `docs/design/website-and-documentation.md`, selected snapshot S |
| `prototype/199-brand-assets` | `9e846bdd966f98010efeac1dbcdc985d9393ee82` | `docs/design/brand-assets.md`, research, masters/export/capture records |

Open-repository links follow `https://github.com/jeffnawroth/source-taster/blob/<full-commit>/<path>`. The identity's original chosen round is recorded at `63d1909` on `prototype/191-identity`; use the later D/calm source for structure and the asset masters from #199 for final colour/optical application.

Private primary sources are `prototype/196-private` at `54cd08197388923c811a29c01dfc8bdca94c951b` (`docs/design/private-surfaces.md`) and private `prototype/197-email-report` at `48912e8a3e61386ac4e129e4011363f8c240831d` (`docs/design/transactional-email.md`). They are referenced for auditability, not copied or published here. The private synthesis branch retains those specifications separately.

## Consolidation edits

Imported text is not silently declared authoritative where sources conflicted. [reconciliations.md](reconciliations.md) records the neutral insertion-role correction, alpha-composited contrast check, already-debited billing qualification, resolved surface choices, should/deferred limits, explicit approval points and prototype limitations. Historical removals/old tables were replaced with current generated tables; source commits above preserve the originals.

No new domain glossary term is introduced. Component/token names belong in the design specification; API/domain terminology and identifiers stay under GLOSSARY.md and the existing ADRs.
