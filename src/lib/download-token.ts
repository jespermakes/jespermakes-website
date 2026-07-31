// Signed, expiring download links for free (email-gated) plans.
// Token = base64url(sku|email|exp) + "." + HMAC-SHA256 signature.

import crypto from "crypto";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createDownloadToken(
  sku: string,
  email: string,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const payload = `${sku}|${email.toLowerCase().trim()}|${Date.now() + ttlMs}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifyDownloadToken(
  token: string,
  sku: string,
): { ok: true; email: string } | { ok: false } {
  try {
    const [p64, sig] = token.split(".");
    if (!p64 || !sig) return { ok: false };
    const payload = Buffer.from(p64, "base64url").toString();
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };
    const [tokenSku, email, expStr] = payload.split("|");
    if (tokenSku !== sku) return { ok: false };
    if (!expStr || Date.now() > Number(expStr)) return { ok: false };
    return { ok: true, email };
  } catch {
    return { ok: false };
  }
}
