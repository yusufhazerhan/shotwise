#!/bin/sh
# Creates the buckets Shotwise needs and applies a 1-day lifecycle policy
# to the exports bucket. Runs once at compose up; safe to re-run.
set -e

ENDPOINT="http://minio:9000"
RAW="${S3_BUCKET_RAW:-shotwise-raw}"
EXPORTS="${S3_BUCKET_EXPORTS:-shotwise-exports}"

echo "Waiting for MinIO at ${ENDPOINT}…"
i=0
until mc alias set local "$ENDPOINT" "$S3_ACCESS_KEY_ID" "$S3_SECRET_ACCESS_KEY" 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -gt 30 ]; then
    echo "MinIO not reachable, giving up."
    exit 1
  fi
  sleep 2
done

mc mb --ignore-existing "local/${RAW}"
mc mb --ignore-existing "local/${EXPORTS}"

mc anonymous set none "local/${RAW}"
mc anonymous set none "local/${EXPORTS}"

# Auto-delete generated PNGs/ZIPs older than 1 day. App-level cleanup cron
# also targets these — this is the belt-and-suspenders second line.
cat > /tmp/lifecycle.json <<EOF
{
  "Rules": [
    {
      "ID": "expire-job-artifacts",
      "Status": "Enabled",
      "Filter": { "Prefix": "jobs/" },
      "Expiration": { "Days": 1 }
    }
  ]
}
EOF
mc ilm import "local/${EXPORTS}" < /tmp/lifecycle.json || true

echo "MinIO buckets ready: ${RAW}, ${EXPORTS}"
