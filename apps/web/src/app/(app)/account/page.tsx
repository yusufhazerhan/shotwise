import { requireUser } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div data-slot="account-page" style={{ maxWidth: 540 }}>
      <h1 style={{ margin: "0 0 4px" }}>Account</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>Manage your profile and session.</p>

      <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 28px 24px" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 4 }}>
            Email
          </div>
          <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>{user.email}</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 4 }}>
            User ID
          </div>
          <code style={{ fontSize: 12, color: "var(--ink-mute)", background: "var(--cream-2)", padding: "4px 8px", borderRadius: 6, display: "inline-block" }}>
            {user.id}
          </code>
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
