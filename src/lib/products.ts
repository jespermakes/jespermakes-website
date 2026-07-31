// Single source of truth for the product catalog (DR-155).
// Every route that mentions a SKU, price, name, or file imports from here.

export type ProductTier = "free" | "paid" | "physical" | "unavailable";

export interface Product {
  sku: string;
  name: string;
  description: string;
  tier: ProductTier;
  /** Floor price in cents for paid/physical tiers. Free tier: 0. */
  priceCents: number;
  /** Paid tier only: buyer may raise the amount above the floor. */
  payMore?: boolean;
  file?: { filename: string; contentType: string };
  hasSize?: boolean;
  shipping?: "printful";
  downloadLabel?: string;
}

export const PRODUCTS: Record<string, Product> = {
  "workshop-wall-charts": {
    sku: "workshop-wall-charts",
    name: "Jesper's Cheat Sheets",
    description:
      "8 printable A4 reference sheets for your workshop wall. Wood species, sandpaper, joinery, screws, drill bits, conversions, angles, and safety.",
    tier: "free",
    priceCents: 0,
    file: { filename: "workshop-wall-charts.pdf", contentType: "application/pdf" },
    downloadLabel: "Download PDF",
  },
  "cone-lamp-laser": {
    sku: "cone-lamp-laser",
    name: "Cone Lamp Laser File",
    description:
      "SVG laser cut file for the Jesper Makes Cone Lamp. All parts included.",
    tier: "free",
    priceCents: 0,
    file: { filename: "cone-lamp-laser.zip", contentType: "application/zip" },
    downloadLabel: "Download ZIP",
  },
  "cone-lamp-3dprint": {
    sku: "cone-lamp-3dprint",
    name: "Cone Lamp 3D Print Files",
    description:
      "Complete 3D print file pack for the Jesper Makes Cone Lamp. STL files + PDF instruction guide.",
    tier: "free",
    priceCents: 0,
    file: { filename: "cone-lamp-3dprint.zip", contentType: "application/zip" },
    downloadLabel: "Download ZIP",
  },
  "workshop-tee": {
    sku: "workshop-tee",
    name: "Jesper Makes Workshop Tee",
    description:
      "Unisex black tee — Bella+Canvas 3001. Logo on front & back. Printed & shipped by Printful.",
    tier: "physical",
    priceCents: 3500,
    hasSize: true,
    shipping: "printful",
  },
  "pallet-starter-kit": {
    sku: "pallet-starter-kit",
    name: "The Pallet Builder's Starter Kit",
    description: "5 complete build guides + tool recommendations. PDF bundle.",
    tier: "unavailable",
    priceCents: 0,
  },
};

export const PRODUCT_NAMES: Record<string, string> = Object.fromEntries(
  Object.values(PRODUCTS).map((p) => [p.sku, p.name]),
);

// Pay-what-you-want support ("the jar"). Amounts in cents, EUR.
export const SUPPORT = {
  suggestedCents: [500, 1500, 3000],
  minCents: 200,
  maxCents: 50000,
};

export function formatPrice(p: Product): string {
  if (p.tier === "free") return "Free";
  return `€${Math.round(p.priceCents / 100)}`;
}
