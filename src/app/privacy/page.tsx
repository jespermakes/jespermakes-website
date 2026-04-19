import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Jesper Makes",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Privacy Policy</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: March 22, 2026</p>

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
          <h2 className="font-serif text-2xl text-wood mb-3">9. Changes</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page with a new &quot;last updated&quot; date. For significant changes, we will notify customers by email.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">10. Contact</h2>
          <p>Questions about your privacy? Email us at <a href="mailto:hello@jespermakes.com" className="text-forest hover:underline">hello@jespermakes.com</a></p>
        </section>
      </div>
    </div>
  );
}
