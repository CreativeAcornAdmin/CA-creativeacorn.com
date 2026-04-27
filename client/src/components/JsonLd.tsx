export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Creative Acorn",
    url: "https://creativeacorn.com",
    description:
      "Creative Acorn is a venture studio and creative incubator based in Santa Fe, NM. Building projects around wellness, movement, technology, and quality of life.",
    foundingLocation: {
      "@type": "Place",
      name: "Santa Fe, New Mexico",
    },
    founder: {
      "@type": "Person",
      name: "Haj Khalsa",
      url: "https://hajkhalsa.com",
    },
    knowsAbout: [
      "Venture Studio",
      "Creative Incubator",
      "Wellness Technology",
      "Outdoor Lifestyle",
      "Real Estate Technology",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
