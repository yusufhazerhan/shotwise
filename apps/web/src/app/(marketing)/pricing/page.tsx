import Link from "next/link";

export default function PricingPage() {
  return (
    <section data-slot="pricing" style={{ padding: "3rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>Pay for credits, not subscriptions</h1>
        <p style={{ color: "var(--muted-fg)" }}>
          1 credit = 1 source screen, rendered across all your selected languages.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <div data-slot="plan-card" data-plan="free" className="sw-card">
          <div className="sw-card-header">
            <h3 className="sw-card-title">Free trial</h3>
            <p style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>For every new account</p>
          </div>
          <div className="sw-card-body">
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>$0</p>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--muted-fg)" }}>
              <li>5 credits on signup</li>
              <li>All AI features</li>
              <li>9 languages</li>
              <li>Watermark on output</li>
            </ul>
          </div>
          <div className="sw-card-footer">
            <Link href="/sign-up" className="sw-btn sw-btn--secondary" style={{ width: "100%" }}>
              Start free
            </Link>
          </div>
        </div>

        <div data-slot="plan-card" data-plan="starter" data-featured="" className="sw-card" style={{ borderColor: "var(--accent)" }}>
          <div className="sw-card-header">
            <h3 className="sw-card-title">Starter pack</h3>
            <p style={{ color: "var(--accent)", fontSize: "0.85rem" }}>Most popular</p>
          </div>
          <div className="sw-card-body">
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>$4.99</p>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--muted-fg)" }}>
              <li>100 credits one-time</li>
              <li>+20 free credits every month</li>
              <li>No watermark</li>
              <li>Cancel anytime — no recurring charge</li>
            </ul>
          </div>
          <div className="sw-card-footer">
            <Link href="/credits" className="sw-btn sw-btn--primary" style={{ width: "100%" }}>
              Buy starter pack
            </Link>
          </div>
        </div>

        <div data-slot="plan-card" data-plan="topup" className="sw-card">
          <div className="sw-card-header">
            <h3 className="sw-card-title">Top up</h3>
            <p style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>Need more later?</p>
          </div>
          <div className="sw-card-body">
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>$2.99</p>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--muted-fg)" }}>
              <li>50 credits, one-time</li>
              <li>Never expires</li>
              <li>Available after first purchase</li>
            </ul>
          </div>
          <div className="sw-card-footer">
            <Link href="/credits" className="sw-btn sw-btn--secondary" style={{ width: "100%" }}>
              Buy top up
            </Link>
          </div>
        </div>
      </div>

      <section data-slot="faq" style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Frequently asked questions</h2>
        <details className="sw-card sw-card-body" style={{ marginTop: "0.5rem" }}>
          <summary>Are credits a subscription?</summary>
          <p>
            No. You buy the starter pack once ($4.99 → 100 credits) and as long as
            you remain active, we add 20 free credits each month at no extra cost.
            You can stop at any time — no recurring charge.
          </p>
        </details>
        <details className="sw-card sw-card-body" style={{ marginTop: "0.5rem" }}>
          <summary>What does 1 credit get me?</summary>
          <p>
            1 source screen, rendered in every language you've selected. Wizard mode
            with 10 screens × 9 locales = 10 credits and 90 PNGs.
          </p>
        </details>
        <details className="sw-card sw-card-body" style={{ marginTop: "0.5rem" }}>
          <summary>What happens to my screenshots?</summary>
          <p>
            We delete the raw uploads as soon as your export is finalized. The
            generated ZIP stays available for 24 hours, then it's wiped too.
            Project metadata (titles, settings) is kept so you can re-export later.
          </p>
        </details>
      </section>
    </section>
  );
}
