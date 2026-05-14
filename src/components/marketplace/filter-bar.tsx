"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { slug: "", label: "All", icon: "" },
  { slug: "furniture", label: "Furniture", icon: "\u{1FA91}" },
  { slug: "joinery", label: "Joinery", icon: "\u{1F9E9}" },
  { slug: "signs", label: "Signs", icon: "\u{1FAA7}" },
  { slug: "toys", label: "Toys", icon: "\u{1F9F8}" },
  { slug: "jigs", label: "Jigs", icon: "\u{1F527}" },
  { slug: "decorative", label: "Decorative", icon: "\u{2728}" },
  { slug: "mechanical", label: "Mechanical", icon: "\u{2699}\uFE0F" },
  { slug: "laser", label: "Laser", icon: "\u{1F4A1}" },
  { slug: "cnc", label: "CNC", icon: "\u{1F3ED}" },
  { slug: "lamp", label: "Lamp", icon: "\u{1FA94}" },
];

const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "most-liked", label: "Most liked" },
];

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const currentCategory = params.get("category") ?? "";
  const currentSort = params.get("sort") ?? "recent";
  const currentSearch = params.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const navigate = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(`/marketplace${qs ? `?${qs}` : ""}`);
  };

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    next.delete("page");
    navigate(next);
  };

  const setSort = (value: string) => {
    const next = new URLSearchParams(params);
    next.set("sort", value);
    next.delete("page");
    navigate(next);
  };

  const submitSearch = (term: string) => {
    const next = new URLSearchParams(params);
    if (term.trim()) next.set("search", term.trim());
    else next.delete("search");
    next.delete("page");
    navigate(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const active = currentCategory === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                active
                  ? "bg-wood text-cream shadow-sm"
                  : "border border-wood/[0.10] bg-white text-wood-light hover:border-forest/30 hover:text-wood"
              }`}
            >
              {c.icon ? (
                <span className="text-[11px]" aria-hidden>
                  {c.icon}
                </span>
              ) : null}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Sort + Search row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-wood/[0.10] bg-white p-0.5">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSort(s.value)}
              className={`rounded-md px-3 py-1 text-[12px] transition-colors ${
                currentSort === s.value
                  ? "bg-cream font-medium text-wood"
                  : "text-wood-light hover:text-wood"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(searchInput);
          }}
          className="relative flex flex-1 sm:max-w-xs"
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-wood-light/40"
            aria-hidden
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search designs..."
            className="w-full rounded-lg border border-wood/[0.10] bg-white py-1.5 pl-8 pr-3 text-sm text-wood placeholder:text-wood-light/40 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          />
        </form>
      </div>
    </div>
  );
}
