import * as React from "react";
import Link from "next/link";
import { Logo } from "./logo";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="app-shell" className="app-shell">
      <nav className="shot-nav" data-slot="app-nav">
        <div className="container shot-nav-inner">
          <Logo href="/dashboard" />
          <div className="shot-nav-links">
            <Link href="/dashboard">Projects</Link>
            <Link href="/studio">Local Studio</Link>
            <Link href="/editor/new">+ Manual</Link>
          </div>
          <div className="spacer" />
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
