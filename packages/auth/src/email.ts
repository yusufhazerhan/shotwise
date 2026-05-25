export async function sendVerificationEmail(opts: { to: string; url: string; name?: string }) {
  // Local-first OSS default: do not require an email provider just to run the app.
  // Hosted deployments can replace this package implementation with their provider.
  void opts.name;
  // eslint-disable-next-line no-console
  console.log(`\n[shotwise] Verification email for ${opts.to}: ${opts.url}\n`);
}
