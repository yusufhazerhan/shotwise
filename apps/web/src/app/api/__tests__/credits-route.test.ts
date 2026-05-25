import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getBalance: vi.fn(),
  hasLifetimeAccess: vi.fn(),
  listCreditLedger: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    listCreditLedger: mocks.listCreditLedger,
    getUserById: mocks.getUserById,
  },
}));

vi.mock("@shotwise/credits", () => ({
  getBalance: mocks.getBalance,
  hasLifetimeAccess: mocks.hasLifetimeAccess,
}));

describe("/api/credits", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
  });

  it("returns balance, ledger, and lifetimeActive for the authenticated user", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getBalance.mockResolvedValue(120);
    mocks.listCreditLedger.mockResolvedValue([{ id: "entry-1", amount: 20 }]);
    mocks.getUserById.mockResolvedValue({ id: "user-1", monthlyRefillActive: false });
    mocks.hasLifetimeAccess.mockResolvedValue(true);

    const { GET } = await import("../credits/route");
    const res = await GET(new NextRequest("http://localhost/api/credits"), { params: Promise.resolve({}) });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      balance: 120,
      lifetimeActive: true,
      ledger: [{ id: "entry-1", amount: 20 }],
    });
  });

  it("returns unauthorized when there is no session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const { GET } = await import("../credits/route");
    const res = await GET(new NextRequest("http://localhost/api/credits"), { params: Promise.resolve({}) });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "unauthorized", message: "Unauthorized" },
    });
  });
});
