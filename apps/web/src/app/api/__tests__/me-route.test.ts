import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getBalance: vi.fn(),
  hasLifetimeAccess: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getUserById: mocks.getUserById,
  },
}));

vi.mock("@shotwise/credits", () => ({
  getBalance: mocks.getBalance,
  hasLifetimeAccess: mocks.hasLifetimeAccess,
}));

describe("/api/me", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
  });

  it("returns the current user shape with lifetimeActive", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getUserById.mockResolvedValue({ id: "user-1", monthlyRefillActive: true });
    mocks.getBalance.mockResolvedValue(80);
    mocks.hasLifetimeAccess.mockResolvedValue(false);

    const { GET } = await import("../me/route");
    const res = await GET(new NextRequest("http://localhost/api/me"), { params: Promise.resolve({}) });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      id: "user-1",
      email: "owner@example.com",
      lifetimeActive: true,
      balance: 80,
    });
  });
});
