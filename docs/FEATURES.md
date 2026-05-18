# Features

## Genel

İki ana mod (Wizard + Manual) + ortak fonksiyonlar.

Her özellik için **MVP**, **v1**, **v2** etiketi var:
- **MVP** — Faz 1-3 yapılır
- **v1** — Faz 3 launch sonrası eklenir
- **v2** — Faz 4+ ileri tarih

---

## 🎯 Wizard Mode (MVP)

### Step 1 — App bilgileri
Kullanıcı doldurur:
- **App adı** (zorunlu)
- **Kategori** (zorunlu, dropdown: Productivity, Health, Lifestyle, Education, Pet/Lifestyle, vs.)
- **Tek cümlelik tagline** (zorunlu, max 100 char)
- **Açıklama** (zorunlu, max 500 char, 3-5 cümle)
- **Hedef kitle** (opsiyonel, "solo founders", "pet owners", vs.)
- **Anahtar özellikler** (3-5 madde, AI ipuçları için)

> **AI bunu nasıl kullanır:** Her screenshot'a bağlam veren marketing copy üretirken bu metadata Gemini prompt'una enjekte edilir.

### Step 2 — Screenshot upload
- Drag & drop area
- Multiple file support (max 10)
- Auto-detect orientation (portrait/landscape)
- Auto-rename: `screenshot_01.png`, `screenshot_02.png` ...
- Preview thumbnails, drag-to-reorder

### Step 3 — AI analizi (Gemini Vision)
Her screenshot için Gemini Vision API çağrılır, çıktı:
- **Ekran açıklaması:** "Home screen with personalized pet card and daily lesson plan"
- **Ekrandaki UI elementleri:** liste
- **Önerilen kategori:** "feature showcase" / "social proof" / "outcome"
- **Önerilen başlık:** 3 varyant

Kullanıcı her ekran için:
- AI önerilerinden seç
- Veya kendi yaz

### Step 4 — Stil seç
4 hazır tema (v1'de marketplace'e taşınır):
- **Cream** — warm cream + deep green (Petwises stili)
- **Dark** — dark + neon accent (modern dev tools)
- **Colorful** — pastel gradient + playful (consumer/Gen Z)
- **Premium** — white + black + gold (luxury/finance)

Her tema:
- Background color/gradient
- Title font + size
- Accent color
- Screenshot border radius + shadow

### Step 5 — Dil seç (multi-locale)
Checkbox grid:
- 🇺🇸 English (default)
- 🇹🇷 Türkçe
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇵🇹 Português
- 🇮🇹 Italiano
- 🇯🇵 日本語
- 🇰🇷 한국어

Seçilen her dil için:
- Gemini başlığı çevirir (native idiomatic, not literal)
- Aynı stil, farklı dil, ayrı export

### Step 6 — Generate & export
- "Generate" butonuna basınca:
  - Backend job kuyruğa girer
  - Progress bar (her dil + her screen için)
  - ~30 saniye total (9 dil × 10 ekran = 90 görsel)
- Output:
  - ZIP indir
  - Veya **doğrudan App Store Connect API** ile yükle (v2)

---

## 🎨 Manual Mode (MVP)

Sol panel: screenshot listesi (upload + reorder).
Orta: live preview canvas (1284×2778 oran).
Sağ panel: o anki seçili ekran için ayarlar.

### Editor ayarları (her screenshot için)
- **Title** — multiline textarea, `\n` ile line break
- **Accent kelime/ifade** — input, otomatik renklendirir
- **Title pozisyonu** — top / bottom (radio)
- **Font** — dropdown (system fonts + Google Fonts top 10)
- **Font ağırlık** — 400 / 600 / 700 / 800 / 900
- **Title rengi** — color picker
- **Accent rengi** — color picker
- **Font boyutu** — slider (60-160px)

### Canvas ayarları (tüm screenshot'lar için ortak)
- **Background** — solid color / gradient (2 stop) / preset
- **Output boyutu** — preset dropdown:
  - 6.7" iPhone (1284×2778) — App Store default
  - 6.5" iPhone (1242×2688)
  - 5.5" iPhone (1242×2208)
  - iPad Pro 12.9" (2048×2732)
  - Google Play Phone (1080×1920)
- **Screenshot ölçek** — slider (max width % of canvas)
- **Screenshot köşe radius**
- **Screenshot shadow** — none / subtle / strong

### Export
- "Export" butonuna basınca tüm ekranlar PNG olarak ZIP.
- "Save preset" → kullanıcı kendi tema'sını kaydeder, ileride re-use.

---

## 🤖 AI Features (Gemini)

### Title generation (MVP)
**Input:** App metadata + ekran açıklaması
**Output:** 3 başlık varyantı

