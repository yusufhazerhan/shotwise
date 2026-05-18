# Roadmap

Hızlı özet (4 faz, ~4 ay toplam aktif çalışma):

| Faz | Süre | Çıktı | Hedef |
|---|---|---|---|
| **1. Engine** | 1 hafta | Çalışan CLI tool | Petwises görsellerini bununla üret |
| **2. UI Foundation** | 2 hafta | Next.js dashboard, manuel mod | Solo developer arkadaşlara test ettir |
| **3. SaaS Launch** | 4 hafta | Wizard + AI + auth + payment | ProductHunt, $19/ay |
| **4. Scale** | sürekli | Brand kit, template marketplace, integrations | $5K MRR |

---

# Faz 1 — Engine (1 hafta)

> **Hedef:** Petwises'in 20 görselini bu kodla üret. Şu an `scripts/src/generate-marketing-screenshots.ts` var; onu Shotwise'a taşıyıp paketle.

## Çıktılar
- [ ] `packages/core/` paketi → `@shotwise/core` npm modülü
- [ ] CLI: `pnpm shotwise generate --config x.json`
- [ ] Çıktı kalitesi Petwises ile bire bir aynı (regresyon yok)
- [ ] 3 stil (cream, dark, premium) hardcoded olarak çalışır

## Görevler
- [ ] `packages/core/src/render.ts` — ana fonksiyon
- [ ] `packages/core/src/themes/cream.ts` — tema preset
- [ ] `packages/core/src/themes/dark.ts`
- [ ] `packages/core/src/themes/premium.ts`
- [ ] `packages/core/src/wrap.ts` — text wrapping
- [ ] `packages/core/src/svg.ts` — SVG title generator
- [ ] `examples/cli.ts` — yargs ile CLI
- [ ] `examples/petwises.config.json` — Petwises preset
- [ ] README + basit usage doc

## Validation
Petwises home + recap_intro + lessons görsellerini bu CLI ile yeniden üret → mevcut output ile pixel-diff <1%.

---

# Faz 2 — UI Foundation (2 hafta)

> **Hedef:** Next.js dashboard kuruyoruz. Auth yok, single-user (local), AI yok. Sadece manuel mod.

## Çıktılar
- [ ] `apps/web/` — Next.js 15 app
- [ ] Landing sayfası (basit, "coming soon")
- [ ] Editor: drag&drop upload + sol panel + sağ panel + canvas preview
- [ ] Live preview (canvas re-render her değişiklikte)
- [ ] "Export ZIP" çalışıyor
- [ ] Brand kit save/load (localStorage MVP)

## Görevler

### Hafta 1: Foundation
- [ ] Next.js 15 + Tailwind + shadcn setup
- [ ] `apps/web/app/page.tsx` — landing (placeholder)
- [ ] `apps/web/app/editor/page.tsx` — editor shell
- [ ] Drag&drop upload (react-dropzone)
- [ ] Canvas component (sol: thumbnails, orta: live preview, sağ: form)

