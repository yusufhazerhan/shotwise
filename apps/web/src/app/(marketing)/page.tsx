import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero" data-slot="hero">
        <div className="container hero-grid">
          <div className="fade-up">
            <span className="hero-eyebrow">
              <span className="dot">★</span> Now in public beta — 9 languages on day one
            </span>
            <h1>App&nbsp;Store screenshots, in 5&nbsp;minutes.</h1>
            <p className="sub">
              AI writes the marketing copy. A sharp engine renders the visuals. You ship in 9
              languages — no Figma, no designer, no excuses.
            </p>
            <div className="hero-ctas">
              <Link href="/wizard/new" className="btn btn-primary btn-lg">
                Start free →
              </Link>
              <Link href="#demo" className="btn btn-ghost btn-lg">
                ▶ See 90-second demo
              </Link>
            </div>
            <div className="hero-meta">
              <span>No credit card</span>
              <span>5 free credits</span>
              <span>iOS & Android</span>
            </div>
          </div>

          {/* Demo stage */}
          <div className="demo-stage" id="demo">
            <div className="demo-badge">
              <span>●</span> live render · 1284×2778
            </div>
            <div className="demo-frames">
              <div className="demo-phone">
                <div className="notch" />
                <div className="raw-screen">
                  <div className="bar w70" />
                  <div className="bar w50" />
                  <div className="tile" />
                  <div className="row2"><div /><div /></div>
                  <div className="pill-row"><div /><div /></div>
                  <div className="row2"><div /><div /></div>
                </div>
              </div>
              <div className="demo-arrow">→</div>
              <div className="demo-phone mkt-phone">
                <div className="notch" />
                <div className="raw-screen">
                  <div className="mkt-title">
                    Track your pets <em>without the chaos</em>.
                  </div>
                  <div className="device-card">
                    <div className="bar" style={{ width: "60%" }} />
                    <div className="tile" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <div className="tile" style={{ height: 38 }} />
                      <div className="tile" style={{ height: 38 }} />
                    </div>
                    <div className="bar" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="container trust">
          <div className="trust-text">Trusted by indie founders shipping to the App Store</div>
          <div className="logo-cloud">
            <div className="lc">Petwises</div>
            <div className="lc">Habitloop</div>
            <div className="lc">Tinydeck</div>
            <div className="lc">Northcup</div>
            <div className="lc">Plantsy</div>
            <div className="lc">Mapnote</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="block" id="how" data-slot="how-it-works">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// How it works</span>
            <h2>Three steps from raw capture to shippable asset.</h2>
            <p>
              Drop your simulator screenshots in, answer three questions about your app, and
              download a 9-locale ZIP. The AI handles the words; the renderer handles the pixels.
            </p>
          </div>
          <div className="steps">
            <div className="step" data-slot="how-step" data-step="1">
              <span className="step-num">01 / Upload</span>
              <h3>Drop your raw screenshots</h3>
              <p>
                Drag any number of simulator captures — iPhone, iPad, Android. Reorder them like
                cards. We keep the originals untouched.
              </p>
              <div className="step-mock">
                <div className="drop">⇣ Drop screenshots or click to browse</div>
              </div>
            </div>
            <div className="step" data-slot="how-step" data-step="2">
              <span className="step-num">02 / Describe</span>
              <h3>Tell the AI about your app</h3>
              <p>
                Three short fields — name, what it does, who it&apos;s for. The AI uses them to
                write titles that match your tone and your features.
              </p>
              <div className="step-mock">
                <div className="fields">
                  <div className="fld">App name &nbsp;·&nbsp; <span>Petwises</span></div>
                  <div className="fld">Tagline &nbsp;·&nbsp; <span>Pet care, without the chaos</span></div>
                  <div className="fld">Audience &nbsp;·&nbsp; <span>Pet parents, multi-pet homes</span></div>
                </div>
              </div>
            </div>
            <div className="step" data-slot="how-step" data-step="3">
              <span className="step-num">03 / Generate</span>
              <h3>Pick languages, hit go</h3>
              <p>
                Tick the locales you ship in. We render each screenshot at App Store dimensions,
                package the ZIP, and you&apos;re back to building.
              </p>
              <div className="step-mock">
                <div className="langs">
                  <span className="on">EN</span><span className="on">ES</span><span className="on">FR</span>
                  <span className="on">DE</span><span className="on">IT</span><span className="on">PT</span>
                  <span className="on">JA</span><span className="on">KO</span><span className="on">TR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO MODES ────────────────────────────────────────────────── */}
      <section className="block" id="modes" data-slot="modes" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// Two modes, one tool</span>
            <h2>For founders without time. For designers with taste.</h2>
          </div>
          <div className="modes">
            <div className="mode">
              <span className="eyebrow">Wizard mode</span>
              <h3 style={{ marginTop: 8 }}>AI guides you through 6 steps.</h3>
              <p style={{ marginTop: 10 }}>
                For solo founders who want a polished result in five minutes flat — no design
                vocabulary required.
              </p>
              <div className="feat">
                <div>AI-written titles per screen</div>
                <div>Suggested style presets</div>
                <div>Auto-translates to 9 locales</div>
                <div>One-click ZIP export</div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/wizard/new" className="btn btn-primary btn-sm">Try the wizard →</Link>
              </div>
            </div>
            <div className="mode dark">
              <span className="eyebrow">Manual mode</span>
              <h3 style={{ marginTop: 8 }}>Pixel-level control, designer-grade.</h3>
              <p style={{ marginTop: 10 }}>
                For designers who already have a vision. Tweak typography, gradients, shadows and
                crops per screen.
              </p>
              <div className="feat">
                <div>Per-screen font + weight + size</div>
                <div>Gradients, presets, brand kit</div>
                <div>Shadow, radius, crop controls</div>
                <div>Save and reuse presets</div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/editor/new" className="btn btn-coral btn-sm">Open the editor →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MULTI-LOCALE ─────────────────────────────────────────────── */}
      <section className="block" data-slot="multi-locale">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// Multi-locale built-in</span>
            <h2>One screenshot. Nine&nbsp;languages. Zero copy-paste.</h2>
            <p>
              Each render uses locale-aware line breaking, font fallbacks for CJK, and AI
              translations reviewed for marketing tone — not literal.
            </p>
          </div>
          <div className="locale-grid">
            {LOCALES.map((l) => (
              <div key={l.code} className="locale-card">
                <div className="lc-flag">{l.code}</div>
                <div className="lc-title" dangerouslySetInnerHTML={{ __html: l.title }} />
                <div className="lc-shot" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASE ───────────────────────────────────────────── */}
      <section className="block" data-slot="pricing-tease">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// Pricing</span>
            <h2>Pay once. Get credits. No surprise bills.</h2>
            <p>
              5 credits on signup. $4.99 for a starter pack of 100 credits plus 20 free every
              month going forward. Top up $2.99 → 50 credits whenever you need more.
            </p>
          </div>
          <div className="price-grid">
            <div className="tier" data-slot="plan-card" data-plan="trial">
              <div className="tier-name">Trial</div>
              <div className="price"><span className="amt">$0</span><span className="per">on signup</span></div>
              <ul>
                <li>5 free credits</li>
                <li>All AI features</li>
                <li>9 languages</li>
                <li>No card required</li>
              </ul>
              <Link href="/sign-up" className="btn btn-ghost">Start free</Link>
            </div>
            <div className="tier feat" data-slot="plan-card" data-plan="starter">
              <div className="tier-badge">Most popular</div>
              <div className="tier-name">Starter pack</div>
              <div className="price"><span className="amt">$4.99</span><span className="per">one-time</span></div>
              <ul>
                <li>100 credits</li>
                <li>+20 free credits every month</li>
                <li>No watermark</li>
                <li>Cancel anytime — no recurring charge</li>
              </ul>
              <Link href="/credits" className="btn btn-primary">Get starter pack</Link>
            </div>
            <div className="tier" data-slot="plan-card" data-plan="topup">
              <div className="tier-name">Top up</div>
              <div className="price"><span className="amt">$2.99</span><span className="per">per pack</span></div>
              <ul>
                <li>50 credits, one-time</li>
                <li>Never expires</li>
                <li>Available after first purchase</li>
              </ul>
              <Link href="/credits" className="btn btn-ghost">Top up</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="block" id="faq" data-slot="faq" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// FAQ</span>
            <h2>Common questions.</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>Why not just use Figma?</summary>
              <p>
                You can — and many designers will. Shotwise is for the part of the work Figma
                doesn&apos;t do well: bulk-rendering nine locales at exact App Store dimensions,
                with AI-written copy and font-aware line breaking. Use Figma for the brand. Use
                Shotwise for the export.
              </p>
            </details>
            <details>
              <summary>How does the AI actually work?</summary>
              <p>
                We pass your app description and a low-res preview of each screenshot to Gemini
                Vision, which returns three title candidates per screen. You pick or rewrite.
                Nothing is auto-published.
              </p>
            </details>
            <details>
              <summary>What does 1 credit get me?</summary>
              <p>
                1 source screen, rendered across every language you&apos;ve selected. A wizard
                with 10 screens × 9 locales = 10 credits and 90 PNGs.
              </p>
            </details>
            <details>
              <summary>What happens to my screenshots?</summary>
              <p>
                We delete the raw uploads as soon as your export is finalized. The generated ZIP
                stays available for 24 hours, then it&apos;s wiped too. Project metadata stays so
                you can re-export later.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="block" data-slot="cta" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="cta-strip">
            <div>
              <h2>Ship the next release this weekend.</h2>
              <p>Five free credits. No credit card. Five minutes from drag to ZIP.</p>
            </div>
            <Link href="/sign-up" className="btn btn-coral btn-lg">Start free →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const LOCALES = [
  { code: "EN", title: "Track your pets <em>without the chaos</em>." },
  { code: "ES", title: "Cuida a tus mascotas <em>sin caos</em>." },
  { code: "FR", title: "Vos animaux, <em>sans le chaos</em>." },
  { code: "DE", title: "Haustiere im Blick — <em>ohne Chaos</em>." },
  { code: "IT", title: "I tuoi animali, <em>senza caos</em>." },
  { code: "PT", title: "Pets organizados, <em>sem caos</em>." },
  { code: "JA", title: "ペットの記録、<em>もう混乱しない</em>。" },
  { code: "KO", title: "반려동물 관리, <em>혼란 없이</em>." },
  { code: "TR", title: "Evcil dostların <em>kaossuz</em>." },
];
