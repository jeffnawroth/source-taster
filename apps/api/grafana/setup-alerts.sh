#!/usr/bin/env bash
# Setup Grafana alert rules via API
# Run after: docker compose up -d grafana
# Usage: bash apps/api/grafana/setup-alerts.sh

set -euo pipefail

GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
AUTH="${GRAFANA_AUTH:-admin:admin}"

echo "Setting up alert rules in Grafana ($GRAFANA_URL)..."

# 1. Create or find the folder
FOLDER_UID=$(curl -sf -u "$AUTH" "$GRAFANA_URL/api/folders" \
  | python3 -c "import sys,json; folders=json.load(sys.stdin); print([f['uid'] for f in folders if f['title']=='Source Taster Alerts'][0] if any(f['title']=='Source Taster Alerts' for f in folders) else '')" 2>/dev/null || true)

if [ -z "$FOLDER_UID" ]; then
  echo "Creating folder 'Source Taster Alerts'..."
  FOLDER_UID=$(curl -sf -u "$AUTH" -X POST -H "Content-Type: application/json" \
    -d '{"title":"Source Taster Alerts"}' \
    "$GRAFANA_URL/api/folders" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['uid'])")
fi

# 2. Get Prometheus datasource UID
PROM_UID=$(curl -sf -u "$AUTH" "$GRAFANA_URL/api/datasources/name/Prometheus" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['uid'])" 2>/dev/null || true)

# 3. Create alert rules
RULES=(
  '{
    "title": "API is down",
    "folderUID": "'"$FOLDER_UID"'",
    "ruleGroup": "Source Taster",
    "condition": "A",
    "noDataState": "Alerting",
    "execErrState": "Error",
    "for": "1m",
    "data": [
      {
        "refId": "A",
        "datasourceUid": "'"$PROM_UID"'",
        "queryType": "",
        "model": {
          "expr": "up{job=\"source-taster-api\"} == 0",
          "intervalMs": 15000,
          "maxDataPoints": 100,
          "refId": "A"
        },
        "relativeTimeRange": { "from": 300, "to": 0 }
      }
    ],
    "labels": { "severity": "critical" },
    "annotations": {
      "summary": "Source Taster API is unreachable",
      "description": "The API has been down for over 1 minute."
    }
  }'
  '{
    "title": "High API Error Rate",
    "folderUID": "'"$FOLDER_UID"'",
    "ruleGroup": "Source Taster",
    "condition": "A",
    "noDataState": "OK",
    "execErrState": "Error",
    "for": "2m",
    "data": [
      {
        "refId": "A",
        "datasourceUid": "'"$PROM_UID"'",
        "queryType": "",
        "model": {
          "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5",
          "intervalMs": 15000,
          "maxDataPoints": 100,
          "refId": "A"
        },
        "relativeTimeRange": { "from": 600, "to": 0 }
      }
    ],
    "labels": { "severity": "warning" },
    "annotations": {
      "summary": "High error rate",
      "description": "The API 5xx error rate has exceeded 5% for over 2 minutes."
    }
  }'
)

for rule_json in "${RULES[@]}"; do
  RULE_TITLE=$(echo "$rule_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
  echo "Creating alert rule: $RULE_TITLE..."
  curl -sf -u "$AUTH" -X POST -H "Content-Type: application/json" \
    -d "$rule_json" \
    "$GRAFANA_URL/api/v1/provisioning/alert-rules" \
    > /dev/null && echo "  ✓ Created" || echo "  ✗ Failed"
done

echo ""
echo "Done! Open http://localhost:3000/alerting/list to view alert rules."
