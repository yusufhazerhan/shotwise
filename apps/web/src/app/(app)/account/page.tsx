import { requireUser } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div data-slot="account-page">
      <h1 style={{ margin: 0 }}>Account</h1>
      <p style={{ color: "var(--muted-fg)" }}>Manage your profile.</p>

      <section className="sw-card sw-card-body" style={{ marginTop: "1rem", maxWidth: 480 }}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User id:</strong> <code>{user.id}</code></p>
        <SignOutButton />
      </section>
    </div>
  );
}
