---
status: accepted
---

# Start small on Scalingo Paris with Scaleway companions, measure our own availability, and keep an independent export path that survives the loss of the platform

The client accepted this decision on 25 October 2026 in [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22). It builds on the evidence in [EU managed hosting options](https://github.com/jeffnawroth/source-taster/issues/10), at research commit [`6886f01`](https://github.com/jeffnawroth/source-taster/blob/6886f0144d2edbe78072c31aaf9284e9cde14eea/docs/research/eu-managed-hosting.md). It places the two programs and the two entrypoints of [ADR-0003](0003-system-architecture.md). It also fills the handoffs from ADR-0003 to ADR-0011.

- **Platform.** Both programs run on Scalingo in the `osc-fr1` region (Paris). Scaleway provides the companions: Object Storage, Transactional Email (TEM) and Cockpit. An external monitor without content measures availability.
- **Start small, upgrade on triggers.** Production starts on a small stage at roughly €50–80 per month. It moves to the target stage of roughly €330 per month only when a named trigger fires.
- **Own measurement.** FA-UEB-44 is measured on our own product surface, not on a vendor SLA.
- **Survive platform loss.** An encrypted export every 6 hours goes to Scaleway under Object Lock. A cold fallback is prepared at Clever Cloud, so the RTO holds even if the Scalingo account or region is lost.
- **Unreadable transient content in backups.** Content of Checks without History is encrypted with daily keys that never enter a backup and are destroyed after the 24-hour window.

The cost is a small stage with one container per program, an on-demand staging environment and a named deputy, all required before launch.

The baseline is the approved [requirements specification v3.2](../requirements-specification.md). This ADR approves no requirement change. Its interpretations and change-request candidates are listed under Consequences.

## Platform

- **Scalingo `osc-fr1`.** Both programs, `source-taster` and `source-taster-service` (ADR-0001), run there with their `web` and `worker` entrypoints (ADR-0003). Deploys are zero-downtime.
- **Scaleway companions:**
  - Object Storage for independent exports and the invoice archive;
  - TEM for mail;
  - Cockpit for telemetry.
- **External monitor.** A monitor outside both providers probes availability and hosts the status page. It receives no content.
- **Costs start with production.** Development runs locally at no cost. Hosting costs begin only when production runs.

## Stages

- **Start stage.** Roughly €50–80 per month:
  - one container per program runs the `web` and `worker` roles in one process;
  - one Scalingo Starter 1G PostgreSQL database holds both schemas;
  - Object Storage costs cents, TEM includes 300 mails per month, and the monitor and status page use a free tier.
- **Security refinement accepted on 25 October 2026.** [ADR-0015](0015-security-abuse-protection.md) requires OS-enforced isolation for untrusted document extraction at launch. The colocated web/worker roles may remain, but the original single-process/container description is not the complete parser security topology. A separate restricted execution area/container may be required before the ordinary upgrade triggers. Its provider support, enforced restrictions, load and cost must be qualified; the €50–80 estimate does not include a proven isolated layout. The existing cost ceiling remains. No provider switch or unproven sandbox is approved.
- **Upgrade triggers.** The upgrade to the target stage happens when any of these occurs:
  - monthly revenue reaches twice the target-stage cost, roughly €700;
  - measured availability falls below 99.7% in a month;
  - capacity metrics exceed their thresholds: queue wait, memory or database connections;
  - an organisation customer requires an availability commitment.
- **Target stage.** Roughly €330 per month. The upgrade runs in this order:
  1. split `web` and `worker` into separate processes, with 2 containers per type;
  2. move the database to Business with a replica and 7 days of PITR;
  3. upgrade the remaining companions where their own trigger fired.
- **Cost ceiling.** Infrastructure stays at or below €650 per month, excluding AI, payment fees and paid support. Anything above needs the client's approval.
- **Mandatory from the start.** The small stage still includes:
  - the 6-hourly encrypted Object Lock export;
  - crypto-shredding of transient content;
  - the prepared cold fallback;
  - the restore test before launch;
  - the named deputy;
  - the external monitor and status page.
- **Capacity proof.** The small stage must pass the live 50-Check test of [ADR-0007](0007-search-strategy-latency.md) before launch. Otherwise the capacity trigger applies at launch.

## Database

- **One instance, two schemas.** Both programs share one PostgreSQL instance, also at the target stage. Each program has its own schema, its own role and its own connection URL. Scalingo documents sharing a database between apps.
- **No gain from two instances.** Hosted mode fails closed when the service program is unavailable (ADR-0003), so separate instances add cost without adding availability.
- **URL changes.** Scalingo does not guarantee that the connection URL stays fixed. A change triggers an alert and a runbook step that updates both programs.
- **Target placement.** Business in one availability zone with a replica. A quote for Dedicated multi-AZ is requested only if the availability trigger fires.
- **PostgreSQL 18.** Scalingo support must confirm PostgreSQL 18 before launch (ADR-0002).

## Availability

- **What counts as available.** The product is available while all three checks pass:
  - both programs report readiness;
  - a synthetic fixture Check runs through the real queue: start, SSE progress, result and cancel;
  - sign-in works: the mail provider accepts the message and the session is verified.
- **Outside dependencies.** Outages of Data sources and the AI provider do not count as downtime. The product then returns Not verifiable or falls back to non-AI Structuring (ADR-0011).
- **Our dependencies.** Mail outages count. Purchase failures count where our side is involved.
- **Maintenance counts.** All downtime counts, including announced maintenance.
- **48-hour notice.** The Operator announces planned maintenance at least 48 hours ahead in the product and on the status page.
- **Unannounced work.** It is allowed only for emergency security fixes and for provider interventions we were not told about. It counts as downtime and is documented afterwards.
- **Vendor SLA is additive.** Scalingo's 99.9% for two or more containers does not replace our measurement. How Scalingo counts that SLA is clarified before launch.

## Recovery

- **RTO clock.** The 8-hour RTO of FA-UEB-45 starts at the beginning of the disruption, not at detection.
- **No carve-out.** The recovery envelope includes the loss of the Scalingo account or region.
- **Platform restore.** Scalingo PITR is the first path.
- **Independent export.** Every 6 hours an export is encrypted and written to Scaleway Object Storage:
  - it uses separate credentials;
  - Object Lock in compliance mode prevents deletion, also by an attacker holding the host;
  - it is encrypted with a public key; the private key exists only offline.
- **Cold fallback.** An account at Clever Cloud in Paris, which offers PostgreSQL 18, plus deploy scripts and a runbook. No resources run there until needed.
- **Restore tests.** Before launch both paths are tested: Scalingo PITR and export to fallback. After launch, at least the export path is tested every year.
- **Restore protocol.** Each test is recorded in an issue with:
  - timestamps for disruption, detection, restore start, restore end and traffic release;
  - the achieved RPO and RTO;
  - evidence that tombstones and both sweeps were applied before the first traffic (ADR-0005);
  - reconciliation reports for grants, reservations, payments against Stripe and mail idempotency (ADR-0004, ADR-0009);
  - evidence that the key table was empty after restore;
  - evidence that all secrets came only from the password manager.
- **Release before traffic.** After any restore, deletions and tombstones are re-applied, and payment reconciliation completes before paid actions reopen. [ADR-0013](0013-authentication-roles.md) additionally requires reapplying Account/Owner blocks and invalidating all pre-restore sessions and sign-in challenges before traffic returns; all clients sign in again.

## Content in backups

- **Transient content.** Texts, documents and References of Checks without History are encrypted with a key that rotates daily.
- **Key storage.** Keys live in a PostgreSQL unlogged table:
  - unlogged tables are not written to the WAL, so they are absent from PITR and from replicas;
  - our exports use `pg_dump --no-unlogged-table-data`;
  - a crash or failover loses the keys, and in-flight transient Checks fail, which is accepted.
- **Shredding.** A key is destroyed when its 24-hour window ends. Backups then hold only unreadable ciphertext.
- **Scalingo logical backups disabled.** Scheduled logical backups would include the key table and keep weekly copies for 4 weeks, so they are switched off.
- **Fallback store.** If the restore test shows the key table is not empty, for example because of disk-level snapshots, the keys move to a separate store without backups before launch.
- **History and account data.** These stay in backups for at most 14 days. Tombstones are re-applied after every restore, before traffic is served.

## Secrets

- **Runtime.** Secrets are Scalingo environment variables.
- **Authoritative copy.** It lives in a password manager with emergency access for the deputy.
- **Export key.** The server holds only the public key. The private key exists only in the password manager and on paper.
- **Compromised host.** It can neither read nor delete the exports.

## Staging

- **On demand.** Staging is created for a release and deleted after it, so it costs cents instead of a permanent environment.
- **Synthetic data only.** Copies of production data are never allowed.
- **Test modes.** Stripe runs in test mode. AI and mail use test keys.

## Mail

- **Provider.** Scaleway TEM Essential behind a provider-neutral SMTP interface. It has no SLA. It includes 300 mails per month, then costs €0.25 per 1,000.
- **Content-free.** Mails carry only minimal account metadata, never References or documents.
- **Upgrade.** TEM Scale, which has an SLA, is used only after a trigger.

## Monitoring and telemetry

- **Probes.** A Better Stack free-tier monitor probes the deep-health endpoints of both programs every 3 minutes. The endpoints run the availability checks above. The free-tier limits are re-verified when the monitor is set up.
- **Status page.** The same monitor hosts the status page of FA-UEB-47.
- **Alerts.** Email with phone push reaches the Operator and the deputy. Paid phone alerts are added only after a trigger.
- **Telemetry.** OpenTelemetry logs, traces and metrics go to Scaleway Cockpit. They contain no content.
- **Required signals:**
  - the content-free OCR counters and resource ceilings of [ADR-0011](0011-non-ai-structuring.md);
  - the metric for cancelled Checks with 100 or more References (ADR-0005);
  - live performance measured server-side in `osc-fr1` (ADR-0007);
  - queue wait, memory and connection metrics for the capacity trigger.

## Operator absence

- **Named deputy.** A named deputy is required before launch.
- **Access.** The deputy has a runbook and sealed, logged break-glass access.
- **Alerts and absences.** Alerts reach both. The deputy is scheduled for every planned absence.
- **Paid support.** Paid Scalingo support is optional and does not replace the deputy.

## Service-provider register

- **Document.** The FA-UEB-13 register is a versioned document in the open repository.
- **Entries.** For each provider:
  - purpose and role;
  - data categories;
  - location, including backups, support and control plane;
  - safeguards;
  - the DPA;
  - the date it was last verified.
- **Coverage.** Scalingo, Scaleway, Clever Cloud, the monitor, Stripe, the e-invoicing integration, the AI provider and its reserve.
- **Review.** The Operator owns the register and reviews it at every release.

## Invoice archive

- **Separate bucket.** Invoice PDFs and their structured data go to their own Scaleway bucket, separate from the exports.
- **Retention.** Object Lock in compliance mode holds them for 8 years (FA-KTO-04). The cost is cents.

## CI

- **GitHub Actions.** CI processes only test material, the Reference test set and the Development documents, never customer data. FA-UEB-13 therefore does not apply to it.
- **Cost.** CI is free for the open repository once public. Free minutes cover the private repositories.
- **Private material.** The private dataset repository and the Development documents sit next to the Reference test set.
- **Suites:**
  - the fixture suites for FA-ERF-05, import, export and rendering (ADR-0006, ADR-0011);
  - the monthly drift run as a scheduled job (ADR-0006).

## Considered options

- **Render Frankfurt as primary**, rejected because its data-location evidence does not yet satisfy FA-UEB-13. It stays a fallback only if a data-location matrix proves it.
- **Scaleway Serverless**, rejected because ADR-0003 needs long-lived processes for SSE and the worker, and PostgreSQL 18 is unverified there.
- **Clever Cloud as primary**, rejected because pricing needs a quote and PITR is available only on request. It becomes the cold fallback instead.
- **Self-managed Hetzner VPS** at roughly €10–20 per month, rejected because it means running the operating system, database and backups ourselves, is a single point of failure and needs a real migration later. That conflicts with minimal operations.
- **Free tiers such as Render free, Koyeb or Neon**, rejected because services sleep and break SSE and the worker, free databases expire and most providers are US companies. They remain fine as a development playground.
- **The full target stage at launch**, roughly €400 per month with permanent staging, rejected because the cost is out of proportion before revenue exists.
- **Two database instances**, rejected because hosted mode fails closed, so a second instance adds cost without availability.
- **Dedicated multi-AZ from the start**, rejected for cost. It is quoted only after the availability trigger.
- **Scaleway Key Manager for the shredding keys**, rejected because deleted keys stay pending for 7 days, which breaks the 24-hour window.
- **Keeping Scalingo scheduled logical backups**, rejected because they would hold the key table and keep copies beyond 14 days.
- **Carving platform loss out of the RTO**, rejected because the client wants the 8-hour envelope to hold in every scenario.
- **Paid monitoring or TEM Scale at the start**, rejected for cost. Both follow triggers.

## Consequences

- **Launch gates:**
  - Scalingo support confirms PostgreSQL 18;
  - the restore test proves the key table is empty after restore;
  - DPAs and the data-location matrix are in place for every provider, including Stripe and the AI provider, with contract evidence for FA-UEB-12;
  - the small stage passes the live 50-Check test;
  - a named deputy exists;
  - Scalingo's SLA counting is clarified.
- **Requirements interpretations:**
  - FA-UEB-44 (interpretation): availability is measured on our own product surface; Data source and AI provider outages do not count; all downtime, including announced maintenance, counts.
  - FA-UEB-45 (interpretation): the RTO clock starts at the disruption; transient content of Checks without History is outside the recovery scope.
  - FA-UEB-10, FA-UEB-11 and FA-KTO-04 (interpretation): History and account data stay in backups for at most 14 days, and tombstones are re-applied after every restore; transient content in backups is unreadable after crypto-shredding.
  - FA-UEB-12 (interpretation): hosting, database, backup storage and invoice archive providers are processors, not a forbidden passing-on; the FA-UEB-13 register covers them.
- **Change-request candidates:** none.
- **Accepted constraints for other decisions:**
  - the release browser checklist lives in the release issue (ADR-0003);
  - payment webhooks use a durable inbox: store before acknowledging, then process from the queue (ADR-0009);
  - grant, payment and reservation reconciliation runs across both programs after a restore (ADR-0004, ADR-0009);
  - the structured-output schema is warmed up on deploy (ADR-0010);
  - if Bedrock is chosen, the setup uses AWS Organizations, an SCP enforcing `data_retention_mode: none`, CloudTrail and the `eu.` inference profile (ADR-0010);
  - accounts on all three AI candidate paths are needed for the measurement (ADR-0010).
- **Handed-off interfaces:**
  - [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23):
    - whether an authentication service sends its own mail;
    - EU evidence for authentication records;
    - production SMTP setup and deliverability;
    - replay of account deletions after a restore.
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24):
    - reading counters and metrics;
    - restore and runbook tooling;
    - maintaining the service-provider register.
  - [Security and abuse protection](https://github.com/jeffnawroth/source-taster/issues/40) receives OWASP ASVS L1, continuous scanning (FA-UEB-46), Guest abuse protection, upload safety and the SSRF bounds of ADR-0007.
