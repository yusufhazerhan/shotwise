import * as React from "react";
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
              <span className="dot">★</span> Open source, manual-first, shipping now
            </span>
            <h1>App&nbsp;Store screenshots you can actually control.</h1>
            <p className="sub">
              Shotwise is a calm screenshot builder for indie teams. Manual editing is unlimited,
              local-first flows work in your browser, and coding agents can use SKILL.md when you
              want a vibe-coding workflow.
            </p>
            <div className="hero-ctas">
              <Link href="/studio" className="btn btn-primary btn-lg">
                Open local Studio →
              </Link>
              <Link href="#local-mode" className="btn btn-ghost btn-lg">
                Explore local mode
              </Link>
            </div>
            <div className="hero-meta">
              <span>No prompts required</span>
              <span>No sign-in local mode</span>
              <span>Open source</span>
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
              Drop your simulator screenshots in, set the story you want to tell, and export a
              store-ready ZIP. Use the SKILL.md workflow if you want vibe-coding automation, or stay fully manual from the
              first screen.
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
              <h3>Shape the story, not just the pixels</h3>
              <p>
                Add the name, what it does, who it&apos;s for, and any design notes. The brief
                maps directly to templates, locales, screen names, and export settings.
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
              <h3>Pick languages, then export only what you need</h3>
              <p>
                Tick the locales and device sizes you ship in. The export matrix keeps every final
                PNG explicit before you export.
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
              <span className="eyebrow">SKILL.md workflow</span>
              <h3 style={{ marginTop: 8 }}>Agents can drive the repo from local files.</h3>
              <p style={{ marginTop: 10 }}>
                For solo founders who want a faster draft. Point your coding agent at SKILL.md,
                your screenshots, and the locales you need.
              </p>
              <div className="feat">
                <div>Template and scene instructions</div>
                <div>Locale copy structure</div>
                <div>Export folder naming rules</div>
                <div>Visual QA checklist</div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/studio" className="btn btn-primary btn-sm">Start from template →</Link>
              </div>
            </div>
            <div className="mode dark">
              <span className="eyebrow">Manual mode</span>
              <h3 style={{ marginTop: 8 }}>Pixel-level control, designer-grade.</h3>
              <p style={{ marginTop: 10 }}>
                For teams who want zero lock-in. Tweak typography, gradients, device frames,
                callouts, crops, locales, and output matrices per screen.
              </p>
              <div className="feat">
                <div>Per-screen font + weight + size</div>
                <div>Gradients, presets, brand kit</div>
                <div>Shadow, radius, crop controls</div>
                <div>Save and reuse presets</div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/studio" className="btn btn-coral btn-sm">Open local Studio →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="local-mode" data-slot="local-mode">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// Local mode</span>
            <h2>Works locally. Works without lock-in.</h2>
            <p>
              The core product is a real screenshot editor, not a thin prompt box. Keep everything
              manual, stay in control, and export local PNG/ZIP files without signing in.
            </p>
          </div>
          <div className="modes">
            <div className="mode">
              <span className="eyebrow">Open source core</span>
              <h3 style={{ marginTop: 8 }}>Build your screenshot system in the open.</h3>
              <p style={{ marginTop: 10 }}>
                Style presets, export matrix logic, scene rendering, and manual editing are being
                shaped as an open product foundation we can keep evolving in public.
              </p>
              <div className="feat">
                <div>Manual editor stays first-class</div>
                <div>Manual project files stay local</div>
                <div>Templates and export presets are reusable</div>
              </div>
            </div>
            <div className="mode">
              <span className="eyebrow">Vibe coding</span>
              <h3 style={{ marginTop: 8 }}>Use your coding agent outside the app.</h3>
              <p style={{ marginTop: 10 }}>
                Preview, tweak, restyle, duplicate, reorder, and localize as much as you want.
                The app stays manual; SKILL.md teaches agents how to prepare the project files.
              </p>
              <div className="feat">
                <div>Unlimited manual editing</div>
                <div>Local PNG and ZIP export</div>
                <div>Agent instructions stay in the repo</div>
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
              Each render uses locale-aware line breaking, font fallbacks for CJK, and a preview
              loop that keeps English anchored while the rest of the set stays editable.
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

      {/* ── OSS TEASE ───────────────────────────────────────────────── */}
      <section className="block" data-slot="pricing-tease">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">// Open source</span>
            <h2>Free local Studio. No account layer in the way.</h2>
            <p>
              Clone the repo, start the web app, open `/studio`, and design store-ready screenshot
              sets directly in the browser.
            </p>
          </div>
          <div className="price-grid">
            <div className="tier" data-slot="plan-card" data-plan="local">
              <div className="tier-name">Local Studio</div>
              <div className="price"><span className="amt">$0</span><span className="per">forever</span></div>
              <ul>
                <li>No login</li>
                <li>No seed account</li>
                <li>No hosted storage</li>
                <li>No generation key</li>
              </ul>
              <Link href="/studio" className="btn btn-ghost">Open Studio</Link>
            </div>
            <div className="tier feat" data-slot="plan-card" data-plan="templates">
              <div className="tier-badge">Included</div>
              <div className="tier-name">Template system</div>
              <div className="price"><span className="amt">20+</span><span className="per">layouts</span></div>
              <ul>
                <li>Two-screen stories</li>
                <li>iPhone, Android, iPad, tablet presets</li>
                <li>Color themes</li>
                <li>Per-device previews</li>
              </ul>
              <Link href="/studio" className="btn btn-primary">Start from template</Link>
            </div>
            <div className="tier" data-slot="plan-card" data-plan="export">
              <div className="tier-name">Export</div>
              <div className="price"><span className="amt">PNG</span><span className="per">and ZIP</span></div>
              <ul>
                <li>Locale folders</li>
                <li>Device folders</li>
                <li>Stable filenames</li>
                <li>Store-ready sizes</li>
              </ul>
              <Link href="/studio" className="btn btn-ghost">Export locally</Link>
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
                with brief-based copy and font-aware line breaking. Use Figma for the brand. Use
                Shotwise for the export.
              </p>
            </details>
            <details>
              <summary>Can I use this with a coding agent?</summary>
              <p>
                Yes. Use the root SKILL.md and tell your agent where your screenshots are, which
                locales you need, and which template direction you want. The app itself remains a
                manual editor.
              </p>
            </details>
            <details>
              <summary>What happens to my screenshots?</summary>
              <p>
                In local Studio they stay in your browser storage. Manual exports are generated
                locally, and you can remove projects whenever you want.
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
              <p>No sign-in. No seed data. Five minutes from drag to ZIP.</p>
            </div>
            <Link href="/studio" className="btn btn-coral btn-lg">Open local Studio →</Link>
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
