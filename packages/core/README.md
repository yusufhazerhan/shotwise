# @shotwise/core

Native SVG + Sharp image generation engine for App Store / Play Store marketing screenshots.

This is the **rendering core** of [Shotwise](../../README.md) — used by the CLI, web editor, and batch renderer. No browser, no Puppeteer, no Figma — pure Node.js + Sharp.

## Why native?

| Approach | Cold start | Memory | 10 images |
|---|---|---|---|
| Puppeteer / headless Chrome | ~3s | 250MB | ~12s |
| `@shotwise/core` (Sharp + SVG) | ~150ms | 30MB | **~2s** |

## Install

```bash
pnpm add @shotwise/core sharp
```

## Quick start

```typescript
import { renderWithTheme, getTheme, getCanvasPreset } from "@shotwise/core";
import fs from "node:fs/promises";

const theme = getTheme("cream");
const canvas = getCanvasPreset("iphone67"); // 1284 × 2778

const buffer = await renderWithTheme(
  {
    source: "./raw/home.png",
    title: "Smarter training,\n5 minutes a day",
    accent: "5 minutes",
  },
  theme,
  { width: canvas.width, height: canvas.height }
);

await fs.writeFile("./out/01_home.png", buffer);
```

## CLI

```bash
pnpm tsx examples/cli.ts --config examples/petwises.config.json
```

See [`examples/petwises.config.json`](./examples/petwises.config.json) for the
full config shape.

## API

### `render(opts)` — low-level

Maximum control. Pass every option explicitly.

```typescript
import { render } from "@shotwise/core";

const buf = await render({
  source: "./home.png",
  canvas: { width: 1284, height: 2778, background: "#F5EFE6" },
  title: {
    text: "Smarter training,\n5 minutes a day",
    accent: "5 minutes",
    fontSize: 108,
    fontWeight: 800,
    color: "#1E3A2E",
    accentColor: "#D97757",
    position: "top",
    padding: 200,
    maxCharsPerLine: 22,
  },
  screenshot: {
    maxWidth: 1020,
    maxHeight: 1820,
    cornerRadius: 60,
    shadow: "subtle",
    top: 720,
  },
});
```

### `renderWithTheme(spec, theme, size)` — preset-based

Use a built-in or custom theme to fill in colors/typography/layout.

### `renderBatch({ screens, theme, canvasSize })` — multiple screens

Sequential render of a batch with shared theme. Returns `BatchRenderResult[]`.

### Themes

Built-in:
- `cream` — warm beige + deep green (Calm, Notion vibe)
- `dark` — charcoal + bright cream (developer tools)
- `premium` — white + navy + gold (luxury / finance)

Each is a `Theme` object you can clone + tweak:

```typescript
import { cream } from "@shotwise/core/themes";

const myTheme = {
  ...cream,
  title: { ...cream.title, color: "#003366" },
};
```

### Canvas presets

- `iphone67` — 1284 × 2778 (App Store default — auto-scales to smaller iPhones)
- `iphone65` — 1242 × 2688
- `iphone55` — 1242 × 2208
- `ipadPro129` — 2048 × 2732
- `playPhone` — 1080 × 1920

## Text wrapping

`wrapText` is greedy with explicit `\n` support:

```typescript
import { wrapText } from "@shotwise/core";

wrapText("Smarter training,\n5 minutes a day", 22);
// → ["Smarter training,", "5 minutes a day"]
```

## Backgrounds

Solid hex:
```typescript
background: "#F5EFE6"
```

Linear gradient (CSS-style, 0deg = up):
```typescript
background: "linear-gradient(180deg, #F5EFE6 0%, #E8DECC 100%)"
```

## Performance

- Single render: ~600-800ms on M-series Mac, ~1.2s on Vercel Edge
- Batch 10 screens: ~8s sequential, ~3s with parallel (use `Promise.all` per language)
- Memory: ~30MB working set per render (no leak)

## Tests

```bash
pnpm test
```

Tests cover `wrapText`, `escapeXml`, and snapshot-based regression on render
output. Visual snapshots are gitignored — regenerate with `pnpm test:update`.

## License

MIT (until v1.0). Subject to Shotwise commercial terms after v1.0 launch.
