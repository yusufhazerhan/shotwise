import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage from "./page";

describe("LandingPage", () => {
  it("renders the local-first positioning", () => {
    render(<LandingPage />);

    expect(screen.getByText(/App Store screenshots you can actually control/i)).toBeTruthy();
    expect(screen.getAllByText(/local Studio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/No prompts required/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/API key/i)).toBeNull();
    expect(screen.getAllByText(/Open source/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/monthly refill/i)).toBeNull();
    expect(screen.queryByText(/20 free exports/i)).toBeNull();
  });
});
