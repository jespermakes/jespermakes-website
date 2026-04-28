"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ConditionalChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Only the canvas (exactly /studio) is full-viewport. Sub-routes like
  // /studio/designs use the site's normal header/footer.
  const hideChrome = pathname === "/studio";

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
