const DEFAULT_BLOCKED_DOMAINS = [
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "anonaddy.com",
  "burnermail.io",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "inboxkitten.com",
  "maildrop.cc",
  "mailinator.com",
  "mintemail.com",
  "moakt.com",
  "sharklasers.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
];

export function normalizeLoginEmail(email: string): string {
  const value = email.trim().toLowerCase();
  const [rawLocal, rawDomain] = value.split("@");
  if (!rawLocal || !rawDomain) return value;

  const domain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  let local = rawLocal;

  if (domain === "gmail.com") {
    local = local.split("+")[0]!.replaceAll(".", "");
  } else if (["outlook.com", "hotmail.com", "live.com", "icloud.com", "me.com", "mac.com"].includes(domain)) {
    local = local.split("+")[0]!;
  }

  return `${local}@${domain}`;
}

export function isDisposableEmail(email: string, extraDomains = process.env.BLOCKED_EMAIL_DOMAINS ?? ""): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;

  const blocked = new Set([
    ...DEFAULT_BLOCKED_DOMAINS,
    ...extraDomains.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  ]);

  for (const blockedDomain of blocked) {
    if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) return true;
  }
  return false;
}

export function assertAllowedLoginEmail(email: string): { ok: true; email: string } | { ok: false; message: string } {
  const normalized = normalizeLoginEmail(email);
  if (isDisposableEmail(normalized)) {
    return {
      ok: false,
      message: "Disposable email addresses are not supported. Please use a real inbox so your projects and credits stay tied to you.",
    };
  }
  return { ok: true, email: normalized };
}

export function extractClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded
      .split(",")
      .map((part) => part.trim())
      .find(Boolean);
    if (first) return first;
  }

  const direct =
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("fly-client-ip") ??
    headers.get("x-client-ip");

  return direct?.trim() || null;
}
