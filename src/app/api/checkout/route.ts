import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const maxDuration = 15;

const PRODUCTS: Record<
  string,
  { name: string; description: string; price: number }
> = {
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
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sku = (body as { sku?: string }).sku || "pallet-starter-kit";
    const config = PRODUCTS[sku];

    if (!config) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: config.price,
            product_data: {
              name: config.name,
              description: config.description,
              metadata: { sku },
            },
          },
          quantity: 1,
        },
      ],
      metadata: { sku },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?product=${sku}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${sku}`,
    });

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
