export function SiteJsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Jesper Makes",
      url: "https://jespermakes.com",
      description:
        "Danish woodworker and maker. Real build guides, honest measurements, no shortcuts.",
      publisher: {
        "@type": "Organization",
        name: "Jesper Makes",
        url: "https://jespermakes.com",
        logo: {
          "@type": "ImageObject",
          url: "https://jespermakes.com/logo.png",
        },
        sameAs: [
          "https://www.youtube.com/@jespermakes",
          "https://www.instagram.com/jespermakes/",
          "https://www.tiktok.com/@jespermakes",
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Jesper",
      url: "https://jespermakes.com",
      jobTitle: "Woodworker & Content Creator",
      sameAs: [
        "https://www.youtube.com/@jespermakes",
        "https://www.instagram.com/jespermakes/",
        "https://www.tiktok.com/@jespermakes",
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
