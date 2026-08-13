# Server-Backup & Restore (VPS jeff@195.201.102.233)

## Backup

- Script: `scripts/backup.sh` → läuft täglich 03:30 per Cron auf dem Server.
- Ablage: `$HOME/backups/source-taster/` (Postgres-Custom-Dump + Keystore-Tar, Rotation 14 Tage).
- Verifikation nach jeder Ausführung: Log `/var/log/source-taster-backup.log` prüfen
  (`backup completed: <stamp>`); monatlich Restore-Probelauf empfehlenswert (siehe unten).
- Offsite: `BACKUP_RSYNC_TARGET` im Cron-Kontext setzen, um eine zweite Kopie extern zu halten.
  Alternativ manuell: `scp -r $HOME/backups/source-taster user@host:~/backups`

## Restore

### Postgres

```bash
# DB-Schema/Nutzer neu anlegen (falls Container frisch):
# docker compose up -d postgres   (POSTGRES_PASSWORD beachten)

# Dump ausspielen (Custom-Format):
docker compose exec -T postgres pg_restore --no-owner --clean --if-exists \
  -U sourcetaster -d sourcetaster < $HOME/backups/source-taster/postgres-<stamp>.dump
```

### Keystore

```bash
# Container-Stop, Backup einspielen, Start:
docker compose stop api
rm -rf apps/api/.keystore && mkdir -p apps/api/.keystore
tar -xzf $HOME/backups/source-taster/keystore-<stamp>.tar.gz -C apps/api
docker compose start api
```

Nach Restore: `curl http://localhost:8000/health` → 200; einen Key-Verify-Smoke fahren
(API-Key anlegen/revoziert ausführen), da Nutzer-LLM-Keys ohne Keystore-Restore verloren sind.
