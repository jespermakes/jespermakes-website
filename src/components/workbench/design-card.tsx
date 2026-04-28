import Link from "next/link";

export interface WorkbenchDesignSummary {
  id: string;
  name: string;
  description: string;
  authorName: string;
  thumbnail: string | null;
  tags: string[];
  category: string;
  downloadCount: number;
  likeCount: number;
  remixCount: number;
  publishedAt: string | Date;
}

interface DesignCardProps {
  design: WorkbenchDesignSummary;
}

export function DesignCard({ design }: DesignCardProps) {
  const date =
    typeof design.publishedAt === "string"
      ? design.publishedAt
      : design.publishedAt.toISOString();
  return (
    <Link
      href={`/workbench/${design.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-wood/[0.08] bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-cream/60">
        {design.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.thumbnail}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <PlaceholderThumb />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-3">
        <h3
          className="truncate text-sm font-semibold text-wood group-hover:text-forest"
          title={design.name}
        >
          {design.name || "Untitled"}
        </h3>
        <p className="text-[11px] text-wood-light/60">by {design.authorName}</p>
        {design.description ? (
          <p
            className="line-clamp-2 text-[12px] leading-snug text-wood-light"
            title={design.description}
          >
            {design.description}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <CategoryPill category={design.category} />
          {design.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-cream/70 px-2 py-0.5 text-[10px] text-wood-light/70"
            >
              #{t}
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-wood-light/60">
          <span title="Downloads">↓ {design.downloadCount}</span>
          <span title="Likes">♥ {design.likeCount}</span>
          {design.remixCount > 0 ? (
            <span title="Remixes">⤴ {design.remixCount}</span>
          ) : null}
          <span className="ml-auto">{relativeTime(date)}</span>
        </div>
      </div>
    </Link>
  );
}

function CategoryPill({ category }: { category: string }) {
  return (
    <span className="rounded-full bg-forest/[0.08] px-2 py-0.5 text-[10px] font-medium text-forest">
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

function PlaceholderThumb() {
  return (
    <div className="flex h-full w-full items-center justify-center text-wood-light/30">
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

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const min = Math.round(diff / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.round(mo / 12);
  return `${yr}y ago`;
}
