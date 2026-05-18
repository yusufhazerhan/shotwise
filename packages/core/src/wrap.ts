/**
 * Soft-wrap a string into multiple lines.
 *
 * - Honors explicit `\n` as forced line breaks (returns a separate line each).
 * - Greedily fits words up to `maxChars`; if a single word exceeds maxChars,
 *   it occupies its own line (we never break mid-word).
 *
 * @example
 *   wrapText("Smarter training,\n5 minutes a day", 22)
 *   // → ["Smarter training,", "5 minutes a day"]
 */
export function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  if (maxChars <= 0) throw new Error("maxChars must be > 0");

  const lines: string[] = [];
  const segments = text.split("\n");

  for (const segment of segments) {
    const words = segment.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (trial.length <= maxChars) {
        current = trial;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
    else lines.push(""); // preserve blank line from explicit \n\n
  }

  return lines;
}

/**
 * Escape XML/HTML-unsafe characters for SVG text nodes.
 */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
