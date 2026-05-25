import * as React from "react";
import Link from "next/link";
import "./pricing.css";

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="pr-hero container" data-slot="pricing-hero">
        <h1>
          Free open-source screenshot studio. <em>No pricing wall.</em>
        </h1>
        <p>
          Shotwise is built around the local Studio path: no login, no billing, no cloud storage,
          no generation key. Clone it, run it, and export App Store / Google Play screenshots from
          your browser.
        </p>
      </section>

      {/* INCLUDED */}
      <section className="pr-grid container" data-slot="pricing-plans">
        <div className="plan" data-plan="local">
          <div className="plan-name">Local Studio</div>
          <h3>Design without accounts</h3>
          <div className="price">
            <span className="amt">$0</span>
            <span className="per">forever</span>
          </div>
          <p className="price-alt">No card, no sign-in</p>
          <p className="lead">
            Projects, screenshot blobs, template choices, device settings, and scene JSON live in
            IndexedDB on your machine.
          </p>
          <ul>
            <li>No-login Studio at `/studio`</li>
            <li>Template gallery</li>
            <li>Unlimited local editing</li>
            <li>Watermark-free output</li>
            <li>SKILL.md agent workflow</li>
          </ul>
          <div className="cta">
            <Link href="/studio" className="btn btn-ghost">Open Studio</Link>
            <div className="micro">works after pnpm install</div>
          </div>
        </div>

        <div className="plan feat" data-plan="templates">
          <span className="plan-badge">Included</span>
          <div className="plan-name">
            Templates <span className="pill pill-coral">★</span>
          </div>
          <h3>Start from a real layout</h3>
          <div className="price">
            <span className="amt">20+</span>
            <span className="per">templates</span>
          </div>
          <p className="price-alt">Color themes and device previews</p>
          <p className="lead">
            Choose from App Store, Play Store, before/after, feature zoom, social proof, paywall,
            onboarding, dark premium, minimal utility, and two-screen story templates.
          </p>
          <ul>
            <li>Two screenshot canvas</li>
            <li>Per-device preview tabs</li>
            <li>iPhone, Android, iPad, tablet presets</li>
            <li>Theme picker</li>
            <li>Per-slot positioning</li>
          </ul>
          <div className="cta">
            <Link href="/studio" className="btn btn-primary">Start from template</Link>
            <div className="micro">manual-first, no AI dependency</div>
          </div>
        </div>

        <div className="plan" data-plan="export">
          <div className="plan-name">Export</div>
          <h3>Generate upload-ready files</h3>
          <div className="price">
            <span className="amt">ZIP</span>
            <span className="per">local</span>
          </div>
          <p className="price-alt">PNG and ZIP outputs</p>
          <p className="lead">
            Export selected devices and locales into stable folders with filenames that match the
            screen names you set in Studio.
          </p>
          <ul>
            <li>Locale folders</li>
            <li>Device folders</li>
            <li>Custom screen names</li>
            <li>App Store sizes</li>
            <li>Google Play sizes</li>
          </ul>
          <div className="cta">
            <Link href="/studio" className="btn btn-ghost">Build export set</Link>
            <div className="micro">browser-side workflow</div>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="compare container" data-slot="pricing-compare">
        <div className="compare-head">
          <span className="eyebrow">// Side by side</span>
          <h2>What is included.</h2>
        </div>
        <div className="ctable">
          <div className="crow head">
            <div>Area</div>
            <div>Mode</div>
            <div>Result</div>
          </div>
          <div className="crow">
            <div>Manual editing</div>
            <div>Free</div>
            <div>Unlimited canvas edits, layout tweaks, previews, and screen setup</div>
          </div>
          <div className="crow">
            <div>Single PNG</div>
            <div>Local</div>
            <div>One screen in one selected language</div>
          </div>
          <div className="crow">
            <div>10-screen multi-locale export</div>
            <div>Local ZIP</div>
            <div>PNG files grouped by locale, device, and screen name</div>
          </div>
          <div className="crow">
            <div>Device preview</div>
            <div>Local</div>
            <div>Tabs for each selected phone or tablet preset</div>
          </div>
          <div className="crow">
            <div>Agent workflow</div>
            <div>SKILL.md</div>
            <div>Tell a coding agent where screenshots live and which locales to prepare</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pr-faq container" data-slot="pricing-faq">
        <h2>Open-source questions</h2>
        <div className="pr-faq-grid">
          <details open>
            <summary>Do I need an account?</summary>
            <p>
              No. The default workflow is `/studio`, and it runs locally in your browser.
            </p>
          </details>
          <details>
            <summary>Does it generate copy automatically?</summary>
            <p>
              No. Shotwise is a manual editor. Agents can use `SKILL.md` to prepare scene JSON,
              copy, filenames, and locales from your local files.
            </p>
          </details>
          <details>
            <summary>Where are screenshots stored?</summary>
            <p>
              Local Studio stores them in browser storage. You can export scene JSON and ZIP files
              whenever you want.
            </p>
          </details>
          <details>
            <summary>Can I publish commercial app screenshots with it?</summary>
            <p>
              Yes. The project is MIT licensed, and local exports are watermark-free.
            </p>
          </details>
          <details>
            <summary>Can I add my own templates?</summary>
            <p>
              Yes. Add definitions to the template registry, include preview metadata, and verify
              with the template validation tests.
            </p>
          </details>
          <details>
            <summary>Does it support iPad and Android?</summary>
            <p>
              Yes. The local Studio includes iPhone, iPad, Android phone, foldable, and tablet
              presets with per-device preview tabs.
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
            <h2 style={{ color: "var(--cream)", fontSize: 36 }}>Local Studio is free forever.</h2>
            <p style={{ color: "rgba(245,239,230,0.7)", marginTop: 10 }}>
              Start from templates, design locally, and export PNG/ZIP without an account.
            </p>
          </div>
          <Link href="/studio" className="btn btn-coral btn-lg">
            Open Studio →
          </Link>
        </div>
      </section>
    </>
  );
}
