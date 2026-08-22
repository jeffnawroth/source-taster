# ADR-0017: Observability Footprint — Proposal to Remove cAdvisor and Pin the Stack

> Status: proposed
> Date: 2026-08-22

**This record is a proposal, not a decision.** The repository convention is that
`accepted` is set only by the commit following an explicit human approval, never
as an agent self-assessment. It was requested as an analysis; it stays
`proposed` until someone decides.

## Context

After moving image builds off the production host (ADR-0015), the host is
healthy: load 0.24, 1174 MiB available, no OOM kills across nine days of uptime.
The observability question is therefore no longer about relieving pressure. It
is about proportion and about two supply-chain exposures that were found while
measuring.

Measured with `docker stats` on 2026-08-22:

| Group | RAM | Share of 3.73 GiB |
|---|---|---|
| Observability (7 containers) | **780 MiB** | 20 % |
| `zwitscher-*` (3, of which SQL Server 710 MiB) | 776 MiB | 20 % |
| **Source Taster production (6 containers)** | **173 MiB** | **4.5 %** |

Per container: grafana 244.6 · prometheus 154.7 · loki 113.0 · cadvisor 75.9 ·
tempo 73.9 · otel-collector 73.2 · promtail 44.9 MiB.

The stack observing the product uses **4.5× the memory of the product**.

## Proposal

### 1. Remove `cadvisor`

The clearest case, and the argument is about privilege rather than memory.

Consumer analysis of all three provisioned dashboards:

| Dashboard | Panels | Datasources |
|---|---|---|
| `business-metrics.json` | 11 | prometheus |
| `logs.json` | 6 | loki |
| `observability.json` | 9 | prometheus, tempo |

**No dashboard uses a single cAdvisor metric.** Searching all three files for
`container_*`, `cadvisor`, and `machine_cpu` returns zero matches — even though
`apps/api/prometheus.yml` defines a `job_name: cadvisor` that scrapes it.

Meanwhile `cadvisor` is the only container in the compose file that runs
`privileged: true`, and it mounts:

```
/:/rootfs:ro   /var/run:ro   /var/lib/docker:ro   /dev/disk:ro   + /dev/kmsg
```

from an unpinned `gcr.io/cadvisor/cadvisor:latest`.

Highest privilege on the host, a mutable image reference, and no demonstrated
consumer. The 75.9 MiB is the smaller half of the argument.

### 2. Pin the observability images

All seven run on `:latest`: prometheus, loki, promtail, otel-collector, tempo,
grafana, cadvisor. This is the same class of supply-chain exposure ADR-0010
closed for the MCP servers — but with higher stakes here, because `promtail`
mounts `/var/run/docker.sock` and `cadvisor` mounts the root filesystem.

Proposed form is tag plus digest, as ADR-0010 used for
`crystaldba/postgres-mcp`, because Docker tags are mutable and can be re-pushed.

### 3. Bind observability ports to `127.0.0.1`

Loki (3100), Tempo (3200), cAdvisor (8082), Prometheus (9090), Grafana (3000)
and otel-collector (4318) publish on `0.0.0.0`, confirmed with `ss -tlnp` on the
host.

They are **not** reachable from the internet — probing all six from outside
returns no response. But `ufw` reports no rules, so the protection comes from a
**Hetzner cloud firewall outside the VM**: invisible in this repository,
unversioned, and changeable independently of any code review.

`postgres` in the same compose file already shows the correct pattern
(`127.0.0.1:5432:5432`). Applying it to the observability ports costs nothing
and makes the boundary independent of an external control this repository
cannot see.

### 4. Keep the remaining six

grafana, prometheus, loki, tempo, promtail, and otel-collector each have a
demonstrated consumer: prometheus and loki back two dashboards directly, tempo
backs `observability.json`, and promtail and otel-collector are the ingest paths
for loki and tempo respectively. **No recommendation to cut any of them.**

The 780 MiB is disproportionate to a 173 MiB product, but disproportion is not
by itself a defect — whether three dashboards justify that cost is a product
judgement, and this record does not make it.

## Alternatives considered

- **Cut tempo and otel-collector as well** (147 MiB combined). Rejected:
  `observability.json` queries tempo, so this would break an existing dashboard.
  Whether distributed tracing earns its keep on a single-host deployment is a
  fair question, but it is a product decision with a visible consequence, not a
  cleanup.
- **Replace the stack with a hosted service.** Out of scope: it trades memory
  for recurring cost and moves telemetry off-premises, which touches data
  handling and deserves its own decision.
- **Leave everything as is.** Defensible for memory — the host is healthy. Not
  defensible for `cadvisor`: a privileged container with a root-filesystem mount
  and a mutable image tag, serving no consumer, is a standing risk regardless of
  how much RAM is free.

## What acting on this would require

Changes would be confined to `docker-compose.yml` (remove the `cadvisor`
service, add digests, rebind ports) and `apps/api/prometheus.yml` (drop the
`cadvisor` scrape job). Both are deploy-path files, so the change would follow
the normal pull-request and release route and be verified by the next deploy.

Nothing in this record has been implemented.
