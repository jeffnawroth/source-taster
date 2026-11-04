# Final #70 review corrections

All nine final review findings were substantiated against the accepted issues, GLOSSARY and ADR-0001/0004/0010/0012/0013/0017/0019. No finding was waived. The coordinated private implementation is documented in its `docs/70-final-review-corrections.md`.

| Public finding | Correction | Verification |
| --- | --- | --- |
| Account-management ownership | Open clients contain a safe private-web `/account?language=…` link, under their existing host flags. No Account-management form or workflow remains in open UI code. Sign-in, session transport, Guest identity, Check workspace and normal revocation enforcement remain open. The private page was independently implemented; no AGPL UI or internal verification implementation was imported or copied into private code. | Real Chromium web tests in DE/EN cover the private page against both real programs: sign-in, fresh proof, wrong code, new-address confirmation and deletion. Public link/gate tests and real extension builds cover forwarding without credentials. |
| Report test seam | Both real programs now create/download Verification reports for paid packs and subscriptions, assert unchanged Quota through `/v2/quota`, then sign out and prove download refusal with the still-signed token. Supplemental PDF structure fixtures remain. Removed the internal reservation-call counter assertion. | `apps/server/test/commerce.contract.ts`, using real PostgreSQL, verification web/worker and private service with fake external payment/mail only. |
| Grounded AI References lost | Parser recognition is no longer an acceptance prerequisite. Parser comparison still identifies changed fields; exact original text/spans, schema validation, field grounding/proposals and fallback notices remain. | New HTTP regression for embedded author/title text without year or identifier failed with an empty Reference list before the fix; all 21 AI extraction tests pass. |

The private corrections cover recoverable limiter authority without shortening 24-hour windows, idempotent refund/chargeback grant fencing, durable exact invoice archive delivery with eight-year COMPLIANCE holds, full temporary Pro History features, current Account language for delayed pack purchase mail, and transaction-scoped Operator activation completion.

## Validation and operational limits

This is local implementation evidence. Both-program report tests and private Account browser tests run the real programs on owned disposable PostgreSQL. Payment, SMTP, AI and object-storage fixtures are synthetic external adapters, not qualified production providers. Invoice archive tests compare exact PDF/UBL bytes through authorized downloads; the delivery-disabled mutation is a sensitivity check, not an original-baseline red run. Other code regressions have original red logs. The Operator bookkeeping extraction retains existing activation behavior/tests.

The independent limiter-authority option refines ADR-0012's original one-instance placement. Human deployment/architecture acceptance, EU/legal/cost evidence and a fresh durable authority surviving primary account/region loss remain prerequisites; no production second database is claimed approved or provisioned. Missing/corrupt authority refuses service. The code enables recovery with preserved consumption; it does not qualify the eight-hour RTO. The invoice bucket must be provisioned separately from 13-day database backups and its actual Object Lock/lifecycle and recovery qualified.

All release refusal (exit 78), quality/load/calibration, source #138/#140/#136, EU/provider/legal, Selected dependency and private minimatch gates remain mandatory. Nothing changes scheduled jobs or marks human qualification complete.

No public transport source changed. All five private dependency pins stay at `d50b0ac24273515e5f291de58aa29d7856f99475`; no repin or temporary workspace override is required. Application publication must be coordinated so the private `/account` page exists before links are enabled.

The implementation owns only the two integration roots starting at public `9970b4c1211c48dedd790fd29e5af1c8de52d26b` and private `2823c0840f599c5a2041e74ea6c32ab57bb3523d`. No predecessor, nested agents, pushes, PR/issue writes, cloud/mail/provider actions or shared port-5433 resources were used. Detailed command logs, checkpoints, exact committed heads and resource cleanup receipts are in `.tmp/spec-70-orchestration/final-review/fixes/`.
