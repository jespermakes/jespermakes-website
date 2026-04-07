import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { purchases, downloads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";

const PRODUCT_FILES: Record<string, { filename: string; contentType: string }> = {
  "workshop-wall-charts": {
    filename: "workshop-wall-charts.pdf",
    contentType: "application/pdf",
  },
  "cone-lamp-laser": {
    filename: "cone-lamp-laser.zip",
    contentType: "application/zip",
  },
  "cone-lamp-3dprint": {
    filename: "cone-lamp-3dprint.zip",
    contentType: "application/zip",
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login?redirect=/account", request.url));
    }

    const product = PRODUCT_FILES[sku];
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user purchased this product
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

    // Read file from protected directory
    const filePath = path.join(process.cwd(), "protected-downloads", product.filename);
    const fileBuffer = await readFile(filePath);

    // Log download
    await db.insert(downloads).values({
      userId: session.user.id,
      purchaseId: purchase.id,
      productSku: sku,
    });

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": product.contentType,
        "Content-Disposition": `attachment; filename="${product.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
