import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingFooter, MarketingNav } from "./marketing-nav";

describe("MarketingNav", () => {
  it("does not advertise login or paid account flows", () => {
    render(<MarketingNav />);

    expect(screen.getAllByText("Open Studio").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sign in")).toBeNull();
    expect(screen.queryByText("Pricing")).toBeNull();
  });
});

describe("MarketingFooter", () => {
  it("keeps only real footer navigation groups", () => {
    render(<MarketingFooter />);

    expect(screen.getByText("Product")).toBeTruthy();
    expect(screen.queryByText("Server editor")).toBeNull();
    expect(screen.queryByText("Pricing")).toBeNull();
    expect(screen.queryByText("Resources")).toBeNull();
    expect(screen.queryByText("Company")).toBeNull();
  });
});
