import { z } from "zod";
import { DEFAULT_GENERATION_CONFIG, getGemini, MODELS, withRetry } from "../client.js";

export const TitlesResponseSchema = z.object({
  titles: z.array(z.string().min(1).max(80)).length(3),
  accent: z.string().min(1).max(40),
});

export type TitlesResponse = z.infer<typeof TitlesResponseSchema>;

export interface GenerateTitlesInput {
  appName: string;
  category?: string;
  tagline?: string;
  screenDescription: string;
  /** Optional: previously rejected titles to avoid. */
  avoid?: string[];
}

const SYSTEM = `You write App Store screenshot titles. Punchy, concrete, 2 lines max,
~25 characters per line. No periods. No corporate fluff.`;

export async function generateTitles(input: GenerateTitlesInput): Promise<TitlesResponse> {
  const model = getGemini().getGenerativeModel({
    model: MODELS.flash,
    generationConfig: DEFAULT_GENERATION_CONFIG,
    systemInstruction: SYSTEM,
  });

  const prompt = `App: ${input.appName}
${input.category ? `Category: ${input.category}` : ""}
${input.tagline ? `Tagline: ${input.tagline}` : ""}
Screen: ${input.screenDescription}
${input.avoid?.length ? `Avoid these titles: ${input.avoid.join(" | ")}` : ""}

Return JSON: { "titles": ["...","...","..."], "accent": "word from one of the titles" }`;

  const raw = await withRetry(
    async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    { label: "generate-titles" }
  );

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = TitlesResponseSchema.safeParse(JSON.parse(cleaned));
  if (!parsed.success) {
    throw new Error(`[generate-titles] schema mismatch: ${parsed.error.message}`);
  }
  return parsed.data;
}
