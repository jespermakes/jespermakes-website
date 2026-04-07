import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Jesper Makes",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Terms of Service</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: March 22, 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 font-sans text-wood-light leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">1. Agreement</h2>
          <p>By using jespermakes.com and making purchases, you agree to these terms. This site is operated by Jesper Makes Workshop, based in Denmark.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">2. Products</h2>
          <h3 className="font-serif text-lg text-wood mb-2">Digital Products</h3>
          <p>Digital products (plans, guides, templates, laser files, 3D print files) are delivered electronically via email and your account page. After purchase, you receive immediate access to download your files.</p>
          <p>All digital products are for personal, non-commercial use only. You may not resell, redistribute, share, or publish purchased files. You may build the projects for personal use, including as gifts.</p>

          <h3 className="font-serif text-lg text-wood mb-2 mt-4">Physical Products</h3>
          <p>Physical merchandise is printed and shipped by our fulfillment partner (Printful). Shipping times vary by location, typically 5 to 10 business days. Tracking information is provided by email once your order ships.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">3. Pricing and Payment</h2>
          <p>All prices are displayed in EUR. Payments are processed securely through Stripe. We do not store your payment details.</p>
          <p>Prices may change without notice, but any change will not affect orders already placed.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">4. Refund Policy</h2>
          <p>Please see our dedicated <a href="/refund" className="text-amber hover:underline">Refund Policy</a> page for full details on returns and refunds for both digital and physical products.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">5. Intellectual Property</h2>
          <p>All content on this website, including plans, guides, videos, images, text, and designs, is owned by Jesper Makes Workshop unless otherwise stated. You may not reproduce, distribute, or commercially exploit any content without written permission.</p>
          <p>The Jesper Makes name, logo, and branding are trademarks of Jesper Makes Workshop.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">6. User Accounts</h2>
          <p>You may create an account to access your purchased products. You are responsible for keeping your login credentials secure. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">7. Affiliate Links</h2>
          <p>This website contains affiliate links to third-party products. When you purchase through these links, we may earn a commission at no extra cost to you. We only recommend products we genuinely use. We are not responsible for third-party products, their quality, or their sellers&apos; policies.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">8. Safety Disclaimer</h2>
          <p>Woodworking, 3D printing, and laser cutting involve inherent risks. The plans, guides, and content provided are for informational purposes. Always follow proper safety precautions and use appropriate protective equipment. Jesper Makes Workshop is not liable for any injury, damage, or loss resulting from following our guides or using our products.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">9. Limitation of Liability</h2>
          <p>Jesper Makes Workshop provides this website and its products &quot;as is.&quot; We make no warranties, expressed or implied, regarding the accuracy or completeness of any content. Our total liability for any claim related to a purchase is limited to the amount you paid for that product.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">10. Governing Law</h2>
          <p>These terms are governed by the laws of Denmark. Any disputes will be resolved in the courts of Denmark. If you are an EU consumer, you also have the right to use the <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">EU Online Dispute Resolution platform</a>.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">11. Changes</h2>
          <p>We may update these terms from time to time. Changes take effect when posted on this page. Continued use of the website after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">12. Contact</h2>
          <p>Questions? Email us at <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a></p>
        </section>
      </div>
    </div>
  );
}
