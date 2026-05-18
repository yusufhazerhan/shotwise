import { describe, it, expect } from "vitest";
import { InsufficientCreditsError, DuplicateGrantError, DEFAULTS } from "./index.js";

describe("credits domain", () => {
  it("InsufficientCreditsError carries required + available", () => {
    const err = new InsufficientCreditsError(10, 3);
    expect(err.required).toBe(10);
    expect(err.available).toBe(3);
    expect(err.message).toContain("10");
  });

  it("DuplicateGrantError carries idempotency key", () => {
    const err = new DuplicateGrantError("paddle:abc");
    expect(err.idempotencyKey).toBe("paddle:abc");
  });

  it("DEFAULTS resolves from env or sane fallbacks", () => {
    expect(typeof DEFAULTS.signupTrial).toBe("number");
    expect(typeof DEFAULTS.starterPack).toBe("number");
    expect(typeof DEFAULTS.topup).toBe("number");
    expect(typeof DEFAULTS.monthlyRefill).toBe("number");
  });
});
