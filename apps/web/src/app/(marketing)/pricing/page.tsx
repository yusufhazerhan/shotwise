import Link from "next/link";
import "./pricing.css";

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="pr-hero container" data-slot="pricing-hero">
        <h1>
          Pay once. Get credits. <em>No surprise bills.</em>
        </h1>
        <p>
          5 free credits on signup. $4.99 for a starter pack of 100 credits, plus 20 free credits
          every month going forward. Top up anytime with $2.99 → 50 credits.
        </p>
      </section>

      {/* PLANS */}
      <section className="pr-grid container" data-slot="pricing-plans">
        <div className="plan" data-plan="trial">
          <div className="plan-name">Trial</div>
          <h3>Try Shotwise</h3>
          <div className="price">
            <span className="amt">$0</span>
            <span className="per">on signup</span>
          </div>
          <p className="price-alt">No card required</p>
          <p className="lead">
            Enough credits to render one small launch and see the full pipeline end-to-end.
          </p>
          <ul>
            <li>5 free credits</li>
            <li>All 9 languages</li>
            <li>Full AI wizard</li>
            <li>Manual editor</li>
            <li>Watermark-free output</li>
          </ul>
          <div className="cta">
            <Link href="/sign-up" className="btn btn-ghost">Start free</Link>
            <div className="micro">no card, no expiry</div>
          </div>
        </div>

        <div className="plan feat" data-plan="starter">
          <span className="plan-badge">Most popular</span>
          <div className="plan-name">
            Starter pack <span className="pill pill-coral">★</span>
          </div>
          <h3>Ship your first app</h3>
          <div className="price">
            <span className="amt">$4.99</span>
            <span className="per">one-time</span>
          </div>
          <p className="price-alt">Includes monthly credit refill</p>
          <p className="lead">
            Pay once, become an active member. We add 20 free credits to your account each month
            for as long as you keep using Shotwise.
          </p>
          <ul>
            <li>100 credits immediately</li>
            <li>+20 free credits every month</li>
            <li>No watermark</li>
            <li>Priority email support</li>
            <li>Re-export with no extra credit</li>
          </ul>
          <div className="cta">
            <Link href="/credits" className="btn btn-primary">Get starter pack</Link>
            <div className="micro">processed by Paddle · VAT handled</div>
          </div>
        </div>

        <div className="plan" data-plan="topup">
          <div className="plan-name">Top up</div>
          <h3>Need more credits?</h3>
          <div className="price">
            <span className="amt">$2.99</span>
            <span className="per">per pack</span>
          </div>
          <p className="price-alt">Available after first purchase</p>
          <p className="lead">
            Power users can top up anytime. Credits never expire as long as your account is
            active.
          </p>
          <ul>
            <li>50 credits per pack</li>
            <li>No subscription</li>
            <li>Stack with monthly refill</li>
            <li>Never expires</li>
          </ul>
          <div className="cta">
            <Link href="/credits" className="btn btn-ghost">Top up</Link>
            <div className="micro">buy as many as you need</div>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="compare container" data-slot="pricing-compare">
        <div className="compare-head">
          <span className="eyebrow">// Side by side</span>
          <h2>What 1 credit buys you.</h2>
        </div>
        <div className="ctable">
          <div className="crow head">
            <div>Item</div>
            <div>Credits</div>
            <div>Result</div>
          </div>
          <div className="crow">
            <div>1 source screen</div>
            <div>1 credit</div>
            <div>Rendered in every selected locale (up to 9 languages)</div>
          </div>
          <div className="crow">
            <div>10-screen wizard run</div>
            <div>10 credits</div>
            <div>90 PNGs across 9 locales + ZIP</div>
          </div>
          <div className="crow">
            <div>AI title regeneration</div>
            <div>Free</div>
            <div>Unlimited title proposals before you commit to an export</div>
          </div>
          <div className="crow">
            <div>Pixel-perfect preview</div>
            <div>Free</div>
            <div>Server-side render to verify before spending credits</div>
          </div>
          <div className="crow">
            <div>Failed export</div>
            <div>Refunded</div>
            <div>If the job fails, credits go right back to your ledger</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pr-faq container" data-slot="pricing-faq">
        <h2>Pricing questions</h2>
        <div className="pr-faq-grid">
          <details open>
            <summary>Is this a subscription?</summary>
            <p>
              No. You pay $4.99 once for the starter pack. As long as your account stays active,
              we add 20 free credits to it every month at no extra cost. You can stop using
              Shotwise at any time — no recurring charge.
            </p>
          </details>
          <details>
            <summary>What does &quot;active&quot; mean?</summary>
            <p>
              You bought the starter pack and you log in at least once in a 6-month window. We
              don&apos;t expire credits or kick anyone out — we just need an indication that
              someone is still using the account before granting monthly refills.
            </p>
          </details>
          <details>
            <summary>What payment methods?</summary>
            <p>
              Card, Apple Pay, Google Pay, and SEPA — billed through Paddle, who handles VAT for
              EU customers and sales tax in the US.
            </p>
          </details>
          <details>
            <summary>Refunds?</summary>
            <p>
              Yes — within 14 days of purchase, no questions asked. Email yusuf@shotwise.app from
              the address you signed up with.
            </p>
          </details>
          <details>
            <summary>What if a render fails?</summary>
            <p>
              If our export pipeline fails mid-run, the debited credits are refunded
              automatically to your ledger so you can try again without losing anything.
            </p>
          </details>
          <details>
            <summary>Team plan?</summary>
            <p>
              Not yet. Right now Shotwise is built for solo founders and indie devs. If you need
              multi-seat workspaces, email us — we&apos;re prioritizing what people actually ask
              for.
            </p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: "0 28px 80px" }}>
        <div
          style={{
            background: "var(--ink)",
            color: "var(--cream)",
            borderRadius: 24,
            padding: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div>
            <h2 style={{ color: "var(--cream)", fontSize: 36 }}>Trial is free forever.</h2>
            <p style={{ color: "rgba(245,239,230,0.7)", marginTop: 10 }}>
              Five credits on signup. One small launch. Zero commitment.
            </p>
          </div>
          <Link href="/sign-up" className="btn btn-coral btn-lg">
            Start free →
          </Link>
        </div>
      </section>
    </>
  );
}
