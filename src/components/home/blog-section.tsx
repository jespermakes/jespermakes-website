import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function BlogSection() {
  const rows = await db
    .select({ post: blogPosts, image: images })
    .from(blogPosts)
    .leftJoin(images, eq(blogPosts.heroImageId, images.id))
    .where(eq(blogPosts.hidden, false))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(6);

  const posts = rows
    .filter((r) => r.post.status === "published")
    .slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section>
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10">
          From the Workshop
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(({ post, image }) => {
            const heroUrl = image?.url ?? post.heroImage ?? null;
            const heroAlt = post.heroImageAlt ?? image?.description ?? post.title;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                {heroUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow">
                    <Image
                      src={heroUrl}
                      alt={heroAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <h3 className="font-serif text-lg text-wood group-hover:text-forest transition-colors mb-1 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-wood-light/60 text-sm mb-2 line-clamp-2">
                  {post.description}
                </p>
                <p className="text-wood-light/40 text-sm">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="mt-10">
          <Link
            href="/blog"
            className="text-forest hover:text-forest-dark font-medium transition-colors"
          >
            Read all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
