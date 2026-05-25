import { describe, expect, it, vi } from "vitest";
import SignInPage from "./page";

const redirect = vi.fn();

vi.mock("next/navigation", () => ({ redirect: (href: string) => redirect(href) }));

describe("SignInPage", () => {
  it("redirects to local Studio", () => {
    SignInPage();
    expect(redirect).toHaveBeenCalledWith("/studio");
  });
});
