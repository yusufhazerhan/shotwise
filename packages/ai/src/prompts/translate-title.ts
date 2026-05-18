import { z } from "zod";
import { DEFAULT_GENERATION_CONFIG, getGemini, MODELS, withRetry } from "../client.js";
import type { Locale } from "@shotwise/types";

export const TranslationSchema = z.object({
  title: z.string().min(1).max(80),
  accent: z.string().min(1).max(40),
});
export type Translation = z.infer<typeof TranslationSchema>;

const SYSTEM = `You translate App Store screenshot titles between locales.
Translations are IDIOMATIC, not literal — match the emotional tone, keep them
punchy (~25 chars/line, max 2 lines), and preserve a highlightable accent word
that exists verbatim in the translated title.`;

const LANG_LABEL: Record<Locale, string> = {
  en: "English (US)",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese (Brazil)",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
};

export interface TranslateTitleInput {
  sourceLocale: Locale;
  targetLocale: Locale;
  title: string;
  accent?: string;
  appContext?: string;
}

export async function translateTitle(input: TranslateTitleInput): Promise<Translation> {
  if (input.sourceLocale === input.targetLocale) {
    return {
      title: input.title,
      accent: input.accent ?? firstWord(input.title),
    };
  }

  const model = getGemini().getGenerativeModel({
    model: MODELS.flash,
    generationConfig: DEFAULT_GENERATION_CONFIG,
    systemInstruction: SYSTEM,
  });

  const prompt = `Translate this App Store screenshot title from ${LANG_LABEL[input.sourceLocale]} to ${LANG_LABEL[input.targetLocale]}.

Title: "${input.title}"
${input.accent ? `Accent word to preserve concept of: "${input.accent}"` : ""}
${input.appContext ? `App context: ${input.appContext}` : ""}

Rules:
- Idiomatic, natural — NOT literal.
- Max ~25 chars/line, ideally 2 lines (use \\n for line break).
- Same emotional tone.
- The "accent" must appear verbatim in your translated title.

Return JSON: { "title": "...", "accent": "..." }`;

  const raw = await withRetry(
    async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    { label: "translate-title" }
  );

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = TranslationSchema.safeParse(JSON.parse(cleaned));
  if (!parsed.success) {
    throw new Error(`[translate-title] schema mismatch: ${parsed.error.message}`);
  }
  return parsed.data;
}

/**
 * Translate one (title, accent) into many target locales in parallel.
 * Concurrency is throttled to avoid Gemini per-minute rate limits.
 */
export async function translateBatch(opts: {
  sourceLocale: Locale;
  targets: Locale[];
  title: string;
  accent?: string;
  appContext?: string;
  concurrency?: number;
}): Promise<Record<Locale, Translation>> {
  const concurrency = opts.concurrency ?? 4;
  const out = {} as Record<Locale, Translation>;

  const queue = [...opts.targets];
  async function worker() {
    while (queue.length) {
      const target = queue.shift();
      if (!target) return;
      out[target] = await translateTitle({
        sourceLocale: opts.sourceLocale,
        targetLocale: target,
        title: opts.title,
        accent: opts.accent,
        appContext: opts.appContext,
      });
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

function firstWord(s: string): string {
  return s.split(/\s+/)[0] ?? s;
}
