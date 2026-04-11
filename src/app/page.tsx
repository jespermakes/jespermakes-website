import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { AboutSection } from "@/components/home/about-section";
import { YouTubeSection } from "@/components/home/youtube-section";
import { BlogSection } from "@/components/home/blog-section";
import { ToolsSection } from "@/components/home/tools-section";
import { NewsletterForm } from "./newsletter-form";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <Suspense fallback={null}>
        <YouTubeSection />
      </Suspense>
      <BlogSection />
      <ToolsSection />
      <NewsletterForm />
    </>
  );
}
