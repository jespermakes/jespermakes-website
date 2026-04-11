import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";

export function BlogSection() {
  const posts = getAllBlogPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section>
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10">
          From the Workshop
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              {post.heroImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow">
                  <Image
                    src={post.heroImage}
                    alt={post.heroImageAlt ?? post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <h3 className="font-serif text-lg text-wood group-hover:text-amber transition-colors mb-1 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-wood-light/60 text-sm mb-2 line-clamp-2">
                {post.description}
              </p>
              <p className="text-wood-light/40 text-sm">
                {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/blog"
            className="text-amber hover:text-amber-dark font-medium transition-colors"
          >
            Read all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
