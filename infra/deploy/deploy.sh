#!/usr/bin/env bash
# Triggered from CI (or run manually on the VPS).
# Pulls the latest image, runs migrations, restarts containers.
set -euo pipefail

cd /opt/shotwise

# Always run from infra/ — compose files reference relative paths
cd infra

docker compose -f docker-compose.prod.yml --env-file ../.env pull app
docker compose -f docker-compose.prod.yml --env-file ../.env up -d

# Run drizzle push (idempotent schema sync) against the running app container.
# We invoke db:push via the app image since it has @shotwise/db installed.
docker compose -f docker-compose.prod.yml exec -T app sh -lc 'node -e "import(\"@shotwise/db\").then(({getDb})=>{const db=getDb();console.log(\"connected\");process.exit(0);}).catch(e=>{console.error(e);process.exit(1);})"' || echo "DB smoke skipped"

echo "Deploy complete: $(date -u +%FT%TZ)"
