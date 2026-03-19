import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

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

async function getOrCreatePrice(sku: string): Promise<string> {
  const stripe = getStripe();
  const config = PRODUCTS[sku];
  if (!config) throw new Error(`Unknown SKU: ${sku}`);

  // Look for existing product by metadata
  const products = await stripe.products.list({ limit: 30, active: true });
  const existing = products.data.find((p) => p.metadata?.sku === sku);

  if (existing) {
    const prices = await stripe.prices.list({
      product: existing.id,
      active: true,
      limit: 1,
    });
    if (prices.data.length > 0) {
      return prices.data[0].id;
    }
  }

  // Create product and price
  const product = await stripe.products.create({
    name: config.name,
    description: config.description,
    metadata: { sku },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: config.price,
    currency: "eur",
  });

  return price.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sku = (body as { sku?: string }).sku || "pallet-starter-kit";

    if (!PRODUCTS[sku]) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = await getOrCreatePrice(sku);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { sku },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you?product=${sku}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${sku}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
