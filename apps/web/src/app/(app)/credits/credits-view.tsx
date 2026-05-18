"use client";
import * as React from "react";
import { Button, useToast } from "@shotwise/ui-primitives";

type LedgerRow = { id: string; amount: number; reason: string; createdAt: string };

export function CreditsView({
  balance,
  monthlyRefillActive,
  ledger,
}: {
  balance: number;
  monthlyRefillActive: boolean;
  ledger: LedgerRow[];
}) {
  const toast = useToast();
  const [busy, setBusy] = React.useState<null | "starter_pack" | "topup_50">(null);

  async function buy(kind: "starter_pack" | "topup_50") {
    setBusy(kind);
    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!r.ok) {
        toast.push({ title: "Checkout error", description: `HTTP ${r.status}`, variant: "error" });
        return;
      }
      const data = (await r.json()) as { checkoutUrl: string | null; transactionId: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.push({ title: "Paddle inline checkout required", description: "Open Paddle.js with the transaction id.", variant: "default" });
        // eslint-disable-next-line no-console
        console.log("Paddle transactionId:", data.transactionId);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div data-slot="credits-view">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Credits</h1>
        <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{balance} credits</span>
      </header>

      <section data-slot="credits-buy" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="sw-card sw-card-body">
          <h3 style={{ margin: 0 }}>Starter pack — $4.99</h3>
          <p style={{ color: "var(--muted-fg)" }}>100 credits + 20 free every month going forward.</p>
          <Button variant="primary" loading={busy === "starter_pack"} onClick={() => buy("starter_pack")} style={{ width: "100%" }}>
            Buy starter
          </Button>
        </div>
        <div className="sw-card sw-card-body">
          <h3 style={{ margin: 0 }}>Top up — $2.99</h3>
          <p style={{ color: "var(--muted-fg)" }}>50 credits added immediately. Never expires.</p>
          <Button variant="secondary" loading={busy === "topup_50"} onClick={() => buy("topup_50")} style={{ width: "100%" }}>
            Buy top up
          </Button>
        </div>
      </section>

      <section data-slot="credits-status" className="sw-card sw-card-body" style={{ marginBottom: "1.25rem" }}>
        <strong>Monthly refill:</strong> {monthlyRefillActive ? "Active — 20 credits added each month" : "Inactive — buy the starter pack to activate"}
      </section>

      <section data-slot="credits-ledger">
        <h2 style={{ fontSize: "1.1rem" }}>Recent activity</h2>
        {ledger.length === 0 ? (
          <p style={{ color: "var(--muted-fg)" }}>No transactions yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.35rem" }}>
            {ledger.map((row) => (
              <li key={row.id} className="sw-card sw-card-body" style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem" }}>
                <span>
                  <strong style={{ color: row.amount > 0 ? "#16a34a" : "#dc2626" }}>
                    {row.amount > 0 ? `+${row.amount}` : row.amount}
                  </strong>{" "}
                  <span style={{ color: "var(--muted-fg)" }}>{row.reason}</span>
                </span>
                <span style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>
                  {new Date(row.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
