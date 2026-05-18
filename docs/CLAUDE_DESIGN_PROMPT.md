# Claude Design Prompt — Shotwise Web UI

> Bu dosyayı Claude.ai/design'a (veya Claude Code'a "design X" istediğinde) **olduğu gibi kopyala-yapıştır**. Ana prompt + her sayfa için ayrı prompt'lar var.

---

# Master prompt (her sayfa için context'e enjekte et)

```
Product: Shotwise
Tagline: AI-powered App Store screenshot generator
Tagline (TR): Yapay zeka destekli App Store görsel üreticisi

Audience: Solo iOS/Android developers, indie founders, multi-locale launchers.
Tone: Premium, calm, designer-grade. NOT playful, NOT enterprisey.
Inspiration: Linear, Vercel, Raycast, Figma — clean developer tools.
NOT like: Canva, Crello (too generic), Mailchimp (too marketingy).

Brand:
- Primary color: warm cream background (#F5EFE6) with deep green (#1E3A2E) text
- Accent: warm orange/coral (#D97757) for highlights
- Optional dark mode: charcoal (#1A1A1A) bg + cream text + same accent
- Typography: sans-serif, bold for headers (800 weight), regular for body
- Suggest: Inter or SF Pro Display
- Generous whitespace, breathing room
- Subtle shadows (no neumorphism, no glassmorphism)

Layout principles:
- Container max-width: 1200px for marketing, full-width for editor
- 8px base spacing grid
- Border radius: 16px for cards, 8px for inputs, 999px for pills
- Dense information when needed (dashboard, editor) but never cramped

Components: shadcn/ui based (Tailwind), customized to brand.

Output: Next.js 15 App Router + Tailwind + shadcn/ui code.
```

---

# Sayfa 1: Landing (Marketing Home)

```
Build the marketing landing page for Shotwise.

Hero section:
- Big bold headline: "App Store screenshots, in 5 minutes."
- Subheadline: "AI writes the marketing copy. Sharp engine renders the visuals. You ship in 9 languages."
- 2 CTA buttons: "Start free" (primary, cream→green) + "See demo" (ghost)
- Right side: animated demo showing raw screenshot → finished marketing screenshot transition (use the actual Petwises home.png → 01_home.png if available)
- Trust bar below: "Trusted by 500+ indie founders" + logo cloud (placeholder logos OK)

Section 1 — "How it works":
3 steps horizontal cards:
1. Upload — drop your raw screenshots
2. Describe — tell AI about your app (3 fields)
3. Generate — pick languages, hit go, download ZIP
Each card has icon + 2 line description + visual mockup.

Section 2 — "Two modes":
Side by side comparison:
- Wizard Mode (AI guides you): for solo founders without design skills
- Manual Mode (full control): for designers who want pixel-perfect

Section 3 — "Multi-locale built-in":
Showcase: 1 raw screenshot turned into 9 different language versions in a grid. Big visual statement.

Section 4 — Social proof:
3 testimonial cards (placeholder text for now).
"Saved me 6 hours per launch" — Founder, Petwises
"My screenshots finally look professional" — Indie iOS dev
"AI nailed the copy on first try" — Multi-app dev

Section 5 — Pricing:
3 tier cards: Free, Pro ($19/mo), Team ($49/mo)
Feature comparison table below.

Section 6 — FAQ accordion:
"Why not Figma?", "How does AI work?", "Can I use my own brand?", "Does it work for Android too?"

Footer:
Logo, social links (Twitter/X, GitHub), legal links, "Made by [user]" 

Hero animation note: Use Framer Motion for the screenshot transformation animation in the hero.
Mobile responsive throughout.
```

---

# Sayfa 2: Editor (Manual Mode)

