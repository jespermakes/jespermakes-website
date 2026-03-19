import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Resend audience ID — resolved once per cold start
let audienceId: string | null = null;

async function getOrCreateAudienceId(): Promise<string> {
  if (audienceId) return audienceId;

  const res = await fetch("https://api.resend.com/audiences", {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  const data = await res.json();
  const existing = data.data?.find(
    (a: { name: string }) => a.name === "Customers"
  );
  if (existing) {
    audienceId = existing.id;
    return audienceId!;
  }

  const create = await fetch("https://api.resend.com/audiences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Customers" }),
  });
  const created = await create.json();
  audienceId = created.id;
  return audienceId!;
}

// --------------- email templates ---------------

interface EmailData {
  to: string;
  firstName: string;
  sku: string;
}

function buildEmail({ to, firstName, sku }: EmailData) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const button = (label: string, href: string) =>
    `<a href="${href}" style="display:inline-block;padding:14px 32px;background:#C17F3C;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">${label}</a>`;

  const footer = `
    <p style="margin-top:32px;color:#666">Keep this email — it is the only way to re-download your files.</p>
    <p style="margin-top:24px">Jesper<br/><span style="color:#888">Jesper Makes</span></p>`;

  if (sku === "cone-lamp-3dprint") {
    return {
      to,
      from: "Jesper Makes <hello@jespermakes.com>",
      subject: "Your Cone Lamp 3D Print Files — Download",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
          <p>${greeting}</p>
          <p>Thank you for your purchase! Your Cone Lamp 3D print files are ready.</p>
          <p style="margin:28px 0">${button("Download 3D Print Files", "https://jespermakes.com/downloads/cone-lamp-3dprint.zip")}</p>
          ${footer}
        </div>`,
    };
  }

  if (sku === "cone-lamp-laser") {
    return {
      to,
      from: "Jesper Makes <hello@jespermakes.com>",
      subject: "Your Cone Lamp Laser File — Download",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
          <p>${greeting}</p>
          <p>Thank you for your purchase! Your Cone Lamp laser file is ready.</p>
          <p style="margin:28px 0">${button("Download Laser File", "https://jespermakes.com/downloads/cone-lamp-laser.svg")}</p>
          ${footer}
        </div>`,
    };
  }

  // pallet-starter-kit (and fallback)
  return {
    to,
    from: "Jesper Makes <hello@jespermakes.com>",
    subject: "Your Pallet Builder Starter Kit — Coming Soon",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
        <p>${greeting}</p>
        <p>Thank you for your purchase! We are preparing your files and will email you shortly.</p>
        ${footer}
      </div>`,
  };
}

// --------------- webhook handler ---------------

export async function POST(request: Request) {
  
  const body = Buffer.from(await request.arrayBuffer());
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || "";
    const sku = session.metadata?.sku || "unknown";
    const firstName = name.split(" ")[0];

    if (email) {
      // Send confirmation email (digital products)
      if (sku !== "workshop-tee") {
        try {
          const emailPayload = buildEmail({ to: email, firstName, sku });
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          });
          if (!emailRes.ok) {
            console.error("Resend email error:", await emailRes.text());
          }
        } catch (err) {
          console.error("Failed to send confirmation email:", err);
        }
      }

      // Create Printful order for physical products
      if (sku === "workshop-tee") {
        try {
          const size = session.metadata?.size || "M";
          const shipping = (session as unknown as { shipping_details?: { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; country?: string; postal_code?: string } } }).shipping_details;
          const address = shipping?.address;

          // Map size to Printful sync variant ID
          const sizeToVariant: Record<string, number> = {
            S: 5239173658,
            M: 5239173659,
            L: 5239173660,
            XL: 5239173661,
            "2XL": 5239173662,
          };

          const printfulOrder = {
            external_id: session.id,
            recipient: {
              name: shipping?.name || name,
              email,
              address1: address?.line1 || "",
              address2: address?.line2 || "",
              city: address?.city || "",
              state_code: address?.state || "",
              country_code: address?.country || "",
              zip: address?.postal_code || "",
            },
            items: [
              {
                sync_variant_id: sizeToVariant[size] || sizeToVariant["M"],
                quantity: 1,
              },
            ],
          };

          const printfulRes = await fetch(
            "https://api.printful.com/orders",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(printfulOrder),
            }
          );

          if (!printfulRes.ok) {
            console.error("Printful order error:", await printfulRes.text());
          } else {
            console.log("Printful order created for", email, size);
          }

          // Send confirmation email for merch
          const merchEmail = {
            to: email,
            from: "Jesper Makes <hello@jespermakes.com>",
            subject: "Your Workshop Tee is on its way! 🎉",
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
                <p>${firstName ? `Hi ${firstName},` : "Hi there,"}</p>
                <p>Thank you for your purchase! Your <strong>Jesper Makes Workshop Tee (${size})</strong> has been sent to print.</p>
                <p>You'll receive shipping updates directly from our print partner once it ships. Most orders arrive within 5–10 business days.</p>
                <p style="margin-top:32px">Jesper<br/><span style="color:#888">Jesper Makes</span></p>
              </div>`,
          };

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(merchEmail),
          });
        } catch (err) {
          console.error("Failed to create Printful order:", err);
        }
      }

      // Add contact to audience
      try {
        const audId = await getOrCreateAudienceId();
        const contactRes = await fetch(
          `https://api.resend.com/audiences/${audId}/contacts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              first_name: firstName,
              last_name: name.split(" ").slice(1).join(" "),
              unsubscribed: false,
            }),
          }
        );
        if (!contactRes.ok) {
          console.error("Resend contact error:", await contactRes.text());
        }
      } catch (err) {
        console.error("Failed to add contact to audience:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
