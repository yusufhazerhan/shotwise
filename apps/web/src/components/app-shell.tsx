import * as React from "react";
import Link from "next/link";
import { CreditBalance } from "./credit-balance";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="app-shell" className="sw-app-shell" style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
      <aside data-slot="app-sidebar" className="sw-app-sidebar" style={{ borderRight: "1px solid var(--border)", padding: "1rem" }}>
        <Link href="/dashboard" data-slot="app-logo" style={{ fontWeight: 700, fontSize: "1.25rem", textDecoration: "none", color: "inherit" }}>
          Shotwise
        </Link>
        <nav data-slot="app-nav" style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/dashboard">Projects</Link>
          <Link href="/wizard/new">+ New (Wizard)</Link>
          <Link href="/editor/new">+ New (Manual)</Link>
          <Link href="/credits">Credits</Link>
          <Link href="/account">Account</Link>
        </nav>
      </aside>
      <main data-slot="app-main" className="sw-app-main">
        <header data-slot="app-topbar" style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
          <CreditBalance />
        </header>
        <div data-slot="app-content" style={{ padding: "1.5rem" }}>{children}</div>
      </main>
    </div>
  );
}
