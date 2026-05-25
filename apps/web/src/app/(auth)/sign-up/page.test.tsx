import { describe, expect, it, vi } from "vitest";
import SignUpPage from "./page";

const redirect = vi.fn();

vi.mock("next/navigation", () => ({ redirect: (href: string) => redirect(href) }));

describe("SignUpPage", () => {
  it("redirects to local Studio", () => {
    SignUpPage();
    expect(redirect).toHaveBeenCalledWith("/studio");
  });
});
