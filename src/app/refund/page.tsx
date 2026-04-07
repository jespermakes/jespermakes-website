import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Jesper Makes",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Refund Policy</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: March 22, 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 font-sans text-wood-light leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">Digital Products</h2>
          <p>Because digital products (plans, guides, templates, laser files, 3D print files) are delivered instantly and cannot be &quot;returned,&quot; all digital sales are generally final.</p>
          <p>However, we want you to be happy with your purchase. If you experience any of the following, we will issue a full refund:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You did not receive your files (delivery failure)</li>
            <li>The files are corrupted or unusable</li>
            <li>The product was significantly different from what was described</li>
            <li>You were charged twice for the same product</li>
          </ul>
          <p>To request a refund, email <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a> within 14 days of purchase with your order details and a description of the issue.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">Physical Products (Merchandise)</h2>
          <p>For physical merchandise (t-shirts, prints, etc.), you have the right to return the product within 14 days of receiving it, in accordance with EU consumer rights.</p>
          <p><strong>To initiate a return:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a> within 14 days of delivery</li>
            <li>The item must be unused, unwashed, and in its original condition</li>
            <li>You are responsible for return shipping costs unless the item is defective</li>
          </ul>
          <p>Once we receive the returned item, we will process your refund within 14 days. Refunds are issued to the original payment method.</p>

          <h3 className="font-serif text-lg text-wood mb-2 mt-4">Defective or Wrong Items</h3>
          <p>If you receive a defective, damaged, or incorrect item, contact us immediately. We will arrange a replacement or full refund at no cost to you, including return shipping.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">EU Consumer Rights</h2>
          <p>If you are a consumer in the EU/EEA, you have a statutory 14-day right of withdrawal for physical products. For digital products, you acknowledge that by downloading the files, you waive your right of withdrawal as the digital content has been fully delivered.</p>
          <p>Nothing in this policy affects your statutory consumer rights under EU law.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">How Refunds Are Processed</h2>
          <p>All refunds are processed through Stripe and returned to the original payment method. Depending on your bank, it may take 5 to 10 business days for the refund to appear on your statement.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">Contact</h2>
          <p>For any refund or return questions, email <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">hello@jespermakes.com</a>. We aim to respond within 24 hours.</p>
        </section>
      </div>
    </div>
  );
}
