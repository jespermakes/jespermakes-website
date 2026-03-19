// Temp debug version
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "No STRIPE_SECRET_KEY" }, { status: 500 });
  }

  try {
    const stripe = new Stripe(key, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Simple test - just list products
    const products = await stripe.products.list({ limit: 1 });
    return NextResponse.json({ 
      ok: true, 
      productCount: products.data.length,
      keyPrefix: key.slice(0, 15) 
    });
  } catch (err: unknown) {
    const e = err as Error & { type?: string; code?: string; statusCode?: number };
    return NextResponse.json({
      error: e.message,
      type: e.type,
      code: e.code,
      statusCode: e.statusCode,
      stack: e.stack?.split('\n').slice(0, 3),
    }, { status: 500 });
  }
}
