import { describe, expect, it } from "vitest";
import { assertAllowedLoginEmail, extractClientIp, isDisposableEmail, normalizeLoginEmail } from "./email-guard";

describe("normalizeLoginEmail", () => {
  it("normalizes gmail dots and plus aliases", () => {
    expect(normalizeLoginEmail("F.o.o+trial@Gmail.com")).toBe("foo@gmail.com");
  });

  it("normalizes googlemail to gmail", () => {
    expect(normalizeLoginEmail("foo.bar@googlemail.com")).toBe("foobar@gmail.com");
  });

  it("strips plus aliases for outlook-style providers", () => {
    expect(normalizeLoginEmail("hello+promo@outlook.com")).toBe("hello@outlook.com");
  });
});

describe("isDisposableEmail", () => {
  it("blocks known temp-mail domains", () => {
    expect(isDisposableEmail("throwaway@mailinator.com")).toBe(true);
  });

  it("allows normal inboxes", () => {
    expect(isDisposableEmail("founder@example.com")).toBe(false);
  });
});

describe("assertAllowedLoginEmail", () => {
  it("returns normalized real inboxes", () => {
    expect(assertAllowedLoginEmail("F.o.o+trial@gmail.com")).toEqual({
      ok: true,
      email: "foo@gmail.com",
    });
  });

  it("returns a helpful message for blocked inboxes", () => {
    const result = assertAllowedLoginEmail("test@mailinator.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Disposable email addresses");
    }
  });
});

describe("extractClientIp", () => {
  it("prefers the first forwarded IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.9, 10.0.0.3",
      "x-real-ip": "198.51.100.8",
    });

    expect(extractClientIp(headers)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip when forwarded-for is missing", () => {
    const headers = new Headers({
      "x-real-ip": "198.51.100.8",
    });

    expect(extractClientIp(headers)).toBe("198.51.100.8");
  });

  it("returns null when no client IP headers are present", () => {
    expect(extractClientIp(new Headers())).toBeNull();
  });
});
