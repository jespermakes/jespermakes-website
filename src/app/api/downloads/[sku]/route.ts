import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { purchases, downloads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";
import { PRODUCTS } from "@/lib/products";
import { verifyDownloadToken } from "@/lib/download-token";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;
    const product = PRODUCTS[sku];

    if (!product?.file) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const serveFile = async () => {
      const filePath = path.join(
        process.cwd(),
        "protected-downloads",
        product.file!.filename
      );
      const fileBuffer = await readFile(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": product.file!.contentType,
          "Content-Disposition": `attachment; filename="${product.file!.filename}"`,
          "Cache-Control": "no-store",
        },
      });
    };

    // Signed-token path: free, email-gated plans. No account needed.
    const token = new URL(request.url).searchParams.get("token");
    if (token) {
      if (product.tier !== "free") {
        return NextResponse.json({ error: "Not available" }, { status: 403 });
      }
      const verdict = verifyDownloadToken(token, sku);
      if (!verdict.ok) {
        return NextResponse.json(
          { error: "Link expired. Claim the plan again to get a fresh one." },
          { status: 403 }
        );
      }
      return serveFile();
    }

    // Account path: purchased products (and legacy purchases of now-free plans).
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login?redirect=/account", request.url));
    }

    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, session.user.id),
        eq(purchases.sku, sku)
      ),
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "You haven't purchased this product" },
        { status: 403 }
      );
    }

    await db.insert(downloads).values({
      userId: session.user.id,
      purchaseId: purchase.id,
      productSku: sku,
    });

    return serveFile();
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
