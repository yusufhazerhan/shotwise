import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  listProjects: vi.fn(),
  listCreditLedger: vi.fn(),
  getUserById: vi.fn(),
  getBalance: vi.fn(),
  hasLifetimeAccess: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    listProjects: mocks.listProjects,
    listCreditLedger: mocks.listCreditLedger,
    getUserById: mocks.getUserById,
  },
}));

vi.mock("@shotwise/credits", () => ({
  getBalance: mocks.getBalance,
  hasLifetimeAccess: mocks.hasLifetimeAccess,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
  });

  it("shows the hosted convenience strip for free users", async () => {
    mocks.requireUser.mockResolvedValue({ id: "user-1", email: "solo.maker@example.com" });
    mocks.listProjects.mockResolvedValue([]);
    mocks.getBalance.mockResolvedValue(20);
    mocks.listCreditLedger.mockResolvedValue([]);
    mocks.getUserById.mockResolvedValue({ monthlyRefillActive: false });
    mocks.hasLifetimeAccess.mockResolvedValue(false);

    const { default: DashboardPage } = await import("./page");
    const html = renderToStaticMarkup(await DashboardPage());

    expect(html).toContain("Hosted export credits are optional");
    expect(html).toContain("server mode is optional");
    expect(html).toContain("No projects yet.");
  });

  it("hides the upgrade strip for lifetime users and links into the latest project", async () => {
    mocks.requireUser.mockResolvedValue({ id: "user-1", email: "admin@shotwise.test" });
    mocks.listProjects.mockResolvedValue([
      { id: "project-1", name: "Local launch", mode: "manual", updatedAt: "2026-05-19T10:00:00.000Z" },
    ]);
    mocks.getBalance.mockResolvedValue(9999);
    mocks.listCreditLedger.mockResolvedValue([
      { id: "row-1", amount: 100, reason: "purchase_starter", createdAt: "2026-05-19T09:00:00.000Z" },
    ]);
    mocks.getUserById.mockResolvedValue({ monthlyRefillActive: false });
    mocks.hasLifetimeAccess.mockResolvedValue(true);

    const { default: DashboardPage } = await import("./page");
    const html = renderToStaticMarkup(await DashboardPage());

    expect(html).toContain("lifetime unlocked");
    expect(html).toContain("/editor/project-1");
    expect(html).not.toContain("trial credits");
  });
});
