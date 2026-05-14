import Link from "next/link";

export interface MarketplaceDesignSummary {
  id: string;
  name: string;
  description: string;
  authorName: string;
  authorId?: string | null;
  thumbnail: string | null;
  tags: string[];
  category: string;
  downloadCount: number;
  likeCount: number;
  remixCount: number;
  publishedAt: string | Date;
}

interface DesignCardProps {
  design: MarketplaceDesignSummary;
  featured?: boolean;
}

export function DesignCard({ design, featured }: DesignCardProps) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg ${
        featured
          ? "border-amber/20 shadow-md ring-1 ring-amber/10"
          : "border-wood/[0.08] hover:border-wood/[0.15]"
      }`}
    >
      <Link
        href={`/marketplace/${design.id}`}
        className="block aspect-[4/3] overflow-hidden bg-cream/60"
      >
        {design.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.thumbnail}
            alt=""
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <PlaceholderThumb />
        )}
      </Link>

      {/* Quick action overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[75%] items-end justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          href={`/marketplace/${design.id}`}
          className="pointer-events-auto rounded-lg bg-wood/90 px-3 py-1.5 text-[11px] font-medium text-cream shadow-lg backdrop-blur-sm transition-colors hover:bg-wood"
        >
          Open in Studio
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
        <Link
          href={`/marketplace/${design.id}`}
          className="truncate text-sm font-semibold text-wood hover:text-forest"
          title={design.name}
        >
          {design.name || "Untitled"}
        </Link>
        <p className="text-[11px] text-wood-light/60">
          by{" "}
          {design.authorId ? (
            <Link
              href={`/profile/${design.authorId}`}
              className="hover:text-forest"
            >
              {design.authorName}
            </Link>
          ) : (
            design.authorName
          )}
        </p>
        {design.description ? (
          <p
            className="line-clamp-2 text-[12px] leading-snug text-wood-light"
            title={design.description}
          >
            {design.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <CategoryPill category={design.category} />
            {design.tags.slice(0, 1).map((t) => (
              <span
                key={t}
                className="rounded-full bg-cream/70 px-2 py-0.5 text-[10px] text-wood-light/70"
              >
                #{t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-wood-light/50">
            <span title="Downloads">
              <DownloadIcon /> {design.downloadCount}
            </span>
            <span title="Likes">
              <HeartIcon /> {design.likeCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CategoryPill({ category }: { category: string }) {
  return (
    <span className="rounded-full bg-forest/[0.08] px-2 py-0.5 text-[10px] font-medium text-forest">
      {CATEGORY_ICONS[category] ?? ""}{" "}
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  furniture: "\u{1FA91}",
  joinery: "\u{1F9E9}",
  signs: "\u{1FAA7}",
  toys: "\u{1F9F8}",
  jigs: "\u{1F527}",
  decorative: "\u{2728}",
  mechanical: "\u{2699}\uFE0F",
  laser: "\u{1F4A1}",
  cnc: "\u{1F3ED}",
  general: "\u{1F4D0}",
  lamp: "\u{1FA94}",
};

function PlaceholderThumb() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream/80 to-cream/40 text-wood-light/20">
      <svg
        viewBox="0 0 64 48"
        width="40%"
        height="40%"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden
      >
        <rect x="6" y="6" width="32" height="22" rx="2" />
        <circle cx="46" cy="24" r="10" />
        <line x1="14" y1="38" x2="58" y2="38" />
      </svg>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      className="inline -mt-px"
      aria-hidden
    >
      <path
        d="M6 2v6M4 6l2 2 2-2M2 10h8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      className="inline -mt-px"
      aria-hidden
    >
      <path
        d="M6 10S1 7 1 4.5C1 2.5 3 1.5 4.5 2.5L6 4l1.5-1.5C9 1.5 11 2.5 11 4.5 11 7 6 10 6 10z"
        fill="currentColor"
      />
    </svg>
  );
}

