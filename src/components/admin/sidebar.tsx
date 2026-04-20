"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/videos/longform", label: "Long-form" },
  { href: "/admin/videos/shorts", label: "Shorts" },
];

const DEEP_DIVES = [
  { href: "/admin/title-lab", label: "Title Lab stats" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside className="w-60 shrink-0 border-r border-wood/[0.08] min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-4 px-3">
        Admin
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "px-3 py-2 rounded-lg bg-wood/[0.08] text-wood font-semibold text-sm"
                  : "px-3 py-2 rounded-lg text-wood-light/70 hover:text-wood hover:bg-wood/[0.04] text-sm"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 px-3">
        <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-2">
          Deep dives
        </div>
        {DEEP_DIVES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-lg text-wood-light/70 hover:text-wood hover:bg-wood/[0.04] text-sm"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
