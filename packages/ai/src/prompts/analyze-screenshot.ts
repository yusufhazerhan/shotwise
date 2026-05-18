import { z } from "zod";
import { getGemini, MODELS, withRetry, DEFAULT_GENERATION_CONFIG } from "../client.js";

export const ScreenAnalysisSchema = z.object({
  description: z.string().min(1).max(280),
  uiElements: z.array(z.string()).max(20),
  suggestedCategory: z.enum([
    "feature_showcase",
    "social_proof",
    "outcome",
    "onboarding",
    "value_prop",
    "comparison",
    "lifestyle",
    "other",
  ]),
  suggestedTitles: z.array(z.string().min(1).max(80)).length(3),
  suggestedAccent: z.string().min(1).max(40),
});

export type ScreenAnalysis = z.infer<typeof ScreenAnalysisSchema>;

const SYSTEM = `You are an App Store marketing copy expert.
Given a screenshot of a mobile app screen, you analyze its UI and propose
launch-quality marketing titles. Be terse, concrete, and avoid generic SaaS speak.
Always return valid JSON matching the requested schema.`;

const USER_TEMPLATE = ({
  appName,
  category,
  tagline,
  description,
}: {
  appName: string;
  category?: string;
  tagline?: string;
  description?: string;
}) => `Analyze this app screenshot.

App context:
- Name: ${appName}
${category ? `- Category: ${category}` : ""}
${tagline ? `- Tagline: ${tagline}` : ""}
${description ? `- Description: ${description}` : ""}

Return JSON with shape:
{
  "description": "1 sentence, max 25 words, of what's shown",
  "uiElements": ["primary cards, buttons, status indicators visible"],
  "suggestedCategory": "feature_showcase | social_proof | outcome | onboarding | value_prop | comparison | lifestyle | other",
  "suggestedTitles": [
    "Title variant 1 (2 lines, < 30 chars/line, action-oriented)",
    "Title variant 2 (outcome-focused)",
    "Title variant 3 (curiosity-driven)"
  ],
  "suggestedAccent": "single word or short phrase to highlight in the title"
}

Rules:
- Titles should be App Store ready (2 lines max, ~25 char/line, no period).
- Match the visual emphasis of the screenshot.
- Pick an accent that already appears verbatim in one of the suggested titles.`;

export interface AnalyzeScreenshotInput {
  /** PNG/JPEG buffer. */
  image: Buffer;
  mimeType?: string;
  appName: string;
  category?: string;
  tagline?: string;
  description?: string;
}

export async function analyzeScreenshot(input: AnalyzeScreenshotInput): Promise<ScreenAnalysis> {
  const model = getGemini().getGenerativeModel({
    model: MODELS.flash,
    generationConfig: DEFAULT_GENERATION_CONFIG,
    systemInstruction: SYSTEM,
  });

  const raw = await withRetry(
    async () => {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: input.mimeType ?? "image/png",
            data: input.image.toString("base64"),
          },
        },
        { text: USER_TEMPLATE(input) },
      ]);
      return result.response.text();
    },
    { label: "analyze-screenshot", timeoutMs: 45_000 }
  );

  return parseJsonStrict(raw, ScreenAnalysisSchema, "analyze-screenshot");
}

function parseJsonStrict<T>(raw: string, schema: z.ZodType<T>, label: string): T {
  const cleaned = stripCodeFence(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`[${label}] non-JSON response: ${cleaned.slice(0, 200)}`);
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`[${label}] schema mismatch: ${result.error.message}`);
  }
  return result.data;
}

function stripCodeFence(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
