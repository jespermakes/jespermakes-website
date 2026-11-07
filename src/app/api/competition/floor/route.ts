import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * The Floor Rescue (Rubio Monocoat competition, Aug-Sep 2026) is closed.
 * Closed on 2026-11-08: this endpoint no longer accepts entries. It reads no
 * form data, stores nothing and sends no email. Existing entries stay in the
 * database untouched. The old handler is in git history.
 */
export async function POST() {
  return NextResponse.json(
    { error: "The Floor Rescue has closed. We are not taking any more entries." },
    { status: 410 },
  );
}
