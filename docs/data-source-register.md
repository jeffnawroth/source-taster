# Distributed reference data

| Data | Upstream and terms | Purpose and delivery | Version and attribution |
| --- | --- | --- | --- |
| NLM J_Medline journal list | [NLM source](https://ftp.ncbi.nih.gov/pubmed/J_Medline.txt), [terms](https://www.nlm.nih.gov/databases/download/terms_and_conditions.html) | Offline attestation of journal abbreviations, NLM IDs, titles and ISSNs under ADR-0018; compact snapshot bundled with the verification core, no user data sent and no extra request | Snapshot 2026-10-29; original-byte SHA-256 in `packages/core/src/data/nlm-journals.json`; “Courtesy of the U.S. National Library of Medicine”, dated snapshot and non-current-data notice in the result explanation and [distribution notice](../packages/core/src/data/NOTICE.md). No NLM endorsement. |

Received Crossref short container titles, Europe PMC Medline abbreviations and
Semantic Scholar venue alternate names are per-result evidence already received
for a Candidate; they are not separately downloaded abbreviation catalogs.
