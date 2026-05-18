# Design Hand-off Notes

Shotwise's app shell, primitives, and pages are all written with semantic HTML
and minimal placeholder Tailwind/CSS. The design layer (Claude Design output)
slots in by:

1. Replacing the **CSS variable defaults** in `apps/web/src/app/globals.css`.
2. Adding rule blocks targeting our **`data-slot="..."`** selectors.
3. (Optional) Replacing the placeholder `sw-*` baseline classes for any
   component you want to re-skin globally.

## 1. CSS variable contract

These vars are read everywhere via Tailwind's color tokens and our `sw-*`
baseline styles. Change them, the whole UI shifts:

| Var | Default | Meaning |
| --- | --- | --- |
| `--bg` | `#ffffff` | App / card background |
| `--fg` | `#111111` | Foreground text |
| `--muted` | `#f5f5f5` | Subtle surface (sidebar, panels) |
| `--muted-fg` | `#666666` | Secondary text |
| `--border` | `#e5e5e5` | Border + dividers |
| `--accent` | `#ff5a1f` | Primary accent / CTA / active state |
| `--font-sans` | system stack | Body font |
| `--font-display` | system stack | Hero / heading font |

Dark-mode override block already exists (`[data-theme="auto"]` with
`prefers-color-scheme: dark`); add light/dark token pairs there.

## 2. data-slot selectors

Every container and primitive carries a `data-slot` attribute. The live
inventory is at `/_dev/preview` (run `pnpm dev` and visit). Major slots:

### Marketing
- `marketing-nav`, `marketing-footer`, `marketing-main`
- `hero`, `hero-title`, `hero-accent`, `hero-subtitle`, `hero-cta`
- `how-it-works`, `how-step` (with `data-step="1|2|3"`)
- `features-grid`, `cta`
- `pricing`, `plan-card` (with `data-plan="free|starter|topup"`), `faq`

### Auth
- `auth-layout`, `auth-form`, `auth-success`, `auth-error`

### App shell
- `app-shell`, `app-sidebar`, `app-logo`, `app-nav`, `app-main`, `app-topbar`, `app-content`
- `credit-balance`

### Dashboard / Projects
- `dashboard`, `empty-state`, `project-list`
- `project-detail`, `project-screenshots`

### Editor (Manual Mode)
- `editor-shell`, `editor-list`, `editor-canvas`, `editor-settings`
- `screenshot-list`, `screenshot-list-item` (active: `data-active=""`)
- `settings-panel`
- `live-preview`, `pixel-preview`

### Wizard
- `wizard-shell`, `wizard-progress`, `wizard-footer`
- `wizard-step-1` … `wizard-step-6`
- `wizard-review-card`, `title-suggestions`, `title-suggestion` (active: `data-active=""`)
- `lang-grid`
- `wizard-export-progress`, `wizard-export-success`, `wizard-insufficient`

### Credits / Account
- `credits-view`, `credits-buy`, `credits-status`, `credits-ledger`
- `account-page`

### Primitives (from `@shotwise/ui-primitives`)
- `button` (with `data-variant`, `data-size`)
- `input`, `textarea`, `label`
- `card`, `card-header`, `card-title`, `card-body`, `card-footer`
- `dialog-overlay`, `dialog-content`, `dialog-title`, `dialog-description`
- `tabs-list`, `tabs-trigger`, `tabs-content`
- `radio-group`, `radio-item`, `checkbox`
- `select-trigger`, `select-content`, `select-item`
- `slider`, `progress`, `spinner`
- `dropzone`, `dropzone-default`
- `toast`, `toast-viewport`

## 3. Where to put new CSS

- **Tokens / global** → `apps/web/src/app/globals.css` (under `:root`).
- **Page-specific** → new file under `apps/web/src/app/.../design.css` and
  import from the page's `layout.tsx`.
- **Primitive override** → bump specificity, e.g.
  `[data-slot="button"][data-variant="primary"] { ... }`.

## 4. Asset hooks

Place images / fonts / SVG icons under `apps/web/public/`. Reference them with
absolute paths starting at `/`. The hero placeholder, for example, currently
has none — the design layer is expected to add `<img>` / `<svg>` children
inside the `data-slot="hero"` container without changing the surrounding
layout structure.

## 5. Don't touch

- Form field IDs and names (`appName`, `category`, `title`, `accent`, etc.)
  — server actions read them.
- API call sites (the `fetch(...)` inside components).
- Route paths (`/wizard/:id/?step=2` etc.).
- `data-slot` values (re-name freely *in CSS*; do not change the markup).

## 6. Smoke test after skinning

1. `pnpm docker:dev` (starts Postgres + MinIO).
2. `pnpm db:push` to create the schema.
3. `pnpm dev` and walk through:
   - Marketing → `/`
   - Sign up → magic link logged in dev console
   - Wizard `/wizard/new` → 1 small screenshot → step 6 export
   - Credits page
4. Open DevTools → verify your styles target the documented `data-slot`s.
