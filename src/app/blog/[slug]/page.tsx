import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { blogPosts, getBlogPostBySlug } from "@/data/blog-posts";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: `${post.title} — Jesper Makes`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      ...(post.heroImage && { images: [{ url: post.heroImage, alt: post.heroImageAlt ?? post.title }] }),
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://jespermakes.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Jesper Makes",
      url: "https://jespermakes.com",
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://jespermakes.com/blog/${post.slug}`,
    },
    ...(post.heroImage && { image: post.heroImage }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-forest hover:text-forest/80 transition-colors mb-10"
        >
          &larr; Back to blog
        </Link>

        {/* Hero image (skip if featured video is present) */}
        {post.heroImage && !post.featuredVideo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.heroImage}
            alt={post.heroImageAlt ?? post.title}
            className="w-full aspect-[16/9] object-cover rounded-2xl mb-10"
          />
        )}

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-wood-light/50 font-sans">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <>
                <span>·</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </>
            )}
          </div>
        </header>

        {/* Featured video */}
        {post.featuredVideo && (
          <div className="mb-10 aspect-video rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${post.featuredVideo}`}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Content */}
        <div className="
          font-sans text-wood-light leading-relaxed
          [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-wood [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-snug
          [&_h3]:font-serif [&_h3]:text-xl [&_h3]:text-wood [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-snug
          [&_h4]:font-sans [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-wood [&_h4]:mt-6 [&_h4]:mb-2
          [&_p]:mb-5 [&_p]:text-base [&_p]:leading-[1.75]
          [&_ul]:mb-5 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1.5
          [&_ol]:mb-5 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5
          [&_li]:text-base [&_li]:leading-[1.75]
          [&_strong]:text-wood [&_strong]:font-semibold
          [&_em]:italic
          [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-forest/80 [&_a]:transition-colors
          [&_hr]:border-wood/10 [&_hr]:my-10
          [&_blockquote]:border-l-4 [&_blockquote]:border-forest/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-wood-light/70 [&_blockquote]:my-6
          [&_code]:bg-wood/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-wood
          [&_pre]:bg-wood/5 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-5
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
        ">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Shop CTA */}
        <div className="mt-16 bg-forest/5 border border-forest/20 rounded-2xl p-8">
          <h2 className="font-serif text-2xl text-wood mb-2">
            Ready to build something?
          </h2>
          <p className="text-wood-light/70 font-sans mb-5">
            Browse plans, printable reference sheets, and digital products for
            woodworkers.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-forest font-medium hover:text-forest/80 transition-colors"
          >
            Browse our woodworking plans and files &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
