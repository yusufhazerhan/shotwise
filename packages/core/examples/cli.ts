#!/usr/bin/env node
/**
 * @shotwise/core CLI demo.
 *
 * Reads a JSON config that defines a project (screens, theme, output paths)
 * and renders all marketing screenshots to disk.
 *
 * Usage:
 *   pnpm tsx examples/cli.ts --config examples/petwises.config.json
 *
 * Config format (JSON):
 *   {
 *     "theme": "cream",
 *     "canvas": "iphone67",
 *     "rawDir": "../../petwise/marketing/screenshots/raw/en",
 *     "outDir": "./out/en",
 *     "screens": [
 *       { "source": "home.png", "out": "01_home.png",
 *         "title": "Smarter training,\n5 minutes a day", "accent": "5 minutes" }
 *     ]
 *   }
 */
import fs from "node:fs/promises";
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  getCanvasPreset,
  getTheme,
  renderWithTheme,
  type CanvasPresetId,
} from "../src/index.js";

interface CliConfig {
  theme: string;
  canvas: CanvasPresetId;
  rawDir: string;
  outDir: string;
  screens: Array<{
    source: string;
    out: string;
    title: string;
    accent?: string;
  }>;
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("config", {
      alias: "c",
      type: "string",
      demandOption: true,
      describe: "Path to JSON config file",
    })
    .strict()
    .help()
    .parse();

  const configPath = path.resolve(argv.config);
  const configDir = path.dirname(configPath);
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw) as CliConfig;

  const theme = getTheme(config.theme);
  const canvas = getCanvasPreset(config.canvas);
  const rawDir = path.resolve(configDir, config.rawDir);
  const outDir = path.resolve(configDir, config.outDir);

  await fs.mkdir(outDir, { recursive: true });

  console.log(`Shotwise — rendering ${config.screens.length} screens`);
  console.log(`  Theme:  ${theme.label} (${theme.id})`);
  console.log(`  Canvas: ${canvas.label} (${canvas.width}×${canvas.height})`);
  console.log(`  Output: ${outDir}\n`);

  for (const screen of config.screens) {
    const sourcePath = path.resolve(rawDir, screen.source);
    const outPath = path.resolve(outDir, screen.out);

    const buffer = await renderWithTheme(
      { source: sourcePath, title: screen.title, accent: screen.accent },
      theme,
      { width: canvas.width, height: canvas.height }
    );

    await fs.writeFile(outPath, buffer);
    console.log(`  ✓ ${screen.out}`);
  }

  console.log(`\nDone. ${config.screens.length} files in ${path.relative(process.cwd(), outDir)}`);
}

main().catch((err) => {
  console.error("\n✗ Failed:", err.message);
  process.exit(1);
});
