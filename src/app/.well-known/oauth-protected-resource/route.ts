import { NextResponse } from "next/server";
import { protectedResourceMetadata } from "@/lib/mcp/metadata";

export async function GET() {
  return NextResponse.json(protectedResourceMetadata(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
