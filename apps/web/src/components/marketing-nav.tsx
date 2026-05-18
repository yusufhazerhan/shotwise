import Link from "next/link";
import { Logo } from "./logo";

export function MarketingNav() {
  return (
    <nav className="shot-nav" data-slot="marketing-nav">
      <div className="container shot-nav-inner">
        <Logo />
        <div className="spacer" />
        <div className="shot-nav-links">
          <Link href="/#how">How it works</Link>
          <Link href="/#modes">Modes</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <Link href="/sign-in" className="btn btn-ghost btn-sm">Sign in</Link>
        <Link href="/sign-up" className="btn btn-primary btn-sm">Start free</Link>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="shot-foot" data-slot="marketing-footer">
      <div className="container">
        <div className="shot-foot-grid">
          <div>
            <Logo />
            <p style={{ marginTop: 14, fontSize: 13.5, maxWidth: 280 }}>
              App Store screenshots in 5 minutes — AI copy, sharp visuals, 9 locales.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <Link href="/editor/new">Editor</Link>
            <Link href="/wizard/new">Wizard</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div>
            <h5>Resources</h5>
            <Link href="#">Docs</Link>
            <Link href="#">App Store sizes</Link>
            <Link href="#">Support</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link href="#">Twitter / X</Link>
            <Link href="#">GitHub</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </div>
        </div>
        <div className="shot-foot-base">
          <div>© {new Date().getFullYear()} Shotwise — made by indie devs, for indie devs.</div>
          <div className="mono">v1.0.0-beta</div>
        </div>
      </div>
    </footer>
  );
}
