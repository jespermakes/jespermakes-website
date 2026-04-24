import { NextResponse } from "next/server";
import { authorizationServerMetadata } from "@/lib/mcp/metadata";

export async function GET() {
  return NextResponse.json(authorizationServerMetadata(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
