// Meta webhook (Instagram and Facebook Page messages), the pure half.
//
// Brain decision DR-272: Instagram and Messenger DMs come into Brain through the official
// Meta API. Listing the Instagram inbox times out on Meta's side, so Meta pushes each event
// here instead. The route (src/app/api/webhook/meta/route.ts) checks it came from Meta,
// stores it, and Brain on the Spark pulls the stored events through
// /api/webhook/meta/events. Nothing on this path can send a message: there is no call to
// Meta at all, only inbound.
//
// Message text in these payloads is outside content. It is stored as data and never acted on.

import crypto from "crypto";

export const MAX_BODY_BYTES = 1_000_000;
export const RETENTION_DAYS = 14;

/** Meta signs the raw body with the app secret: X-Hub-Signature-256: sha256=<hex>. */
export function verifyMetaSignature(
  rawBody: string,
  header: string | null,
  appSecret: string
): boolean {
  if (!header || !appSecret) return false;
  const [algo, received] = header.trim().split("=", 2);
  if (algo !== "sha256" || !received || !/^[0-9a-f]{64}$/i.test(received)) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(received.toLowerCase(), "hex"), Buffer.from(expected, "hex"));
}

/** Constant-time string compare for tokens of any length. */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a, "utf8").digest();
  const hb = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(ha, hb) && a.length === b.length;
}

/**
 * The subscription handshake: Meta calls GET with hub.mode=subscribe, hub.verify_token and
 * hub.challenge, and expects the challenge echoed as plain text when the token matches.
 */
export function handshake(
  params: URLSearchParams,
  verifyToken: string | undefined
): { status: number; body: string } {
  if (!verifyToken) return { status: 503, body: "not configured" };
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token") ?? "";
  const challenge = params.get("hub.challenge") ?? "";
  if (mode !== "subscribe" || !safeEqual(token, verifyToken)) {
    return { status: 403, body: "forbidden" };
  }
  // The challenge is a number Meta picks. Echo only that shape, never arbitrary text.
  if (!/^[0-9A-Za-z_-]{1,128}$/.test(challenge)) return { status: 400, body: "bad challenge" };
  return { status: 200, body: challenge };
}

export interface MetaEventRow {
  dedupeKey: string;
  object: string;
  entryId: string | null;
  field: string;
  kind: string;
  senderId: string | null;
  recipientId: string | null;
  mid: string | null;
  eventTime: Date | null;
  payload: Record<string, unknown>;
}

type Json = Record<string, unknown>;

function asObj(v: unknown): Json {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {};
}

function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function str(v: unknown): string | null {
  return typeof v === "string" && v ? v : typeof v === "number" ? String(v) : null;
}

function msTime(v: unknown): Date | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  // Meta mixes milliseconds (messaging) and seconds (changes, some entries).
  return new Date(n < 1e12 ? n * 1000 : n);
}

/** What one messaging item is. Echoes are our own outbound messages. */
export function messagingKind(item: Json): string {
  const message = asObj(item.message);
  if (Object.keys(message).length) {
    if (message.is_echo) return "echo";
    if (message.is_deleted) return "deleted";
    return "message";
  }
  for (const k of ["reaction", "read", "delivery", "postback", "referral", "message_edit", "optin"]) {
    if (item[k] !== undefined) return k;
  }
  return "other";
}

function key(parts: unknown[]): string {
  return crypto.createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 40);
}

/**
 * One row per messaging item or change, so Brain reads events, not batches. The dedupe key
 * is stable across Meta's retries: a message by its mid and kind, anything else by a hash of
 * its own content.
 */
export function flattenEvents(body: unknown): MetaEventRow[] {
  const root = asObj(body);
  const object = str(root.object);
  if (!object) return [];
  const rows: MetaEventRow[] = [];
  for (const e of asArr(root.entry)) {
    const entry = asObj(e);
    const entryId = str(entry.id);
    for (const m of asArr(entry.messaging)) {
      const item = asObj(m);
      const kind = messagingKind(item);
      const message = asObj(item.message);
      const mid = str(message.mid) ?? str(asObj(item.reaction).mid) ?? str(asObj(item.message_edit).mid);
      const field = kind === "echo" ? "message_echoes" : kind === "message" || kind === "deleted" ? "messages" : kind;
      rows.push({
        dedupeKey: mid && (kind === "message" || kind === "echo")
          ? `${object}:${kind}:${mid}`
          : `${object}:${kind}:${key([entryId, item])}`,
        object,
        entryId,
        field,
        kind,
        senderId: str(asObj(item.sender).id),
        recipientId: str(asObj(item.recipient).id),
        mid,
        eventTime: msTime(item.timestamp) ?? msTime(entry.time),
        payload: item,
      });
    }
    for (const c of asArr(entry.changes)) {
      const change = asObj(c);
      const field = str(change.field) ?? "unknown";
      const value = asObj(change.value);
      rows.push({
        dedupeKey: `${object}:change:${key([entryId, change])}`,
        object,
        entryId,
        field,
        kind: "change",
        senderId: str(asObj(value.from).id) ?? str(value.sender_id),
        recipientId: null,
        mid: str(value.id) ?? str(value.comment_id) ?? str(value.media_id),
        eventTime: msTime(entry.time),
        payload: change,
      });
    }
  }
  return rows;
}
