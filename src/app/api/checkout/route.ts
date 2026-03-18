import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

async function getOrCreatePrice(): Promise<string> {
  // Look for existing product by metadata
  const products = await stripe.products.list({ limit: 10, active: true });
  const existing = products.data.find(
    (p) => p.metadata?.sku === "pallet-starter-kit"
  );

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
    name: "The Pallet Builder's Starter Kit",
    description:
      "5 complete build guides + tool recommendations. PDF bundle.",
    metadata: { sku: "pallet-starter-kit" },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 3500,
    currency: "eur",
  });

  return price.id;
}

export async function POST() {
  try {
    const priceId = await getOrCreatePrice();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thank-you`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/pallet-starter-kit`,
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
