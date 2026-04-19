import Image from "next/image";
import { getLatestVideos } from "@/lib/youtube";

export async function YouTubeSection() {
  const videos = await getLatestVideos(3);

  if (videos.length === 0) return null;

  return (
    <section className="border-y border-wood/10 bg-cream/50">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10">
          Latest builds
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <a
              key={video.url}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-lg text-wood group-hover:text-forest transition-colors mb-1 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-wood-light/50 text-sm">
                {new Date(video.published).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
