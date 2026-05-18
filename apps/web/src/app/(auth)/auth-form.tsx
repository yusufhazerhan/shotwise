"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@shotwise/auth/client";
import { Button, Input, Label } from "@shotwise/ui-primitives";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const showGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED);

  async function sendMagic(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: next,
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send link");
    }
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: next });
  }

  return (
    <div data-slot="auth-form" className="sw-card sw-card-body">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
        {mode === "sign-in" ? "Sign in to Shotwise" : "Create your Shotwise account"}
      </h1>
      <p style={{ color: "var(--muted-fg)", marginTop: "0.4rem" }}>
        We&apos;ll email you a magic link — no password.
      </p>

      <form onSubmit={sendMagic} style={{ marginTop: "1.25rem" }}>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending" || status === "sent"}
        />
        <Button type="submit" variant="primary" loading={status === "sending"} style={{ width: "100%", marginTop: "0.75rem" }}>
          {status === "sent" ? "Check your email" : "Send magic link"}
        </Button>
      </form>

      {status === "sent" && (
        <p data-slot="auth-success" style={{ color: "var(--muted-fg)", marginTop: "1rem" }}>
          Magic link sent to <strong>{email}</strong>. Open it on this device.
        </p>
      )}
      {error && (
        <p data-slot="auth-error" style={{ color: "#dc2626", marginTop: "1rem" }}>{error}</p>
      )}

      {showGoogle && (
        <Button onClick={signInWithGoogle} variant="secondary" style={{ width: "100%", marginTop: "0.75rem" }}>
          Continue with Google
        </Button>
      )}

      <p style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--muted-fg)" }}>
        {mode === "sign-in" ? (
          <>New here? <Link href="/sign-up">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href="/sign-in">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
