import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PricingPage from "./page";

describe("PricingPage", () => {
  it("renders the free open-source page without stale paid copy", () => {
    render(<PricingPage />);

    expect(screen.getByText(/Free open-source screenshot studio/i)).toBeTruthy();
    expect(screen.getByText(/Design without accounts/i)).toBeTruthy();
    expect(screen.getByText(/Start from a real layout/i)).toBeTruthy();
    expect(screen.getByText(/Generate upload-ready files/i)).toBeTruthy();
    expect(screen.getByText(/Unlimited local editing/i)).toBeTruthy();
    expect(screen.getByText(/Do I need an account\?/i)).toBeTruthy();
    expect(screen.queryByText(/subscription/i)).toBeNull();
    expect(screen.queryByText(/hosted render/i)).toBeNull();
    expect(screen.queryByText(/payment/i)).toBeNull();
  });
});
