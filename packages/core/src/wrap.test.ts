import { describe, expect, it } from "vitest";
import { escapeXml, wrapText } from "./wrap.js";

describe("wrapText", () => {
  it("returns empty array for empty input", () => {
    expect(wrapText("", 20)).toEqual([]);
  });

  it("returns single line when below maxChars", () => {
    expect(wrapText("Hello world", 20)).toEqual(["Hello world"]);
  });

  it("wraps greedy at word boundaries", () => {
    expect(wrapText("Smarter training in five minutes a day", 20)).toEqual([
      "Smarter training in",
      "five minutes a day",
    ]);
  });

  it("respects explicit line breaks", () => {
    expect(wrapText("Smarter training,\n5 minutes a day", 30)).toEqual([
      "Smarter training,",
      "5 minutes a day",
    ]);
  });

  it("handles multiple consecutive newlines", () => {
    expect(wrapText("A\n\nB", 5)).toEqual(["A", "", "B"]);
  });

  it("places oversized single word on its own line", () => {
    expect(wrapText("Hi supercalifragilistic World", 10)).toEqual([
      "Hi",
      "supercalifragilistic",
      "World",
    ]);
  });

  it("throws on zero maxChars", () => {
    expect(() => wrapText("Hi", 0)).toThrow();
  });
});

describe("escapeXml", () => {
  it("escapes XML-special characters", () => {
    expect(escapeXml("<b>foo & bar</b>")).toBe(
      "&lt;b&gt;foo &amp; bar&lt;/b&gt;"
    );
  });

  it("escapes quotes", () => {
    expect(escapeXml(`"hello" 'world'`)).toBe(
      "&quot;hello&quot; &apos;world&apos;"
    );
  });

  it("leaves plain text unchanged", () => {
    expect(escapeXml("Hello world")).toBe("Hello world");
  });
});
