#!/usr/bin/env bash
# Run hourly. Crontab example:
#   0 * * * * /opt/shotwise/infra/cron/cleanup-expired.sh >> /var/log/shotwise/cron.log 2>&1
set -euo pipefail

APP_URL="${APP_URL:?APP_URL is required}"
CRON_SECRET="${CRON_SECRET:?CRON_SECRET is required}"

curl --fail --silent --show-error \
  -X POST \
  -H "x-cron-secret: ${CRON_SECRET}" \
  -H "Content-Type: application/json" \
  "${APP_URL%/}/api/cron/cleanup-expired"
