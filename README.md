# Shotwise

> **AI-powered App Store screenshot generator.**
> Yükle. Anlat. AI başlığı yazsın, görseli üretsin. Bütün dillerde.

Mobil uygulama geliştiricileri için **App Store / Play Store marketing screenshot** üretme aracı. Bir mobil uygulamanın raw ekran görüntülerini alır, üzerine başlık + accent + arka plan ekler, App Store formatına (1284×2778) export eder. **Gemini AI** ile uygulama açıklamasından otomatik başlık üretir, istenen tüm dillere çevirir.

```
Raw screenshot  →  Title + style + AI  →  Store-ready PNG
```

---

## Neden var?

Solo founder/küçük ekiplerin app store launch'unda en büyük 2 ağrı:
1. **Screenshot tasarımı** — Figma'da saatler, her yeni dil için yeniden iş
2. **Marketing copy** — başlık yazmak zor, lokalize etmek daha zor

Shotwise ikisini bir adımda halleder: yükle, app'ini anlat, AI başlık + görsel üretsin.

## İki mod

### 🎯 Wizard Mode (önerilen)
1. App'ini anlat: ad, kategori, hedef kitle, anahtar özellikler
2. Screenshot'ları yükle
3. AI her ekranı analiz eder (Gemini Vision), başlık önerir
4. Stil seç: cream, dark, colorful, premium
5. Dil seç: EN, TR, ES, FR, DE, PT, IT, JA, KO (Gemini çevirir)
6. AI tüm görselleri üretir → ZIP indir

### 🎨 Manual Mode
- Her ekran için title, accent kelime, font, renk, arkaplan tek tek ayarla
- Live preview
- Tam kontrol — designer için

## Teknik

- **Backend:** Node.js + Sharp + SVG-based image generation (no Figma, no Photoshop, native)
- **Frontend:** Next.js + Tailwind + shadcn/ui
- **AI:** Google Gemini API (text + vision)
- **DB:** Postgres (Neon)
- **Auth:** Clerk
- **Storage:** Cloudflare R2 (S3-compatible, ucuz)
- **Payment:** Stripe veya LemonSqueezy
- **Hosting:** Vercel (frontend) + Fly.io (image worker)

Detay için → [`docs/TECH.md`](docs/TECH.md)

## Roadmap özeti

- **Faz 1 (MVP, 4 hafta):** CLI tool + 1 stil + EN/TR. Kendi kullanım.
- **Faz 2 (Web, 6 hafta):** Next.js dashboard, manuel mod, single user.
- **Faz 3 (SaaS, 4 hafta):** Wizard + AI + auth + payment. İlk müşteri.
- **Faz 4 (Scale):** Çoklu stil, template marketplace, brand kit.

Detay → [`docs/ROADMAP.md`](docs/ROADMAP.md)

## Hedef pazar

| Müşteri | Acı | Petwises sözü |
|---|---|---|
| Solo iOS/Android developer | Figma'da saatler | 5 dakikada 10 görsel |
| Indie founder (no design) | Tasarım yapamıyor | AI tasarlar |
| Multi-locale app | Her dil için yeni iş | Tek tıkla 9 dil |
| Agency / freelancer | Toplu screenshot işi | Bulk export, brand kit |

## İş modeli (planlanan)

- **Free:** 3 export/ay, watermark
- **Pro:** $19/ay, sınırsız, AI dahil
- **Team:** $49/ay, brand kit, multi-user

## Klasör yapısı

```
shotwise/
├── README.md                   ← buradasın
├── docs/
│   ├── VISION.md               # uzun vadeli yön, neden bu
│   ├── FEATURES.md             # tüm planlı özellikler detay
│   ├── TECH.md                 # tech stack kararları
│   ├── ROADMAP.md              # faz faz plan
│   └── CLAUDE_DESIGN_PROMPT.md # Claude Design'a web UI tasarlatmak için prompt
└── packages/
    └── core/                   # SVG + Sharp image generator (kullanılabilir CLI)
        ├── src/
        ├── examples/
        └── package.json
```

## Hızlı başlangıç (Faz 1 CLI)

```bash
cd packages/core
pnpm install
pnpm tsx examples/cli.ts \
  --input ../../petwise/marketing/screenshots/raw/en/home.png \
  --output ./out/home.png \
  --title "Smarter training, 5 minutes a day" \
  --accent "5 minutes"
```

## Lisans

MIT (Faz 1-3). Faz 4'te commercial SaaS → kapalı kaynak.

## Bağlantılı projeler

- [Petwises](../petwise) — Shotwise'ın ilk müşterisi (kendi ürünümüzü besler).
