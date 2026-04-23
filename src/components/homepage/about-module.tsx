import { SmartImage } from "@/components/smart-image";
import { getImageById } from "@/lib/homepage/fetch";
import type { AboutData } from "@/lib/homepage/types";

export default async function AboutModule({ data }: { data: AboutData }) {
  const image = await getImageById(data.imageId);
  const imageLeft = (data.direction ?? "image-left") === "image-left";

  return (
    <section className="bg-wood text-cream">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className={"grid grid-cols-1 md:grid-cols-2 gap-12 items-center " + (imageLeft ? "" : "md:[&>*:first-child]:order-2")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream/10">
            {image && (
              <SmartImage
                src={image.url}
                alt={image.description || ""}
                width={image.width || 800}
                height={image.height || 600}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl leading-[1.1]">{data.title}</h2>
            <div className="mt-5 text-cream/75 leading-relaxed space-y-3">
              {data.body.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {data.ctaLabel && data.ctaUrl && (
              <a href={data.ctaUrl} className="mt-6 inline-block text-forest-light font-medium hover:text-cream">
                {data.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
