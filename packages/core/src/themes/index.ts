import { cream } from "./cream.js";
import { dark } from "./dark.js";
import { premium } from "./premium.js";
import type { Theme } from "../types.js";

export { cream, dark, premium };

export const themes: Record<string, Theme> = {
  cream,
  dark,
  premium,
};

export type ThemeId = keyof typeof themes;

/**
 * Resolve a theme by id. Throws if unknown.
 */
export function getTheme(id: string): Theme {
  const theme = themes[id];
  if (!theme) {
    throw new Error(`Unknown theme "${id}". Available: ${Object.keys(themes).join(", ")}`);
  }
  return theme;
}
