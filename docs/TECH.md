# Tech Stack

## Felsefe

- **Native > Headless Chromium.** Sharp + SVG ile PNG üretmek Puppeteer'dan **10x daha hızlı**, container memory'si **20x daha az**. Faz 4'e kadar tek server'da scale eder.
- **Serverless > Always-on.** Vercel + Cloudflare Workers ana akış, image worker tek başına Fly.io.
- **Postgres > NoSQL.** Account + project metadata zaten relational. Drizzle ile typesafe.
- **AI: 1 sağlayıcı, multi-model.** Gemini API (text + vision) — OpenAI'dan ucuz, kalite eşdeğer.

## Stack özeti

```
Frontend       →  Next.js 15 (App Router) + Tailwind + shadcn/ui
Backend        →  Next.js API routes + Cloudflare Workers (image generation hot path)
Image engine   →  Sharp + SVG (native Node.js)
AI             →  Google Gemini API (gemini-1.5-flash + gemini-1.5-pro)
DB             →  Postgres (Neon serverless) + Drizzle ORM
Auth           →  Clerk (multi-OAuth, magic link, ücretsiz tier yeterli)
Storage        →  Cloudflare R2 (S3-compatible, $0.015/GB vs S3 $0.023/GB)
Payment        →  LemonSqueezy (Faz 3) → Stripe (Faz 4+, EU VAT MOR için LS)
Hosting        →  Vercel (frontend) + Fly.io (image worker, eğer Cloudflare Workers limit aşılırsa)
Email          →  Resend (developer-first, ucuz)
Analytics      →  PostHog (self-hosted free tier) veya Plausible (basit)
Monitoring     →  Sentry (frontend + backend)
CI/CD          →  GitHub Actions + Vercel auto-deploy
```

## Klasör mimarisi (monorepo)

```
shotwise/
├── apps/
│   ├── web/                  # Next.js — landing + dashboard + editor
│   ├── docs/                 # Docusaurus veya direkt MD (basit)
│   └── cli/                  # @shotwise/cli npm package
├── packages/
│   ├── core/                 # Image generation engine (Sharp + SVG)
│   ├── ai/                   # Gemini integration
│   ├── db/                   # Drizzle schemas + migrations
│   ├── types/                # Shared TS types
│   └── ui/                   # shadcn-derived components
├── infra/
│   └── docker-compose.yml    # local Postgres
├── package.json              # pnpm workspaces
├── turbo.json                # Turborepo cache
└── tsconfig.base.json
```

## Veritabanı şeması (Faz 3 MVP)

```typescript
// packages/db/src/schema.ts (Drizzle)

users: {
  id: uuid PK
  clerkId: text UNIQUE       // Clerk user id
  email: text UNIQUE
  plan: enum('free', 'pro', 'team')
  createdAt: timestamp
}

projects: {
  id: uuid PK
  userId: uuid FK
  name: text                 // "Petwises Launch v1"
  appMetadata: jsonb         // { appName, category, description, ... }
  config: jsonb              // { style, languages, ... }
  createdAt: timestamp
  updatedAt: timestamp
}

screenshots: {
  id: uuid PK
  projectId: uuid FK
  rawUrl: text               // R2 url of raw upload
  order: int
  title: jsonb               // { en: "...", tr: "...", ... }
  accent: jsonb              // same
  aiAnalysis: jsonb          // Gemini Vision output
}

exports: {
  id: uuid PK
  projectId: uuid FK
  language: text             // 'en', 'tr', ...
  outputUrl: text            // R2 url of final PNG
  createdAt: timestamp
}

usage: {
  userId: uuid FK
  month: text                // '2026-05'
  exports: int
  aiCalls: int
}
```

## Image generation pipeline

```
1. User uploads raw screenshot → R2 storage
2. (Wizard mode) Gemini Vision analyzes → screenshots.aiAnalysis kaydedilir
3. (Wizard mode) Gemini generates title → screenshots.title kaydedilir
4. (Multi-lang) Gemini translates → screenshots.title.{lang} her dil için
5. For each (screenshot × language):
   a. packages/core/render() çağrılır
   b. SVG'de title + style composition
   c. Sharp ile composite + PNG export
   d. R2'ya yükle → exports tablosuna kaydet
6. Tüm exports tamamlandığında: ZIP oluştur → user'a sunulur
```

`packages/core/render()` API:

```typescript
interface RenderOptions {
  source: Buffer;              // raw screenshot
  canvas: {
    width: number;             // 1284
    height: number;            // 2778
    background: string;        // '#F5EFE6' or gradient
  };
  title: {
    text: string;              // multiline (\n)
    accent?: string;           // word/phrase to highlight
    font: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    accentColor: string;
    position: 'top' | 'bottom';
    maxLineChars: number;
  };
  screenshot: {
    maxWidth: number;          // % of canvas
    cornerRadius: number;
    shadow: 'none' | 'subtle' | 'strong';
  };
}

function render(opts: RenderOptions): Promise<Buffer>;
```

## Gemini API kullanımı

