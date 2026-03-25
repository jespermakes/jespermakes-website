import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Jesper Makes",
  description:
    "Woodworking tips, guides, and project ideas from a Danish maker. Honest, practical, no fluff.",
  alternates: {
    canonical: "/blog",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Blog
        </h1>
        <p className="text-wood-light/70 text-lg font-sans">
          Guides, tips, and honest takes on woodworking and making things.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white/60 rounded-2xl border border-wood/5 hover:border-amber/20 transition-all overflow-hidden"
          >
            {post.heroImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.heroImage}
                alt={post.heroImageAlt ?? post.title}
                className="w-full aspect-[16/9] object-cover"
              />
            )}
            {!post.heroImage && (
              <div className="w-full aspect-[16/9] bg-wood/5 flex items-center justify-center">
                <span className="text-4xl opacity-20">🪵</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-serif text-xl text-wood group-hover:text-amber transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-wood-light/70 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-wood-light/50 font-sans">
                <span>{post.author}</span>
                <span>·</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
