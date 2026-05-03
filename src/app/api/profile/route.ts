import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface UpdateInput {
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  location?: string | null;
}

const MAX_BIO = 500;
const MAX_NAME = 80;
const MAX_LOCATION = 80;
const MAX_URL = 200;

function trimOrNull(v: unknown, max: number): string | null | undefined {
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (t.length === 0) return null;
  return t.slice(0, max);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const update: UpdateInput = {};
  const dn = trimOrNull(obj.displayName, MAX_NAME);
  if (dn !== undefined) update.displayName = dn;
  const bio = trimOrNull(obj.bio, MAX_BIO);
  if (bio !== undefined) update.bio = bio;
  const avatar = trimOrNull(obj.avatarUrl, MAX_URL);
  if (avatar !== undefined) update.avatarUrl = avatar;
  const site = trimOrNull(obj.website, MAX_URL);
  if (site !== undefined) update.website = site;
  const loc = trimOrNull(obj.location, MAX_LOCATION);
  if (loc !== undefined) update.location = loc;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  await db
    .update(users)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