### Hafta 2: Editor logic
- [ ] Form fields: title, accent, font, color, background, sizing
- [ ] Live preview via SVG render in browser (DOM, sonra `@shotwise/core` call'a swap)
- [ ] Multi-screen support (reorder via drag)
- [ ] Export → API route → `@shotwise/core` call → ZIP stream

## Tasarım
- Claude Design'a → bkz. [CLAUDE_DESIGN_PROMPT.md](CLAUDE_DESIGN_PROMPT.md)

## Validation
- 5 friend dev'e link gönder, kendi screenshot'larıyla test et
- Geri bildirim topla, "$19/ay'a alır mıydınız?" diye sor

---

# Faz 3 — SaaS Launch (4 hafta)

> **Hedef:** Public launch. Wizard mod + AI + auth + payment. İlk müşteri.

## Çıktılar
- [ ] Clerk auth (email magic link + Google)
- [ ] Postgres + Drizzle (users, projects, screenshots, exports, usage)
- [ ] Wizard flow (Step 1-6 — bkz. FEATURES.md)
- [ ] Gemini integration:
  - [ ] Vision analysis (screenshot → açıklama + accent öneri)
  - [ ] Title generation (3 varyant)
  - [ ] Translation (9 dil)
- [ ] LemonSqueezy entegrasyon
- [ ] Free tier (3 export/ay, watermark)
- [ ] Pro tier ($19/ay)
- [ ] R2 storage (raw + exports)
- [ ] Account dashboard: project geçmişi, billing

## Görevler

### Hafta 1: Auth + DB
- [ ] Clerk setup + webhook (user create → DB insert)
- [ ] Drizzle schemas migrate
- [ ] R2 bucket setup, signed URL helper

### Hafta 2: Wizard
- [ ] Step 1-5 UI (multi-step form, zustand state)
- [ ] Step 3 Gemini Vision integration
- [ ] Step 4-5 stil + dil seçimi
- [ ] Job queue (Vercel cron veya QStash)

### Hafta 3: AI + Payment
- [ ] Gemini title generation prompt + retry logic
- [ ] Gemini translation pipeline
- [ ] LemonSqueezy product setup
- [ ] Webhook → user.plan upgrade
- [ ] Usage tracking (free tier 3 limit enforce)

### Hafta 4: Polish + launch
- [ ] Landing sayfası gerçekleşmiş (testimonial yer tutucu)
- [ ] Demo video çek (loom veya screen.studio)
- [ ] ProductHunt'a hazırlık
- [ ] Reddit r/SideProject, r/indiehackers post draft
- [ ] Email list (Resend ile newsletter signup)

## Launch checklist
- [ ] shotwise.app (veya .com) domain
- [ ] SSL + custom domain Vercel
- [ ] Sentry, PostHog kurulu
- [ ] Privacy + Terms sayfaları
- [ ] Support email: hello@shotwise.app
- [ ] ProductHunt Tuesday/Wednesday lansman
- [ ] X/Twitter @shotwise hesap aç

## Launch hedefleri (30 gün post-launch)
- 100 free signup
- 10 paid abone ($190 MRR)
- ProductHunt top 5 of the day
- 5+ review (App Store + Trustpilot benzeri)

---

# Faz 4 — Scale (sürekli)

## Q1 sonrası özellikler

### Brand kit (v1)
- Logo upload (corner overlay)
- Custom font upload
- Saved templates
- Project'ler arası reuse

### Template marketplace (v2)
- Community designer'lar template satar
- %30 Shotwise commission
- Featured templates

### Integrations
- App Store Connect API → direkt yükle
- Play Console API → direkt yükle
- Figma plugin
- VS Code extension (CLI'ya alternatif)

### Advanced AI
- A/B test title önerileri (5 varyant + AI critique)
- ASO keyword optimization (description-aware title)
- Image-aware styling (screenshot'ın dominant renklerinden stil öneri)

### Team tier
- Multi-user workspace
- Approval flow (designer önerir, PM onaylar)
- Shared brand kit

### Mobile app preview videos (v3)
- Static PNG değil, animated MP4 üret
- Apple "App Preview" max 30 saniye support

## MRR hedefleri
- 90 gün: $950 (50 paid)
- 6 ay: $5K (260 paid)
- 12 ay: $20K (1000 paid)

## Pivot triggers

Eğer 90 gün sonunda <100 paid abone → şu sıralarda düşün:
1. **Niş daralt** (sadece pet app developer'lar, sadece iOS, vs.)
2. **B2B'ye git** (agency'lere $99/ay, multi-tenant)
3. **AI Twitter/blog tools** ekle (sadece screenshot değil, full launch)
4. **Open source** (community + sponsorlu features)
5. **Acquisition exit** (Figma plugin, Loom benzeri exit)

---

# Faz 5+ — Long-term ideas

Henüz commit yok, sadece beyin fırtınası:

- **App Preview video gen** — animated marketing video AI ile
- **ASO copilot** — keyword research + title optimization (Gemini + scraping)
- **Social media variant** — TikTok/IG 9:16 versions otomatik
- **Press kit generator** — logo + screenshots + brand colors + JSON metadata
- **Founder community** — paid Discord, monthly office hours
- **YC partnership** — YC batch'lerine ücretsiz access (PR)

---

# Risk taşıma

| Risk | Olasılık | Etki | Mitigation |
|---|---|---|---|
| Rakip aynı feature'ı yapar | Yüksek | Orta | Hızlı launch, brand build et |
| Gemini fiyatları artar | Orta | Yüksek | OpenAI/Claude fallback hazır tut |
| Sharp scale limit | Düşük | Yüksek | Fly.io scale-out ready, queue based |
| Solo founder burnout | Yüksek | Yüksek | Faz 1-2'yi kısa tut, hızlı validation |
| Apple/Play API değişir | Düşük | Düşük | Manual export her zaman çalışır |

---

# Bağımlılıklar

Bu projeye başlamadan önce **bitmesi gereken işler:**

- ✅ Petwises launch (Shotwise'ın ilk müşterisi, dogfooding)
- ⏳ Petwises'tan $500+ MRR (cash flow, gerekli runway)

Eğer Petwises Faz 1-2'sini bitirmeden Shotwise'a başlarsan **odak kaybı riski**. Önce 1 ürün finish et, sonra ikinciye geç.
