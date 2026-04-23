import { getSubscriberCount } from "@/lib/homepage/fetch";
import type { NewsletterData } from "@/lib/homepage/types";
import { NewsletterInlineForm } from "./newsletter-inline-form";
import { resolveTheme } from "@/lib/homepage/themes";

export default async function NewsletterModule({ data }: { data: NewsletterData }) {
  const count = data.showSubscriberCount ? await getSubscriberCount() : 0;
  const theme = resolveTheme("newsletter", data.theme);

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-xl px-6 py-20 md:py-24 text-center">
        {data.caps && <div className={`text-[10px] font-bold tracking-[0.15em] uppercase ${theme.caps}`}>{data.caps}</div>}
        <h2 className={`mt-2 font-serif text-3xl md:text-4xl ${theme.heading}`}>{data.title}</h2>
        <p className={`mt-4 ${theme.text}`}>{data.subtitle}</p>
        <div className="mt-6">
          <NewsletterInlineForm buttonLabel={data.buttonLabel} placeholder={data.placeholder} />
        </div>
        {data.showSubscriberCount && count > 0 && (
          <p className={`mt-3 text-xs ${theme.muted}`}>{count.toLocaleString()} subscribers. Unsubscribe anytime.</p>
        )}
      </div>
    </section>
  );
}
