import React from "react";
import { Helmet as ReactHelmet } from "react-helmet-async";

interface HelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

export const Helmet: React.FC<HelmetProps> = ({
  title = "Teguaze  | Premium Car Rental & Parts Service",
  description = "Teguaze  provides premium car rentals and authentic parts service. Explore our wide range of vehicles and book your next adventure today.",
  keywords = "car rental, car parts, premium cars, car service, automotive parts",
  ogImage = "/og-image.jpg",
  ogUrl = "https://Teguaze .com",
}) => {
  const siteName = "Teguaze ";

  return (
    <ReactHelmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={ogUrl} />
    </ReactHelmet>
  );
};

// Add this for backward compatibility with existing imports
export default Helmet;
