import Link from "next/link";

export function MarketingNav() {
  return (
    <header data-slot="marketing-nav" className="sw-marketing-nav" style={{ display: "flex", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
      <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>Shotwise</Link>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/pricing">Pricing</Link>
        <Link href="/sign-in">Sign in</Link>
        <Link href="/sign-up">Get started</Link>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer data-slot="marketing-footer" style={{ padding: "2rem 1.5rem", borderTop: "1px solid var(--border)", color: "var(--muted-fg)", fontSize: "0.85rem" }}>
      © {new Date().getFullYear()} Shotwise — App Store screenshots in 5 minutes.
    </footer>
  );
}
