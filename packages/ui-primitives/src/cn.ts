import clsx, { type ClassValue } from "clsx";

/**
 * Minimal classname helper. Kept dependency-free of tailwind-merge — the
 * design layer is allowed to override our placeholder classes verbatim.
 */
export function cn(...args: ClassValue[]) {
  return clsx(args);
}