```
Build the screenshot editor page for Shotwise (manual mode).

Layout — 3 columns:
LEFT (240px): Screenshot list
- Drag & drop zone at top ("+ Add screenshot")
- Vertical list of uploaded screenshots as thumbnails
- Drag to reorder
- Selected screenshot has cream highlight
- "Export ZIP" button at bottom

CENTER (flex): Live canvas preview
- Canvas at 1284×2778 aspect ratio (or whatever output preset)
- Live re-renders as user changes settings on right
- Subtle drop shadow + cream background to evoke "App Store screenshot"
- Zoom controls bottom right (50%, 75%, 100%, fit)

RIGHT (320px): Settings panel
Tabs at top: "Screen" (per-screen) | "Canvas" (global)

"Screen" tab:
- Title (multiline textarea)
- Accent word/phrase (input)
- Position (radio: Top / Bottom)
- Font (dropdown of Google Fonts)
- Font weight (dropdown 400-900)
- Title color (color picker)
- Accent color (color picker)
- Font size (slider 60-160)

"Canvas" tab:
- Output size (dropdown: 6.7" iPhone, 6.5", 5.5", iPad Pro, Play Store)
- Background type (solid / gradient / preset)
- Background color picker (or 2 stops for gradient)
- Screenshot max width % (slider)
- Screenshot corner radius (slider)
- Screenshot shadow (radio: none / subtle / strong)
- "Save as preset" button

Header bar (top of page):
- Logo + project name (editable inline)
- Right: "AI suggest title" button (Pro feature, locked tooltip on free)
- Account avatar dropdown

Sticky footer:
- "Export ZIP" primary CTA
- Export progress modal (when clicked)

Style: like a stripped-down Figma, calm, developer-friendly. Not playful.
```

---

# Sayfa 3: Wizard Mode

```
Build the AI wizard flow for Shotwise — a 6-step guided flow.

Layout: Single column, 600px max-width, centered. Step indicator at top.
Progress bar shows current step (1 of 6, etc.).

Step 1 — "Tell us about your app":
- App name (text input, required)
- Category (dropdown: Productivity, Health, Lifestyle, Education, Pet, Finance, Other)
- Tagline (input, 100 char limit, character counter)
- Description (textarea, 500 char limit)
- Target audience (input, optional, e.g. "solo founders", "pet parents")
- Key features (3-5 inputs, expandable list)
- "Continue" button (disabled until required fields)

Step 2 — "Upload screenshots":
- Big drag & drop zone (dashed border, icon, "Drop or click")
- Uploaded screenshots shown as grid below (4 columns)
- Each: thumbnail + filename + drag-to-reorder + delete X
- Min 1 max 10 screenshots
- "Continue" button

Step 3 — "AI is analyzing..." (loading state):
- Animated illustration (subtle pulse)
- "Reading your screenshots and generating titles..."
- Progress: 1 of N analyzed
- Takes 5-15 seconds

Step 4 — "Review AI suggestions":
- For each screenshot: card with
  - Thumbnail on left
  - AI's description: "Home screen with personalized pet card..."
  - 3 title options as selectable cards
  - "Use my own" textarea fallback
  - Accent word input (pre-filled with AI suggestion)
- "Regenerate" button per screenshot
- "Continue" button

Step 5 — "Pick your style":
- 4 large preview cards: Cream, Dark, Colorful, Premium
- Each shows actual generated preview using user's first screenshot
- User clicks to select
- Optional advanced: custom colors

Step 5b — "Pick languages":
- 9 language flags as checkbox grid
- English pre-selected
- "Add language" expansion (future: custom languages)

Step 6 — "Generate":
- Summary card: "You're about to generate {count} screenshots in {N} languages"
- "Generate" big CTA button
- Loading state with progress bar (each lang × each screen)
- ~30-60 seconds
- Success state: "Done! 18 screenshots ready."
- Download ZIP + "Export to App Store Connect" (Pro feature)

Style: warm, friendly but professional. Generous whitespace.
Cream background. Cards have subtle shadows. Buttons feel premium.
```

---

# Sayfa 4: Dashboard (Account home)

```
Build the user dashboard for Shotwise (post-login home).

Header:
- Shotwise logo + nav (Editor, Wizard, Templates, Pricing, Account dropdown)
- Account avatar with plan badge (Free / Pro / Team)

Hero card (above the fold):
- "Welcome back, [name]"
- Subtext: "You've created X screenshots in Y projects this month."
- "+ New project" CTA (primary)

Stats row (4 metric cards):
- Total projects
- Total screenshots
- Languages used
- AI credits remaining (Free tier shows 2/3 used)

Recent projects grid (3 columns on desktop):
- Card per project with thumbnail of first screenshot
- Project name, last edited, language count
- Hover: "Open" + "Duplicate" + "Delete" actions

Footer suggestion:
- "Upgrade to Pro" banner (Free users only)
- Link to docs, support, changelog

Style: same brand, dense but not cramped. Cards have hover lift.
```

---

# Sayfa 5: Pricing

