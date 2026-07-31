import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PRODUCTS, SUPPORT } from "@/lib/products";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sku, size, amountCents, forSku } = body as {
      sku?: string;
      size?: string;
      amountCents?: number;
      forSku?: string;
    };

    if (!sku) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Standalone support payment ("the jar"). Also used as the optional
    // support step after claiming a free plan.
    if (sku === "support") {
      const amount = Math.floor(Number(amountCents));
      if (
        !Number.isFinite(amount) ||
        amount < SUPPORT.minCents ||
        amount > SUPPORT.maxCents
      ) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        submit_type: "donate",
        line_items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: amount,
              product_data: {
                name: "Support the workshop",
                description: "Keeps the free plans free. Thank you.",
                metadata: { sku: "support" },
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          sku: "support",
          ...(forSku && PRODUCTS[forSku] ? { for: forSku } : {}),
        },
        success_url: `${siteUrl}/thank-you?product=${
          forSku && PRODUCTS[forSku] ? "support-plan" : "support"
        }`,
        cancel_url: forSku && PRODUCTS[forSku] ? `${siteUrl}/shop/${forSku}` : `${siteUrl}/support`,
      });
      return NextResponse.json({ url: session.url });
    }

    const config = PRODUCTS[sku];

    // Free plans are claimed via /api/plans/claim, not bought.
    if (!config || config.tier === "unavailable" || config.tier === "free") {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    if (config.hasSize && !size) {
      return NextResponse.json({ error: "Size is required" }, { status: 400 });
    }

    // Pay-more: the buyer may raise the amount above the floor, never below.
    let amount = config.priceCents;
    if (config.payMore) {
      const requested = Math.floor(Number(amountCents));
      if (Number.isFinite(requested)) {
        amount = Math.min(
          Math.max(requested, config.priceCents),
          SUPPORT.maxCents,
        );
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: {
              name: size ? `${config.name} (${size})` : config.name,
              description: config.description,
              metadata: { sku },
            },
          },
          quantity: 1,
        },
      ],
      metadata: { sku, ...(size ? { size } : {}) },
      success_url: `${siteUrl}/thank-you?product=${sku}`,
      cancel_url: `${siteUrl}/shop/${sku}`,
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
