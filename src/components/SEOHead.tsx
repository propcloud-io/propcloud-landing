
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEOHead({
  title = "PropCloud - The Future of Real Estate Investment is a Conversation",
  description = "Meet your AI co-pilot for STR investing. Ask complex questions, get instant insights. No dashboards. No spreadsheets. Just simple, intelligent conversations with PropCloud.",
  image = "/hero-neural.jpg",
  url = window.location.href,
  type = "website"
}: SEOHeadProps) {
  const siteName = "PropCloud";
  const fullTitle = title.includes("PropCloud") ? title : `${title} | PropCloud`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="real estate investment, AI, short-term rental, STR, Airbnb, property investment, real estate AI, investment analysis, PropCloud" />
      <meta name="author" content="PropCloud" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@propcloud" />
      <meta name="twitter:creator" content="@propcloud" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0f766e" />
      <meta name="msapplication-TileColor" content="#0f766e" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "PropCloud",
          "description": description,
          "url": url,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "PropCloud"
          }
        })}
      </script>
    </Helmet>
  );
}