```
Build the pricing page for Shotwise.

Header section:
- "Choose your plan"
- Subheader: "Start free. Upgrade when you're ready to ship."
- Toggle: Monthly / Annual (-20%)

3 tier cards (horizontal):

FREE
- $0/mo
- "Try Shotwise"
- 3 exports per month
- 1 language only
- Watermark on output
- Manual mode only
- "Start free" CTA (ghost button)

PRO (featured, highlighted)
- $19/mo (or $15 annual)
- "Most popular" badge
- Unlimited exports
- 9 languages
- No watermark
- AI wizard
- Brand kit
- Priority email support
- "Start 7-day trial" CTA (primary)

TEAM
- $49/mo (or $39 annual)
- 3 team seats
- Everything in Pro
- Shared brand kit
- Multi-user workspace
- API access (Faz 4)
- "Contact sales" CTA

Feature comparison table below.

FAQ section:
- "Can I cancel anytime?" Yes
- "Do you offer refunds?" 7-day free trial
- "What payment methods?" Card via LemonSqueezy
- "Is there a discount for students/non-profits?" 50% off, email us

Style: Pro card stands out (slight scale up, accent border). Comparison table is dense but scannable. Footer trust bar with logos.
```

---

# Sayfa 6: Auth (Sign in / Sign up)

```
Build the auth page for Shotwise (powered by Clerk).

Layout: split screen.
LEFT (50%): Brand side
- Big logo
- Headline: "Ship your app in 5 minutes."
- Animated showcase of a screenshot being generated
- Trust bar: "1,000+ developers shipping with Shotwise"

RIGHT (50%): Form side
- Clean Clerk-styled form
- "Sign in" tab + "Create account" tab
- Email magic link primary CTA
- "Continue with Google" + "Continue with GitHub" social buttons below
- Footer: link to Terms, Privacy

Style: spacious, premium. Brand side has subtle animation (Framer Motion).
On mobile: stacks vertically, brand side becomes short hero.
```

---

# Mobil tasarım notları

Tüm sayfalar mobil responsive olmalı:
- Editor mobil'de: yatay tab'lar (Screens / Canvas / Settings) — 3 panel yerine
- Wizard mobil'de: tek kolon, step indicator yatay scroll
- Landing mobil'de: hero animation azalır, CTA stack'lenir

---

# Asset gereksinimleri

Claude Design'a bunları üretmesini iste:
- Logo (SVG) — "S" + "wise" kombinasyonu, cream bg üzerinde green text, accent orange noktası
- Favicon (32x32, 16x16)
- OG image (1200x630) — "Shotwise" + tagline + hero screenshot
- App icon (varsa iOS app — opsiyonel)
- Hero animation source (Framer or Lottie file)

---

# Bonus: dark mode

Opsiyonel dark mode için:
- bg: `#1A1A1A` (charcoal)
- text: `#F5EFE6` (cream)
- accent: same `#D97757`
- borders: `#333`
- shadows: less prominent

Toggle in header (system / light / dark).

---

# Output formatı

Claude Design'dan istenecek:
1. Her sayfa için Next.js 15 App Router page component
2. Tailwind utility classes (custom config'e gerek yok başlangıçta)
3. shadcn/ui component'leri kullanarak (Button, Card, Input, Tabs vs.)
4. Framer Motion animasyonlar opsiyonel
5. Sıkı TypeScript, anytype yok
6. Server components default, "use client" sadece interaction gerekirken

---

# Kullanım

Bu dosyayı Claude.ai/design'a aç:
1. Master prompt'u "system" alanına yapıştır
2. Her sayfa için ayrı conversation aç, ilgili prompt'u kopyala
3. Üretilen kodu `apps/web/app/[page]/page.tsx` altına kaydet
4. shadcn-ui install: `pnpm dlx shadcn@latest add button card input tabs`
5. Test: `pnpm dev`

Üretim sırası önerisi:
1. **Landing** (Faz 1 sonu, marketing için lazım)
2. **Editor** (Faz 2 ana ekran)
3. **Auth** (Faz 3 başı, Clerk takılır)
4. **Dashboard** (Faz 3)
5. **Wizard** (Faz 3 ana fonksiyon)
6. **Pricing** (Faz 3 launch öncesi)

Tüm 6'sını birden istemek yerine **birer birer iste**, geri bildirim ver, iterate et.
