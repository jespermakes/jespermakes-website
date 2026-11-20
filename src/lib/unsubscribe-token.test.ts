import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createUnsubscribeToken,
  listUnsubscribeHeaders,
  oneClickUnsubscribeUrl,
  unsubscribePageUrl,
  verifyUnsubscribeToken,
} from "./unsubscribe-token";
import { welcomeEmailFor } from "./email/welcome";

// A throwaway secret for the tests only; the real one lives in Vercel.
const TEST_SECRET = "test-only-unsubscribe-secret-not-a-real-one";
const TEST_EMAIL = "unsubscribe-test@example.invalid";

describe("unsubscribe tokens", () => {
  const saved = { secret: process.env.UNSUBSCRIBE_SECRET, site: process.env.NEXT_PUBLIC_SITE_URL };
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = TEST_SECRET;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
  afterEach(() => {
    if (saved.secret === undefined) delete process.env.UNSUBSCRIBE_SECRET;
    else process.env.UNSUBSCRIBE_SECRET = saved.secret;
    if (saved.site === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = saved.site;
  });

  it("round-trips and normalises the address", () => {
    const t = createUnsubscribeToken("  Unsubscribe-Test@Example.INVALID ");
    expect(t).toBeTruthy();
    expect(verifyUnsubscribeToken(t)).toBe(TEST_EMAIL);
  });

  it("is URL safe", () => {
    expect(createUnsubscribeToken(TEST_EMAIL)).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("refuses a forged or tampered token", () => {
    const t = createUnsubscribeToken(TEST_EMAIL)!;
    const [, sig] = t.split(".");
    const other = Buffer.from("someone-else@example.invalid").toString("base64url");
    expect(verifyUnsubscribeToken(`${other}.${sig}`)).toBeNull();
    expect(verifyUnsubscribeToken(t.slice(0, -2))).toBeNull();
    expect(verifyUnsubscribeToken(`${t.split(".")[0]}.`)).toBeNull();
    expect(verifyUnsubscribeToken("")).toBeNull();
    expect(verifyUnsubscribeToken(null)).toBeNull();
    expect(verifyUnsubscribeToken("x".repeat(5000))).toBeNull();
  });

  it("refuses a token signed with another secret", () => {
    const t = createUnsubscribeToken(TEST_EMAIL);
    process.env.UNSUBSCRIBE_SECRET = "a-different-secret";
    expect(verifyUnsubscribeToken(t)).toBeNull();
  });

  it("builds the page link and the one-click link", () => {
    const t = createUnsubscribeToken(TEST_EMAIL);
    expect(unsubscribePageUrl(TEST_EMAIL)).toBe(`https://jespermakes.com/unsubscribe?t=${t}`);
    expect(oneClickUnsubscribeUrl(TEST_EMAIL)).toBe(`https://jespermakes.com/api/newsletter/unsubscribe?t=${t}`);
  });

  it("sends RFC 8058 headers with the secret", () => {
    const h = listUnsubscribeHeaders(TEST_EMAIL);
    expect(h["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(h["List-Unsubscribe"]).toMatch(
      /^<https:\/\/jespermakes\.com\/api\/newsletter\/unsubscribe\?t=[^>]+>, <mailto:hello@jespermakes\.com\?subject=unsubscribe>$/,
    );
  });

  it("falls back to mailto, and no one-click claim, without the secret", () => {
    delete process.env.UNSUBSCRIBE_SECRET;
    expect(createUnsubscribeToken(TEST_EMAIL)).toBeNull();
    expect(unsubscribePageUrl(TEST_EMAIL)).toBeNull();
    expect(listUnsubscribeHeaders(TEST_EMAIL)).toEqual({
      "List-Unsubscribe": "<mailto:hello@jespermakes.com?subject=unsubscribe>",
    });
  });

  it("puts the signed link in the welcome email footer", () => {
    const { html, headers } = welcomeEmailFor(TEST_EMAIL, "Test");
    expect(html).not.toContain("RESEND_UNSUBSCRIBE_URL");
    expect(html).toContain(`href="${unsubscribePageUrl(TEST_EMAIL)}"`);
    expect(html).not.toContain("mailto:hello@jespermakes.com?subject=unsubscribe");
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("keeps the old mailto footer when the secret is missing", () => {
    delete process.env.UNSUBSCRIBE_SECRET;
    const { html } = welcomeEmailFor(TEST_EMAIL, null);
    expect(html).toContain('href="mailto:hello@jespermakes.com?subject=unsubscribe"');
  });
});
