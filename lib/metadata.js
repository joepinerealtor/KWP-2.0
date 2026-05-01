const fallbackSiteUrl = "http://localhost:3000";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
const normalizedSiteUrl = configuredSiteUrl.replace(/\/+$/, "");

export const siteMetadataBase = new URL(normalizedSiteUrl);

export function createPortalMetadata({ title, description, path }) {
  const url = path || "/";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: [
        {
          url: "/images/social-preview-login.png",
          width: 1893,
          height: 919,
          alt: "KW Leading Edge Agent Portal login screen"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/social-preview-login.png"]
    }
  };
}
