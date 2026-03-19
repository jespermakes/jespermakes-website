import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const maxDuration = 15;

interface ProductConfig {
  name: string;
  description: string;
  price: number;
  hasSize?: boolean;
  shipping?: "printful";
}

const PRODUCTS: Record<string, ProductConfig> = {
  "pallet-starter-kit": {
    name: "The Pallet Builder's Starter Kit",
    description: "5 complete build guides + tool recommendations. PDF bundle.",
    price: 3500,
  },
  "cone-lamp-laser": {
    name: "Cone Lamp Laser File",
    description:
      "SVG laser cut file for the Jesper Makes Cone Lamp. All parts included.",
    price: 500,
  },
  "cone-lamp-3dprint": {
    name: "Cone Lamp 3D Print Files",
    description:
      "Complete 3D print file pack for the Jesper Makes Cone Lamp. STL files + PDF instruction guide.",
    price: 500,
  },
  "workshop-tee": {
    name: "Jesper Makes Workshop Tee",
    description:
      "Unisex black tee — Bella+Canvas 3001. Logo on front & back. Printed & shipped by Printful.",
    price: 3500,
    hasSize: true,
    shipping: "printful",
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sku = "pallet-starter-kit", size } = body as {
      sku?: string;
      size?: string;
    };
    const config = PRODUCTS[sku];

    if (!config) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    if (config.hasSize && !size) {
      return NextResponse.json(
        { error: "Size is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: config.price,
            product_data: {
              name: size
                ? `${config.name} (${size})`
                : config.name,
              description: config.description,
              metadata: { sku },
            },
          },
          quantity: 1,
        },
      ],
      metadata: { sku, ...(size ? { size } : {}) },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?product=${sku}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${sku}`,
    };

    // Physical products need shipping address
    if (config.shipping === "printful") {
      sessionParams.shipping_address_collection = {
        allowed_countries: [
          "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
          "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
          "PL", "PT", "RO", "SK", "SI", "ES", "SE",
          "GB", "US", "CA", "AU", "NO", "CH", "IS",
        ],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const e = err as Error & {
      type?: string;
      code?: string;
      statusCode?: number;
    };
    console.error("Stripe checkout error:", e.message);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
