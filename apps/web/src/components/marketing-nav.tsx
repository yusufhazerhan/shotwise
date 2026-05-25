import * as React from "react";
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
          <Link href="/studio">Local Studio</Link>
          <Link href="/#modes">Modes</Link>
          <Link href="/pricing">Free OSS</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <Link href="/studio" className="btn btn-primary btn-sm">Open Studio</Link>
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
              Open-source, manual-first store screenshot builder.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <Link href="/studio">Local Studio</Link>
            <Link href="/studio">SKILL.md workflow</Link>
            <Link href="/pricing">Free open-source</Link>
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
