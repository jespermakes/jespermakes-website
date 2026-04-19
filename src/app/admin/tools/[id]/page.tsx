import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
import type { BuyLink, ColorSwatch, Spec } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ToolEditor } from "@/components/admin/tool-editor";

export default async function EditToolPage({ params }: { params: { id: string } }) {
  const rows = await db.select().from(toolItems).where(eq(toolItems.id, params.id)).limit(1);
  const tool = rows[0];
  if (!tool) notFound();

  let initialImage = null;
  if (tool.imageId) {
    const imgRows = await db.select().from(images).where(eq(images.id, tool.imageId)).limit(1);
    initialImage = imgRows[0] ?? null;
  }

  return (
    <ToolEditor
      initial={{
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        categorySlug: tool.categorySlug,
        categoryIcon: tool.categoryIcon,
        description: tool.description,
        longDescription: tool.longDescription,
        imageId: tool.imageId,
        image: tool.image,
        buyLinks: normalizeBuyLinks(tool.buyLinks),
        ambassadorBadge: tool.ambassadorBadge,
        featured: tool.featured,
        sortOrder: tool.sortOrder,
        youtubeVideos: normalizeStringArray(tool.youtubeVideos),
        colorGrid: normalizeColorGrid(tool.colorGrid),
        productList: normalizeStringArray(tool.productList),
        gallery: normalizeStringArray(tool.gallery),
        useCases: normalizeStringArray(tool.useCases),
        specs: normalizeSpecs(tool.specs),
        jesperNote: tool.jesperNote,
        learnMoreUrl: tool.learnMoreUrl,
        initialImage,
      }}
    />
  );
}

// Defensive normalizers — the JSONB column might be stored in unexpected
// shapes from legacy data, especially buy_links which may still be an object
// on any row that escapes the conversion script. These coerce to the right
// shape so the editor never crashes loading a tool.

function normalizeBuyLinks(raw: unknown): BuyLink[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is BuyLink =>
      x && typeof x === "object" && typeof (x as BuyLink).label === "string" && typeof (x as BuyLink).url === "string"
    );
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([k, v]) => typeof v === "string" && v.length > 0 && k.length > 0)
      .map(([label, url]) => ({ label, url: url as string }));
  }
  return [];
}

function normalizeStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  return [];
}

function normalizeColorGrid(raw: unknown): ColorSwatch[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is ColorSwatch =>
    x && typeof x === "object" && typeof (x as ColorSwatch).name === "string" && typeof (x as ColorSwatch).hex === "string"
  );
}

function normalizeSpecs(raw: unknown): Spec[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is Spec =>
    x && typeof x === "object" && typeof (x as Spec).label === "string" && typeof (x as Spec).value === "string"
  );
}
