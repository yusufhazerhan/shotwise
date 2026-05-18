#!/usr/bin/env bash
# Daily pg_dump → /var/backups/shotwise. Keeps the last 14 dumps.
# Crontab: 0 3 * * * /opt/shotwise/infra/backup/pg-backup.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/shotwise}"
mkdir -p "$BACKUP_DIR"

TS=$(date -u +"%Y%m%dT%H%M%SZ")
OUT="$BACKUP_DIR/shotwise-$TS.sql.gz"

docker exec shotwise-postgres pg_dump \
  --username "${POSTGRES_USER:-shotwise}" \
  --dbname "${POSTGRES_DB:-shotwise}" \
  --format=plain --no-owner --no-privileges \
  | gzip --best > "$OUT"

# Prune older than 14 days
find "$BACKUP_DIR" -type f -name 'shotwise-*.sql.gz' -mtime +14 -delete

echo "Backup written: $OUT"
