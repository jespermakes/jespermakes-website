import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HomepageEditor from "@/components/admin/homepage-editor";
import type { PageSection } from "@/lib/homepage/types";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const rows = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.hidden, false)))
    .orderBy(asc(pageSections.position));

  const sections = rows as unknown as PageSection[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/50 uppercase">Admin / Homepage</div>
      <h1 className="mt-2 font-serif text-3xl text-wood">Page sections</h1>
      <p className="mt-2 text-sm text-wood-light/70">Drag to reorder. Click to edit. Changes go live immediately.</p>
      <div className="mt-8">
        <HomepageEditor initialSections={sections} />
      </div>
    </div>
  );
}
