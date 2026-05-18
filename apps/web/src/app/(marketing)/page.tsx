import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <section data-slot="hero" className="sw-section sw-hero" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 data-slot="hero-title" style={{ fontSize: "3rem", fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
          App Store screenshots
          <br />
          in <span data-slot="hero-accent">5 minutes</span>.
        </h1>
        <p data-slot="hero-subtitle" style={{ fontSize: "1.1rem", color: "var(--muted-fg)", margin: "1.25rem auto 2rem", maxWidth: 540 }}>
          AI-assisted marketing screenshots for solo founders. Upload your screens,
          let Gemini Vision write the titles, ship to App Store Connect.
        </p>
        <div data-slot="hero-cta" style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/sign-up" className="sw-btn sw-btn--primary sw-btn--lg">
            Start with 5 free credits
          </Link>
          <Link href="/pricing" className="sw-btn sw-btn--secondary sw-btn--lg">
            See pricing
          </Link>
        </div>
      </section>

      <section data-slot="how-it-works" className="sw-section" style={{ padding: "3rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <article data-slot="how-step" data-step="1" className="sw-card sw-card-body">
            <strong>1. Upload</strong>
            <p style={{ color: "var(--muted-fg)" }}>Drop in your raw app screenshots (PNG/JPG, up to 10).</p>
          </article>
          <article data-slot="how-step" data-step="2" className="sw-card sw-card-body">
            <strong>2. AI titles</strong>
            <p style={{ color: "var(--muted-fg)" }}>Gemini Vision proposes punchy launch-ready titles per screen.</p>
          </article>
          <article data-slot="how-step" data-step="3" className="sw-card sw-card-body">
            <strong>3. Export</strong>
            <p style={{ color: "var(--muted-fg)" }}>9 languages, instant ZIP. 1 credit per source screen.</p>
          </article>
        </div>
      </section>

      <section data-slot="features-grid" className="sw-section" style={{ padding: "3rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Why Shotwise</h2>
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", listStyle: "none", padding: 0 }}>
          <li className="sw-card sw-card-body">No Figma needed — native SVG/Sharp pipeline.</li>
          <li className="sw-card sw-card-body">Multi-locale ready: EN, TR, ES, FR, DE, PT, IT, JA, KO.</li>
          <li className="sw-card sw-card-body">Ephemeral storage — your raw screens are deleted after export.</li>
          <li className="sw-card sw-card-body">Credits, not subscriptions — $4.99 once, use anytime.</li>
        </ul>
      </section>

      <section data-slot="cta" className="sw-section" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.75rem" }}>Ready to ship your launch?</h2>
        <Link href="/sign-up" className="sw-btn sw-btn--primary sw-btn--lg" style={{ marginTop: "1rem" }}>
          Sign up — free trial
        </Link>
      </section>
    </>
  );
}
