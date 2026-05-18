# Shotwise

> **AI-powered App Store screenshot generator.**
> Upload. Describe. AI writes the titles, ships the PNGs. In every language.

Marketing-screenshot SaaS for App Store / Play Store. Take raw app screens,
overlay a punchy title + accent + background, export at native store
resolutions. **Gemini Vision** proposes launch-ready titles; **Gemini Flash**
translates them across 9 locales.

```
Raw screenshot  →  Title + style + AI  →  Store-ready PNG
```

---

## What's in this repo

```
shotwise/
├── apps/
│   └── web/             # Next.js 15 app — marketing, auth, dashboard, editor, wizard, credits
├── packages/
│   ├── core/            # Sharp + SVG render engine (themes, presets, batch)
│   ├── types/           # Shared TS types
│   ├── db/              # Drizzle schema + queries (Postgres)
│   ├── auth/            # Better-Auth wrapper (magic-link via Resend, optional Google)
│   ├── ai/              # Gemini client + prompts (analyze, generate, translate)
│   ├── storage/         # S3-compatible client (MinIO local, any S3 in prod)
│   ├── billing/         # Paddle checkout + webhook helpers
│   ├── credits/         # Credit ledger domain logic
│   └── ui-primitives/   # Unstyled Radix-based primitives with data-slot hooks
├── infra/
│   ├── docker-compose.dev.yml   # Postgres + MinIO for local dev
│   ├── docker-compose.prod.yml  # full stack (app + postgres + minio + caddy)
│   ├── Caddyfile / postgres / minio / backup / cron / deploy   # ops bits
└── docs/
    ├── DEPLOYMENT.md            # VPS setup A→Z
    ├── DESIGN_HANDOFF.md        # how to skin the app
    └── VISION / FEATURES / TECH / ROADMAP   # original product docs
```

---

## Stack

- **App**: Next.js 15 (App Router) + React 18 + Tailwind CSS
- **Auth**: [Better-Auth](https://www.better-auth.com) (magic-link via Resend)
- **DB**: Postgres + Drizzle ORM
- **Storage**: S3-compatible (MinIO in dev/self-hosted, Cloudflare R2 / AWS S3 in prod)
- **AI**: Google Gemini 1.5 Flash (Vision + Text JSON)
- **Payment**: [Paddle](https://www.paddle.com) (Merchant of Record, EU VAT handled)
- **Render**: Sharp + SVG, native Node, no headless browser
- **Deploy**: Single VPS + Docker Compose + Caddy auto-TLS

---

## Business model

**Credit-based, not a subscription.**

- **Free trial**: 5 credits on signup
- **Starter pack**: $4.99 → 100 credits + 20 free credits every month going forward
- **Top-up**: $2.99 → 50 credits anytime

1 credit = 1 source screen, rendered in every language the user selected.

---

## Local development

```bash
# 0. Install
pnpm install

# 1. Start local Postgres + MinIO
pnpm docker:dev

# 2. Environment
cp .env.example .env.local
# Fill in BETTER_AUTH_SECRET (random), GEMINI_API_KEY (free tier), PADDLE_* (sandbox).
# RESEND_API_KEY can be left blank — magic links print to the dev console.

# 3. Schema
pnpm db:push

# 4. Run
pnpm dev
# → http://localhost:3000
```

### Useful pages

- `/` — marketing landing
- `/sign-up` → magic-link → `/dashboard`
- `/wizard/new` — full AI-driven flow
- `/editor/new` — manual mode
- `/credits` — Paddle checkout + ledger
- `/_dev/preview` — design hand-off reference (every UI primitive + every `data-slot`)

---

## Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full VPS playbook.

The short version: provision a Hetzner CX22 (or similar), point your domain
to it, fill in `.env`, then:

```bash
git clone <repo> /opt/shotwise && cd /opt/shotwise/infra
docker compose -f docker-compose.prod.yml --env-file ../.env up -d
```

Caddy issues TLS automatically. Push to `main` triggers GitHub Actions →
GHCR image build → SSH deploy.

---

## Design hand-off

Everything in `apps/web` is intentionally **un-styled or minimally styled**.
All structural containers carry `data-slot="..."` attributes so a design
package (Claude Design output) can override visual presentation without
touching markup, state, or routing.

See [docs/DESIGN_HANDOFF.md](docs/DESIGN_HANDOFF.md) for the full slot
inventory and CSS-variable contract.

---

## License

MIT for the infrastructure and `packages/core`. App-layer code is reserved
for commercial use once launched.
