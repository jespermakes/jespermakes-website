import { getHomepageSections } from "@/lib/homepage/fetch";
import type { PageSection } from "@/lib/homepage/types";
import HeroModule from "@/components/homepage/hero-module";
import AboutModule from "@/components/homepage/about-module";
import CreatorToolsModule from "@/components/homepage/creator-tools-module";
import BlogModule from "@/components/homepage/blog-module";
import ShopModule from "@/components/homepage/shop-module";
import YoutubeModule from "@/components/homepage/youtube-module";
import NewsletterModule from "@/components/homepage/newsletter-module";

export const revalidate = 60;

export default async function Home() {
  const sections = await getHomepageSections();
  const visible = sections.filter((s) => s.visible);

  return (
    <main>
      {visible.map((s) => (
        <ModuleRenderer key={s.id} section={s} />
      ))}
    </main>
  );
}

function ModuleRenderer({ section }: { section: PageSection }) {
  switch (section.kind) {
    case "hero":
      return <HeroModule data={section.data as import("@/lib/homepage/types").HeroData} />;
    case "about":
      return <AboutModule data={section.data as import("@/lib/homepage/types").AboutData} />;
    case "creator_tools":
      return <CreatorToolsModule data={section.data as import("@/lib/homepage/types").CreatorToolsData} />;
    case "blog":
      return <BlogModule data={section.data as import("@/lib/homepage/types").BlogData} />;
    case "shop":
      return <ShopModule data={section.data as import("@/lib/homepage/types").ShopData} />;
    case "youtube":
      return <YoutubeModule data={section.data as import("@/lib/homepage/types").YoutubeData} />;
    case "newsletter":
      return <NewsletterModule data={section.data as import("@/lib/homepage/types").NewsletterData} />;
    default:
      return null;
  }
}
