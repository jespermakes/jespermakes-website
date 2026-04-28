"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { slug: "", label: "All" },
  { slug: "furniture", label: "Furniture" },
  { slug: "joinery", label: "Joinery" },
  { slug: "signs", label: "Signs" },
  { slug: "toys", label: "Toys" },
  { slug: "jigs", label: "Jigs" },
  { slug: "decorative", label: "Decorative" },
  { slug: "mechanical", label: "Mechanical" },
  { slug: "laser", label: "Laser" },
  { slug: "cnc", label: "CNC" },
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
    router.push(`/workbench${qs ? `?${qs}` : ""}`);
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const active = currentCategory === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                active
                  ? "bg-wood text-cream"
                  : "border border-wood/[0.12] bg-white text-wood-light hover:border-forest/40"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-wood-light">
          <span>Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-wood/[0.12] bg-white px-2 py-1 text-sm text-wood"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(searchInput);
          }}
          className="flex flex-1 items-center gap-2 sm:max-w-xs"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search designs…"
            className="flex-1 rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          />
        </form>
      </div>
    </div>
  );
}
