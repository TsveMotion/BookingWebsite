export function SchemaMarkup() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GlamBooking",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    },
    "operatingSystem": "Web, iOS, Android",
    "description": "The #1 UK salon booking and management software. Book beauty, wellness, and barbershop appointments instantly with zero commission.",
    "url": "https://glambooking.co.uk",
    "publisher": {
      "@type": "Organization",
      "name": "GlamBooking",
      "url": "https://glambooking.co.uk",
      "logo": "https://glambooking.co.uk/logo/Logo_Long.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+44-xxx-xxx-xxxx",
        "contactType": "customer support",
        "email": "support@glambooking.co.uk",
        "areaServed": "GB",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://instagram.com/glambooking",
        "https://linkedin.com/company/glambooking",
        "https://twitter.com/glambooking"
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1200",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Online appointment booking",
      "Calendar management",
      "Client database",
      "Payment processing",
      "Marketing tools",
      "Analytics and reporting",
      "Mobile app access",
      "Zero commission"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GlamBooking",
    "url": "https://glambooking.co.uk",
    "logo": "https://glambooking.co.uk/logo/Logo_Long.png",
    "description": "UK's leading beauty and wellness booking platform with zero commission fees.",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Organization",
        "name": "TsvWeb",
        "url": "https://tsvweb.co.uk"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressRegion": "England"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+44-xxx-xxx-xxxx",
      "contactType": "customer support",
      "email": "support@glambooking.co.uk",
      "areaServed": "GB",
      "availableLanguage": "English"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://glambooking.co.uk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Features",
        "item": "https://glambooking.co.uk/features"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Pricing",
        "item": "https://glambooking.co.uk/pricing"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
