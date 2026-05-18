import { Resend } from "resend";

let _resend: Resend | undefined;

function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("[@shotwise/auth] RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

export async function sendMagicLink(opts: { to: string; url: string }) {
  const from = process.env.RESEND_FROM_EMAIL ?? "Shotwise <noreply@shotwise.app>";

  // In dev with no Resend key, fall back to console logging
  if (!process.env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.log(`\n[dev] Magic link for ${opts.to}: ${opts.url}\n`);
    return;
  }

  await getResend().emails.send({
    from,
    to: opts.to,
    subject: "Your Shotwise sign-in link",
    text: `Click to sign in: ${opts.url}\n\nThis link expires in 10 minutes.`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 24px auto; color: #2b2b2b;">
        <h2 style="margin: 0 0 12px;">Sign in to Shotwise</h2>
        <p>Click the button below to sign in. This link expires in 10 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${opts.url}" style="background:#2b2b2b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            Sign in
          </a>
        </p>
        <p style="color:#888;font-size:13px;">If you didn't request this, you can ignore the email.</p>
      </div>
    `,
  });
}
