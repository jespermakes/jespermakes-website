import crypto from "crypto";
import { describe, it, expect } from "vitest";
import { flattenEvents, handshake, safeEqual, verifyMetaSignature } from "./meta-webhook";

const SECRET = "test-app-secret";
const sign = (body: string, secret = SECRET) =>
  "sha256=" + crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");

describe("verifyMetaSignature", () => {
  const body = JSON.stringify({ object: "page", entry: [] });

  it("accepts Meta's HMAC of the raw body", () => {
    expect(verifyMetaSignature(body, sign(body), SECRET)).toBe(true);
    expect(verifyMetaSignature(body, sign(body).toUpperCase().replace("SHA256", "sha256"), SECRET)).toBe(true);
  });

  it("refuses a wrong secret, a changed body, a missing or malformed header", () => {
    expect(verifyMetaSignature(body, sign(body, "other"), SECRET)).toBe(false);
    expect(verifyMetaSignature(body + " ", sign(body), SECRET)).toBe(false);
    expect(verifyMetaSignature(body, null, SECRET)).toBe(false);
    expect(verifyMetaSignature(body, "sha1=abc", SECRET)).toBe(false);
    expect(verifyMetaSignature(body, "sha256=xyz", SECRET)).toBe(false);
    expect(verifyMetaSignature(body, sign(body), "")).toBe(false);
  });
});

describe("handshake", () => {
  const q = (o: Record<string, string>) => new URLSearchParams(o);

  it("echoes the challenge only for the right token", () => {
    const ok = q({ "hub.mode": "subscribe", "hub.verify_token": "tok", "hub.challenge": "1158201444" });
    expect(handshake(ok, "tok")).toEqual({ status: 200, body: "1158201444" });
    expect(handshake(q({ "hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "1" }), "tok").status).toBe(403);
    expect(handshake(q({ "hub.mode": "unsubscribe", "hub.verify_token": "tok", "hub.challenge": "1" }), "tok").status).toBe(403);
  });

  it("fails closed without a configured token and never echoes markup", () => {
    expect(handshake(q({ "hub.mode": "subscribe", "hub.verify_token": "", "hub.challenge": "1" }), undefined).status).toBe(503);
    const evil = q({ "hub.mode": "subscribe", "hub.verify_token": "tok", "hub.challenge": "<script>" });
    expect(handshake(evil, "tok").status).toBe(400);
  });

  it("safeEqual compares whole strings", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("flattenEvents", () => {
  const messenger = {
    object: "page",
    entry: [
      {
        id: "109103828091826",
        time: 1763640000000,
        messaging: [
          {
            sender: { id: "29124291220560121" },
            recipient: { id: "109103828091826" },
            timestamp: 1763640000123,
            message: { mid: "m_abc", text: "Hello" },
          },
          {
            sender: { id: "109103828091826" },
            recipient: { id: "29124291220560121" },
            timestamp: 1763640001000,
            message: { mid: "m_def", text: "Hi back", is_echo: true },
          },
          { sender: { id: "1" }, recipient: { id: "2" }, timestamp: 1763640002000, read: { watermark: 1 } },
        ],
      },
    ],
  };

  it("makes one row per messaging item with a stable key", () => {
    const rows = flattenEvents(messenger);
    expect(rows.map((r) => [r.kind, r.field, r.mid])).toEqual([
      ["message", "messages", "m_abc"],
      ["echo", "message_echoes", "m_def"],
      ["read", "read", null],
    ]);
    expect(rows[0].dedupeKey).toBe("page:message:m_abc");
    expect(rows[0].senderId).toBe("29124291220560121");
    expect(rows[0].eventTime?.toISOString()).toBe("2025-11-20T12:00:00.123Z");
    expect(flattenEvents(messenger).map((r) => r.dedupeKey)).toEqual(rows.map((r) => r.dedupeKey));
  });

  it("reads Instagram messages and changes", () => {
    const ig = {
      object: "instagram",
      entry: [
        {
          id: "17841400000000000",
          time: 1763640000,
          messaging: [{ sender: { id: "9" }, recipient: { id: "17841400000000000" }, timestamp: 1763640000999, message: { mid: "aWdf", text: "Collab?" } }],
          changes: [{ field: "comments", value: { id: "c1", from: { id: "77" }, text: "nice" } }],
        },
      ],
    };
    const rows = flattenEvents(ig);
    expect(rows.map((r) => [r.object, r.kind, r.field, r.mid, r.senderId])).toEqual([
      ["instagram", "message", "messages", "aWdf", "9"],
      ["instagram", "change", "comments", "c1", "77"],
    ]);
    expect(rows[1].eventTime?.toISOString()).toBe("2025-11-20T12:00:00.000Z");
  });

  it("ignores anything that is not a Meta batch", () => {
    expect(flattenEvents(null)).toEqual([]);
    expect(flattenEvents({ entry: [] })).toEqual([]);
    expect(flattenEvents({ object: "page", entry: "x" })).toEqual([]);
  });
});
