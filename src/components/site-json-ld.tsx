/**
 * sameAs is how Google is told these accounts are all the same entity. It is a
 * large part of why the site ranks first for "jesper makes" and converts brand
 * searches at ~27%, and brand is 97% of the site's search traffic — so this
 * list earning its keep matters more here than on most sites.
 *
 * Every URL must be verified to belong to Jesper. A wrong one actively tells
 * Google that a stranger's account is his: @intherough looked right and is an
 * unrelated fashion channel. The second channel is @jespermakes2.
 *
 * The Facebook page is a numeric profile URL because it has no vanity handle
 * yet. That URL keeps resolving after a handle is set, so it is safe to list —
 * swap it for the handle once one exists.
 */
const PROFILES = [
  "https://www.youtube.com/@jespermakes",
  "https://www.youtube.com/@jespermakes2",
  "https://www.instagram.com/jespermakes/",
  "https://www.tiktok.com/@jespermakes",
  "https://www.facebook.com/profile.php?id=100065584250685",
];

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
        sameAs: PROFILES,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Jesper",
      url: "https://jespermakes.com",
      jobTitle: "Woodworker & Content Creator",
      sameAs: PROFILES,
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
