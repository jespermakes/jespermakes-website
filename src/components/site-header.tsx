"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { NotificationsBell } from "@/components/notifications-bell";

// The header, designed as one moving system (see DR-161 follow-up):
// - fixed, never leaves the screen
// - full size at the top of the page, compact once you scroll
// - hovering it (or returning to the top) grows it back
// - oversized round logo overhangs the bar and floats over the page
// - color-adaptive: over the dark homepage it is light-on-transparent,
//   over light pages it is dark-on-cream; scrolled it gains a translucent
//   blurred backdrop in the matching tone.

const GEAR_CATEGORIES = [
  { title: "Festool", slug: "festool", icon: "⚡" },
  { title: "Power Tools", slug: "power-tools", icon: "🔨" },
  { title: "Hand Tools", slug: "hand-tools", icon: "✋" },
  { title: "Finishing", slug: "finishing", icon: "🎨" },
  { title: "Plywood", slug: "plywood", icon: "🪵" },
  { title: "3D Printing & Laser", slug: "3d-printing-laser", icon: "🖨️" },
  { title: "Workshop Essentials", slug: "workshop-essentials", icon: "🔧" },
  { title: "Office & YouTube Gear", slug: "office-youtube-gear", icon: "📷" },
  { title: "Gardening & Outdoors", slug: "gardening-outdoors", icon: "🌿" },
];

const APP_LINKS = [
  { title: "2D Design Studio", href: "/studio", icon: "📐" },
  { title: "Workbench", href: "/marketplace", icon: "🏪" },
  // Lamp Designer hidden from nav until it is finished (page still reachable at /lamp-designer)
  { title: "Box Joint Jig", href: "/box-joint-jig", icon: "🧰" },
  { title: "Cone Lamp", href: "/cone-lamp", icon: "◐" },
  { title: "Rubio Finish Guide", href: "/rubio", icon: "🎨" },
  { title: "Title Lab", href: "/title-lab", icon: "🧪" },
  { title: "Storyteller Engine", href: "/storyteller", icon: "🎬" },
];

export function SiteHeader({
  hasSession,
  userName,
}: {
  hasSession: boolean;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const overlay = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const expanded = !scrolled || hovered;

  // Color context: the homepage is a dark world; everything else is light.
  const dark = overlay;

  const headerBg = scrolled
    ? dark
      ? "bg-[#20100A]/90 backdrop-blur-md border-b border-cream/10"
      : "bg-cream/90 backdrop-blur-md border-b border-wood/10 shadow-sm shadow-wood/5"
    : dark
      ? "bg-gradient-to-b from-black/40 via-black/10 to-transparent"
      : "bg-cream";

  const linkCls = dark
    ? "text-cream/80 hover:text-amber transition-colors"
    : "text-wood-light hover:text-amber-dark transition-colors";

  const panelCls = dark
    ? "bg-[#2A1712] border border-cream/10"
    : "bg-cream border border-wood/10";

  const panelItemCls = dark
    ? "text-cream/70 hover:text-amber hover:bg-cream/5"
    : "text-wood-light hover:text-amber-dark hover:bg-wood/5";

  const dividerCls = dark ? "bg-cream/10" : "bg-wood/10";

  const dropdown = (items: React.ReactNode) => (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
      <div className={`${panelCls} rounded-xl shadow-lg py-2 w-52`}>{items}</div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${headerBg}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <nav
          className={`max-w-6xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
            expanded ? "py-4" : "py-2"
          }`}
        >
          <Link href="/" className="flex items-center shrink-0" aria-label="Jesper Makes home">
            <Image
              src="/logo.png"
              alt="Jesper Makes Workshop"
              width={80}
              height={80}
              priority
              className={`rounded-full shadow-lg shadow-black/20 transition-all duration-300 ${
                expanded ? "h-[76px] w-[76px] -mb-8" : "h-11 w-11 mb-0"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-7 text-sm font-sans">
            <Link href="/work" className={linkCls}>Work</Link>
            <Link href="/shop" className={linkCls}>Plans</Link>
            <Link href="/barn" className={linkCls}>Barn</Link>
            <div className="relative group">
              <Link href="/tools" className={linkCls}>Gear</Link>
              {dropdown(
                GEAR_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/tools/category/${cat.slug}`}
                    className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${panelItemCls}`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.title}
                  </Link>
                ))
              )}
            </div>
            <div className="relative group">
              <span className={`${linkCls} cursor-pointer`}>Apps</span>
              {dropdown(
                APP_LINKS.map((app, i) => (
                  <span key={app.href}>
                    {i === 2 && <span className={`block my-1 mx-3 h-px ${dividerCls}`} />}
                    <Link
                      href={app.href}
                      className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${panelItemCls}`}
                    >
                      <span className="text-base">{app.icon}</span>
                      {app.title}
                    </Link>
                  </span>
                ))
              )}
            </div>
            <Link href="/blog" className={linkCls}>Blog</Link>
            <Link href="/newsletter" className={linkCls}>Newsletter</Link>
            <Link href="/about" className={linkCls}>About</Link>

            {hasSession ? (
              <>
                <NotificationsBell hasSession dark={dark} />
                <Link
                  href="/account"
                  className={`font-medium transition-colors ${
                    dark ? "text-cream hover:text-amber" : "text-forest hover:text-amber-dark"
                  }`}
                >
                  {userName?.split(" ")[0] || "Account"}
                </Link>
              </>
            ) : (
              <Link href="/login" className={linkCls}>Sign in</Link>
            )}

            <div className="flex items-center gap-3">
              <a href="https://youtube.com/@jespermakes" target="_blank" rel="noopener noreferrer" className={linkCls} aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg>
              </a>
              <a href="https://instagram.com/jespermakes" target="_blank" rel="noopener noreferrer" className={linkCls} aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
              </a>
              <a href="https://tiktok.com/@jespermakes" target="_blank" rel="noopener noreferrer" className={linkCls} aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          <MobileNav dark={dark} userName={userName} />
        </nav>
      </header>
      {/* Fixed header spacer: light pages start below the bar; the homepage
          hero is designed to run underneath it. */}
      {!overlay && <div className="h-24" aria-hidden />}
    </>
  );
}
