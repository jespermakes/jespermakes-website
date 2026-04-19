import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { IMAGE_TAG_VOCABULARY } from "@/data/image-tag-vocabulary";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ vocabulary: IMAGE_TAG_VOCABULARY });
}
