import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
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
        description: tool.description,
        imageId: tool.imageId,
        image: tool.image,
        buyLinks: (tool.buyLinks as Record<string, string>) ?? {},
        ambassadorBadge: tool.ambassadorBadge,
        featured: tool.featured,
        sortOrder: tool.sortOrder,
        initialImage,
      }}
    />
  );
}
