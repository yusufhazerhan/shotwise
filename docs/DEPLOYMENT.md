# Shotwise — Self-Hosted Deployment

End-to-end guide for spinning up Shotwise on a single VPS (Hetzner CX22 or similar). All services run inside Docker Compose with Caddy fronting TLS.

## 1. VPS prerequisites

- Ubuntu 24.04 LTS (or similar)
- Docker + Docker Compose plugin (`apt install docker.io docker-compose-plugin`)
- A domain pointed (A record) to the VPS IP

## 2. Initial setup

```bash
ssh root@<vps>
mkdir -p /opt/shotwise && cd /opt/shotwise
git clone https://github.com/<you>/shotwise .
cp .env.example .env   # fill in below
```

Required `.env` values:

| Var | Purpose |
| --- | --- |
| `DOMAIN` | bare hostname (e.g. `shotwise.app`) |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | `https://${DOMAIN}` |
| `DATABASE_URL` | `postgres://shotwise:<pw>@postgres:5432/shotwise` |
| `POSTGRES_PASSWORD` | matches the password above |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | for magic-link email |
| `GEMINI_API_KEY` | from aistudio.google.com |
| `S3_*` | MinIO root user/pass + buckets (the compose file generates these) |
| `PADDLE_*` | API key, webhook secret, price IDs |
| `CRON_SECRET` | random string used by host cron jobs |

## 3. First boot

```bash
cd /opt/shotwise/infra
docker compose -f docker-compose.prod.yml --env-file ../.env pull
docker compose -f docker-compose.prod.yml --env-file ../.env up -d
docker compose -f docker-compose.prod.yml --env-file ../.env logs -f app
```

Then push the DB schema (one-time):

```bash
# From a workstation with the repo checked out and DATABASE_URL pointing at prod:
DATABASE_URL=postgres://... pnpm db:push
```

## 4. Cron jobs

Install on the host (not inside containers) so they survive container restarts:

```bash
# Put env vars somewhere readable by root only
sudo tee /etc/default/shotwise <<EOF
APP_URL=https://$DOMAIN
CRON_SECRET=...
POSTGRES_USER=shotwise
POSTGRES_DB=shotwise
EOF
sudo chmod 600 /etc/default/shotwise

# Install the crontab entries
sudo crontab /opt/shotwise/infra/cron/crontab.example
```

## 5. Paddle webhook

In the Paddle dashboard, add a webhook endpoint pointing at:

```
https://${DOMAIN}/api/webhooks/paddle
```

Subscribe to: `transaction.completed`, `transaction.payment_failed`.

## 6. Updating

Every push to `main` builds a new image and tags it; deploy with:

```bash
cd /opt/shotwise && git pull && ./infra/deploy/deploy.sh
```

## 7. Backups

`infra/backup/pg-backup.sh` runs daily at 03:00 UTC (see crontab.example).
It dumps the DB to `/var/backups/shotwise/*.sql.gz` and keeps the last 14
days. Configure off-site rsync as desired.

## 8. Disaster recovery

```bash
# Restore from a dump
gunzip -c /var/backups/shotwise/shotwise-<ts>.sql.gz | \
  docker exec -i shotwise-postgres psql -U shotwise -d shotwise
```
