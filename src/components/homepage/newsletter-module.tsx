import { getSubscriberCount } from "@/lib/homepage/fetch";
import type { NewsletterData } from "@/lib/homepage/types";
import { NewsletterInlineForm } from "./newsletter-inline-form";
import { resolveTheme } from "@/lib/homepage/themes";
import { Kicker } from "./kicker";

export default async function NewsletterModule({ data }: { data: NewsletterData }) {
  const count = data.showSubscriberCount ? await getSubscriberCount() : 0;
  const theme = resolveTheme("newsletter", data.theme);

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32 text-center">
        {data.caps && <Kicker center>{data.caps}</Kicker>}
        <h2 className={`mt-5 font-serif text-4xl md:text-5xl leading-tight ${theme.heading}`}>
          {data.title}
        </h2>
        <p className={`mt-5 leading-relaxed ${theme.text}`}>{data.subtitle}</p>
        <div className="mt-8 max-w-md mx-auto">
          <NewsletterInlineForm buttonLabel={data.buttonLabel} placeholder={data.placeholder} />
        </div>
        {data.showSubscriberCount && count > 0 && (
          <p className={`mt-3 text-xs ${theme.muted}`}>
            {count.toLocaleString()} makers read it. Unsubscribe anytime.
          </p>
        )}
        {data.signatureImage && (
          <div className="mt-12 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.signatureImage}
              alt={data.signatureName || "Jesper"}
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="font-serif italic text-xl text-amber-dark">
              {data.signatureName || "Jesper"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
