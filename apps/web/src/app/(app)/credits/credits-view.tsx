"use client";
import * as React from "react";
import "./credits.css";

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
  const [busy, setBusy] = React.useState<null | "starter_pack" | "topup_50">(null);

  async function buy(kind: "starter_pack" | "topup_50") {
    setBusy(kind);
    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!r.ok) { alert(`Checkout error: HTTP ${r.status}`); return; }
      const data = (await r.json()) as { checkoutUrl: string | null; transactionId: string };
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div data-slot="credits-view">
      {/* Hero balance */}
      <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", margin: "0 0 8px" }}>
          Current balance
        </p>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
          {balance}
        </div>
        <div style={{ fontSize: 16, color: "var(--ink-soft)", marginTop: 6 }}>credits</div>
        {monthlyRefillActive && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, background: "rgba(91,174,127,0.12)", color: "#2D7A50", borderRadius: 999, padding: "5px 12px", fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5BAE7F", display: "inline-block" }} />
            +20 credits every month
          </div>
        )}
      </div>

      {/* Plans grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 32 }}>
        {/* Starter pack */}
        <div className="plan feat">
          <div className="plan-badge">Most popular</div>
          <div className="plan-name">Starter Pack</div>
          <h3>Get started</h3>
          <div className="price">
            <span className="amt">$4.99</span>
            <span className="per">one-time</span>
          </div>
          <div className="price-alt">100 credits + 20/mo refill</div>
          <p className="lead">100 credits to begin, plus 20 free credits every month — forever.</p>
          <ul>
            <li>100 credits on purchase</li>
            <li>20 free credits/month</li>
            <li>ZIP download (24h)</li>
            <li>9 languages supported</li>
          </ul>
          <div className="cta">
            <button
              className="btn btn-primary"
              disabled={busy === "starter_pack"}
              onClick={() => buy("starter_pack")}
            >
              {busy === "starter_pack" ? "Redirecting…" : "Buy Starter Pack"}
            </button>
          </div>
        </div>

        {/* Top-up */}
        <div className="plan">
          <div className="plan-name">Top Up</div>
          <h3>Need more?</h3>
          <div className="price">
            <span className="amt">$2.99</span>
            <span className="per">one-time</span>
          </div>
          <div className="price-alt">50 credits, never expire</div>
          <p className="lead">50 credits added instantly. Buy as many times as you need.</p>
          <ul>
            <li>50 credits on purchase</li>
            <li>Never expire</li>
            <li>Stackable with Starter Pack</li>
          </ul>
          <div className="cta">
            <button
              className="btn btn-ghost"
              disabled={busy === "topup_50"}
              onClick={() => buy("topup_50")}
            >
              {busy === "topup_50" ? "Redirecting…" : "Top up 50 credits"}
            </button>
          </div>
        </div>
      </div>

      {/* Ledger */}
      <section data-slot="credits-ledger">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 14 }}>Recent activity</h2>
        {ledger.length === 0 ? (
          <p style={{ color: "var(--ink-mute)" }}>No transactions yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ledger.map((row) => (
              <div
                key={row.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "white", border: "1px solid var(--line)", borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <span>
                  <strong style={{ color: row.amount > 0 ? "#16a34a" : "#B91C1C", fontFamily: "var(--font-mono)" }}>
                    {row.amount > 0 ? `+${row.amount}` : row.amount}
                  </strong>
                  {" "}
                  <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>{row.reason}</span>
                </span>
                <span style={{ color: "var(--ink-mute)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                  {new Date(row.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
