import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete your data | Jesper Makes",
  description: "How to ask Jesper Makes to delete your messages and personal data.",
  alternates: { canonical: "/data-deletion" },
};

export default function DataDeletionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-wood mb-2">Delete Your Data</h1>
      <p className="text-wood-light/60 text-sm mb-10">Last updated: November 20, 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 font-sans text-wood-light leading-relaxed">
        <section>
          <p>If you have sent a message to Jesper Makes on Instagram or Facebook, or bought something on this site, you can ask us to delete what we hold about you. You don&apos;t need to give a reason.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">How to ask</h2>
          <p>Email <a href="mailto:hello@jespermakes.com?subject=Delete%20my%20data" className="text-forest hover:underline">hello@jespermakes.com</a> with the subject &quot;Delete my data&quot;. Tell us the name on your Instagram or Facebook account, or the email address you bought with, so we can find you.</p>
          <p>You can also ask in a message to @jespermakes on Instagram or to the Jesper Makes Page on Facebook.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">What happens next</h2>
          <p>Within 30 days we delete your messages, the details Meta sent along with them (your name and the account ID Meta gives us), and any notes we made about the conversation. Then we write back to tell you it is done.</p>
          <p>Our encrypted backups are not edited one by one. They are only ever used to restore our own systems after a failure, and they age out on a fixed schedule, the last of them after twelve months. If we ever restore one, we delete your data again before anything else happens.</p>
          <p>Purchase records are the one exception: Danish bookkeeping law makes us keep them for five years. We keep only what that law asks for.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-wood mb-3">What this does not cover</h2>
          <p>Your own copy of the conversation stays in your Instagram or Facebook app, and Meta keeps its own records under its own rules. To delete those, use the settings in the app.</p>
          <p>More about what we collect and why is in our <Link href="/privacy" className="text-forest hover:underline">privacy policy</Link>.</p>
        </section>
      </div>
    </div>
  );
}
