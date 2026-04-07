type ProductJsonLdProps = {
  name: string;
  description: string;
  price: string;
  currency?: string;
  image: string;
  url: string;
  availability?: "InStock" | "PreOrder" | "OutOfStock";
  brand?: string;
  sku?: string;
};

export function ProductJsonLd({
  name,
  description,
  price,
  currency = "EUR",
  image,
  url,
  availability = "InStock",
  brand = "Jesper Makes",
  sku,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image.startsWith("http") ? image : `https://jespermakes.com${image}`,
    url,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    ...(sku && { sku }),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
      seller: {
        "@type": "Organization",
        name: "Jesper Makes",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
