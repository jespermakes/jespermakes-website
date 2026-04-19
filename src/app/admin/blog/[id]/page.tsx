import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BlogEditor } from "@/components/admin/blog-editor";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, params.id)).limit(1);
  const post = rows[0];
  if (!post) notFound();

  let initialHeroImage = null;
  if (post.heroImageId) {
    const imgRows = await db.select().from(images).where(eq(images.id, post.heroImageId)).limit(1);
    initialHeroImage = imgRows[0] ?? null;
  }

  return (
    <BlogEditor
      initial={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        tags: (post.tags as string[]) ?? [],
        heroImageId: post.heroImageId,
        heroImage: post.heroImage,
        heroImageAlt: post.heroImageAlt,
        featuredVideo: post.featuredVideo,
        status: post.status as "draft" | "published",
        initialHeroImage,
      }}
    />
  );
}
