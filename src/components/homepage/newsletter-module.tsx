import { getSubscriberCount } from "@/lib/homepage/fetch";
import type { NewsletterData } from "@/lib/homepage/types";
import { NewsletterInlineForm } from "./newsletter-inline-form";

export default async function NewsletterModule({ data }: { data: NewsletterData }) {
  const count = data.showSubscriberCount ? await getSubscriberCount() : 0;

  return (
    <section className="bg-forest/[0.08]">
      <div className="mx-auto max-w-xl px-6 py-20 md:py-24 text-center">
        {data.caps && <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">{data.caps}</div>}
        <h2 className="mt-2 font-serif text-3xl md:text-4xl text-wood">{data.title}</h2>
        <p className="mt-4 text-wood-light/80">{data.subtitle}</p>
        <div className="mt-6">
          <NewsletterInlineForm buttonLabel={data.buttonLabel} placeholder={data.placeholder} />
        </div>
        {data.showSubscriberCount && count > 0 && (
          <p className="mt-3 text-xs text-wood-light/50">{count.toLocaleString()} subscribers. Unsubscribe anytime.</p>
        )}
      </div>
    </section>
  );
}
