export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Terms of Service</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: March 18, 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 font-sans text-wood-light leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">1. Agreement</h2>
          <p>By accessing jespermakes.com and purchasing digital products, you agree to these terms. This site is operated by Jesper Makes Workshop.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">2. Digital Products</h2>
          <p>All purchases are for personal, non-commercial use only. You may not resell, redistribute, or share purchased files. Digital products are delivered as downloadable PDF files. Due to the digital nature of the products, all sales are final.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">3. Intellectual Property</h2>
          <p>All content, plans, guides, and materials on this website are owned by Jesper Makes Workshop. You may build the projects for personal use, but may not use the plans or content commercially.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">4. Payments</h2>
          <p>Payments are processed securely through Stripe. We do not store your payment details. Prices are in EUR and include applicable taxes.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">5. Liability</h2>
          <p>Woodworking involves inherent risks. The plans and guides provided are for informational purposes. Always follow proper safety precautions and use appropriate protective equipment. Jesper Makes Workshop is not liable for any injury or damage resulting from following our guides.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">6. Contact</h2>
          <p>Questions? Email us at <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a></p>
        </section>
      </div>
    </div>
  );
}
