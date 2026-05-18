"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@shotwise/auth/client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
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
      await authClient.signIn.magicLink({ email, callbackURL: next });
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
    <div data-slot="auth-form">
      <div className="form-tabs">
        <Link href="/sign-in" className={mode === "sign-in" ? "on" : ""}>
          Sign in
        </Link>
        <Link href="/sign-up" className={mode === "sign-up" ? "on" : ""}>
          Create account
        </Link>
      </div>

      {status === "sent" ? (
        <div className="sent" data-slot="auth-success">
          <div className="tick">✓</div>
          <h3>Magic link sent</h3>
          <p>
            Check <strong>{email || "your inbox"}</strong>. Open the link on this device to
            continue. It expires in 10 minutes.
          </p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 18 }}
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <h2>{mode === "sign-in" ? "Welcome back." : "Start with 5 free credits."}</h2>
          <p className="sub">
            {mode === "sign-in"
              ? "Sign in with a magic link or your developer account."
              : "We'll email you a magic link — no password, no nonsense."}
          </p>

          <form className="form-body" onSubmit={sendMagic}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                required
                placeholder="you@studio.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "sending"}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send magic link →"}
            </button>
          </form>

          {error && (
            <p data-slot="auth-error" style={{ color: "#B91C1C", marginTop: 12, fontSize: 13 }}>
              {error}
            </p>
          )}

          {showGoogle && (
            <>
              <div className="divider">or continue with</div>
              <div className="social">
                <button onClick={signInWithGoogle} className="btn btn-ghost">
                  Continue with Google
                </button>
              </div>
            </>
          )}

          <p className="terms">
            By {mode === "sign-in" ? "signing in" : "signing up"} you agree to our{" "}
            <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link>.
          </p>
        </>
      )}
    </div>
  );
}
