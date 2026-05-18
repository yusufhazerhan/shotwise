# Shotwise — design handoff

High-fidelity HTML prototypes for **Shotwise** — an AI-powered App Store screenshot generator. These files are the visual source of truth; convert them to a Next.js 15 / Tailwind / shadcn/ui codebase.

## Files

| File | Purpose |
|---|---|
| `index.html` | **Start here.** Pan/zoom overview of all six pages side by side. |
| `landing.html` | Marketing home — hero, how-it-works, modes, locale grid, testimonials, pricing tease, FAQ. |
| `editor.html` | Manual editor — 3-column workspace (screen list / live canvas / settings panel), working export modal. |
| `wizard.html` | 6-step AI wizard with working step navigation, counters, and a fake generate run. |
| `dashboard.html` | Logged-in home — greeting, stats, projects grid, activity rail, template strip. |
| `pricing.html` | 3 plans + comparison table + monthly/annual toggle + FAQ. |
| `auth.html` | Split-screen sign-in / sign-up with magic-link confirm state. |
| `brand.css` | Shared design tokens (colors, type, spacing, components). |
| `design-canvas.jsx` | Pan/zoom canvas component used by `index.html` (not for the Next.js app). |

## Brand tokens

| Token | Value |
|---|---|
| `--cream` | `#F5EFE6` — primary background |
| `--ink` | `#1E3A2E` — primary text / dark surfaces |
| `--ink-soft` | `#4A6258` — body text |
| `--ink-mute` | `#7A8A82` — secondary / meta |
| `--coral` | `#D97757` — accent |
| `--charcoal` | `#1A1A1A` — dark-mode bg |
| Card radius | `16px` |
| Input radius | `8px` |
| Pill radius | `999px` |
| Grid | 8px base |
| Shadow scale | sm / md / lg / xl — see `brand.css` |
| Type | Inter (400 / 500 / 600 / 700 / 800) + JetBrains Mono (labels) |
| Display | Inter 800, letter-spacing −0.025em to −0.035em |

## Tailwind config to drop into the Next.js app

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream:   { DEFAULT: "#F5EFE6", 2: "#EFE7DA", 3: "#E8DFCF" },
        ink:     { DEFAULT: "#1E3A2E", soft: "#4A6258", mute: "#7A8A82" },
        coral:   { DEFAULT: "#D97757", 2: "#C8623F" },
        charcoal:"#1A1A1A",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      borderRadius: { card: "16px", input: "8px", pill: "999px" },
      boxShadow: {
        sm: "0 1px 2px rgba(30,58,46,0.04), 0 1px 1px rgba(30,58,46,0.03)",
        md: "0 4px 14px rgba(30,58,46,0.06), 0 1px 3px rgba(30,58,46,0.04)",
        lg: "0 16px 40px rgba(30,58,46,0.08), 0 4px 12px rgba(30,58,46,0.04)",
        xl: "0 30px 60px rgba(30,58,46,0.10), 0 8px 20px rgba(30,58,46,0.06)",
      },
    },
  },
} satisfies Config;
```

## Suggested Next.js 15 structure

```
src/
  app/
    (marketing)/
      layout.tsx               // nav + footer
      page.tsx                 // ← landing.html
      pricing/page.tsx         // ← pricing.html
    (auth)/
      sign-in/[[...rest]]/page.tsx   // ← auth.html (Clerk)
    (app)/
      layout.tsx               // logged-in nav
      dashboard/page.tsx       // ← dashboard.html
      editor/[projectId]/page.tsx    // ← editor.html (client component for state)
      wizard/page.tsx          // ← wizard.html (client component)
  components/
    ui/                        // shadcn primitives (Button, Card, Input, Select, Tabs, Dialog, Progress…)
    brand/Logo.tsx
    marketing/{Hero,HowItWorks,Modes,LocaleGrid,Testimonials,PricingTease,FAQ}.tsx
    editor/{ShotList,Canvas,SettingsPanel,ExportDialog}.tsx
    wizard/{Stepper,Step1App,Step2Upload,Step3Analyzing,Step4Review,Step5Style,Step6Generate}.tsx
  lib/{api,ai,zip}.ts
```

## Component → shadcn/ui mapping

| HTML class | shadcn primitive |
|---|---|
| `.btn` `.btn-primary` `.btn-ghost` `.btn-coral` | `<Button variant="default" \| "ghost" \| "coral">` (add coral variant) |
| `.card` | `<Card>` |
| `.input`, `.textarea`, `.select` | `<Input>`, `<Textarea>`, `<Select>` |
| `.tab-row` + `.tab` | `<Tabs>` `<TabsList>` `<TabsTrigger>` |
| `.modal-back` + `.modal` | `<Dialog>` / `<DialogContent>` |
| `.pill`, `.pill-coral` | `<Badge variant="default" \| "coral">` |
| `.faq details/summary` | `<Accordion>` |
| `.progress` | `<Progress value={n}>` |
| `.radio-group` (segmented) | `<ToggleGroup type="single">` |

## Interaction notes

- **Editor:** title/accent inputs update the canvas live (already implemented in the HTML — port the same reducer pattern). Selected screen has a cream-highlighted item; the export modal is a fake progress simulator — wire it to the real renderer.
- **Wizard:** step navigation is the only required state; each step is its own component. Step 3 is a deliberate "analyzing" wait state — use server actions + streaming.
- **Pricing:** monthly/annual toggle swaps the `data-monthly` / `data-annual` price attrs — port to a store value.
- **Auth:** the magic-link sent state replaces the form in place. With Clerk, swap the whole `<form>` for `<SignIn />` and keep the left brand panel.

## Animations

Where there's motion in the prototype (hero arrow nudge, AI pulse orb, step transitions, count-up progress bars), use **Framer Motion** in the Next.js port:
- Hero: animated transition between "raw → marketing" frames every ~3s.
- Wizard step transitions: `motion.div` with `initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}`.
- Analyzing screen: the pulse orb is a pure CSS animation; keep as-is in a `<div>`.

## Out of scope for the prototype

- Real AI/LLM calls — placeholder text only.
- Real ZIP generation — modal is a simulated progress bar.
- Auth flow — UI only; integrate Clerk.
- Mobile responsiveness — basic breakpoints are wired in `brand.css`; expand for production.

## Assets to produce (separate from this handoff)

- Logo SVG (S-mark + "shotwise" wordmark with coral dot accent — see `.logo-mark` in `brand.css` for the placeholder).
- Favicon 32×32 / 16×16.
- OG image 1200×630.
- Brand kit page for the dashboard.

## License & tone

Indie-developer tooling. Tone is **calm, designer-grade, developer-friendly** — not playful, not enterprisey. References that match the bar: Linear, Vercel, Raycast, Figma. Avoid Canva/Mailchimp tropes (gradients-everywhere, illustrations, exclamation marks).

---

Generated as a high-fidelity design package. Hand to Claude Code or any Next.js developer to scaffold the live app.