**Prompt template:**
```
You are a senior App Store marketing copywriter.

App: {{appName}}
Category: {{category}}
Description: {{description}}
Target audience: {{audience}}
Key features: {{features}}

This screenshot shows: {{screenDescription}}

Write 3 different marketing titles for this screenshot.
Rules:
- Max 25 characters per line, max 2 lines
- Direct, benefit-focused (not feature-focused)
- Use natural, idiomatic language
- Avoid generic phrases ("the best", "amazing")
- Include 1-2 word "accent" suggestion for color emphasis

Output JSON:
[
  {"title": "Smarter training,\n5 minutes a day", "accent": "5 minutes"},
  ...
]
```

### Screen vision analysis (MVP)
**Input:** Raw screenshot PNG
**Output:** Structured description

Gemini Vision call: `gemini-1.5-flash` (cheap, fast).

**Prompt:**
```
Analyze this mobile app screenshot. Output JSON:
{
  "primaryPurpose": "...",         // "feature showcase", "social proof", "outcome", "tutorial"
  "uiElements": ["..."],            // visible UI elements
  "dominantColors": ["..."],        // top 3 hex colors
  "suggestedAccent": "...",         // word in screenshot worth highlighting
  "screenSummary": "..."            // 1 sentence describing what user sees
}
```

### Translation (MVP)
**Input:** Title in source language + target language
**Output:** Idiomatic title (not literal)

**Prompt:**
```
Translate this App Store screenshot title from {{sourceLang}} to {{targetLang}}.
Title: "{{title}}"
Accent: "{{accent}}"

Rules:
- Idiomatic, natural — NOT literal translation
- Same emotional tone
- Same length range (max 25 char per line)
- Preserve the "accent" concept (highlight a word in target language)

Output JSON: {"title": "...", "accent": "..."}
```

### Title A/B test (v1)
Kullanıcı tek başlık için 5 varyant AI üretir, hangisinin daha iyi olduğunu yorum yapar (linguistic critique).

### Style suggestion (v1)
AI app kategorisinden + screenshot dominant renklerinden uygun stil önerir.

---

## 🧰 Brand Kit (v1)

Tek seferlik setup, sonra tüm projelerde re-use:
- **Logo upload** — corner overlay (opsiyonel)
- **Brand colors** — primary, secondary, accent
- **Font** — Google Fonts library + custom upload
- **Default canvas size**
- **Save as template** → wizard'a otomatik enjekte

## 🏪 Template Marketplace (v2)

Designer community katkıda bulunur, kullanıcılar **paid template** satın alır (Shotwise %30 commission).

---

## 🔗 Integrations

### App Store Connect API (v2)
- OAuth ile kullanıcı App Store Connect hesabını bağlar
- "Export & upload" butonu doğrudan ASC'ye PNG'leri yükler
- Hangi dil hangi locale slot'una gider — otomatik mapping

### Play Console API (v2)
Aynısı Play Console için.

### Figma plugin (v2)
"Open in Shotwise" butonu Figma'dan tek tıkla import.

### CLI tool (MVP)
```bash
npx shotwise generate \
  --config shotwise.json \
  --screenshots ./screenshots/*.png \
  --languages en,tr,es \
  --output ./out
```
Solo developer'lar için no-UI alternatif. Build pipeline'a entegre edilebilir.

---

## 📊 Analytics & Metrics

### Kullanıcı görür (v1)
- Toplam export
- Bu ay export
- En çok kullanılan stil
- AI vs manual oranı

### Founder dashboard (internal)
- DAU, WAU, MAU
- Conversion funnel (free → paid)
- Churn
- AI cost per user
- Most exported language

---

## ⚙️ Account & Billing

### Pricing tiers
| Tier | Aylık | Limit | AI | Watermark |
|---|---|---|---|---|
| Free | $0 | 3 export/ay | ❌ | ✅ |
| Pro | $19 | sınırsız | ✅ | ❌ |
| Team | $49 | sınırsız | ✅ | ❌ + 3 seat |

Yıllık ödeme %20 indirim (Stripe annual billing).

### Auth (MVP)
- Email + magic link (Clerk)
- Google OAuth (v1)
- GitHub OAuth (v1, developer audience için)

### Account features
- Project'leri kaydet (export geçmişi)
- Re-export (önceden üretilen project'i tekrar üret, başka dilde)
- Team workspace (Team tier)

---

## 🚫 Yapmayacaklarımız (anti-features)

- ❌ Generative AI ile pet/insan görsel üretme (sadece copy + layout)
- ❌ Video preview üretme (Faz 5+, henüz değil)
- ❌ Mockup phone frame'leri (3D tilt, vs.) — bilinçli karar: minimalist
- ❌ Çok karmaşık animasyon (CSS keyframe vb.) — static PNG yeter
- ❌ Pro designer için Figma'ya alternatif olmaya çalışma — onlar zaten Figma kullanır
