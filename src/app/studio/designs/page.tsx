import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studioDesigns } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { CollectionsPanel } from "@/components/studio/collections-panel";
import { DesignsGrid, type DesignSummary } from "./designs-grid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Designs — Jesper Makes Studio",
};

export default async function MyDesignsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/studio/designs");
  }
  const rows = await db
    .select({
      id: studioDesigns.id,
      name: studioDesigns.name,
      thumbnail: studioDesigns.thumbnail,
      updatedAt: studioDesigns.updatedAt,
      createdAt: studioDesigns.createdAt,
    })
    .from(studioDesigns)
    .where(eq(studioDesigns.userId, session.user.id))
    .orderBy(desc(studioDesigns.updatedAt));

  const designs: DesignSummary[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    thumbnail: r.thumbnail,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <DesignsGrid initialDesigns={designs} />
      <CollectionsPanel />
    </main>
  );
}
