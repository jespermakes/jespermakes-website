// Signed unsubscribe links for the newsletter, usable without logging in.
// Token = base64url(email) + "." + HMAC-SHA256("unsub|v1|" + email).
//
// No expiry on purpose: a link in a welcome email from two years ago must
// still work (and the law expects it to). That also means UNSUBSCRIBE_SECRET
// must never be rotated casually: every link already sent dies with the old
// value. It is its own secret, not AUTH_SECRET, so rotating login secrets can
// never break unsubscribes.
//
// Without the secret, every helper here returns null and callers fall back to
// the monitored inbox (mailto:hello@), the way the welcome email worked before.

import crypto from "crypto";

const PREFIX = "unsub|v1|";
export const UNSUBSCRIBE_MAILTO = "mailto:hello@jespermakes.com?subject=unsubscribe";

function secret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || null;
}

function sign(key: string, email: string): string {
  return crypto.createHmac("sha256", key).update(PREFIX + email).digest("base64url");
}

function normalise(email: string): string {
  return email.toLowerCase().trim();
}

export function createUnsubscribeToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  const e = normalise(email);
  if (!e.includes("@")) return null;
  return `${Buffer.from(e).toString("base64url")}.${sign(key, e)}`;
}

/** Returns the email the token was made for, or null if it is not genuine. */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
  const key = secret();
  if (!key || !token || token.length > 1000) return null;
  const [e64, sig] = token.trim().split(".");
  if (!e64 || !sig) return null;
  let email: string;
  try {
    email = Buffer.from(e64, "base64url").toString("utf-8");
  } catch {
    return null;
  }
  if (!email.includes("@") || email !== normalise(email)) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(key, email));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return email;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://jespermakes.com").replace(/\/$/, "");
}

/** The page a person lands on from the footer link: one button, one click. */
export function unsubscribePageUrl(email: string): string | null {
  const t = createUnsubscribeToken(email);
  return t ? `${siteUrl()}/unsubscribe?t=${t}` : null;
}

/** The RFC 8058 endpoint mail apps POST to from their own unsubscribe button. */
export function oneClickUnsubscribeUrl(email: string): string | null {
  const t = createUnsubscribeToken(email);
  return t ? `${siteUrl()}/api/newsletter/unsubscribe?t=${t}` : null;
}

/**
 * List-Unsubscribe headers for a send to this address. With the secret: the
 * one-click https endpoint plus mailto, and List-Unsubscribe-Post (RFC 8058,
 * what Gmail and Yahoo require of bulk senders). Without it: mailto only,
 * since a mailto cannot do one-click.
 */
export function listUnsubscribeHeaders(email: string): Record<string, string> {
  const oneClick = oneClickUnsubscribeUrl(email);
  if (!oneClick) return { "List-Unsubscribe": `<${UNSUBSCRIBE_MAILTO}>` };
  return {
    "List-Unsubscribe": `<${oneClick}>, <${UNSUBSCRIBE_MAILTO}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
