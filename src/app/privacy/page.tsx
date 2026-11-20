import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy | Jesper Makes",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Privacy Policy</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: November 20, 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 font-sans text-wood-light leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">1. Who We Are</h2>
          <p>This website is operated by Jesper Makes Workshop, based in Denmark. We sell digital woodworking products and physical merchandise, and we produce content on YouTube and social media.</p>
          <p>Contact: <a href="mailto:hello@jespermakes.com" className="text-forest hover:underline">hello@jespermakes.com</a></p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">2. What We Collect</h2>
          <p>We collect only what we need to process your order and provide support:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Purchase information:</strong> Name, email address, and shipping address (for physical products only). Payment details are handled entirely by Stripe and never touch our servers.</li>
            <li><strong>Account information:</strong> If you create an account, we store your email address and link it to your purchases.</li>
            <li><strong>Newsletter:</strong> If you subscribe, we store your email address with our email provider (Resend).</li>
            <li><strong>Analytics:</strong> We use Vercel Web Analytics, which collects anonymous page view data without cookies or personal identifiers.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To deliver your digital products and send order confirmations</li>
            <li>To ship physical products (via our fulfillment partner Printful)</li>
            <li>To provide customer support</li>
            <li>To send occasional product updates (only if you opt in, and you can unsubscribe at any time)</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">4. Third-Party Services</h2>
          <p>We use the following services to operate the shop:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe</strong> for payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">stripe.com/privacy</a>)</li>
            <li><strong>Printful</strong> for physical product fulfillment (<a href="https://www.printful.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">printful.com/policies/privacy</a>)</li>
            <li><strong>Resend</strong> for transactional and marketing emails</li>
            <li><strong>Vercel</strong> for website hosting and analytics (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">vercel.com/legal/privacy-policy</a>)</li>
            <li><strong>Neon</strong> for database hosting</li>
          </ul>
          <p>These services process data on our behalf and are bound by their own privacy policies.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">5. Cookies</h2>
          <p>We use only essential cookies required for the website to function, such as authentication session tokens. We do not use tracking cookies, advertising cookies, or third-party marketing pixels.</p>
          <p>Vercel Web Analytics does not use cookies.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">6. Data Retention</h2>
          <p>We keep your purchase records and account information for as long as your account exists or as required for legal and accounting purposes. You can request deletion at any time.</p>
          <p>Newsletter subscribers are removed immediately upon unsubscribing.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">7. Your Rights (GDPR)</h2>
          <p>If you are in the EU/EEA, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access</strong> the personal data we hold about you</li>
            <li><strong>Correct</strong> inaccurate data</li>
            <li><strong>Delete</strong> your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Export</strong> your data in a portable format</li>
            <li><strong>Object</strong> to processing of your data</li>
            <li><strong>Withdraw consent</strong> at any time (e.g., unsubscribe from emails)</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:hello@jespermakes.com" className="text-forest hover:underline">hello@jespermakes.com</a>. We will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">8. Affiliate Links</h2>
          <p>Some links on this website are affiliate links. When you click them and make a purchase, we may earn a small commission at no extra cost to you. This does not affect the price you pay or the products we recommend. We only link to products we genuinely use and recommend.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">9. Messages and Our Social Media Accounts</h2>
          <p><strong>Messages you send us.</strong> When you send a direct message to @jespermakes on Instagram or to the Jesper Makes Page on Facebook, Meta passes it to us through its official API: your name as it shows on Instagram or Facebook, the account ID Meta gives us for you, the text and anything you attach, and the time it was sent. We use it only to read and answer your message and to keep track of the conversation, so a question or a collaboration request does not get lost. Our legal basis is our legitimate interest in answering the people who write to us, and, when you ask about buying something, taking the steps you asked for before a purchase (GDPR Article 6(1)(f) and 6(1)(b)).</p>
          <p>Messages are kept on a private server we run ourselves in Denmark. On the way there, Meta&apos;s notifications pass through our website host (Vercel) and database host (Neon), where they are deleted after 14 days at the latest. To sort messages we use an AI model that runs on our own server, and Anthropic&apos;s Claude when that model is unavailable. To help draft replies we also use Claude. Every reply is read and sent by hand by Jesper. We never use your messages for advertising, and we never sell or share them.</p>
          <p>We keep a conversation as long as we need it to answer you and follow up. You can ask us to delete it at any time, see <Link href="/data-deletion" className="text-forest hover:underline">jespermakes.com/data-deletion</Link>.</p>
          <p><strong>Figures about our own accounts.</strong> We also read performance data about our own Instagram, Facebook and YouTube accounts through the platforms&apos; official APIs: follower counts, views, reach, likes, comments, shares and saves on content we published ourselves. These figures are totals and do not identify individual viewers or followers. We use them to see which work lands, to plan what to make next, and to report audience figures to sponsors.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">10. Changes</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page with a new &quot;last updated&quot; date. For significant changes, we will notify customers by email.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">11. Contact</h2>
          <p>Questions about your privacy? Email us at <a href="mailto:hello@jespermakes.com" className="text-forest hover:underline">hello@jespermakes.com</a></p>
        </section>
      </div>
    </div>
  );
}
