// The Starter Kit: the welcome email every new subscriber gets, instantly.
// Strategy: docs/newsletter/signup-welcome-strategy.md. The welcome is a
// gift, not a receipt: the three live tools, three films, the barn. Sent as
// a Resend transactional email (never touches broadcast quotas), from
// hello@ so replies land in the monitored inbox. Copy lives on the Brain
// writing desk (piece: "Welcome email: The Starter Kit"); keep in sync.

import { renderWorkshopLetter } from "@/lib/email/letter-template";

const AMBER = "#B26E2E";
const A = (href: string, text: string) =>
  `<a href="${href}" style="color:${AMBER};">${text}</a>`;

export function renderWelcomeEmail(firstName?: string | null): {
  subject: string;
  html: string;
} {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const html = renderWorkshopLetter({
    title: "Welcome to the workshop",
    preheader: "Three free tools, three films, and one dead barn with a plan.",
    greeting,
    sections: [
      {
        paragraphs: [
          "You just joined The Workshop Letter. About once a month I write about running a woodworking and YouTube business from Fyn, Denmark, in public: the numbers, the doubts, the wins, the failures. Not woodworking tips. The videos are for that.",
          "You can reply to every letter. I read everything.",
          "One small favor first: drag this email into your Primary inbox, or just hit reply and say hi. That tells your mail app these letters matter, and it means they actually reach you.",
        ],
      },
      {
        heading: "The starter kit",
        paragraphs: [
          "So you do not have to dig through anything, here is the best of what I have built, free, no account, no catch.",
          `<strong>The Box Joint Jig Designer.</strong> A cut-ready box joint template for any wood thickness. Drop the SVG into your Shaper Origin, laser cutter, or CNC. ${A("https://jespermakes.com/box-joint-jig", "jespermakes.com/box-joint-jig")}`,
          `<strong>The Cone Lamp Designer.</strong> Build my pinecone pendant lamp from whatever plywood you have. Pick your thickness, get all 159 pieces sized to your stock. ${A("https://jespermakes.com/cone-lamp", "jespermakes.com/cone-lamp")}`,
          `<strong>The Storyteller Engine.</strong> For makers who also film. The story is already inside your project; this digs it out. ${A("https://jespermakes.com/storyteller", "jespermakes.com/storyteller")}`,
        ],
      },
      {
        heading: "Three films to start with",
        paragraphs: [
          `<strong>How this started.</strong> Zero background to full-time woodworker in two years. ${A("https://www.youtube.com/watch?v=1Vl7WQqodFc", "It's entertaining, I promise")}.`,
          `<strong>The one about my father.</strong> A log he said I would never make anything from. ${A("https://www.youtube.com/watch?v=GCzn9aFKa-4", "He was almost right")}.`,
          `<strong>The big one.</strong> A cabin, a hard year, and everything I know about both. ${A("https://www.youtube.com/watch?v=uFguK77AQxE", "The Hardest Year of My Life: A Build Diary")}.`,
        ],
      },
      {
        heading: "And one dead barn",
        paragraphs: [
          `I am trying to raise an 1850s barn from the dead as a proper timber-framed home for craft on Sydfyn. It is slow, expensive, and completely worth it. The story lives at ${A("https://ohavsladen.dk", "ohavsladen.dk")}, and every letter carries an update.`,
        ],
      },
      {
        heading: "Bring a friend",
        paragraphs: [
          `Know a maker who would use the tools? Forward this email. The starter kit is the gift. And if someone forwarded it to you: welcome, you can sign up at ${A("https://jespermakes.com/newsletter", "jespermakes.com/newsletter")}.`,
          "That's it. The next letter lands in your inbox soon. Build something real.",
        ],
      },
    ],
  });
  return { subject: "You're in. Here's the starter kit.", html };
}

/**
 * Send the welcome email as a Resend transactional send. Never throws into
 * the signup path: callers fire-and-forget; failures are logged, a signup
 * must never fail because a welcome email could not be sent.
 */
export async function sendWelcomeEmail(
  email: string,
  firstName?: string | null
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("welcome email skipped: RESEND_API_KEY not set");
    return;
  }
  const { subject, html } = renderWelcomeEmail(firstName);
  // Transactional send: the broadcast unsubscribe merge tag does not resolve
  // here. Until the tokenized one-click unsubscribe page exists, route
  // unsubscribes through the monitored inbox (handled same-day).
  const resolvedHtml = html.replaceAll(
    "{{{RESEND_UNSUBSCRIBE_URL}}}",
    "mailto:hello@jespermakes.com?subject=unsubscribe"
  );
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Jesper Makes <hello@jespermakes.com>",
      to: [email],
      subject,
      html: resolvedHtml,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`welcome email failed for ${email}: ${res.status} ${body.slice(0, 200)}`);
  }
}
