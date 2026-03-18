export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Privacy Policy</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: March 18, 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 font-sans text-wood-light leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">1. Who We Are</h2>
          <p>Jesper Makes Workshop operates jespermakes.com. Contact: <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a></p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">2. What We Collect</h2>
          <p>When you make a purchase, we collect your name, email address, and payment information (processed by Stripe — we never see your full card details). We do not use tracking cookies or analytics beyond basic server logs.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">3. How We Use Your Data</h2>
          <p>Your email is used solely to deliver your purchase and provide customer support. We do not sell, share, or rent your personal information to third parties. We may send you occasional emails about new products — you can unsubscribe at any time.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">4. Third-Party Services</h2>
          <p>We use Stripe for payment processing. Their privacy policy applies to payment data: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">stripe.com/privacy</a></p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">5. TikTok Integration</h2>
          <p>This website may use TikTok Login Kit to allow social login. If you log in via TikTok, we receive only your basic profile information (username and profile picture). We do not access your TikTok content or post on your behalf without explicit permission.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Email us at <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a> and we will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">7. Cookies</h2>
          <p>We use only essential cookies required for the website to function (e.g., session management after purchase). No tracking or advertising cookies are used.</p>
        </section>
      </div>
    </div>
  );
}