### Modeller
- **gemini-1.5-flash** — text generation, ucuz ($0.075 / 1M input tokens, $0.30 / 1M output)
- **gemini-1.5-pro** — vision analysis (premium quality)
- **gemini-1.5-flash with vision** — Faz 1'de hepsi flash, Faz 3'te kalite testine göre pro'ya geçilir

### Cost estimation
- Tipik wizard flow (10 screenshots × 5 languages):
  - 10 vision call (flash) ≈ $0.001
  - 10 title gen + 50 translation = 60 text call (flash) ≈ $0.005
  - **Toplam ~$0.01 / user / project**
- Pro tier $19/ay, 100 projeli kullanıcı = $1 maliyet → %95+ margin

### Rate limit
Gemini free tier: 15 RPM, 1M tokens/day. Paid: 360 RPM. Faz 3'te paid'e geç.

### Error handling
- AI call fail → kullanıcıya retry sun
- Translation fail → orijinal dilde fallback + uyarı
- Vision fail → manuel description input fallback

## Auth (Clerk)

Clerk free tier: 10K MAU. Faz 3'te yeterli.
Faz 4'te custom auth gerekirse Lucia veya Better-Auth'a geç.

Akış:
1. User signs up → Clerk webhook → `users` tablo insert
2. JWT cookie ile session
3. Next.js middleware route protection
4. API route'lar `clerkClient.users.getUserId(req)` ile authorize

## Storage (Cloudflare R2)

Bucket'lar:
- `shotwise-raw` — kullanıcı upload'ları (private, 30 gün retention)
- `shotwise-exports` — generated PNG'ler (private, signed URL ile download)
- `shotwise-templates` — Faz 4 marketplace template'leri (public)

R2 egress ücretsiz (S3'te major maliyet) — ZIP download'lar maliyet yok.

## Payment (LemonSqueezy)

Faz 3'te neden LemonSqueezy:
- **Merchant of Record:** EU VAT, US sales tax otomatik halleder
- Setup 1 saat (Stripe'da KYC + VAT 1 hafta)
- %5 + $0.50 ücret (Stripe %2.9 + $0.30 ama EU VAT için ayrı ödeme gerekiyor)
- Webhook → user.plan güncelle

Faz 4'te volume yüksek olunca Stripe'a migration düşünülür.

## Deployment

### Frontend (Vercel)
- Next.js app `apps/web/` push → Vercel auto-deploy
- Preview deploy per PR
- Production: `shotwise.app` (veya `.com`)

### Image worker (Cloudflare Workers)
- Sharp Cloudflare Workers'ta çalışmaz (native binding) → bu işi Vercel Functions Edge ile dene
- Eğer Vercel function timeout (60s) yeterli olmazsa → Fly.io'da küçük worker

### DB (Neon serverless)
- Auto-scale, branch'lı dev DB ücretsiz tier
- Connection pooling Neon dahili

### CDN
- Vercel + R2 zaten CDN'li
- Custom domain `cdn.shotwise.app` opsiyonel

## Performance hedefleri

| İşlem | Hedef |
|---|---|
| Screenshot upload (10MB) | <3s |
| AI vision analysis (1 screenshot) | <5s |
| AI title generation | <3s |
| Single image render | <800ms |
| Full project export (10 screens × 5 lang) | <60s |
| ZIP download ready | <10s after generate |

## Local dev setup

```bash
# Klonla, init et
git clone <repo>
cd shotwise
pnpm install

# Local services
docker compose up -d postgres
cp .env.example .env.local
# Doldur: DATABASE_URL, GEMINI_API_KEY (free tier OK), CLERK_*

# DB migrate
pnpm db:push

# Dev server
pnpm dev
# Web: http://localhost:3000
```

## Test stratejisi

- **Unit:** `packages/core/render()` — snapshot tests (Vitest)
- **Integration:** AI pipeline mock'lu (Gemini API'ya gerçek call atmıyor)
- **E2E:** Playwright — wizard flow happy path
- **Visual regression:** Percy.io veya Chromatic (Faz 3 sonrası)

## Security

- R2 buckets private + signed URL'ler (1 saat TTL)
- Clerk JWT verification her API route'ta
- Rate limit: Vercel KV ile basit token bucket
- Content moderation: user upload NSFW yoksa default — Faz 4'te Gemini Safety'ye delegate

## Monitoring

- Sentry → error tracking
- PostHog → kullanıcı davranışı (free tier yeterli)
- BetterStack veya UptimeRobot → uptime
- Vercel Analytics → web vitals

## CI/CD

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    - pnpm install
    - pnpm typecheck
    - pnpm test
    - pnpm build
```

Vercel auto-deploy production branch'ten.

## Notlar

- **Sharp Cloudflare Workers'ta çalışmaz** — image gen edge'de değil function/server'da. Bu yüzden Vercel Functions veya Fly.io.
- **Gemini Vision rate limit** Faz 3 launch'ında dikkat — paid tier hazır olmalı.
- **R2 egress ücretsiz** ama bandwidth limit'i var; Faz 4'te Cloudflare Stream'e geç.
