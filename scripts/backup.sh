#!/usr/bin/env bash
set -euo pipefail

# Source Taster — tägliches Backup (PostgreSQL + .keystore)
# Cron: 30 3 * * * /bin/bash /srv/source-taster/scripts/backup.sh >> /var/log/source-taster-backup.log 2>&1
# Offsite: BACKUP_RSYNC_TARGET setzen (z.B. rsync://host/backup) für zusätzliche Kopie.

COMPOSE_DIR="${COMPOSE_DIR:-/srv/source-taster}"
BACKUP_DIR="${BACKUP_DIR:-/srv/backups/source-taster}"
KEEP="${BACKUP_KEEP:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
cd "$COMPOSE_DIR"

# 1. PostgreSQL (Custom-Format, Restore via pg_restore)
docker compose exec -T postgres pg_dump -U sourcetaster -d sourcetaster -Fc --no-owner \
  > "$BACKUP_DIR/postgres-$STAMP.dump"

# 2. .keystore (Nutzer-LLM-API-Keys, verschlüsselt auf Platte)
tar -czf "$BACKUP_DIR/keystore-$STAMP.tar.gz" -C "$COMPOSE_DIR/apps/api" .keystore

# 3. Rotation: nur die KEEP neuesten behalten
ls -1t "$BACKUP_DIR"/postgres-*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
ls -1t "$BACKUP_DIR"/keystore-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

# 4. Optional: offsite-Kopie (rsync-Ziel, wenn konfiguriert)
if [[ -n "${BACKUP_RSYNC_TARGET:-}" ]]; then
  rsync -a --delete "$BACKUP_DIR"/ "$BACKUP_RSYNC_TARGET"
fi

echo "backup completed: $STAMP"
