import { describe, it, expect } from "vitest";
import { ScreenAnalysisSchema } from "./analyze-screenshot.js";
import { TitlesResponseSchema } from "./generate-titles.js";
import { TranslationSchema } from "./translate-title.js";

describe("ai prompt schemas", () => {
  it("ScreenAnalysisSchema rejects missing fields", () => {
    const res = ScreenAnalysisSchema.safeParse({ description: "x" });
    expect(res.success).toBe(false);
  });

  it("ScreenAnalysisSchema accepts a full payload", () => {
    const res = ScreenAnalysisSchema.safeParse({
      description: "Home with personalized cards",
      uiElements: ["nav", "card"],
      suggestedCategory: "feature_showcase",
      suggestedTitles: ["A", "B", "C"],
      suggestedAccent: "5 minutes",
    });
    expect(res.success).toBe(true);
  });

  it("TitlesResponseSchema needs exactly 3 titles", () => {
    expect(
      TitlesResponseSchema.safeParse({ titles: ["a", "b"], accent: "x" }).success
    ).toBe(false);
    expect(
      TitlesResponseSchema.safeParse({
        titles: ["a", "b", "c"],
        accent: "x",
      }).success
    ).toBe(true);
  });

  it("TranslationSchema requires title + accent", () => {
    expect(TranslationSchema.safeParse({ title: "Smarter", accent: "5" }).success).toBe(true);
    expect(TranslationSchema.safeParse({ title: "Smarter" }).success).toBe(false);
  });
});
