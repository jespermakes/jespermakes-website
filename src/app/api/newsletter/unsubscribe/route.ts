import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { unsubscribeVerifiedEmail } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Two callers POST here:
//  1. A mail app's own unsubscribe button (RFC 8058 one-click). The token is
//     in the URL from the List-Unsubscribe header, the body is
//     "List-Unsubscribe=One-Click", and it wants a plain 200 back.
//  2. The button on /unsubscribe. The token comes as a form field and the
//     person gets sent back to the page to see that it worked.
// A GET never unsubscribes: link scanners and mail previews fetch URLs on
// their own, and they must not take people off the list. GET goes to the page.

export async function GET(request: NextRequest) {
  const t = request.nextUrl.searchParams.get("t") ?? "";
  const page = new URL("/unsubscribe", request.nextUrl.origin);
  if (t) page.searchParams.set("t", t);
  return NextResponse.redirect(page, 303);
}

export async function POST(request: NextRequest) {
  let form: FormData | null = null;
  try {
    form = await request.formData();
  } catch {
    form = null;
  }
  const fromPage = form?.get("from") === "page";
  const token =
    request.nextUrl.searchParams.get("t") ?? (typeof form?.get("t") === "string" ? (form?.get("t") as string) : null);

  const back = (state: "done" | "invalid" | "error") => {
    const page = new URL("/unsubscribe", request.nextUrl.origin);
    page.searchParams.set(state, "1");
    return NextResponse.redirect(page, 303);
  };

  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return fromPage ? back("invalid") : new NextResponse("Invalid unsubscribe link", { status: 400 });
  }

  try {
    await unsubscribeVerifiedEmail(email);
  } catch (e) {
    console.error("Unsubscribe by token failed:", e);
    return fromPage ? back("error") : new NextResponse("Unsubscribe failed, please try again", { status: 500 });
  }

  return fromPage ? back("done") : new NextResponse("Unsubscribed", { status: 200 });
}
