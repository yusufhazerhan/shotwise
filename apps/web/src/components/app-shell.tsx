import * as React from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { CreditBalance } from "./credit-balance";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="app-shell" className="app-shell">
      <nav className="shot-nav" data-slot="app-nav">
        <div className="container shot-nav-inner">
          <Logo href="/dashboard" />
          <div className="shot-nav-links">
            <Link href="/dashboard">Projects</Link>
            <Link href="/wizard/new">+ Wizard</Link>
            <Link href="/editor/new">+ Manual</Link>
            <Link href="/credits">Credits</Link>
          </div>
          <div className="spacer" />
          <CreditBalance />
          <Link href="/credits" className="btn btn-coral btn-sm">Buy</Link>
          <Link
            href="/account"
            className="avatar-link"
            aria-label="Account"
            data-slot="account-avatar"
          >
            A
          </Link>
        </div>
      </nav>
      <main className="container" data-slot="app-content" style={{ paddingTop: 32, paddingBottom: 96 }}>
        {children}
      </main>
    </div>
  );
}
